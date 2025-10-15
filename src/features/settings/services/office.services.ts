import { BASE_URL, HTTPRequests } from "@/config/axios.config";
import { Office, UpdateOffice, CreateOffice } from "../types/settings.types";

export class OfficeServices {
  // Obtener todas las oficinas
  static async getOffices(): Promise<Office[]> {
    const response = await HTTPRequests.get(`${BASE_URL}/api/offices`);
    return response.data;
  }

  // Obtener oficina por ID
  static async getOfficeById(id: string): Promise<Office> {
    const response = await HTTPRequests.get(`${BASE_URL}/api/offices/${id}`);
    return response.data;
  }

  // Crear nueva oficina
  static async createOffice(data: CreateOffice): Promise<Office> {
    const response = await HTTPRequests.post(`${BASE_URL}/api/offices`, data);
    return response.data;
  }

  // Actualizar oficina
  static async updateOffice(id: string, data: UpdateOffice): Promise<Office> {
    const response = await HTTPRequests.patch(
      `${BASE_URL}/api/offices/${id}`,
      data
    );
    return response.data;
  }

  // Eliminar oficina
  static async deleteOffice(id: string): Promise<void> {
    await HTTPRequests.delete(`${BASE_URL}/api/offices/${id}`);
  }

  // Establecer oficina por defecto (toggle)
  static async setDefaultOffice(id: string): Promise<Office> {
    const response = await HTTPRequests.patch(
      `${BASE_URL}/api/offices/${id}/toggle-default`
    );
    return response.data;
  }

  // Métodos legacy para compatibilidad (mantener por si se usan en otros lugares)
  static async getDefaultOffice(): Promise<Office> {
    const response = await HTTPRequests.get(`${BASE_URL}/api/offices/default`);
    return response.data;
  }

  static async updateDefaultOffice(data: UpdateOffice): Promise<Office> {
    const response = await HTTPRequests.patch(
      `${BASE_URL}/api/offices/default`,
      data
    );
    return response.data;
  }
}
