import { z } from "zod";
import fields from "@/features/members/components/AddMember/JSON/shipmentdata.json";

export interface LoggedInUser {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;
  address?: string;
  apartment?: string;
  image?: string | null;
  tenantName?: string | null;
  accountProvider: "credentials" | "google" | "azure-ad";
  isRecoverableConfig: Record<string, boolean>;
  computerExpiration?: number;
  widgets: Array<{
    id: string;
    order: number;
  }>;
}

export interface User extends LoggedInUser {
  password: string | null;
}

export type RegisterUser = Pick<
  User,
  "name" | "email" | "password" | "tenantName" | "accountProvider"
>;

export type RegisterUserPlatforms = Pick<
  User,
  "name" | "email" | "image" | "tenantName" | "accountProvider"
>;

export type LoginUser = Pick<User, "email" | "password">;

const onlyLetters = /^[A-Za-z\s\u00C0-\u00FF]+$/;
const phoneRegex = /^\+?[0-9\s]*$/;
export const UserZodSchema = z.object({
  _id: z.string(),
  name: z.string(),
  email: z.string(),
  image: z.string().optional(),
  tenantName: z.string().optional(),
  phone: z
    .string()
    .trim()
    .regex(phoneRegex, {
      message: "Phone number is invalid",
    })
    .optional(),
  city: z
    .string()
    .trim()
    .refine((value) => value.length === 0 || onlyLetters.test(value), {
      message: "This field might be completed only with letters",
    })
    .optional(),
  state: z
    .string()
    .trim()
    .refine((value) => value.length === 0 || onlyLetters.test(value), {
      message: "This field might be completed only with letters",
    })
    .optional(),
  country: z
    .string()
    .trim()
    .refine((value) => value.length === 0 || onlyLetters.test(value), {
      message: "This field might be completed only with letters",
    })
    .optional(),
  zipCode: z.string().trim().optional(),
  address: z.string().trim().optional(),
  apartment: z.string().trim().optional(),
  isRecoverableConfig: z.record(z.string(), z.boolean()).optional(),
  computerExpiration: z.number().min(0.5).max(10).optional(),
});

export type UserZod = z.infer<typeof UserZodSchema>;
export type SettingsFormKeys = keyof Omit<UserZod, "_id" | "name" | "image">;
export const SETTINGS_ARRAY_KEYS: SettingsFormKeys[] = [
  "phone",
  "city",
  "state",
  "country",
  "zipCode",
  "address",
  "apartment",
  "tenantName",
  "email",
  "isRecoverableConfig",
  "computerExpiration",
];

type SettingsFormInput = {
  label: string;
  placeholder: string;
  subMessage: string;
  name: SettingsFormKeys;
  readonly: boolean;
  tpye?: "select" | "input" | "switch";
  options?: string[];
};
export const SettingsFormConfig: Record<SettingsFormKeys, SettingsFormInput> = {
  address: {
    subMessage: "",
    label: "Address",
    name: "address",
    placeholder: "Address",
    readonly: false,
  },
  apartment: {
    subMessage: "",
    label: "Appartment, Suite, etc.",
    name: "apartment",
    placeholder: "Apartment, suite, etc.",
    readonly: false,
  },
  city: {
    subMessage: "",
    label: "City",
    name: "city",
    placeholder: "City",
    readonly: false,
  },
  country: {
    subMessage: "",
    label: "Country",
    name: "country",
    placeholder: "Country",
    readonly: false,
    tpye: "select",
    options: fields.fields[0].options,
  },
  phone: {
    subMessage: "",
    label: "Contact Phone Number",
    name: "phone",
    placeholder: "+54 11 15466052",
    readonly: false,
  },
  state: {
    subMessage: "",
    label: "State",
    name: "state",
    placeholder: "State",
    readonly: false,
  },
  zipCode: {
    subMessage: "",
    label: "Zip Code",
    name: "zipCode",
    placeholder: "Zip Code",
    readonly: false,
  },
  //READ ONLY INPUTS
  email: {
    subMessage: "",
    label: "Email Address",
    name: "email",
    placeholder: "email@example.com",
    readonly: true,
  },
  tenantName: {
    subMessage: "",
    label: "Company Name",
    name: "tenantName",
    placeholder: "Company Name",
    readonly: true,
  },
  isRecoverableConfig: {
    subMessage: "Configure recoverability settings for each category",
    label: "Recoverable Settings",
    name: "isRecoverableConfig",
    placeholder: "",
    readonly: false,
    tpye: "switch",
  },
  computerExpiration: {
    subMessage: "Set the expiration time for computers in years",
    label: "Computer Expiration",
    name: "computerExpiration",
    placeholder: "",
    readonly: false,
  },
};
