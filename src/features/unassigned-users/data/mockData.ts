import { UnassignedUser } from "../interfaces/unassigned-user.interface";

export const mockUnassignedUsers: UnassignedUser[] = [
  {
    id: "1",
    creationDate: "2024-01-15T10:30:00Z",
    name: "Juan Pérez",
    email: "juan.perez@empresa1.com",
    tenant: "",
    role: "",
  },
  {
    id: "2",
    creationDate: "2024-01-20T14:45:00Z",
    name: "María González",
    email: "maria.gonzalez@empresa2.com",
    tenant: "",
    role: "",
  },
  {
    id: "3",
    creationDate: "2024-01-25T09:15:00Z",
    name: "Carlos Rodríguez",
    email: "carlos.rodriguez@empresa3.com",
    tenant: "",
    role: "",
  },
  {
    id: "4",
    creationDate: "2024-02-01T11:20:00Z",
    name: "Ana Martínez",
    email: "ana.martinez@empresa1.com",
    tenant: "",
    role: "",
  },
  {
    id: "5",
    creationDate: "2024-02-05T16:30:00Z",
    name: "Luis Fernández",
    email: "luis.fernandez@empresa4.com",
    tenant: "",
    role: "",
  },
  {
    id: "6",
    creationDate: "2024-02-10T13:45:00Z",
    name: "Sofia López",
    email: "sofia.lopez@empresa2.com",
    tenant: "",
    role: "",
  },
  {
    id: "7",
    creationDate: "2024-02-15T08:00:00Z",
    name: "Roberto Silva",
    email: "roberto.silva@empresa5.com",
    tenant: "",
    role: "",
  },
  {
    id: "8",
    creationDate: "2024-02-20T15:30:00Z",
    name: "Carmen Ruiz",
    email: "carmen.ruiz@empresa3.com",
    tenant: "",
    role: "",
  },
  {
    id: "9",
    creationDate: "2024-02-25T12:15:00Z",
    name: "Diego Morales",
    email: "diego.morales@empresa1.com",
    tenant: "",
    role: "",
  },
  {
    id: "10",
    creationDate: "2024-03-01T10:00:00Z",
    name: "Patricia Castro",
    email: "patricia.castro@empresa6.com",
    tenant: "",
    role: "",
  },
];

// Opciones disponibles para tenant
export const availableTenants = [
  "Empresa A",
  "Empresa B",
  "Empresa C",
  "Empresa D",
  "Empresa E",
  "Empresa F",
];

// Opciones disponibles para role
export const availableRoles = ["Admin", "User", "Super Admin"];
