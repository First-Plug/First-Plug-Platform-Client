import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { AuthServices, type RegisterUserPlatforms } from "@/features/auth";
import { AuthV2Services } from "@/features/auth/services/auth-v2.services";

const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      // encoding: "algop",
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
      async profile(profile) {
        const profileObject = {
          id: profile.sub,
          name: profile.preferred_username,
          email: profile.email,
          image: "",
          _id: profile.sub,
          accountProvider: "azure-ad" as const,
          isRecoverableConfig: {},
          widgets: [],
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

      async authorize(credentials) {
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
            // Usar la nueva estructura de backendTokens
            access_token:
              (loginResponse as any).backendTokens?.accessToken ||
              loginResponse.access_token,
            refresh_token: (loginResponse as any).backendTokens?.refreshToken,
            expires_at: (loginResponse as any).backendTokens?.expiresIn,
            backendTokens: (loginResponse as any).backendTokens,
            isRecoverableConfig: {},
            widgets: [],
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
              isRecoverableConfig: {},
              widgets: [],
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
      if (!account) return true;
      if (account.provider === "google" || account.provider === "azure-ad") {
        const payload = {
          email: user?.email ?? "",
          image: user?.image ?? "",
          name: user?.name ?? "",
          accountProvider: account.provider,
        } as const;

        try {
          await AuthServices.getBackendTokens(payload);
        } catch (error: any) {
          const status = error?.response?.status;
          const msg = error?.response?.data?.message || error?.message || "";
          const userNotFound =
            status === 404 ||
            /not\s*found/i.test(msg) ||
            (status === 401 && /user\s*not\s*found/i.test(msg));

          if (userNotFound) {
            // podés apuntar a /api/users/provider o al proxy /api/auth/register-providers
            await AuthServices.registerByProviders(payload);
            try {
              await AuthServices.getBackendTokens(payload);
            } catch (e) {}
          } else {
            console.error("Error en signIn callback:", msg);
          }
        }
      }
      return true;
    },

    async jwt({ token, user, account }) {
      // Si es el primer login (user existe), guardar datos en el token
      if (user && account) {
        if (account.provider === "google" || account.provider === "azure-ad") {
          try {
            const payload: RegisterUserPlatforms = {
              email: user.email,
              image: user.image,
              name: user.name,
              tenantName: "",
              accountProvider: account.provider as
                | "credentials"
                | "google"
                | "azure-ad",
            };

            const res = await AuthServices.getBackendTokens(payload);

            // Guardar todos los datos del backend en el token
            token._id = res.user._id;
            token.firstName = res.user.firstName;
            token.lastName = res.user.lastName;
            token.role = res.user.role;
            token.tenantId = res.user.tenantId;
            token.tenantName = res.user.tenantName;
            token.accountProvider = res.user.accountProvider;
            token.backendTokens = res.backendTokens;
          } catch (error) {
            console.error("Error in JWT callback:", error);
          }
        } else if (account.provider === "credentials") {
          // Para credentials, los datos ya vienen en user
          token._id = user._id;
          token.firstName = user.firstName;
          token.lastName = user.lastName;
          token.role = user.role;
          token.tenantId = user.tenantId;
          token.tenantName = user.tenantName;
          token.accountProvider = user.accountProvider;
          token.access_token = user.access_token;
          token.refresh_token = (user as any).refresh_token;
          token.expires_at = (user as any).expires_at;
          token.backendTokens = (user as any).backendTokens;
        }
      }

      return token;
    },

    async session({ token, session }) {
      // Construir session.user desde el token (que ya tiene todos los datos)
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

      // Asignar backendTokens
      if (token.access_token) {
        // Para usuarios de credentials (nueva estructura)
        session.backendTokens = {
          accessToken: token.access_token as string,
          refreshToken: token.refresh_token as string,
          expiresIn: token.expires_at as number,
        };
      } else if (token.backendTokens) {
        // Para usuarios de Google/Azure
        session.backendTokens = token.backendTokens;
      } else {
        // Fallback - crear backendTokens vacío para evitar errores
        session.backendTokens = {
          accessToken: "",
          refreshToken: "",
          expiresIn: 0,
        };
      }

      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
