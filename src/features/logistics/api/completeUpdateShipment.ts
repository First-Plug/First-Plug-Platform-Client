import { BASE_URL, HTTPRequests } from "@/config/axios.config";

export interface CompleteUpdateShipmentData {
  shipment_status: string;
  price: {
    amount: number;
    currency: string;
  };
  shipment_type: string;
  trackingURL?: string;
}

export interface CompleteUpdateShipmentResponse {
  success: boolean;
  message: string;
  data?: any;
}

export const completeUpdateShipment = async (
  tenantName: string,
  shipmentId: string,
  data: CompleteUpdateShipmentData
): Promise<CompleteUpdateShipmentResponse> => {
  try {
    const response = await HTTPRequests.patch(
      `${BASE_URL}/api/superadmin/shipments/${tenantName}/${shipmentId}/complete-update`,
      data
    );

    return {
      success: true,
      message: "Shipment updated successfully",
      data: response.data,
    };
  } catch (error: any) {
    console.error("Error updating shipment:", error);

    return {
      success: false,
      message: error.response?.data?.message || "Failed to update shipment",
      data: null,
    };
  }
};
