import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { AuthServices } from "@/services";
import { RegisterUserPlatforms } from "@/features/auth";

const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      encoding: "algop",
    }),
    {
      id: "azure-ad",
      name: "Azure AD",
      type: "oauth",
      clientId: process.env.AZURE_AD_CLIENT_ID,
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET,
      wellKnown: `https://login.microsoftonline.com/${process.env.AZURE_AD_TENANT_ID}/v2.0/.well-known/openid-configuration`,
      authorization: {
        params: { scope: "openid profile User.Read User.Read.All email" },
      },
      idToken: true,
      async profile(profile, tokens) {
        const profileObject = {
          id: profile.sub,
          name: profile.preferred_username,
          email: profile.email,
          image: "",
          accountProvider: "azure-ad",
        };

        // TODO: Add to the profile photo when we have file management in the back
        // const profilePicture = await fetch(
        //   `https://graph.microsoft.com/v1.0/me/photos/64x64/$value`,
        //   {
        //     headers: {
        //       Authorization: `Bearer ${tokens.access_token}`,
        //     },
        //   }
        // );

        // if (profilePicture.ok) {
        //   const pictureBuffer = await profilePicture.arrayBuffer();
        //   const pictureBase64 = Buffer.from(pictureBuffer).toString("base64");
        //   profileObject.image = `${pictureBase64}`;
        // }

        return profileObject;
      },
    },
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: {
          label: "Username",
          type: "text",
          placeholder: "jsmith",
        },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials, req) {
        if (!credentials?.email || !credentials.password) return null;

        const res = await AuthServices.login(credentials);

        if (res.status === 401) {
          return null;
        }

        return res.data;
      },
    }),
  ],

  callbacks: {
    async signIn({ user, account }) {
      const authenticatedUser: RegisterUserPlatforms = {
        email: user.email,
        image: user.image,
        name: user.name,
        tenantName: "",
        accountProvider: account.provider as
          | "credentials"
          | "google"
          | "azure-ad",
      };

      if (account.provider === "google" || account.provider === "azure-ad") {
        await AuthServices.registerByProviders(authenticatedUser);
      }

      return true;
    },

    async session({ token, session, user }) {
      if (token.backendTokens) {
        session.user = token.user;
        session.backendTokens = token.backendTokens;
      } else {
        const payload: RegisterUserPlatforms = {
          name: token.name,
          email: token.email,
          image: token.picture,
          tenantName: "",
          accountProvider: "google",
        };

        const res = await AuthServices.getBackendTokens(payload);
        session.user = res.user;
        session.backendTokens = res.backendTokens;
      }

      return session;
    },

    async jwt({ token, user, trigger, session }) {
      if (trigger === "update") {
        return {
          ...token,
          user: session?.user || token.user,
          backendTokens: session?.backendTokens || token.backendTokens,
        };
      }

      if (user) return { ...token, ...user };

      if (token.backendTokens && token.backendTokens.expiresIn) {
        if (new Date().getTime() < token.backendTokens.expiresIn) return token;

        return await AuthServices.refreshToken(
          token.backendTokens.refreshToken
        );
      }

      return { ...token, ...user };
    },
  },
  pages: {
    signIn: "/login",
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
