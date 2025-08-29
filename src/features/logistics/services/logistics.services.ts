import { BASE_URL, HTTPRequests } from "@/config/axios.config";
import { LogisticOrder } from "../interfaces/logistics";
import { ShipmentsResponse, Shipment } from "../interfaces/shipments";

export class LogisticsServices {
  static async getAllShipments(
    startDate?: string,
    endDate?: string
  ): Promise<LogisticOrder[]> {
    try {
      let url = `${BASE_URL}/api/superadmin/shipments/all`;
      
      // Agregar parámetros de fecha si están disponibles
      if (startDate && endDate) {
        url += `?startDate=${startDate}&endDate=${endDate}`;
      }

      const response = await HTTPRequests.get(url);

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
