"use client";

import { PageLayout, Button, SectionTitle } from "@/shared";
import { Package, Wrench, Plus } from "lucide-react";

export default function NewQuoteRequestPage() {
  const handleAddProduct = () => {
    // TODO: Implementar lógica para agregar producto
    console.log("Add product clicked");
  };

  return (
    <PageLayout>
      <div className="flex flex-col p-6 w-full h-full">
        {/* Header */}
        <div className="flex justify-end items-start mb-6">
          <div className="flex gap-3">
            <Button
              variant="primary"
              icon={<Package size={18} color="white" strokeWidth={2} />}
              onClick={handleAddProduct}
              size="small"
              body="Add Product"
            />
          </div>
        </div>

        {/* Content Area */}
        <div className="flex justify-center items-center bg-white border border-grey rounded-lg">
          <div className="flex flex-col justify-center items-center p-8 text-center">
            <div className="flex justify-center items-center mb-4">
              <div className="bg-blue/10 p-4 rounded-full">
                <Plus
                  size={48}
                  className="text-blue"
                  color="black"
                  strokeWidth={1.5}
                />
              </div>
            </div>
            <p className="mb-2 font-medium text-black text-lg">
              No items added yet
            </p>
            <p className="text-dark-grey text-sm">
              Start by adding products or services to your quote request
            </p>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
