"use client";

import { useMemo } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { DetailsButton } from "@/shared/components/Tables";
import { DeleteAction } from "@/shared";
import { Package } from "lucide-react";
import type { QuoteTableWithDetailsDto } from "../types/quote.types";

interface UseQuotesTableColumnsProps {
  quotes: QuoteTableWithDetailsDto[];
}

export const useQuotesTableColumns = ({
  quotes,
}: UseQuotesTableColumnsProps) => {
  const formatDate = (dateString: string | undefined | null) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Invalid date";
      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    } catch {
      return "Invalid date";
    }
  };

  const columns = useMemo<ColumnDef<QuoteTableWithDetailsDto>[]>(() => {
    const cols: ColumnDef<QuoteTableWithDetailsDto>[] = [
      {
        accessorKey: "requestId",
        header: "ID",
        size: 180,
        cell: ({ getValue }) => {
          const id = getValue() as string | undefined;
          return (
            <span className="font-semibold text-blue-500">{id || "N/A"}</span>
          );
        },
      },
      {
        accessorKey: "requestType",
        header: "Type",
        size: 180,
        cell: ({ getValue, row }) => {
          const type =
            (getValue() as string | undefined)?.toLowerCase().trim() || "";
          const originalType = (getValue() as string | undefined) || "";

          // Verificar si el tipo contiene las palabras clave
          const hasProduct = type.includes("product");
          const hasService = type.includes("service");
          const hasMixed = type.includes("mixed");

          // Determinar el tipo basado en las palabras clave
          let badgeClasses = "";
          let displayType = originalType || "N/A";

          if (hasMixed || (hasProduct && hasService)) {
            badgeClasses = "bg-pink-50 text-pink-700 border border-pink-200";
            displayType = "Mixed";
          } else if (hasProduct) {
            badgeClasses = "bg-blue/10 text-blue border";
            displayType = "Product";
          } else if (hasService) {
            badgeClasses =
              "bg-purple-50 text-purple-700 border border-purple-200";
            displayType = "Service";
          } else {
            badgeClasses = "bg-gray-50 text-gray-700 border border-gray-200";
          }

          return (
            <div
              className={`px-2 py-1 rounded-full text-xs font-medium inline-flex items-center gap-1 ${badgeClasses}`}
            >
              {hasProduct && !hasMixed && (
                <Package className="mb-0.5 w-3 h-3" />
              )}
              <span>{displayType}</span>
            </div>
          );
        },
      },
      {
        id: "items",
        header: "Items",
        size: 120,
        cell: ({ row }) => {
          const quote = row.original;
          return <span>{quote?.productCount ?? 0}</span>;
        },
      },
      {
        accessorKey: "createdAt",
        header: "Created",
        size: 120,
        cell: ({ getValue }) => {
          const dateString = getValue() as string | undefined;
          return <span>{formatDate(dateString)}</span>;
        },
      },
      {
        accessorKey: "userName",
        header: "User",
        size: 180,
        cell: ({ getValue }) => {
          const user = (getValue() as string | undefined) || "N/A";
          return <span className="text-gray-700">{user}</span>;
        },
      },
      {
        accessorKey: "status",
        header: "Status",
        size: 120,
        cell: ({ getValue }) => {
          const status = (getValue() as string | undefined) || "Unknown";
          const isRequested = status === "Requested";
          const isCancelled = status === "Cancelled";

          let badgeClasses = "";
          if (isRequested) {
            // Amarillo/naranja pastel para indicar pendiente de aceptación
            badgeClasses =
              "bg-yellow-50 text-yellow-700 border border-yellow-200";
          } else if (isCancelled) {
            badgeClasses = "bg-red-50 text-red-700 border border-red-200";
          } else {
            // Color gris pastel para estados desconocidos
            badgeClasses = "bg-gray-50 text-gray-700 border border-gray-200";
          }

          return (
            <div
              className={`px-2 py-1 rounded-full text-xs font-medium inline-block ${badgeClasses}`}
            >
              {status}
            </div>
          );
        },
      },
      {
        id: "actions",
        header: "Actions",
        size: 120,
        cell: ({ row }) => {
          const isRequested = row.original.status === "Requested";
          return (
            <div className="flex items-center gap-1">
              {isRequested && (
                <DeleteAction type="quote" id={row.original._id} />
              )}
              {row.getCanExpand() ? <DetailsButton row={row} /> : null}
            </div>
          );
        },
      },
    ];

    return cols;
  }, [quotes]);

  return columns;
};
