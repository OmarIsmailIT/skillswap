import { DefaultSession } from "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string; // 👈 add id here
      name?: string | null;
      email?: string | null;
      image?: string | null;
      onBoardingCompleted?: boolean;
    };
  }

  interface User {
    id: string;
    name?: string | null;
    email?: string | null;
    onBoardingCompleted?: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    userId?: string;
    onBoardingCompleted?: boolean;
    avatarUrl?: string;
  }
}
