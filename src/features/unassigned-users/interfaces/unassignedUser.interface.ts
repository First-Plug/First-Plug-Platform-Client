export interface UnassignedUser {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: "user" | "admin" | "superadmin" | null;
  tenantId: null;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface AssignUserToTenantRequest {
  tenantId: string;
  role: "user" | "admin" | "superadmin";
}

export const AVAILABLE_ROLES = ["user", "admin", "superadmin"] as const;
export type UserRole = (typeof AVAILABLE_ROLES)[number];
