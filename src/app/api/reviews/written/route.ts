// src/app/api/reviews/written/route.ts
import { NextResponse } from "next/server";
import { connectDB } from "@/src/lib/db";
import { auth } from "@/src/lib/authSession";
import mongoose from "mongoose";
import { Review } from "@/src/models";

/**
 * Retrieves a list of reviews written by the current user.
 *
 * @param {Request} req - Request object
 *
 * @returns {Promise<NextResponse>} - Response object containing the list of reviews written by the current user
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

    const reviewerId = session.user.id;
    if (!mongoose.Types.ObjectId.isValid(reviewerId)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }

    // ✅ Parse pagination params
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const skip = (page - 1) * limit;

    // ✅ Count total reviews written
    const totalReviews = await Review.countDocuments({ reviewer: reviewerId });

    // ✅ Fetch paginated reviews
    const reviews = await Review.find({ reviewer: reviewerId })
      .select("_id comment rating provider skillOffer")
      .populate("provider", "name")
      .populate("skillOffer", "title")
      .skip(skip)
      .limit(limit)
      .lean();

    return NextResponse.json(
      {
        success: true,
        reviews,
        totalReviews,
        page,
        limit,
        totalPages: Math.ceil(totalReviews / limit),
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
