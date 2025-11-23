// src/app/api/users/[id]/route.ts
import { NextResponse } from "next/server";
import { connectDB } from "@/src/lib/db";
import mongoose from "mongoose";
import { User, SkillOffer } from "@/src/models";
import { IUser } from "@/src/types";

/**
 * GET /api/users/:id
 *
 * Retrieve a user's public profile and the skill offers they are providing
 *
 * @param {string} id - User ID to fetch profile for
 *
 * @returns {NextResponse} - User object with public profile details and skill offers they are providing
 *
 * @throws {NextResponse} - 400 if invalid user ID, 404 if user not found, 500 if internal server error occurs
 */
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const { id: userId } = await params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }

    // ✅ Fetch public profile
    const [user, skillOffers] = await Promise.all([
      User.findById(userId)
        .select("name bio avatarUrl ratingAvg reviewsCount")
        .lean<IUser>(),
      SkillOffer.find({ owner: userId, status: "active" })
        .select("title costCredits")
        .lean(),
    ]);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    return NextResponse.json(
      {
        success: true,
        user: {
          _id: user._id,
          name: user.name,
          bio: user.bio,
          avatarUrl: user.avatarUrl,
          ratingAvg: user.ratingAvg,
          reviewsCount: user.reviewsCount,
          credits: user.credits, // optional — remove if you want to keep it private
          skillsOffered: skillOffers.map((offer) => ({
            title: offer.title,
            costCredits: offer.costCredits,
          })),
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
