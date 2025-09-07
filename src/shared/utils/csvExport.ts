export interface CsvColumnConfig<T> {
  key: keyof T;
  header: string;
  formatter?: (value: any) => string;
}

export interface CsvExportOptions {
  filename?: string;
  includeTimestamp?: boolean;
  dateFormat?: Intl.DateTimeFormatOptions;
  datetimeFormat?: Intl.DateTimeFormatOptions;
}

export const formatPrice = (price: {
  currencyCode: string;
  amount: number;
}) => {
  if (!price?.amount) return price?.currencyCode || "";
  return `${price.currencyCode} ${price.amount}`;
};

export const formatDate = (
  date: string | Date,
  options: Intl.DateTimeFormatOptions = {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }
) => {
  try {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    return dateObj.toLocaleDateString("es-ES", options);
  } catch {
    return "";
  }
};

export const exportToCsv = <T extends Record<string, any>>(
  data: T[],
  columns: CsvColumnConfig<T>[],
  options: CsvExportOptions = {}
) => {
  try {
    if (data.length === 0) {
      console.warn("No hay datos para exportar");
      return;
    }

    // Preparar datos CSV
    const csvData = data.map((item) => {
      const row: Record<string, string> = {};
      columns.forEach((column) => {
        const value = item[column.key];
        row[column.header] = column.formatter
          ? column.formatter(value)
          : String(value || "");
      });
      return row;
    });

    // Generar contenido CSV
    const headers = columns.map((col) => col.header);
    const csvContent = [
      headers.join(","),
      ...csvData.map((row) =>
        headers
          .map((header) => {
            const value = row[header];
            // Escapar comillas y envolver en comillas
            return `"${String(value).replace(/"/g, '""')}"`;
          })
          .join(",")
      ),
    ].join("\n");

    // Crear y descargar archivo
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    // Generar nombre de archivo
    const timestamp = options.includeTimestamp
      ? `-${new Date().toISOString().split("T")[0]}`
      : "";
    const filename = options.filename || "export";

    link.setAttribute("href", url);
    link.setAttribute("download", `${filename}${timestamp}.csv`);
    link.style.visibility = "hidden";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    return true;
  } catch (error) {
    console.error("Error al exportar CSV:", error);
    return false;
  }
};

// Configuraciones predefinidas para casos comunes
export const createLogisticsCsvConfig = (): CsvColumnConfig<any>[] => [
  { key: "tenant", header: "Tenant" },
  { key: "order_id", header: "Order ID" },
  {
    key: "createdAt",
    header: "Date",
    formatter: (value: string) => formatDate(value),
  },
  { key: "quantity_products", header: "Quantity" },
  { key: "shipment_type", header: "Type" },
  { key: "shipment_status", header: "Status" },
  {
    key: "price",
    header: "Price",
    formatter: formatPrice,
  },
  {
    key: "updatedAt",
    header: "Updated",
    formatter: (value: string) =>
      formatDate(value, {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
  },
];
