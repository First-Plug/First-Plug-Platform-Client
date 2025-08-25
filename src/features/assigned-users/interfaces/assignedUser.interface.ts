export interface AssignedUser {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: "user" | "admin" | "superadmin";
  tenantId: {
    _id: string;
    name: string;
    tenantName: string;
  };
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface UpdateAssignedUserRequest {
  firstName?: string;
  lastName?: string;
  role?: "user" | "admin" | "superadmin";
  // email and tenantId are readonly - not included
}

export const AVAILABLE_ROLES = ["user", "admin", "superadmin"] as const;
export type UserRole = (typeof AVAILABLE_ROLES)[number];
