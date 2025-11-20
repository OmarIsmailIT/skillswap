import { auth } from "@/src/lib/authSession";
import { connectDB } from "@/src/lib/db";
import { onboardingSchema } from "@/src/lib/validators/onborading";
import User from "@/src/models/User";
import { NextResponse } from "next/server";

// PATCH /api/users/me/onboarding
export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();
  const body = await req.json();
  const { bio, topSkills } = onboardingSchema.parse(body);
  
  await User.findByIdAndUpdate(session.user.id, {
    ...(bio ? { bio } : {}),
    ...(Array.isArray(topSkills) && topSkills.length
      ? { topSkills: topSkills.map(s => s.trim().toLowerCase()) }
      : {}),
  });

  return NextResponse.json({ success: true });
}