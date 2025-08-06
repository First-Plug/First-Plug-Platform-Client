import {
  Shipment,
  UpdateShipment,
} from "../interfaces/shipments-response.interface";
import { BASE_URL, HTTPRequests } from "@/config/axios.config";

export class ShipmentServices {
  static async getAll() {
    const response = await HTTPRequests.get(`${BASE_URL}/api/shipments`);

    return response.data as Shipment[];
  }

  static async cancel(shipmentId: string) {
    const response = await HTTPRequests.patch(
      `${BASE_URL}/api/shipments/${shipmentId}/cancel`
    );

    return response.data;
  }

  static async update(shipmentId: string, body: UpdateShipment) {
    const response = await HTTPRequests.patch(
      `${BASE_URL}/api/shipments/${shipmentId}`,
      body
    );

    return response.data;
  }

  static async findShipmentPage(shipmentId: string, pageSize: number) {
    const response = await HTTPRequests.get(
      `${BASE_URL}/api/shipments/find-page/${shipmentId}?size=${pageSize}`
    );
    return response.data as { page: number };
  }
}
