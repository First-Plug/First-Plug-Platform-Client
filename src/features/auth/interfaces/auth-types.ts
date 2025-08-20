import { z } from "zod";

// ============================================================================
// JWT USER (Datos del token después del login exitoso)
// ============================================================================
export interface JWTUser {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  tenantId: string;
  tenantName: string;
  accountProvider: "credentials" | "google" | "azure-ad";
}

// ============================================================================
// DATOS PERSONALES DEL USUARIO (GET /users/profile)
// ============================================================================
export interface UserProfile {
  firstName: string;
  lastName: string;
  phone?: string;
  address?: string;        // Dirección PERSONAL
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;
  apartment?: string;
  widgets: Array<{
    id: string;
    order: number;
  }>;
}

// ============================================================================
// DATOS DE OFICINA (GET /offices/default)
// ============================================================================
export interface OfficeInfo {
  name: string;
  email: string;
  phone?: string;
  address?: string;        // Dirección de OFICINA
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;
  apartment?: string;
}

// ============================================================================
// CONFIGURACIÓN DE EMPRESA (GET /tenants/config)
// ============================================================================
export interface TenantConfig {
  tenantName: string;
  name: string;
  isRecoverableConfig: Record<string, boolean>;
  computerExpiration: number;
}

// ============================================================================
// ESTADO COMPLETO DEL USUARIO
// ============================================================================
export interface CompleteUserState {
  jwt: JWTUser;
  profile: UserProfile | null;
  office: OfficeInfo | null;
  tenant: TenantConfig | null;
}

// ============================================================================
// TIPOS PARA FORMULARIOS
// ============================================================================
export interface RegisterFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  accountProvider: "credentials";
}

export interface LoginFormData {
  email: string;
  password: string;
}

// ============================================================================
// RESPUESTAS DE LA API
// ============================================================================
export interface LoginSuccessResponse {
  access_token: string;
  user: JWTUser;
}

export interface LoginErrorResponse {
  error: string;
  message: string;
  statusCode: number;
}

// ============================================================================
// TIPOS PARA NEXT-AUTH
// ============================================================================
export interface NextAuthUser extends JWTUser {
  access_token: string;
}

// ============================================================================
// VALIDACIONES ZOD
// ============================================================================
const onlyLetters = /^[A-Za-z\s\u00C0-\u00FF]+$/;
const phoneRegex = /^\+?[0-9\s]*$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const registerSchema = z.object({
  firstName: z
    .string()
    .min(1, "First name is required")
    .regex(onlyLetters, "First name can only contain letters"),
  
  lastName: z
    .string()
    .min(1, "Last name is required")
    .regex(onlyLetters, "Last name can only contain letters"),
  
  email: z
    .string()
    .min(1, "Email is required")
    .regex(emailRegex, "Please enter a valid email address"),
  
  password: z
    .string()
    .min(1, "Password is required")
    .min(6, "Password must be at least 6 characters long")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d!@#\$%\^&\*\(\)_\+\-=\[\]\{\};':"\\|,.<>\/?]{6,}$/,
      "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    ),
  
  confirmPassword: z
    .string()
    .min(1, "Please confirm your password"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .regex(emailRegex, "Please enter a valid email address"),
  
  password: z
    .string()
    .min(1, "Password is required"),
});

export type RegisterFormSchema = z.infer<typeof registerSchema>;
export type LoginFormSchema = z.infer<typeof loginSchema>;
