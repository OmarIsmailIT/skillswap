// src/app/api/reviews/user/[userId]/route.ts
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import mongoose from "mongoose";
import { User, Booking, SkillOffer, Review } from "@/models";
import { IUser } from "@/types";

/**
 * GET /api/reviews/user/:userId
 *
 * Retrieve all reviews about a user as a provider, along with their average rating and total reviews.
 *
 * @param {string} userId - User ID to fetch reviews for
 *
 * @returns {NextResponse} - Reviews array with average rating and total reviews count
 *
 * @throws {NextResponse} - 400 if invalid user ID, 404 if user not found, 500 if internal server error occurs
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    await connectDB();
    const { userId } = await params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }

    // ✅ Parse pagination params
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const skip = (page - 1) * limit;

    // Check if user exists
    // ✅ Fetch user stats directly
    const user = await User.findById(userId)
      .select("ratingAvg reviewsCount")
      .lean<IUser>();

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Fetch reviews about this provider
    const reviews = await Review.find({ provider: userId })
      .select("_id comment rating offerSkill reviewer") // only needed fields
      .populate("reviewer", "name avatarUrl") // reviewer name only
      .populate("skillOffer", "title")
      .skip(skip)
      .limit(limit)
      .lean();

    return NextResponse.json(
      {
        success: true,
        reviews,
        averageRating: user.ratingAvg,
        totalReviews: user.reviewsCount,
        page, 
        limit,
        totalPages: Math.ceil((user.reviewsCount || 0) / limit),
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
