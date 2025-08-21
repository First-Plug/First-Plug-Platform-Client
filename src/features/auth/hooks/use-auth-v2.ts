"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { AuthV2Services } from "../services/auth-v2.services";
import {
  RegisterFormData,
  LoginFormData,
  CompleteUserState,
  UserProfile,
  OfficeInfo,
  TenantConfig,
} from "../interfaces/auth-types";

// ============================================================================
// HOOK PARA REGISTRO
// ============================================================================
export const useRegisterV2 = () => {
  const router = useRouter();

  const registerMutation = useMutation({
    mutationFn: (data: Omit<RegisterFormData, "confirmPassword">) =>
      AuthV2Services.register(data),
    onSuccess: () => {
      // Redirigir a página de éxito o login
      router.push("/register/success");
    },
    onError: (error: any) => {
      console.error("Registration failed:", error);
    },
  });

  return {
    register: registerMutation.mutate,
    isLoading: registerMutation.isPending,
    error: registerMutation.error,
    isSuccess: registerMutation.isSuccess,
  };
};

// ============================================================================
// HOOK PARA LOGIN
// ============================================================================
export const useLoginV2 = () => {
  const router = useRouter();
  const [loginError, setLoginError] = useState<{
    type: "NO_TENANT" | "INVALID_CREDENTIALS" | "UNKNOWN";
    message: string;
  } | null>(null);

  const loginMutation = useMutation({
    mutationFn: async (data: LoginFormData) => {
      setLoginError(null);

      try {
        // Intentar login con el backend
        const loginResponse = await AuthV2Services.login(data);

        // Si el login es exitoso, usar Next-Auth para manejar la sesión
        const nextAuthResult = await signIn("credentials", {
          email: data.email,
          password: data.password,
          redirect: false,
        });

        if (!nextAuthResult?.ok) {
          throw new Error("Next-Auth login failed");
        }

        return loginResponse;
      } catch (error: any) {
        if (error.type === "NO_TENANT") {
          setLoginError({
            type: "NO_TENANT",
            message:
              "Tu cuenta está pendiente de asignación de empresa. Contacta al administrador.",
          });
        } else if (error.type === "INVALID_CREDENTIALS") {
          setLoginError({
            type: "INVALID_CREDENTIALS",
            message: "Email o contraseña incorrectos. Intenta de nuevo.",
          });
        } else {
          setLoginError({
            type: "UNKNOWN",
            message: "Error inesperado. Intenta de nuevo.",
          });
        }
        throw error;
      }
    },
    onSuccess: (data) => {
      // Limpiar cache y redirigir
      if (typeof window !== "undefined") {
        localStorage.clear();
        sessionStorage.clear();
      }

      console.log("🔍 LOGIN SUCCESS - User data:", {
        role: data?.user?.role,
        email: data?.user?.email,
        tenantName: data?.user?.tenantName,
      });

      // Redirigir según el rol del usuario
      const userRole = data?.user?.role;
      const userEmail = data?.user?.email;
      const adminEmails = ["hola@firstplug.com", "superadmin@mail.com"];

      if (userRole === "superadmin" || adminEmails.includes(userEmail)) {
        router.push("/home/logistics");
      } else {
        router.push("/home/dashboard");
      }
    },
  });

  return {
    login: loginMutation.mutate,
    isLoading: loginMutation.isPending,
    error: loginError,
    isSuccess: loginMutation.isSuccess,
    clearError: () => setLoginError(null),
  };
};

// ============================================================================
// HOOK PARA OBTENER DATOS ADICIONALES DEL USUARIO
// ============================================================================
export const useUserAdditionalData = (enabled: boolean = true) => {
  return useQuery({
    queryKey: ["userAdditionalData"],
    queryFn: AuthV2Services.getAdditionalUserData,
    enabled,
    staleTime: 1000 * 60 * 5, // 5 minutos
    retry: 2,
  });
};

// ============================================================================
// HOOK PARA DATOS ESPECÍFICOS
// ============================================================================
export const useUserProfile = () => {
  return useQuery<UserProfile>({
    queryKey: ["userProfile"],
    queryFn: AuthV2Services.getUserProfile,
    staleTime: 1000 * 60 * 5,
  });
};

export const useOfficeInfo = () => {
  return useQuery<OfficeInfo>({
    queryKey: ["officeInfo"],
    queryFn: AuthV2Services.getDefaultOffice,
    staleTime: 1000 * 60 * 5,
  });
};

export const useTenantConfig = () => {
  return useQuery<TenantConfig>({
    queryKey: ["tenantConfig"],
    queryFn: AuthV2Services.getTenantConfig,
    staleTime: 1000 * 60 * 5,
  });
};

// ============================================================================
// HOOK PRINCIPAL PARA ESTADO COMPLETO DEL USUARIO
// ============================================================================
export const useCompleteUserState = (): {
  userState: CompleteUserState | null;
  isLoading: boolean;
  error: any;
  refetch: () => void;
} => {
  const { data: session } = useSession();
  const {
    data: additionalData,
    isLoading,
    error,
    refetch,
  } = useUserAdditionalData(!!session?.user);

  // Combinar datos JWT de Next-Auth con datos adicionales
  const userState: CompleteUserState | null =
    session?.user && additionalData
      ? {
          jwt: {
            _id: (session.user as any)._id,
            email: session.user.email!,
            firstName: (session.user as any).firstName,
            lastName: (session.user as any).lastName,
            role: (session.user as any).role,
            tenantId: (session.user as any).tenantId,
            tenantName: (session.user as any).tenantName,
            accountProvider: (session.user as any).accountProvider,
          },
          profile: additionalData.profile,
          office: additionalData.office,
          tenant: additionalData.tenant,
        }
      : null;

  return {
    userState,
    isLoading,
    error,
    refetch,
  };
};

// ============================================================================
// UTILIDADES
// ============================================================================
export const useAuthUtils = () => {
  return {
    getFullName: AuthV2Services.getFullName,
    isUserDataComplete: AuthV2Services.isUserDataComplete,
  };
};
