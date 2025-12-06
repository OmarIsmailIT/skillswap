// src/app/api/users/me/route.ts
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { auth } from "@/lib/authSession";
import mongoose from "mongoose";
import { User, SkillOffer } from "@/models";
import { IUser } from "@/types";
import { editUser } from "@/lib/validators/user";

/**
 * Retrieves the current user's profile, including their name, email, bio, avatar URL, credits, reserved credits, average rating, reviews count, and skills offered.
 *
 * @returns {Promise<NextResponse>} - Response object containing the current user's profile details
 *
 * @throws {NextResponse} - 401 if unauthorized, 400 if invalid user ID, 404 if user not found, 500 if internal server error occurs
 */
export async function GET() {
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

    const [user, skillOffers] = await Promise.all([
      User.findById(userId)
        .select(
          "name email bio avatarUrl credits reservedCredits ratingAvg reviewsCount topSkills"
        )
        .lean<IUser>(),
      SkillOffer.find({ owner: userId })
        .select("title costCredits status")
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
          email: user.email,
          bio: user.bio,
          avatarUrl: user.avatarUrl,
          credits: user.credits,
          reservedCredits: user.reservedCredits,
          ratingAvg: user.ratingAvg,
          reviewsCount: user.reviewsCount,
          skills: user.topSkills,
          skillsOffered: skillOffers.map((offer) => ({
            title: offer.title,
            costCredits: offer.costCredits,
            status: offer.status,
          })),
          canEdit: true,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message || "Internal Server Error" },
        { status: 500 }
      );
    }
  }
}

/**
 * Updates the current user's profile information
 *
 * @param {Request} req - request object
 *
 * @returns {Promise<NextResponse>} - response object
 *
 * @throws {NextResponse} - 401 if unauthorized, 400 if invalid user ID, 500 if internal server error occurs
 */

export async function PUT(req: Request) {
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

    const body = await req.json();
    const { bio, topSkills, avatarUrl, name } = editUser.parse(body);

    // ✅ Update user
    await User.updateOne(
      { _id: userId },
      {
        ...(name && { name }),
        ...(bio && { bio }),
        ...(topSkills && { topSkills }),
        ...(avatarUrl && { avatarUrl }),
      }
    );

    return NextResponse.json(
      { success: true, message: "Profile updated" },
      { status: 200 }
    );
  } catch (error) {
    if(error instanceof Error)
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
