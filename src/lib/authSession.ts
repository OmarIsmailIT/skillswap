// src/lib/authSession.ts
import { getServerSession } from "next-auth";
import { authOptions } from "@/src/app/api/auth/[...nextauth]/route";

export async function auth() {
  return getServerSession(authOptions);
}