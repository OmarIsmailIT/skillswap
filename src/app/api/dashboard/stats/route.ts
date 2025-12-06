import { auth } from "@/lib/authSession";
import { connectDB } from "@/lib/db";
import { User, Booking, SkillOffer, CreditTransaction } from "@/models";
import { NextResponse } from "next/server";
import mongoose from "mongoose";

/**
 * Get aggregated dashboard statistics for the current user
 */
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const userId = session.user.id;
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [
      user,
      bookingStats,
      skillOffers,
      recentTransactions,
      upcomingBookings,
      creditHistory
    ] = await Promise.all([
      // Fetch user data
      User.findById(userId).select('credits reservedCredits').lean(),

      // Combined Booking Stats (Active & Total)
      Booking.aggregate([
        { $match: { $or: [{ requester: userObjectId }, { provider: userObjectId }] } },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            active: {
              $sum: {
                $cond: [{ $in: ["$status", ["accepted", "pending"]] }, 1, 0]
              }
            }
          }
        }
      ]),

      // Fetch user's skill offers
      SkillOffer.find({ owner: userId })
        .select('title category bookingsCount avgRating')
        .lean(),

      // Fetch recent transactions (last 10)
      CreditTransaction.find({
        $or: [{ fromUser: userId }, { toUser: userId }]
      })
        .sort({ performedAt: -1 })
        .limit(10)
        .populate('fromUser', 'name')
        .populate('toUser', 'name')
        .lean(),

      // Fetch upcoming bookings (next 5)
      Booking.find({
        $or: [{ requester: userId }, { provider: userId }],
        status: 'accepted',
        dateStart: { $gte: new Date() }
      })
        .sort({ dateStart: 1 })
        .limit(5)
        .populate('skillOffer', 'title')
        .populate('requester', 'name')
        .populate('provider', 'name')
        .lean(),

      // Calculate credit history for the chart (last 30 days)
      CreditTransaction.find({
        $or: [{ fromUser: userId }, { toUser: userId }],
        performedAt: { $gte: thirtyDaysAgo }
      })
        .sort({ performedAt: 1 })
        .select('amountCredits performedAt fromUser toUser')
        .lean()
    ]);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const stats = bookingStats[0] || { total: 0, active: 0 };

    // Group transactions by day for chart
    const dailyCredits: { date: string; credits: number }[] = [];
    
    // Calculate starting balance by reversing all transactions in the period
    // @ts-ignore
    let runningTotal = user.credits - creditHistory.reduce((sum, tx) => {
      // @ts-ignore
      return sum + (tx.toUser.toString() === userId ? tx.amountCredits : -tx.amountCredits);
    }, 0);

    for (const tx of creditHistory) {
      const date = new Date(tx.performedAt).toISOString().split('T')[0];
      // @ts-ignore
      if (tx.toUser.toString() === userId) {
        runningTotal += tx.amountCredits;
      } else {
        runningTotal -= tx.amountCredits;
      }
      
      const existing = dailyCredits.find(d => d.date === date);
      if (existing) {
        existing.credits = runningTotal;
      } else {
        dailyCredits.push({ date, credits: runningTotal });
      }
    }

    return NextResponse.json({
      credits: {
        // @ts-ignore
        available: user.credits,
        // @ts-ignore
        reserved: user.reservedCredits,
        // @ts-ignore
        total: user.credits + user.reservedCredits
      },
      bookings: {
        active: stats.active,
        upcoming: upcomingBookings.length,
        total: stats.total
      },
      skills: {
        listed: skillOffers.length,
        topPerforming: skillOffers
          .sort((a, b) => (b.avgRating || 0) - (a.avgRating || 0))
          .slice(0, 3)
      },
      recentActivity: recentTransactions.map((tx: any) => ({
        id: tx._id,
        type: tx.fromUser._id.toString() === userId ? 'sent' : 'received',
        amount: tx.amountCredits,
        from: tx.fromUser.name,
        to: tx.toUser.name,
        date: tx.performedAt
      })),
      upcomingBookings: upcomingBookings.map((b: any) => ({
        id: b._id,
        skill: b.skillOffer?.title || 'Unknown',
        with: b.requester._id.toString() === userId ? b.provider.name : b.requester.name,
        date: b.dateStart,
        role: b.provider._id.toString() === userId ? 'provider' : 'requester'
      })),
      creditHistory: dailyCredits
    }, {status: 200});

  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message || "Internal Server Error" },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
