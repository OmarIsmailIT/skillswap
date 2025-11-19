import { NextResponse } from "next/server";
import { connectDB } from "@/src/lib/db";
import bcrypt from "bcryptjs";
import User from "@/src/models/User";
import { registerSchema } from "@/src/lib/validators/auth";

export async function POST(req: Request) {
  try {
    await connectDB();

    const body = await req.json();
    const parsed = registerSchema.parse(body);
    const { name, email, password } = parsed;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: "Email already exists" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
     await User.create({
      name,
      email,
      hashedPassword,
    });

    return NextResponse.json(
      { success: true, message: "User created successfully" },
      { status: 201 }
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
