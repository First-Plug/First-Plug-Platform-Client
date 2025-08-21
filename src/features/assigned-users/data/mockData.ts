import { AssignedUser } from "../interfaces/assigned-user.interface";

export const mockAssignedUsers: AssignedUser[] = [
  {
    id: "1",
    assignedTenant: "Tenant",
    name: "Juan Pérez",
    email: "juan.perez@company.com",
    role: "User",
  },
  {
    id: "2",
    assignedTenant: "Tenant",
    name: "María García",
    email: "maria.garcia@company.com",
    role: "Admin",
  },
  {
    id: "3",
    assignedTenant: "",
    name: "Carlos Rodríguez",
    email: "carlos.rodriguez@firstplug.com",
    role: "Super Admin",
  },
  {
    id: "4",
    assignedTenant: "Tenant",
    name: "Ana López",
    email: "ana.lopez@company.com",
    role: "User",
  },
  {
    id: "5",
    assignedTenant: "",
    name: "Roberto Silva",
    email: "roberto.silva@firstplug.com",
    role: "Super Admin",
  },
  {
    id: "6",
    assignedTenant: "Tenant",
    name: "Laura Martínez",
    email: "laura.martinez@company.com",
    role: "Admin",
  },
  {
    id: "7",
    assignedTenant: "Tenant",
    name: "Diego Fernández",
    email: "diego.fernandez@company.com",
    role: "User",
  },
  {
    id: "8",
    assignedTenant: "",
    name: "Sofia Herrera",
    email: "sofia.herrera@firstplug.com",
    role: "Super Admin",
  },
];

export const availableTenants = ["Tenant"];
export const availableRoles = ["User", "Admin", "Super Admin"];
