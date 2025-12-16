"use client";

import * as React from "react";
import { format } from "date-fns";
import {
  Package,
  Trash2,
  MapPin,
  Calendar,
  Shield,
  Settings,
} from "lucide-react";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared";
import { useQuoteStore } from "../../store/quote.store";
import type { QuoteProduct } from "../../types/quote.types";
import { cn } from "@/shared";

interface QuoteProductCardProps {
  product: QuoteProduct;
}

export const QuoteProductCard: React.FC<QuoteProductCardProps> = ({
  product,
}) => {
  const { removeProduct } = useQuoteStore();

  const handleDelete = () => {
    removeProduct(product.id);
  };

  const formatOS = (os?: string) => {
    if (!os) return null;
    const osMap: Record<string, string> = {
      macos: "macOS",
      windows: "Windows",
      linux: "Linux",
    };
    return osMap[os] || os;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    try {
      return format(new Date(dateString), "yyyy-MM-dd");
    } catch {
      return dateString;
    }
  };

  return (
    <div className="relative bg-gray-50 p-4 border border-grey rounded-lg">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <Badge variant="outline" className="flex items-center gap-1">
          <Package className="w-3 h-3" />
          Product
        </Badge>
        <button
          type="button"
          onClick={handleDelete}
          className="hover:bg-gray-200 p-2 rounded-full transition-colors"
          aria-label="Delete product"
        >
          <Trash2 className="w-4 h-4 text-gray-600" />
        </button>
      </div>

      {/* Category and OS */}
      <div className="flex items-center gap-2 mb-4">
        <span className="font-semibold text-lg capitalize">
          {product.category}
        </span>
        {product.operatingSystem && (
          <Badge variant="secondary" className="bg-gray-200 text-gray-800">
            {formatOS(product.operatingSystem)}
          </Badge>
        )}
      </div>

      {/* Specifications Grid */}
      <div className="gap-3 grid grid-cols-2 mb-4 text-sm">
        {product.brands && product.brands.length > 0 && (
          <div>
            <span className="font-medium">Brands: </span>
            <span className="text-gray-700">{product.brands.join(", ")}</span>
          </div>
        )}
        {product.processors && product.processors.length > 0 && (
          <div>
            <span className="font-medium">Processors: </span>
            <span className="text-gray-700">
              {product.processors.join(", ")}
            </span>
          </div>
        )}
        {product.ram && (
          <div>
            <span className="font-medium">RAM: </span>
            <span className="text-gray-700">{product.ram}</span>
          </div>
        )}
        {product.storage && (
          <div>
            <span className="font-medium">Storage: </span>
            <span className="text-gray-700">{product.storage}</span>
          </div>
        )}
        <div>
          <span className="font-medium">Quantity: </span>
          <span className="text-gray-700">{product.quantity}</span>
        </div>
      </div>

      {/* Services */}
      {(product.extendedWarranty?.enabled || product.deviceEnrollment) && (
        <div className="flex gap-2 mb-4">
          {product.extendedWarranty?.enabled && (
            <Badge
              variant="secondary"
              className="flex items-center gap-1 bg-gray-200 text-gray-800"
            >
              <Shield className="w-3 h-3" />
              Extended Warranty
            </Badge>
          )}
          {product.deviceEnrollment && (
            <Badge
              variant="secondary"
              className="flex items-center gap-1 bg-gray-200 text-gray-800"
            >
              <Settings className="w-3 h-3" />
              Enrollment
            </Badge>
          )}
        </div>
      )}

      {/* Delivery Details */}
      <div className="flex justify-between items-center pt-3 border-t text-gray-600 text-sm">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4" />
          <span>
            {product.country}
            {product.city && `, ${product.city}`}
          </span>
        </div>
        {product.requiredDeliveryDate && (
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span>{formatDate(product.requiredDeliveryDate)}</span>
          </div>
        )}
      </div>
    </div>
  );
};
