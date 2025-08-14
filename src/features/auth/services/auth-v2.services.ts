import { BASE_URL, HTTPRequests } from "@/config/axios.config";
import axios from "axios";
import {
  RegisterFormData,
  LoginFormData,
  LoginSuccessResponse,
  UserProfile,
  OfficeInfo,
  TenantConfig,
} from "../interfaces/auth-types";

export class AuthV2Services {
  // ============================================================================
  // REGISTRO DE USUARIO (sin tenant)
  // ============================================================================
  static async register(
    data: Omit<RegisterFormData, "confirmPassword">
  ): Promise<void> {
    try {
      const response = await axios.post(`${BASE_URL}/users`, {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
        accountProvider: data.accountProvider,
      });
      return response.data;
    } catch (error: any) {
      console.error("Registration error:", error);
      throw error;
    }
  }

  // ============================================================================
  // LOGIN DE USUARIO
  // ============================================================================
  static async login(data: LoginFormData): Promise<LoginSuccessResponse> {
    try {
      const response = await axios.post(`${BASE_URL}/api/auth/login`, {
        email: data.email,
        password: data.password,
      });

      return response.data as LoginSuccessResponse;
    } catch (error: any) {
      console.error("Login error:", error);

      // CASO 1: Usuario sin tenant asignado (credenciales correctas)
      if (
        error?.response?.status === 401 &&
        error?.response?.data?.message ===
          "Usuario sin tenant asignado. Contacte al administrador."
      ) {
        throw {
          type: "NO_TENANT",
          message: "Usuario sin tenant asignado. Contacte al administrador.",
          user: error?.response?.data?.user || null,
          originalError: error,
        };
      }

      // CASO 2 y 3: Credenciales inválidas (password incorrecto o email incorrecto)
      if (
        error?.response?.status === 401 &&
        error?.response?.data?.message === "Credenciales inválidas"
      ) {
        throw {
          type: "INVALID_CREDENTIALS",
          message: "Invalid username or password. Please try again.",
          originalError: error,
        };
      }

      // Fallback para otros errores 401
      if (error?.response?.status === 401) {
        throw {
          type: "INVALID_CREDENTIALS",
          message: "Invalid username or password. Please try again.",
          originalError: error,
        };
      }

      throw error;
    }
  }

  // ============================================================================
  // OBTENER DATOS ADICIONALES DESPUÉS DEL LOGIN
  // ============================================================================

  /**
   * Obtiene el perfil personal del usuario
   */
  static async getUserProfile(): Promise<UserProfile> {
    try {
      const response = await HTTPRequests.get(`${BASE_URL}/users/profile`);
      return response.data;
    } catch (error) {
      console.error("Error fetching user profile:", error);
      throw error;
    }
  }

  /**
   * Obtiene los datos de la oficina por defecto
   */
  static async getDefaultOffice(): Promise<OfficeInfo> {
    try {
      const response = await HTTPRequests.get(`${BASE_URL}/offices/default`);
      return response.data;
    } catch (error) {
      console.error("Error fetching office info:", error);
      throw error;
    }
  }

  /**
   * Obtiene la configuración del tenant
   */
  static async getTenantConfig(): Promise<TenantConfig> {
    try {
      const response = await HTTPRequests.get(`${BASE_URL}/tenants/config`);
      return response.data;
    } catch (error) {
      console.error("Error fetching tenant config:", error);
      throw error;
    }
  }

  // ============================================================================
  // OBTENER TODOS LOS DATOS ADICIONALES EN PARALELO
  // ============================================================================
  static async getAdditionalUserData(): Promise<{
    profile: UserProfile | null;
    office: OfficeInfo | null;
    tenant: TenantConfig | null;
  }> {
    try {
      // Ejecutar todas las llamadas en paralelo
      const [profileResult, officeResult, tenantResult] =
        await Promise.allSettled([
          this.getUserProfile(),
          this.getDefaultOffice(),
          this.getTenantConfig(),
        ]);

      return {
        profile:
          profileResult.status === "fulfilled" ? profileResult.value : null,
        office: officeResult.status === "fulfilled" ? officeResult.value : null,
        tenant: tenantResult.status === "fulfilled" ? tenantResult.value : null,
      };
    } catch (error) {
      console.error("Error fetching additional user data:", error);
      throw error;
    }
  }

  // ============================================================================
  // REFRESH TOKEN (mantener compatibilidad)
  // ============================================================================
  static async refreshToken(refreshToken: string): Promise<any> {
    try {
      const response = await axios.post(
        `${BASE_URL}/auth/refresh`,
        {},
        {
          headers: {
            authorization: `Refresh ${refreshToken}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error refreshing token:", error);
      throw error;
    }
  }

  // ============================================================================
  // CAMBIAR CONTRASEÑA
  // ============================================================================
  static async changePassword(data: {
    oldPassword: string;
    newPassword: string;
  }): Promise<void> {
    try {
      const response = await HTTPRequests.post(
        `${BASE_URL}/auth/change-password`,
        data
      );
      return response.data;
    } catch (error) {
      console.error("Error changing password:", error);
      throw error;
    }
  }

  // ============================================================================
  // UTILIDADES
  // ============================================================================

  /**
   * Combina firstName y lastName para mostrar nombre completo
   */
  static getFullName(user: { firstName?: string; lastName?: string }): string {
    if (!user.firstName && !user.lastName) return "";
    return `${user.firstName || ""} ${user.lastName || ""}`.trim();
  }

  /**
   * Verifica si un usuario tiene todos los datos necesarios
   */
  static isUserDataComplete(user: {
    profile: UserProfile | null;
    office: OfficeInfo | null;
    tenant: TenantConfig | null;
  }): boolean {
    return !!(user.profile && user.office && user.tenant);
  }
}
