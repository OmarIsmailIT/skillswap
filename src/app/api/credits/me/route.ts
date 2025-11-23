// src/app/api/credits/me/route.ts
import { NextResponse } from "next/server";
import { connectDB } from "@/src/lib/db";
import { auth } from "@/src/lib/authSession";
import mongoose from "mongoose";
import { User, Booking, SkillOffer } from "@/src/models";
import CreditTransaction from "@/src/models/CreditTransaction";
import { IUser } from "@/src/types";

/**
 * Retrieves the current user's credits, reserved credits, income and outcome
 * 
 * @return {Promise<NextResponse>} - Response object containing the current user's credits, reserved credits, income and outcome
 * 
 * @throws {NextResponse} - 401 if unauthorized, 400 if invalid user ID, 500 if internal server error occurs
 */
export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const userId = session.user.id;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }

    // ✅ Parse pagination
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const skip = (page - 1) * limit;

    // ✅ Run all queries in parallel
    const [user, transactions, totalTransactions, incomeAgg, outcomeAgg] =
      await Promise.all([
        User.findById(userId).select("credits reservedCredits").lean<IUser>(),
        CreditTransaction.find({
          $or: [{ fromUser: userId }, { toUser: userId }],
          status: "completed",
        })
          .select("amountCredits fromUser toUser booking performedAt")
          .populate("fromUser", "name")
          .populate({
            path: "booking",
            populate: {
              path: "skillOffer",
              select: "title",
            },
          })
          .sort({ performedAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        CreditTransaction.countDocuments({
          $or: [{ fromUser: userId }, { toUser: userId }],
          status: "completed",
        }),
        CreditTransaction.aggregate([
          {
            $match: {
              toUser: new mongoose.Types.ObjectId(userId),
              status: "completed",
            },
          },
          { $group: { _id: null, total: { $sum: "$amountCredits" } } },
        ]),
        CreditTransaction.aggregate([
          {
            $match: {
              fromUser: new mongoose.Types.ObjectId(userId),
              status: "completed",
            },
          },
          { $group: { _id: null, total: { $sum: "$amountCredits" } } },
        ]),
      ]);

    // ✅ Format creditDetails
    const creditDetails = transactions.map((tx) => ({
      amount:
        tx.toUser._id.toString() === userId
          ? `+${tx.amountCredits}`
          : `-${tx.amountCredits}`,
      from: tx.fromUser?.name || "System",
      offer: tx.booking?.skillOffer?.title || "—",
      date: new Date(tx.performedAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }),
    }));

    return NextResponse.json(
      {
        success: true,
        credits: {
          current: user?.credits || 0,
          reserved: user?.reservedCredits || 0,
          income: incomeAgg[0]?.total || 0,
          outcome: outcomeAgg[0]?.total || 0,
        },
        creditDetails,
        page,
        limit,
        totalTransactions,
        totalPages: Math.ceil(totalTransactions / limit),
      },
      { status: 200 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
