import { z } from "zod";
import { CATEGORIES, LOCATION, zodProductModel } from "./product";
import { zodCreateMembertModel } from "./member";

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
  Country: z.string().optional(),
  Phone: z.string().optional(),
  City: z.string().optional(),
  "Zip Code": z.string().optional(),
  Address: z.string().optional(),
  Apartment: z.string().optional(),
  "Additional Info": z.string().optional(),
});
export type CsvMember = z.infer<typeof zodMemberCsvSchema>;
export const csvMemberSchema = z.array(zodMemberCsvSchema);
export const csvSquema = z.object({
  prdoucts: z.array(zodProductModel).optional(),
  members: z.array(zodCreateMembertModel).optional(),
});
export type CsvInfo = {
  title: string;
  file: string;
  currentDate: string;
};

export const CSVUrls = {
  MyTeam: "/api/members/bulkcreate",
  MyStock: "/api/products/bulkcreate",
} as const;

export const CSVTeamplates = {
  LoadStock:
    "name,description,category,color,screen,keyboard,processor,ram,storage,gpu,serialNumber,status,stock",
  LoadMembers:
    "firstName,lastName,dateOfBirth,dni,phone,email,teams,jobPosition,country,city,zipCode,address,appartment,joiningDate,timeSlotForDelivery,additionalInfo",
} as const;

export type CSVUrl = keyof typeof CSVUrls;
