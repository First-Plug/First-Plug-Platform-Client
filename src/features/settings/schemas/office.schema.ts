import { z } from "zod";

const onlyLetters = /^[A-Za-z\s\u00C0-\u00FF]*$/;
const phoneRegex = /^\+?[0-9\s]*$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Función para crear el esquema con validación de nombre único
export const createOfficeSchema = (
  existingOffices: Array<{ name: string; _id?: string }>,
  editingOfficeId?: string
) => {
  return z.object({
    name: z
      .string()
      .min(1, "Office name is required")
      .refine(
        (name) => {
          // Si estamos editando, excluir la oficina actual de la validación
          const otherOffices = editingOfficeId
            ? existingOffices.filter((office) => office._id !== editingOfficeId)
            : existingOffices;

          return !otherOffices.some(
            (office) => office.name.toLowerCase() === name.toLowerCase()
          );
        },
        {
          message: "An office with this name already exists",
        }
      ),

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

    additionalInfo: z.string().optional().or(z.literal("")),
  });
};

// Esquema original para compatibilidad (sin validación de nombre único)
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

  additionalInfo: z.string().optional().or(z.literal("")),
});

export type OfficeFormData = z.infer<typeof officeSchema>;
