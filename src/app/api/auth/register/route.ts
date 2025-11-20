import { NextResponse } from "next/server";
import { connectDB } from "@/src/lib/db";
import bcrypt from "bcryptjs";
import User from "@/src/models/User";
import { registerSchema } from "@/src/lib/validators/auth";
import { IUser } from "@/src/types";

export async function POST(req: Request) {
  try {
    await connectDB();

    const body = await req.json();
    const parsed = registerSchema.parse(body);
    const { name, email, password } = parsed;

    // Check if user already exists
    const existingUsers = await User.find({
      $or: [{ email }, { name }],
    });

    const errors: string[] = [];

    existingUsers.forEach((user: IUser) => {
      if (user.email === email && !errors.includes("Email already exists")) {
        errors.push("Email already exists");
      }
      if (
        user.name === name &&
        !errors.includes("Username already exists")
      ) {
        errors.push("Username already exists");
      }
    });

    if (errors.length > 0) {
      return NextResponse.json({ errors }, { status: 409 });
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
    // ✅ Catch Mongo duplicate key errors (race condition safety)
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      return NextResponse.json(
        { errors: [`${field} already exists`] },
        { status: 409 }
      );
    }

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
