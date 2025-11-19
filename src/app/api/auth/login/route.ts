import { NextResponse } from "next/server";
import { connectDB } from "@/src/lib/db";
import { loginSchema } from "@/src/lib/validators/auth";
import User from "@/src/models/User";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();

    const { email, password } = loginSchema.parse(body);
    
    const user = await User.findOne({ email });
    if (!user)
      return NextResponse.json({ error: "User not found" }, { status: 404 });

    const isPasswordValid = await bcrypt.compare(password, user.hashedPassword);

    if (!isPasswordValid)
      return NextResponse.json({ error: "Invalid password" }, { status: 401 });

    return NextResponse.json(
      { success: true, message: "User logged in successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    if (error.name === "ZodError") {
      // ZodError has `issues`, not `errors`
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
