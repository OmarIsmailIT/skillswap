// src/app/api/reviews/skilloffer/[skillOfferId]/route.ts
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import mongoose from "mongoose";
import { Review, SkillOffer } from "@/models";
import { ISkillOffer } from "@/types";

/**
 * Retrieves a list of reviews for a given skill offer ID
 *
 * @param {Request} req - Request object
 * @param {{ params: { skillOfferId: string } }} - Request parameters
 * @returns {Promise<NextResponse>} - Response object containing the list of reviews for the given skill offer ID
 *
 * @throws {NextResponse} - 400 if invalid skill offer ID, 404 if skill offer not found, 500 if internal server error occurs
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ skillOfferId: string }> }
) {
  try {
    await connectDB();
    const { skillOfferId } = await params;



    if (!mongoose.Types.ObjectId.isValid(skillOfferId)) {
      return NextResponse.json(
        { error: "Invalid SkillOffer ID" },
        { status: 400 }
      );
    }

    // ✅ Parse pagination params
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const skip = (page - 1) * limit;

    // ✅ Fetch skill offer stats directly
    const skillOffer = await SkillOffer.findById(skillOfferId)
      .select("avgRating bookingsCount")
      .lean<ISkillOffer>();

    if (!skillOffer) {
      return NextResponse.json(
        { error: "SkillOffer not found" },
        { status: 404 }
      );
    }

    // ✅ Fetch reviews with only required fields
    const reviews = await Review.find({ skillOffer: skillOfferId })
      .select("_id comment rating reviewer")
      .populate("reviewer", "name")
      .skip(skip)
      .limit(limit)

      .lean();

    return NextResponse.json(
      {
        success: true,
        reviews,
        averageRating: skillOffer.avgRating,
        totalReviews: reviews.length, // count of reviews for this skill offer
        bookingsCount: skillOffer.bookingsCount,
        page,
        limit,
        totalPages: Math.ceil(reviews.length / limit),
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
