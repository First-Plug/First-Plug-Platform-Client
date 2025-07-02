"use client";

import { z } from "zod";

export const CURRENCY_CODES = [
  "USD",
  "ARS",
  "BOB",
  "BRL",
  "CLP",
  "COP",
  "CRC",
  "GTQ",
  "HNL",
  "ILS",
  "MXN",
  "NIO",
  "PAB",
  "PEN",
  "PYG",
  "EUR",
  "UYU",
  "VES",
] as const;

export const LOCATION = ["Our office", "FP warehouse", "Employee"] as const;
export type Location = (typeof LOCATION)[number];

export const CATEGORIES = [
  "Audio",
  "Computer",
  "Merchandising",
  "Monitor",
  "Peripherals",
  "Other",
] as const;

export type Category = (typeof CATEGORIES)[number];

export const KEYS = [
  "brand",
  "model",
  "color",
  "screen",
  "keyboardLanguage",
  "processor",
  "ram",
  "storage",
  "gpu",
] as const;

export type Key = (typeof KEYS)[number];

export const PRODUCT_STATUSES = [
  "Available",
  "Delivered",
  "Deprecated",
  "Unavailable",
  "In Transit",
  "In Transit - Missing Data",
] as const;

export type ProductStatus = (typeof PRODUCT_STATUSES)[number];

export const PRODUCT_CONDITIONS = ["Optimal", "Defective", "Unusable"] as const;
export type ProductCondition = (typeof PRODUCT_CONDITIONS)[number];

export interface Attribute {
  _id: string;
  key: Key;
  value?: string;
}

export interface DesirableDate {
  origin?: string;
  destination?: string;
}

export interface Price {
  amount?: number;
  currencyCode?: (typeof CURRENCY_CODES)[number];
}

export interface Product {
  _id: string;
  name: string | null;
  category: Category;
  attributes: Attribute[];
  status: ProductStatus;
  deleted?: boolean;
  recoverable?: boolean;
  acquisitionDate?: string;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
  location?: string;
  assignedEmail?: string;
  assignedMember?: string;
  serialNumber: string | null;
  lastAssigned: string | null;
  fp_shipment?: boolean;
  desirableDate?: DesirableDate;
  shipmentOrigin: string | null;
  shipmentDestination: string | null;
  shipmentId: string | null;
  activeShipment: boolean | null;
  origin: string | null;
  price?: Price;
  productCondition: ProductCondition;
  additionalInfo?: string;
}

export interface ProductTable {
  category: string;
  products: Product[];
  status?: ProductStatus;
  productCondition?: ProductCondition;
}

export type ProductFormData = Omit<Product, "price"> & {
  price?: {
    amount?: number;
    currencyCode?: (typeof CURRENCY_CODES)[number];
  };
  productCondition: ProductCondition;
  additionalInfo?: string;
};

export const CATEGORY_KEYS: Record<Category, readonly Key[]> = {
  Merchandising: ["color"],
  Computer: [
    "brand",
    "model",
    "color",
    "screen",
    "keyboardLanguage",
    "processor",
    "ram",
    "storage",
    "gpu",
  ],
  Monitor: ["brand", "model", "screen", "color"],
  Audio: ["brand", "model", "color"],
  Peripherals: ["brand", "model", "color", "keyboardLanguage"],
  Other: ["brand", "color", "model"],
};

export const zodAtrributesModel = z.object({
  key: z.enum(KEYS).optional(),
  value: z.string().optional(),
});

export type AtrributeZod = z.infer<typeof zodAtrributesModel>;

export const zodProductModel = z.object({
  _id: z.string().optional(),
  name: z.string().optional(),
  category: z.enum(CATEGORIES),
  acquisitionDate: z.string().optional(),
  attributes: z.array(zodAtrributesModel).optional(),
  deleted: z.boolean().optional(),
  recoverable: z.boolean().optional(),
  location: z.enum(LOCATION),
  assignedEmail: z.string().optional(),
  serialNumber: z.string().optional(),
  status: z.string().optional(),
  productCondition: z.string().optional(),
  additionalInfo: z.string().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  deletedAt: z.string().optional(),
  price: z
    .object({
      amount: z.number().nonnegative().optional(),
      currencyCode: z.enum(CURRENCY_CODES).optional(),
    })
    .optional(),
});

export type PrdouctModelZod = z.infer<typeof zodProductModel>;

export const zodCreateProductModel = z
  .object({
    _id: z.string().optional(),
    name: z.string().optional(),
    category: z.enum(CATEGORIES, {
      required_error: "Category is required",
      invalid_type_error: "Invalid category",
    }),
    attributes: z
      .array(
        z.object({
          key: z.enum(KEYS),
          value: z.string().optional().default(""),
        })
      )
      .refine(
        (attrs) => {
          const keys = attrs.map((attr) => attr.key);
          return new Set(keys).size === keys.length;
        },
        {
          message: "Attribute keys must be unique.",
        }
      ),
    serialNumber: z.string().optional(),
    recoverable: z.boolean().default(true).optional(),
    assignedMember: z.string().optional(),
    assignedEmail: z
      .string()
      .optional()
      .refine(
        (value) => {
          return value !== undefined || value !== null || value !== "None";
        },
        {
          message: "Assigned Member is required",
        }
      ),
    acquisitionDate: z.string().optional(),
    createdAt: z.string().optional(),
    updatedAt: z.string().optional(),
    deletedAt: z.string().optional().nullable(),
    deleted: z.boolean().optional(),
    location: z.enum(LOCATION, {
      required_error: "Location is required",
      invalid_type_error: "Invalid location",
    }),
    status: z.string().optional(),
    productCondition: z.string().optional(),
    additionalInfo: z.string().optional(),
    price: z
      .object({
        amount: z.number().nonnegative().optional(),
        currencyCode: z.enum(CURRENCY_CODES).optional(),
      })
      .optional(),
  })
  .superRefine((data, ctx) => {
    if (data.category === "Computer") {
      const requiredKeys = ["brand", "model", "processor", "ram", "storage"];
      const missingKeys = requiredKeys.filter(
        (key) => !data.attributes.some((attr) => attr.key === key)
      );

      if (missingKeys.length > 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Missing required attributes for Computer: ${missingKeys.join(
            ", "
          )}`,
          path: ["attributes"],
        });
      }
    }
  });

export type CreateProductModel = z.infer<typeof zodCreateProductModel>;
