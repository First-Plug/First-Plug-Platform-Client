import { types, Instance, cast } from "mobx-state-tree";
import { z } from "zod";
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
// -------------------- MOBX DEFINITION -----------------------

export const AttributeModel = types.model({
  _id: types.string,
  key: types.enumeration(KEYS),
  value: types.optional(types.string, ""),
});
export type Atrribute = Instance<typeof AttributeModel>;

const DesirableDate = types.model({
  origin: types.maybe(types.string),
  destination: types.maybe(types.string),
});

export const ProductModel = types.model({
  _id: types.string,
  name: types.maybeNull(types.string),
  category: types.enumeration(CATEGORIES),
  attributes: types.array(AttributeModel),
  status: types.enumeration(PRODUCT_STATUSES),
  deleted: types.optional(types.boolean, false),
  recoverable: types.optional(types.boolean, true),
  acquisitionDate: types.optional(types.string, ""),
  createdAt: types.optional(types.string, ""),
  updatedAt: types.optional(types.string, ""),
  deletedAt: types.maybeNull(types.string),
  location: types.optional(types.string, ""),
  assignedEmail: types.optional(types.string, ""),
  assignedMember: types.optional(types.string, ""),
  serialNumber: types.maybeNull(types.string),
  lastAssigned: types.maybeNull(types.string),
  fp_shipment: types.maybe(types.boolean),
  desirableDate: types.maybe(DesirableDate),
  shipmentOrigin: types.maybeNull(types.string),
  shipmentDestination: types.maybeNull(types.string),
  shipmentId: types.maybeNull(types.string),
  activeShipment: types.maybeNull(types.boolean),
  origin: types.maybeNull(types.string),
  price: types.maybe(
    types.model({
      amount: types.maybe(types.number),
      currencyCode: types.optional(types.enumeration(CURRENCY_CODES), "USD"),
    })
  ),
  productCondition: types.optional(
    types.enumeration(["Optimal", "Defective", "Unusable"]),
    "Optimal"
  ),
  additionalInfo: types.optional(types.string, ""),
});
export type Product = Instance<typeof ProductModel>;

export type ProductFormData = Omit<Product, "price"> & {
  price?: {
    amount?: number;
    currencyCode?: (typeof CURRENCY_CODES)[number];
  };
  productCondition: ProductCondition;
  additionalInfo?: string;
};

export const emptyProduct: Omit<Product, "category"> & { category: string } = {
  _id: "",
  name: "",
  category: undefined,
  attributes: cast([]),
  status: "Available",
  productCondition: "Optimal",
  deleted: false,
  recoverable: true,
  acquisitionDate: "",
  createdAt: "",
  updatedAt: "",
  deletedAt: "",
  serialNumber: "",
  location: undefined,
  assignedEmail: undefined,
  assignedMember: undefined,
  lastAssigned: "",
  price: undefined,
  additionalInfo: "",
  fp_shipment: false,
  desirableDate: {
    origin: "",
    destination: "",
  },
  shipmentOrigin: "",
  shipmentDestination: "",
  shipmentId: "",
  origin: "",
  activeShipment: false,
};

export const ProductTableModel = types.model({
  category: types.string,
  products: types.array(ProductModel),
});
export type ProductTable = Instance<typeof ProductTableModel>;
// -------------------- ZOD DEFINITION -----------------------

export const zodAtrributesModel = z.object({
  key: z.enum(KEYS).optional(),
  value: z.string().optional(),
});
export type AtrributeZod = z.infer<typeof zodAtrributesModel>;

// --------

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

// -------- create my own zod schema for the createProductform

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
    if (data.category === "Merchandising" && !data.name) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Name is required for Merchandising category.",
        path: ["name"],
      });
    }
    if (data.category === "Merchandising") {
      data.recoverable = false;
    } else {
      data.recoverable = true;
    }
  })
  .superRefine((data, ctx) => {
    if (data.serialNumber === null) {
      data.serialNumber = "";
    }
  })
  .refine(
    (data) => {
      if (data.category === "Merchandising" && data.recoverable) {
        return false;
      }
      return true;
    },
    {
      message: "Merchandising products must not be recoverable.",
    }
  );

export type CreateProductModel = z.infer<typeof zodCreateProductModel>;
