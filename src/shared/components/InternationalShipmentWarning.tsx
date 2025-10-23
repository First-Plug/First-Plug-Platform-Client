"use client";

import React from "react";
import { GenericAlertDialog } from "@/features/assets";

interface InternationalShipmentWarningProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const InternationalShipmentWarning: React.FC<
  InternationalShipmentWarningProps
> = ({ isOpen, onConfirm, onCancel }) => {
  return (
    <GenericAlertDialog
      open={isOpen}
      onClose={onCancel}
      title="⚠️ International Shipment Warning"
      description="<div style='line-height: 1.6; margin-bottom: 16px;'>Cross-country shipments may result in very high costs (often higher than purchasing a new product) and desired pickup/delivery dates are unlikely to be met.</div><div style='line-height: 1.6; font-weight: 500;'>Do you still want to proceed with this shipment?</div>"
      buttonText="Confirm"
      onButtonClick={onConfirm}
      showCancelButton={true}
      cancelButtonText="Cancel"
      onCancel={onCancel}
      isHtml={true}
    />
  );
};
