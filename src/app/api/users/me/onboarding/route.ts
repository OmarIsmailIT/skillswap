import { auth } from "@/lib/authSession";
import { connectDB } from "@/lib/db";
import { onboardingSchema } from "@/lib/validators/onborading";
import { User } from "@/models";
import { NextResponse } from "next/server";


/**
 * Completes the onboarding process for the current user.
 * Updates the user's bio and top skills, and sets the onboarding completed flag to true.
 *
 * @param {Request} req - request object
 *
 * @returns {Promise<NextResponse>} - response object
 *
 * @throws {NextResponse} - 401 if unauthorized, 500 if internal server error occurs
 */
export async function PATCH(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const body = await req.json();
    const { bio, topSkills, avatarUrl } = onboardingSchema.parse(body);

    await User.findByIdAndUpdate(session.user.id, {
      ...(avatarUrl ? { avatarUrl } : {}),
      ...(bio ? { bio } : {}),
      ...(Array.isArray(topSkills) && topSkills.length
        ? { topSkills: topSkills.map((s) => s.trim().toLowerCase()) }
        : {}),
      onBoardingCompleted: true,
    });

    return NextResponse.json(
      { success: true, message: "Onboarding completed" },
      { status: 200 }
    );
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
