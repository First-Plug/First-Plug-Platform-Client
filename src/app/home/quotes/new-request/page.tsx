"use client";

import { useState } from "react";
import { PageLayout, Button, useToast } from "@/shared";
import { Package, Wrench, Send } from "lucide-react";
import {
  AddProductForm,
  QuoteProductCard,
  useQuoteStore,
  QuoteServices,
} from "@/features/quotes";

export default function NewQuoteRequestPage() {
  const { products, isAddingProduct, setIsAddingProduct, clearProducts } =
    useQuoteStore();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddProduct = () => {
    setIsAddingProduct(true);
  };

  const handleCancelAddProduct = () => {
    setIsAddingProduct(false);
  };

  const handleCompleteAddProduct = () => {
    setIsAddingProduct(false);
  };

  const handleSubmitRequest = async () => {
    if (products.length === 0) {
      toast({
        variant: "destructive",
        title: "No products",
        description: "Please add at least one product before submitting.",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await QuoteServices.submitQuoteRequest(products);

      clearProducts();
    } catch (error: any) {
      console.error("Error submitting quote request:", error);

      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "An error occurred while submitting your quote request. Please try again.";

      toast({
        variant: "destructive",
        title: "Submission Failed",
        description: errorMessage,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageLayout>
      <div className="flex flex-col mx-auto p-6 w-5/6 h-full">
        {/* Header */}
        <div className="flex justify-end items-start mb-6">
          <div className="flex gap-3">
            {!isAddingProduct && (
              <>
                <Button
                  variant="primary"
                  icon={<Package size={18} color="white" strokeWidth={2} />}
                  onClick={handleAddProduct}
                  size="small"
                  body="Add Product"
                />
                <Button
                  variant="secondary"
                  icon={<Wrench size={18} strokeWidth={2} />}
                  onClick={() => {}}
                  size="small"
                  body="Add Service"
                  disabled
                />
              </>
            )}
          </div>
        </div>

        {/* Content Area */}
        {isAddingProduct ? (
          <AddProductForm
            onCancel={handleCancelAddProduct}
            onComplete={handleCompleteAddProduct}
          />
        ) : products.length === 0 ? (
          <div className="flex justify-center items-center bg-white border border-grey rounded-lg min-h-[400px]">
            <div className="flex flex-col justify-center items-center p-8 text-center">
              <div className="flex justify-center items-center mb-4">
                <div className="bg-blue/10 p-4 rounded-full">
                  <Package
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
        ) : (
          <div className="flex flex-col items-end gap-4">
            <div className="bg-white rounded-lg w-full">
              <div className="flex flex-col gap-4">
                {products.map((product) => (
                  <QuoteProductCard key={product.id} product={product} />
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
              <Button
                variant="primary"
                icon={<Send size={18} color="white" strokeWidth={2} />}
                onClick={handleSubmitRequest}
                size="small"
                disabled={isSubmitting}
                body={
                  isSubmitting
                    ? "Submitting..."
                    : `Submit Request (${products.length} ${
                        products.length === 1 ? "item" : "items"
                      })`
                }
              />
            </div>
          </div>
        )}
      </div>
    </PageLayout>
  );
}
