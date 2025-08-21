import { Tenant } from "../interfaces/tenant.interface";

export const mockTenants: Tenant[] = [
  {
    id: "1",
    name: "First Plug Solutions",
    numberOfActiveUsers: 25,
    users: [
      {
        id: "1",
        firstName: "Juan",
        lastName: "Pérez",
        email: "juan.perez@firstplug.com",
        role: "Admin",
        createdAt: "2024-01-15",
      },
      {
        id: "2",
        firstName: "María",
        lastName: "García",
        email: "maria.garcia@firstplug.com",
        role: "Manager",
        createdAt: "2024-02-20",
      },
      {
        id: "3",
        firstName: "Carlos",
        lastName: "López",
        email: "carlos.lopez@firstplug.com",
        role: "User",
        createdAt: "2024-03-10",
      },
    ],
  },
  {
    id: "2",
    name: "TechCorp Industries",
    numberOfActiveUsers: 18,
    users: [
      {
        id: "4",
        firstName: "Ana",
        lastName: "Martínez",
        email: "ana.martinez@techcorp.com",
        role: "Admin",
        createdAt: "2024-01-10",
      },
      {
        id: "5",
        firstName: "Luis",
        lastName: "Rodríguez",
        email: "luis.rodriguez@techcorp.com",
        role: "Manager",
        createdAt: "2024-02-15",
      },
    ],
  },
  {
    id: "3",
    name: "Global Solutions Ltd",
    numberOfActiveUsers: 32,
    users: [
      {
        id: "6",
        firstName: "Sofia",
        lastName: "Hernández",
        email: "sofia.hernandez@globalsolutions.com",
        role: "Admin",
        createdAt: "2024-01-05",
      },
      {
        id: "7",
        firstName: "Diego",
        lastName: "Fernández",
        email: "diego.fernandez@globalsolutions.com",
        role: "Manager",
        createdAt: "2024-01-20",
      },
      {
        id: "8",
        firstName: "Elena",
        lastName: "Moreno",
        email: "elena.moreno@globalsolutions.com",
        role: "User",
        createdAt: "2024-02-25",
      },
    ],
  },
];
