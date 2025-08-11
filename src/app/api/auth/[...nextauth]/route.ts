import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { AuthServices, type RegisterUserPlatforms } from "@/features/auth";
import { AuthV2Services } from "@/features/auth/services/auth-v2.services";
import { JWTUser } from "@/features/auth/interfaces/auth-types";

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
          accountProvider: "azure-ad" as const,
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

        try {
          // Usar el nuevo servicio de autenticación
          const loginResponse = await AuthV2Services.login({
            email: credentials.email,
            password: credentials.password,
          });

          // Retornar el usuario con el token para Next-Auth (compatible con User type)
          return {
            id: loginResponse.user._id,
            name: `${loginResponse.user.firstName} ${loginResponse.user.lastName}`,
            email: loginResponse.user.email,
            image: null,
            // Datos adicionales para el JWT
            _id: loginResponse.user._id,
            firstName: loginResponse.user.firstName,
            lastName: loginResponse.user.lastName,
            role: loginResponse.user.role,
            tenantId: loginResponse.user.tenantId,
            tenantName: loginResponse.user.tenantName,
            accountProvider: loginResponse.user.accountProvider,
            access_token: loginResponse.access_token,
          };
        } catch (error: any) {
          console.error("Login authorization failed:", error);

          // Si es error de usuario sin tenant, permitir login pero sin tenant
          if (error.type === "NO_TENANT") {
            // Retornar usuario sin tenant para que pueda loguearse y ser redirigido a waiting
            return {
              id: error.user?._id || "temp-id",
              name: error.user?.firstName
                ? `${error.user.firstName} ${error.user.lastName}`
                : credentials.email,
              email: credentials.email,
              image: null,
              // Datos adicionales para el JWT
              _id: error.user?._id || "temp-id",
              firstName: error.user?.firstName || "",
              lastName: error.user?.lastName || "",
              role: error.user?.role || "",
              tenantId: null,
              tenantName: null, // Sin tenant
              accountProvider: "credentials",
              access_token: null,
            };
          }

          // Si son credenciales inválidas, fallar el login
          if (error.type === "INVALID_CREDENTIALS") {
            return null;
          }

          return null;
        }
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

    async session({ token, session }) {
      if (token.access_token) {
        // Para usuarios autenticados con credentials (nueva estructura)
        session.user = {
          _id: token._id as string,
          name: token.name as string,
          email: token.email as string,
          firstName: token.firstName as string,
          lastName: token.lastName as string,
          role: token.role as string,
          tenantId: token.tenantId as string,
          tenantName: token.tenantName as string,
          accountProvider: token.accountProvider as any,
          // Campos requeridos por compatibilidad
          password: null,
          isRecoverableConfig: {},
          widgets: [],
        };
        session.backendTokens = {
          accessToken: token.access_token as string,
          refreshToken: token.refresh_token as string,
          expiresIn: token.expires_at as number,
        };
      } else if (token.backendTokens) {
        // Mantener compatibilidad con estructura anterior
        session.user = token.user;
        session.backendTokens = token.backendTokens;
      } else {
        // Para providers externos (Google, Azure)
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

      // Si hay un usuario (login exitoso), almacenar sus datos en el token
      if (user) {
        const customUser = user as any; // Cast para acceder a propiedades personalizadas
        return {
          ...token,
          // Datos del JWT
          _id: customUser._id,
          firstName: customUser.firstName,
          lastName: customUser.lastName,
          role: customUser.role,
          tenantId: customUser.tenantId,
          tenantName: customUser.tenantName,
          accountProvider: customUser.accountProvider,
          access_token: customUser.access_token,
          // Mantener campos estándar de Next-Auth
          name: user.name,
          email: user.email,
        };
      }

      // Manejo de refresh token (mantener compatibilidad)
      if (token.backendTokens && token.backendTokens.expiresIn) {
        if (new Date().getTime() < token.backendTokens.expiresIn) return token;

        return await AuthServices.refreshToken(
          token.backendTokens.refreshToken
        );
      }

      return token;
    },
  },
  pages: {
    signIn: "/login",
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
