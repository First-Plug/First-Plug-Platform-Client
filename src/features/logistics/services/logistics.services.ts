import { BASE_URL, HTTPRequests } from "@/config/axios.config";
import { LogisticOrder } from "../interfaces/logistics";

export class LogisticsServices {
  static async exportLogisticsCsv(): Promise<void> {
    try {
      const response = await HTTPRequests.get(
        `${BASE_URL}/api/logistics/export-csv`,
        {
          responseType: "blob",
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "logistics_report.csv");
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.log("API not available, exporting mock data as CSV");
      this.exportMockDataAsCsv();
    }
  }

  private static exportMockDataAsCsv(): void {
    import("../data/mockData").then(({ mockLogisticOrders }) => {
      const csvContent = this.convertToCSV(mockLogisticOrders);
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "logistics_report.csv");
      document.body.appendChild(link);
      link.click();
      link.remove();
    });
  }

  private static convertToCSV(data: LogisticOrder[]): string {
    const headers = [
      "Order ID",
      "Tenant",
      "Quantity",
      "Order Date",
      "Shipment Status",
      "Price",
      "Origin",
      "Destination",
      "Products",
      "Shipment Type",
      "Tracking URL",
      "Destination Details",
      "Updated At",
    ];

    const formatDate = (dateString: string): string => {
      if (!dateString) return "-";
      const date = new Date(dateString);
      if (Number.isNaN(date.getTime())) return dateString;

      return date.toLocaleDateString("en-US", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    };

    const formatDateTime = (dateString: string): string => {
      if (!dateString) return "-";
      const date = new Date(dateString);
      if (Number.isNaN(date.getTime())) return dateString;

      return date.toLocaleDateString("en-US", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    };

    const csvRows = [
      headers.join(","),
      ...data.map((row) =>
        [
          row.orderId,
          row.tenant,
          row.quantity,
          formatDate(row.orderDate),
          row.shipmentStatus,
          row.price,
          row.origin,
          row.destination,
          row.products,
          row.shipmentType,
          row.trackingURL,
          row.destinationDetails,
          formatDateTime(row.updatedAt),
        ]
          .map((field) => `"${field}"`)
          .join(",")
      ),
    ];

    return csvRows.join("\n");
  }
}
