"use client";

import { createPortal } from "react-dom";
import { useMemberModalStore } from "../store/memberModal.store";

export const MemberModalProvider = () => {
  const { isOpen, orderDetails, closeModal, isMember, memberName } =
    useMemberModalStore();

  if (typeof window === "undefined") {
    return null;
  }

  if (!isOpen) {
    return null;
  }

  return createPortal(
    <div className="z-[9999] fixed inset-0 pointer-events-none">
      <div
        className="absolute inset-0 bg-black/20 pointer-events-auto"
        onClick={closeModal}
      />
      <div className="top-1/2 left-1/2 absolute -translate-x-1/2 -translate-y-1/2 pointer-events-auto transform">
        <div className="bg-white shadow-xl mx-4 border border-gray-200 rounded-lg w-full max-w-2xl animate-in duration-200 fade-in-0 zoom-in-95">
          <div className="flex justify-between items-center p-6 border-b">
            <h2 className="font-semibold text-gray-900 text-xl">
              {isMember ? `Member Details - ${memberName}` : "Office Details"}
            </h2>
            <button
              onClick={closeModal}
              className="p-1 text-gray-500 hover:text-gray-700"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <div className="p-6">
            <div className="gap-6 grid grid-cols-1 md:grid-cols-2">
              <div className="space-y-4">
                <div className="flex flex-col">
                  <span className="font-medium text-gray-700 text-base">
                    Country
                  </span>
                  <span className="text-gray-900 text-sm">
                    {orderDetails?.country || "Not specified"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="font-medium text-gray-700 text-base">
                    City
                  </span>
                  <span className="text-gray-900 text-sm">
                    {orderDetails?.city || "Not specified"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="font-medium text-gray-700 text-base">
                    Address
                  </span>
                  <span className="text-gray-900 text-sm">
                    {orderDetails?.address || "Not specified"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="font-medium text-gray-700 text-base">
                    Apartment/Floor
                  </span>
                  <span className="text-gray-900 text-sm">
                    {orderDetails?.apartment || "Not specified"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="font-medium text-gray-700 text-base">
                    Phone
                  </span>
                  <span className="text-gray-900 text-sm">
                    {orderDetails?.phone || "Not specified"}
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex flex-col">
                  <span className="font-medium text-gray-700 text-base">
                    State/Province
                  </span>
                  <span className="text-gray-900 text-sm">
                    {orderDetails?.state || "Not specified"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="font-medium text-gray-700 text-base">
                    Zip Code
                  </span>
                  <span className="text-gray-900 text-sm">
                    {orderDetails?.zipCode || "Not specified"}
                  </span>
                </div>

                {/* Campos condicionales según el tipo de usuario */}
                {isMember ? (
                  <>
                    <div className="flex flex-col">
                      <span className="font-medium text-gray-700 text-base">
                        Assigned Email
                      </span>
                      <span className="text-gray-900 text-sm">
                        {orderDetails?.assignedEmail || "Not specified"}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="font-medium text-gray-700 text-base">
                        Personal Email
                      </span>
                      <span className="text-gray-900 text-sm">
                        {orderDetails?.personalEmail || "Not specified"}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="font-medium text-gray-700 text-base">
                        DNI/Passport
                      </span>
                      <span className="text-gray-900 text-sm">
                        {orderDetails?.dni || "Not specified"}
                      </span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex flex-col">
                      <span className="font-medium text-gray-700 text-base">
                        Email
                      </span>
                      <span className="text-gray-900 text-sm">
                        {orderDetails?.assignedEmail || "Not specified"}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
