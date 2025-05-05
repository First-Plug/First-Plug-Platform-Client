import { ShipmentsResponse } from "../interfaces/shipments-response.interface";
import { BASE_URL, HTTPRequests } from "@/config/axios.config";

export class ShipmentServices {
  static async getAll(pageIndex: number, pageSize: number) {
    const response = await HTTPRequests.get(
      `${BASE_URL}/api/shipments?page=${pageIndex}&size=${pageSize}`
    );

    return response.data as ShipmentsResponse;
  }

  static async cancel(shipmentId: string) {
    const response = await HTTPRequests.patch(
      `${BASE_URL}/api/shipments/${shipmentId}/cancel`
    );

    return response.data;
  }
}
