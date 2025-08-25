import { BASE_URL, HTTPRequests } from "@/config/axios.config";
import { LogisticOrder } from "../interfaces/logistics";
import { ShipmentsResponse, Shipment } from "../interfaces/shipments";

export class LogisticsServices {
  static async getAllShipments(): Promise<LogisticOrder[]> {
    try {
      const response = await HTTPRequests.get(
        `${BASE_URL}/api/superadmin/shipments/all`
      );

      const sortedShipments = response.data.shipments.sort(
        (a: LogisticOrder, b: LogisticOrder) => {
          const dateA = new Date(a.createdAt);
          const dateB = new Date(b.createdAt);

          return dateB.getTime() - dateA.getTime();
        }
      );

      return sortedShipments;
    } catch (error) {
      console.error("Error fetching logistics shipments:", error);
      return [];
    }
  }
}
