"use client";

import React from "react";
import { LogisticOrder } from "../interfaces/logistics";
import { useMemberModalStore } from "../store/memberModal.store";

interface ExpandedRowContentProps {
  order: LogisticOrder;
}

export const ExpandedRowContent = React.memo<ExpandedRowContentProps>(
  ({ order }) => {
    const { openModal } = useMemberModalStore();

    const handleOriginClick = React.useCallback(
      (e: React.MouseEvent) => {
        e.stopPropagation();
        if (order.origin !== "FP Warehouse") {
          openModal(order.origin);
        }
      },
      [order.origin, openModal]
    );

    const handleDestinationClick = React.useCallback(
      (e: React.MouseEvent) => {
        e.stopPropagation();
        if (order.destination !== "FP Warehouse") {
          openModal(order.destination);
        }
      },
      [order.destination, openModal]
    );

    return (
      <div
        className="bg-gray-50 p-4 border-gray-200 border-b w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="space-y-6">
          <div className="gap-4 grid grid-cols-1 md:grid-cols-2">
            <div>
              <h4 className="mb-2 font-semibold text-gray-900">
                Origin / Pickup Date:
              </h4>
              <div className="bg-white p-3 border rounded-md">
                <div className="text-gray-600 text-sm">Date: 15/1/2024</div>
                <div className="text-gray-600 text-sm">
                  From:{" "}
                  <span
                    className={`${
                      order.origin !== "FP Warehouse"
                        ? "text-blue hover:text-blue-800 bg-blue-100 rounded cursor-pointer"
                        : "text-gray-600"
                    }`}
                    onClick={handleOriginClick}
                  >
                    {order.origin}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="mb-2 font-semibold text-gray-900">
                Destination / Delivery Date:
              </h4>
              <div className="bg-white p-3 border rounded-md">
                <div className="text-gray-600 text-sm">Date: 19/1/2024</div>
                <div className="text-gray-600 text-sm">
                  To:{" "}
                  <span
                    className={`${
                      order.destination !== "FP Warehouse"
                        ? "text-blue hover:text-blue-800 bg-blue-100 rounded cursor-pointer"
                        : "text-gray-600"
                    }`}
                    onClick={handleDestinationClick}
                  >
                    {order.destination}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h4 className="mb-3 font-semibold text-gray-900">
              Products to Send:
            </h4>
            <div className="space-y-3">
              <div className="bg-white p-3 border rounded-md">
                <div className="flex flex-wrap gap-4">
                  <div className="text-gray-600 text-sm">
                    <span className="font-medium text-gray-700">Category:</span>{" "}
                    Electronics
                  </div>
                  <div className="text-gray-600 text-sm">
                    <span className="font-medium text-gray-700">Brand:</span>{" "}
                    Samsung
                  </div>
                  <div className="text-gray-600 text-sm">
                    <span className="font-medium text-gray-700">Model:</span>{" "}
                    Galaxy S23
                  </div>
                  <div className="text-gray-600 text-sm">
                    <span className="font-medium text-gray-700">Name:</span>{" "}
                    Smartphone
                  </div>
                  <div className="text-gray-600 text-sm">
                    <span className="font-medium text-gray-700">Serial:</span>{" "}
                    SN001234
                  </div>
                </div>
              </div>
              <div className="bg-white p-3 border rounded-md">
                <div className="flex flex-wrap gap-4">
                  <div className="text-gray-600 text-sm">
                    <span className="font-medium text-gray-700">Category:</span>{" "}
                    Accessories
                  </div>
                  <div className="text-gray-600 text-sm">
                    <span className="font-medium text-gray-700">Brand:</span>{" "}
                    Samsung
                  </div>
                  <div className="text-gray-600 text-sm">
                    <span className="font-medium text-gray-700">Model:</span>{" "}
                    EP-TA300
                  </div>
                  <div className="text-gray-600 text-sm">
                    <span className="font-medium text-gray-700">Name:</span>{" "}
                    Charger
                  </div>
                  <div className="text-gray-600 text-sm">
                    <span className="font-medium text-gray-700">Serial:</span>{" "}
                    SN001235
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

ExpandedRowContent.displayName = "ExpandedRowContent";
