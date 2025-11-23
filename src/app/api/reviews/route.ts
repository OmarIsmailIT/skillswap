import { NextResponse } from "next/server";
import { connectDB } from "@/src/lib/db";
import { auth } from "@/src/lib/authSession";
import { reviewSchema } from "@/src/lib/validators/review";
import { Booking, Review, User, SkillOffer } from "@/src/models";
import { IBooking } from "@/src/types";
import mongoose from "mongoose";

/**
 * Create a new review for a booking.
 *
 * @param {Request} req - request object
 *
 * @returns {Promise<NextResponse>} - response object
 *
 * @throws {NextResponse} - 401 if unauthorized, 400 if body is invalid, 404 if booking not found, 403 if not requester, 500 if internal server error occurs
 */

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    await connectDB();

    const body = await req.json();
    const { bookingId, rating, text } = reviewSchema.parse(body);

    if (!mongoose.Types.ObjectId.isValid(bookingId)) {
      return NextResponse.json(
        { error: "Invalid booking ID" },
        { status: 400 }
      );
    }
    const booking = await Booking.findById(bookingId)
      .populate("requester", "_id")
      .populate("provider", "_id")
      .populate("skillOffer", "_id") // ✅ needed for SkillOffer stats
      .lean<IBooking>();

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    // Only requester can leave a review
    if (booking.requester._id.toString() !== session.user.id) {
      return NextResponse.json(
        { error: "Only requester can leave a review" },
        { status: 403 }
      );
    }

    // Booking must be completed
    if (booking.status !== "completed") {
      return NextResponse.json(
        { error: "Booking must be completed to review" },
        { status: 400 }
      );
    }

    // Create review directly, rely on unique index for duplicate prevention
    try {
      await Review.create({
        booking: booking._id,
        reviewer: booking.requester._id,
        provider: booking.provider._id,
        skillOffer: booking.skillOffer._id,
        rating,
        comment: text,
      });
      // ✅ Parallel updates using Promise.all
      await Promise.all([
        // Update provider stats
        (async () => {
          const provider = await User.findById(booking.provider._id).select(
            "reviewsCount ratingAvg"
          );
          if (provider) {
            const newCount = provider.reviewsCount + 1;
            const newAvg =
              (provider.ratingAvg * provider.reviewsCount + rating) / newCount;
            provider.reviewsCount = newCount;
            provider.ratingAvg = newAvg;
            await provider.save();
          }
        })(),

        // Update skill offer stats
        (async () => {
          const skillOffer = await SkillOffer.findById(
            booking.skillOffer._id
          ).select("avgRating bookingsCount");
          if (skillOffer) {
            const newAvg =
              (skillOffer.avgRating * skillOffer.bookingsCount + rating) /
              (skillOffer.bookingsCount || 1);
            skillOffer.avgRating = newAvg;
            await skillOffer.save();
          }
        })(),
      ]);
    } catch (err: any) {
      if (err.code === 11000) {
        return NextResponse.json(
          { error: "Review already exists for this booking" },
          { status: 400 }
        );
      }
      throw err;
    }

    return NextResponse.json(
      { success: true, message: "Review created successfully" },
      { status: 201 }
    );
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: error.issues.map((issue: any) => issue.message) },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
