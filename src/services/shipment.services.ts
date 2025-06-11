import { Shipment } from "@/features/shipments";
import { BASE_URL, HTTPRequests } from "@/config/axios.config";

export class ShipmentServices {
  static async getAllShipments() {
    return await HTTPRequests.get(`${BASE_URL}/api/shipments`);
  }
  static async getShipmentById(shipmentId: Shipment["_id"]) {
    return await HTTPRequests.get(`${BASE_URL}/api/shipments/${shipmentId}`);
  }
  static async deleteShipment(shipmentId: Shipment["_id"]) {
    return await HTTPRequests.delete(`${BASE_URL}/api/shipments/${shipmentId}`);
  }
  static async updateShipment(
    shipmentId: Shipment["_id"],
    data: Partial<Shipment>
  ) {
    return await HTTPRequests.put(
      `${BASE_URL}/api/shipments/${shipmentId}`,
      data
    );
  }
}
