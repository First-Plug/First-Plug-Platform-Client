import { zodCreateProductModel } from "@/features/assets/interfaces/product";
import { z } from "zod";

const phoneRegex = /^\+?[0-9\s]*$/;
// Regex que permite letras (incluyendo acentuadas, ñ, Ñ) y espacios
// Soporta: á, é, í, ó, ú, à, è, ì, ò, ù, ä, ë, ï, ö, ü, ã, õ, ñ, etc.
const onlyLettersRegex = /^[a-zA-Z\s\u00C0-\u017F\u0180-\u024F]+$/;

export const zodCreateMemberModel = z.object({
  firstName: z
    .string()
    .min(1, { message: "First name is required" })
    .trim()
    .refine((value) => onlyLettersRegex.test(value), {
      message: "First name cannot contain numbers",
    }),
  lastName: z
    .string()
    .min(1, { message: "Last name is required" })
    .trim()
    .refine((value) => onlyLettersRegex.test(value), {
      message: "Last name cannot contain numbers",
    }),
  email: z
    .string()
    .email({ message: "Invalid email address" })
    .trim()
    .toLowerCase()
    .min(1, { message: "Email is required" }),
  picture: z.string().optional(),
  position: z.string().trim().optional(),
  personalEmail: z
    .string()
    .trim()
    .toLowerCase()
    .refine(
      (value) => value === "" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
      { message: "Please enter a valid email address" }
    )
    .optional(),
  phone: z
    .string()
    .trim()
    .regex(phoneRegex, {
      message: "Phone number must only contain numbers and the '+' sign",
    })
    .optional(),
  city: z.string().trim().optional(),
  country: z.string().min(1, { message: "Country is required" }).trim(),
  zipCode: z.string().trim().optional(),
  address: z.string().trim().optional(),
  apartment: z.string().trim().optional(),
  additionalInfo: z.string().trim().optional(),
  startDate: z.string().trim().optional(),
  birthDate: z.string().nullable().optional(),
  products: z.array(zodCreateProductModel).optional(),
  team: z.string().trim().optional(),
  dni: z
    .preprocess((value) => {
      if (typeof value === "string") {
        return value.trim() === "" ? undefined : value;
      }
      return value ? String(value) : undefined;
    }, z.union([z.string().min(1).max(20, { message: "DNI cannot be longer than 20 characters" }), z.undefined()]))
    .optional(),
});
