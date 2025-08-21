import { UnassignedUser } from "../interfaces/unassigned-user.interface";

export class UnassignedUsersServices {
  static async assignUser(
    userId: string,
    data: { tenant: string; role: string }
  ): Promise<UnassignedUser> {
    // Simular delay de API
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Retornar el usuario "asignado" (esto simula la respuesta del backend)
    return {
      id: userId,
      creationDate: new Date().toISOString(),
      name: "Usuario Asignado",
      email: "usuario@asignado.com",
      tenant: data.tenant,
      role: data.role as "Admin" | "User" | "Super Admin",
    };
  }
}
