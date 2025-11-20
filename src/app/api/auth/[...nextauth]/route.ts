import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { connectDB } from "@/src/lib/db";
import User from "@/src/models/User";
import { loginSchema } from "@/src/lib/validators/auth";

// Minimal user returned from authorize
type AuthUser = {
  id: string;
  name: string;
  email: string;
};

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials): Promise<AuthUser | null> {
        if (!credentials) return null;

        // Validate email/password format
        try {
          loginSchema.parse(credentials);
        } catch {
          return null;
        }

        await connectDB();
        const user = await User.findOne({ email: credentials.email });
        if (!user) return null;

        const isValid = await bcrypt.compare(
          credentials.password,
          user.hashedPassword
        );
        if (!isValid) return null;

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 24 * 7, // 7 days in seconds
  },
  jwt: {
    maxAge: 60 * 60 * 24 * 7, // keep in sync
  },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      // On sign-in, `user` is the AuthUser returned by authorize()
      if (user && "id" in user) {
        token.userId = (user as AuthUser).id; // store string id
      }
      return token;
    },
    async session({ session, token }) {
      // Add id to session.user
      if (session.user && token.userId) {
        session.user.id = token.userId;
      }
      return session;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
