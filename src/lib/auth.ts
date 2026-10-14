import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { isAdminEmail } from "@/lib/admin";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    // Lets client UI (the nav) show admin links; every admin route still checks the email server-side.
    session: ({ session }) => {
      if (session.user) session.user.isAdmin = isAdminEmail(session.user.email);
      return session;
    },
  },
};
