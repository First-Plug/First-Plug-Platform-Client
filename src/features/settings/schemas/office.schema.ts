import { z } from "zod";

const onlyLetters = /^[A-Za-z\s\u00C0-\u00FF]*$/;
const phoneRegex = /^\+?[0-9\s]*$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const officeSchema = z.object({
  name: z.string().min(1, "Office name is required"),

  email: z
    .string()
    .refine((value) => value === "" || emailRegex.test(value), {
      message: "Please enter a valid email address",
    })
    .optional()
    .or(z.literal("")),

  phone: z
    .string()
    .regex(phoneRegex, "Phone number is invalid")
    .optional()
    .or(z.literal("")),

  country: z
    .string()
    .regex(onlyLetters, "Country can only contain letters")
    .optional()
    .or(z.literal("")),

  city: z
    .string()
    .regex(onlyLetters, "City can only contain letters")
    .optional()
    .or(z.literal("")),

  state: z
    .string()
    .regex(onlyLetters, "State can only contain letters")
    .optional()
    .or(z.literal("")),

  zipCode: z.string().optional().or(z.literal("")),

  address: z.string().optional().or(z.literal("")),

  apartment: z.string().optional().or(z.literal("")),
});

export type OfficeFormData = z.infer<typeof officeSchema>;
