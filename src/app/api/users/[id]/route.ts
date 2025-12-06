// src/app/api/users/[id]/route.ts
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import mongoose from "mongoose";
import { User, SkillOffer } from "@/models";
import { IUser } from "@/types";

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
  { params }: { params: Promise<{ id: string }> }
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
        .select("name bio avatarUrl ratingAvg reviewsCount topSkills")
        .lean<IUser>(),
      SkillOffer.find({ owner: userId, status: "active" })
        .select("_id title costCredits")
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
          topSkills: user.topSkills,
          skillsOffered: skillOffers.map((offer) => ({
            _id: offer._id,
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
