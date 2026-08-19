import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { upsertPublicUser, getPublicUserByEmail } from "@/lib/user/user-service";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google" && user?.email) {
        try {
          await upsertPublicUser({
            googleId: account.providerAccountId,
            email: user.email,
            name: user.name ?? null,
            image: user.image ?? null,
          });
        } catch (error) {
          console.error("[Auth.js signIn Callback] Error syncing public user:", error);
          // Allow authentication to proceed even if DB sync has transient error
        }
      }
      return true;
    },
    async jwt({ token, user }) {
      const email = user?.email || token?.email;
      if (email && !token.userId) {
        try {
          const dbUser = await getPublicUserByEmail(email);
          if (dbUser) {
            token.userId = dbUser.id;
          }
        } catch (error) {
          console.error("[Auth.js jwt Callback] Error retrieving public user ID:", error);
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token?.userId && session?.user) {
        session.user.id = token.userId as string;
      }
      return session;
    },
  },
  secret: process.env.AUTH_SECRET,
});
