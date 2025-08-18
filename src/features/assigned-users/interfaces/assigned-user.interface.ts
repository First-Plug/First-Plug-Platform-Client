export interface AssignedUser {
  id: string;
  assignedTenant: string; // "" para Internal FP, "Tenant" para otros
  name: string; // nombre y apellido
  email: string; // assigned email
  role: "User" | "Admin" | "Super Admin";
}
