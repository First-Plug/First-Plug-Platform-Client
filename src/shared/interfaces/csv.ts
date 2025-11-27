"use client";
import { z } from "zod";
import { zodProductModel } from "@/features/assets/interfaces/product";
import {
  CATEGORIES,
  LOCATION,
  CURRENCY_CODES,
  PRODUCT_CONDITIONS,
} from "@/features/assets/interfaces/product";
import { zodCreateMemberModel } from "@/features/members/schemas/members.zod";

export const EMPTY_FILE_INFO: CsvInfo = {
  title: "",
  file: "",
  currentDate: "",
} as const;
// PRDUCTS ZOD CSV SCHEMA
export const csvProductModel = z
  .object({
    _id: z.string().optional(),
    name: z.string().optional(),
    acquisitionDate: z.string().optional(),
    "category*": z.enum(CATEGORIES).refine((val) => CATEGORIES.includes(val), {
      message: "El valor ingresado no es una categoría válida",
    }),
    "model*": z.string().optional(),
    "brand*": z.string().optional(),
    color: z.string().optional(),
    screen: z.string().optional(),
    keyboardLanguage: z.string().optional(),
    processor: z.string().optional(),
    ram: z.string().optional(),
    storage: z.string().optional(),
    gpu: z.string().optional(),
    serialNumber: z.string().optional(),
    "location*": z.enum(LOCATION).superRefine((value, ctx) => {
      if (!value) {
        ctx.addIssue({
          code: "custom",
          path: ["location"],
          message: `The field 'location' is required.`,
        });
      } else {
        // @ts-ignore
        if (!LOCATION.includes(value)) {
          ctx.addIssue({
            code: "custom",
            path: ["location"],
            message: ` "${value}" is not correct value for Location .`,
          });
        }
      }
    }),
    assignedEmail: z.string().optional(),
    "Product Condition": z
      .string()
      .transform((val) => {
        // Si está vacío, retorna undefined para que se asigne "Optimal" por defecto
        if (!val || val === "") return undefined;
        return val;
      })
      .pipe(z.enum(PRODUCT_CONDITIONS).optional()),
    "Additional info": z.string().optional(),
    "country*": z.string().optional(),
    "officeName*": z.string().optional(),
    "Price per unit": z
      .string()
      .transform((val) => {
        if (!val || val === "") return undefined;
        const num = parseFloat(val);
        return isNaN(num) ? undefined : num;
      })
      .optional(),
    Currency: z
      .string()
      .transform((val) => {
        // Si está vacío, retorna undefined para que sea opcional
        if (!val || val === "") return undefined;
        return val;
      })
      .pipe(z.enum(CURRENCY_CODES).optional()),
    Recoverable: z
      .string()
      .transform((val) => {
        // Si está vacío, retorna undefined
        if (!val || val === "") return undefined;
        // Transforma YES/NO a true/false (case-insensitive)
        if (val.toUpperCase() === "YES") return true;
        if (val.toUpperCase() === "NO") return false;
        // Si no es YES ni NO, retorna undefined para que sea opcional
        return undefined;
      })
      .optional(),
  })
  .superRefine((data, ctx) => {
    if (data["category*"] === "Merchandising") {
      if (!data.name) {
        ctx.addIssue({
          code: "custom",
          path: ["name"],
          message: `The field 'name' is required for ${data["category*"]} category`,
        });
      }
    } else {
      if (!data["model*"]) {
        ctx.addIssue({
          code: "custom",
          path: ["model*"],
          message: `The field 'model' is required for ${data["category*"]} category.`,
        });
      }
      if (!data["brand*"]) {
        ctx.addIssue({
          code: "custom",
          path: ["brand*"],
          message: `The field 'brand' is required for ${data["category*"]} category.`,
        });
      }
      // Validar que si el modelo es "Other", el name sea obligatorio
      if (data["model*"] === "Other" && !data.name) {
        ctx.addIssue({
          code: "custom",
          path: ["name"],
          message: `The field 'name' is required when model is "Other"`,
        });
      }
    }

    // Validar que si location es "Our office", officeName sea obligatorio
    if (data["location*"] === "Our office" && !data["officeName*"]) {
      ctx.addIssue({
        code: "custom",
        path: ["officeName*"],
        message: `The field 'officeName' is required when location is "Our office".`,
      });
    }
  });
export type CsvProduct = z.infer<typeof csvProductModel>;
export const csvPrdocutSchema = z.array(csvProductModel);

// MEMBERS ZOD CSV SCHEMA
export const zodMemberCsvSchema = z.object({
  "First Name *": z.string().min(1),
  "Last Name *": z.string().min(1),
  "Email *": z.string().email(),
  "Start Date": z.string().optional(),
  "Birth Date": z.string().optional(),
  Team: z.string().optional(),
  "Job Position": z.string().optional(),
  "Personal Email": z.string().optional(),
  "Country*": z.string().min(1, "Country is required"),
  Phone: z.string().optional(),
  City: z.string().optional(),
  "Zip Code": z.string().optional(),
  Address: z.string().optional(),
  Apartment: z.string().optional(),
  "Additional Info": z.string().optional(),
  "DNI/CI/Passport": z.string().optional(),
});
export type CsvMember = z.infer<typeof zodMemberCsvSchema>;
export const csvMemberSchema = z.array(zodMemberCsvSchema);

export const csvSchema = z.object({
  products: z.array(zodProductModel).optional(),
  members: z.array(zodCreateMemberModel).optional(),
});

export type CsvInfo = {
  title: string;
  file: string;
  currentDate: string;
};

export const CSVUrls = {
  MyTeam: "/api/members/bulkcreate",
  MyStock: "/api/products/bulkcreate-csv",
} as const;

export const CSVTeamplates = {
  LoadStock:
    "name,description,category,color,screen,keyboard,processor,ram,storage,gpu,serialNumber,status,stock,Recoverable",
  LoadMembers:
    "firstName,lastName,dateOfBirth,dni,phone,email,teams,jobPosition,country,city,zipCode,address,appartment,joiningDate,timeSlotForDelivery,additionalInfo",
} as const;

export type CSVUrl = keyof typeof CSVUrls;
