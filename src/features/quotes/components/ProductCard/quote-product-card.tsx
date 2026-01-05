"use client";

import * as React from "react";
import {
  Package,
  Trash2,
  MapPin,
  Calendar,
  Shield,
  Settings,
} from "lucide-react";
import {
  Badge,
  PenIcon,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  Button,
} from "@/shared";
import { useQuoteStore } from "../../store/quote.store";
import type { QuoteProduct } from "../../types/quote.types";

interface QuoteProductCardProps {
  product: QuoteProduct;
}

export const QuoteProductCard: React.FC<QuoteProductCardProps> = ({
  product,
}) => {
  const {
    removeProduct,
    setIsAddingProduct,
    setCurrentStep,
    setEditingProductId,
  } = useQuoteStore();

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);

  const handleDelete = () => {
    removeProduct(product.id);
    setIsDeleteDialogOpen(false);
  };

  const handleEdit = () => {
    setIsAddingProduct(true);
    setEditingProductId(product.id);
    // El step se establecerá en el useEffect del AddProductForm
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
    // Extraer solo la fecha si viene en formato ISO con tiempo
    const dateOnly = dateString.includes("T")
      ? dateString.split("T")[0]
      : dateString;
    // Convertir de YYYY-MM-DD a dd/MM/yyyy
    const parts = dateOnly.split("-");
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateOnly;
  };

  return (
    <div className="relative p-4 border border-grey rounded-lg">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <Badge variant="outline" className="flex items-center gap-1">
          <Package className="w-3 h-3" />
          Product
        </Badge>
        <div className="flex">
          <button
            type="button"
            onClick={handleEdit}
            className="hover:bg-gray-200 p-2 rounded-full transition-colors"
            aria-label="Edit product"
          >
            <PenIcon className="w-4 h-4 text-blue" strokeWidth={2} />
          </button>
          <button
            type="button"
            onClick={() => setIsDeleteDialogOpen(true)}
            className="hover:bg-gray-200 p-2 rounded-full transition-colors"
            aria-label="Delete product"
          >
            <Trash2 className="w-4 h-4 text-red-600" />
          </button>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-xl">
              Are you sure you want to delete this product? 🗑️
            </DialogTitle>
            <DialogDescription className="font-normal text-md">
              This product will be permanently removed from your quote request.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center gap-2 mt-4">
            <Button
              variant="secondary"
              onClick={() => setIsDeleteDialogOpen(false)}
              className="w-full"
            >
              Cancel
            </Button>
            <Button
              variant="delete"
              onClick={handleDelete}
              className="bg-error w-full"
            >
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Category and OS */}
      <div className="flex items-center gap-2 mb-4">
        <span className="font-semibold text-lg capitalize">
          {product.category}
        </span>
        {product.operatingSystem && (
          <Badge
            variant="secondary"
            className="bg-blue/10 border border-blue/20 text-blue"
          >
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
        {product.models && product.models.length > 0 && (
          <div>
            <span className="font-medium">Models: </span>
            <span className="text-gray-700">{product.models.join(", ")}</span>
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
        {product.ram && product.ram.length > 0 && (
          <div>
            <span className="font-medium">RAM: </span>
            <span className="text-gray-700">{product.ram.join(", ")}</span>
          </div>
        )}
        {product.storage && product.storage.length > 0 && (
          <div>
            <span className="font-medium">Storage: </span>
            <span className="text-gray-700">{product.storage.join(", ")}</span>
          </div>
        )}
        <div>
          <span className="font-medium">Quantity: </span>
          <span className="text-gray-700">{product.quantity}</span>
        </div>
      </div>

      {/* Description for Merchandising */}
      {product.category?.toLowerCase() === "merchandising" &&
        product.description && (
          <div className="mb-4 text-sm">
            <span className="font-medium">Description: </span>
            <span className="text-gray-700">{product.description}</span>
          </div>
        )}

      {/* Services */}
      {(product.extendedWarranty?.enabled || product.deviceEnrollment) && (
        <div className="flex gap-2 mb-4">
          {product.extendedWarranty?.enabled && (
            <Badge
              variant="secondary"
              className="flex items-center gap-1 bg-blue/10 border border-blue/20 text-blue"
            >
              <Shield className="w-3 h-3" />
              Extended Warranty
            </Badge>
          )}
          {product.deviceEnrollment && (
            <Badge
              variant="secondary"
              className="flex items-center gap-1 bg-blue/10 border border-blue/20 text-blue"
            >
              <Settings className="w-3 h-3" />
              Enrollment
            </Badge>
          )}
        </div>
      )}

      {/* Delivery Details */}
      <div className="flex items-center gap-2 pt-3 border-t text-gray-600 text-sm">
        <div className="flex justify-center items-center gap-2">
          <MapPin className="w-4 h-4" />
          <span>
            {product.country}
            {product.city && `, ${product.city}`}
          </span>
        </div>
        {product.requiredDeliveryDate && (
          <div className="flex justify-center items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span>{formatDate(product.requiredDeliveryDate)}</span>
          </div>
        )}
      </div>
    </div>
  );
};
