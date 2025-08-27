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
        if (order.origin !== "FP warehouse") {
          openModal(
            order.originDetails,
            order.origin !== "Our office",
            order.origin
          );
        }
      },
      [order.origin, openModal, order.originDetails]
    );

    const handleDestinationClick = React.useCallback(
      (e: React.MouseEvent) => {
        e.stopPropagation();
        if (order.destination !== "FP warehouse") {
          openModal(
            order.destinationDetails,
            order.destination !== "Our office",
            order.destination
          );
        }
      },
      [order.destination, openModal, order.destinationDetails]
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
                <div className="text-gray-600 text-sm">
                  Date:{" "}
                  {new Date(
                    order.originDetails.desirableDate
                  ).toLocaleDateString()}
                </div>
                <div className="text-gray-600 text-sm">
                  From:{" "}
                  <span
                    className={`${
                      order.origin !== "FP warehouse"
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
                <div className="text-gray-600 text-sm">
                  Date:{" "}
                  {new Date(
                    order.destinationDetails.desirableDate
                  ).toLocaleDateString()}
                </div>
                <div className="text-gray-600 text-sm">
                  To:{" "}
                  <span
                    className={`${
                      order.destination !== "FP warehouse"
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
              {order.snapshots && order.snapshots.length > 0 ? (
                order.snapshots.map((snapshot, index) => (
                  <div key={index} className="bg-white p-3 border rounded-md">
                    <div className="flex flex-wrap gap-4">
                      {snapshot.name && (
                        <div className="text-gray-600 text-sm">
                          <span className="font-medium text-gray-700">
                            Name:
                          </span>{" "}
                          {snapshot.name}
                        </div>
                      )}

                      {snapshot.attributes && snapshot.attributes.length > 0 ? (
                        snapshot.attributes
                          .filter(
                            (attr) => attr.value && attr.value.trim() !== ""
                          )
                          .map((attr, attrIndex) => (
                            <div
                              key={attrIndex}
                              className="text-gray-600 text-sm"
                            >
                              <span className="font-medium text-gray-700">
                                {attr.key.charAt(0).toUpperCase() +
                                  attr.key.slice(1)}
                                :
                              </span>{" "}
                              {attr.value}
                            </div>
                          ))
                      ) : (
                        <div className="text-gray-500 text-sm">
                          No attributes available
                        </div>
                      )}

                      {snapshot.serialNumber && (
                        <div className="text-gray-600 text-sm">
                          <span className="font-medium text-gray-700">
                            Serial Number:
                          </span>{" "}
                          {snapshot.serialNumber}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-white p-3 border rounded-md">
                  <div className="text-gray-500 text-sm text-center">
                    No product details available
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
);

ExpandedRowContent.displayName = "ExpandedRowContent";
