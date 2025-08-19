import { z } from "zod";

const onlyLetters = /^[A-Za-z\s\u00C0-\u00FF]*$/;
const phoneRegex = /^\+?[0-9\s]*$/;

export const profileSchema = z.object({
  firstName: z
    .string()
    .min(1, "First name is required")
    .regex(onlyLetters, "First name can only contain letters"),

  lastName: z
    .string()
    .min(1, "Last name is required")
    .regex(onlyLetters, "Last name can only contain letters"),

  phone: z
    .string()
    .regex(phoneRegex, "Phone number is invalid")
    .optional()
    .or(z.literal("")),

  personalEmail: z
    .string()
    .refine(
      (value) => value === "" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
      {
        message: "Please enter a valid email address",
      }
    )
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

export type ProfileFormData = z.infer<typeof profileSchema>;
