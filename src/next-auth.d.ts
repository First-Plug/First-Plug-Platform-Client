import NextAuth from "next-auth";
import { JWT } from "next-auth/jwt";

declare module "next-auth" {
  /**
   * Extender la interfaz User para incluir propiedades personalizadas
   */
  interface User {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    // Propiedades personalizadas de nuestro sistema
    _id?: string;
    firstName?: string;
    lastName?: string;
    role?: string;
    tenantId?: string;
    tenantName?: string;
    accountProvider?: "credentials" | "google" | "azure-ad";
    access_token?: string;
    // Propiedades de compatibilidad con el sistema anterior
    password?: string | null;
    isRecoverableConfig?: Record<string, boolean>;
    widgets?: Array<{ id: string; order: number }>;
  }

  /**
   * Extender la interfaz Session para incluir propiedades personalizadas
   */
  interface Session {
    user: {
      _id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      firstName?: string;
      lastName?: string;
      role?: string;
      tenantId?: string;
      tenantName?: string;
      accountProvider?: "credentials" | "google" | "azure-ad";
      // Propiedades de compatibilidad
      password?: string | null;
      isRecoverableConfig?: Record<string, boolean>;
      widgets?: Array<{ id: string; order: number }>;
    };
    backendTokens?: {
      accessToken: string;
      refreshToken: string;
      expiresIn: number;
    };
  }
}

declare module "next-auth/jwt" {
  /**
   * Extender la interfaz JWT para incluir propiedades personalizadas
   */
  interface JWT {
    // Propiedades estándar de Next-Auth
    name?: string | null;
    email?: string | null;
    picture?: string | null;
    sub?: string;

    // Propiedades personalizadas de nuestro sistema
    _id?: string;
    firstName?: string;
    lastName?: string;
    role?: string;
    tenantId?: string;
    tenantName?: string;
    accountProvider?: "credentials" | "google" | "azure-ad";
    access_token?: string;
    refresh_token?: string;
    expires_at?: number;

    // Propiedades de compatibilidad con el sistema anterior
    user?: any;
    backendTokens?: {
      accessToken: string;
      refreshToken: string;
      expiresIn: number;
    };
  }
}
