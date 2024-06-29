import { Instance, types } from "mobx-state-tree";
import { z } from "zod";
import fields from "@/components/AddMember/JSON/shipmentdata.json";
export const LoggedInUserModel = types.model({
  _id: types.string,
  name: types.string,
  email: types.string,
  phone: types.optional(types.string, ""),
  city: types.optional(types.string, ""),
  state: types.optional(types.string, ""),
  country: types.optional(types.string, ""),
  zipCode: types.optional(types.string, ""),
  address: types.optional(types.string, ""),
  apartment: types.optional(types.string, ""),
  image: types.maybeNull(types.string),
  tenantName: types.maybeNull(types.string),
});
export const UserModel = types.compose(
  LoggedInUserModel,
  types.model({
    password: types.maybeNull(types.string),
  })
);

export type LoggedInUser = Instance<typeof LoggedInUserModel>;
export type User = Instance<typeof UserModel>;

export type RegisterUser = Pick<
  User,
  "name" | "email" | "password" | "tenantName"
>;

export type RegisterUserPlatforms = Pick<
  User,
  "name" | "email" | "image" | "tenantName"
>;

export type LoginUser = Pick<User, "email" | "password">;

const onlyLetters = /^[A-Za-z\s]+$/;
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
    .regex(onlyLetters, {
      message: "This fiel might be completed only with lettes",
    })
    .optional(),
  state: z.string().trim().optional(),
  country: z.string().trim().optional(),
  zipCode: z.string().trim().optional(),
  address: z.string().trim().optional(),
  apartment: z.string().trim().optional(),
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
];

type SettingsFormInput = {
  label: string;
  placeholder: string;
  subMessage: string;
  name: SettingsFormKeys;
  readonly: boolean;
  tpye?: "select" | "input";
  options?: string[];
};
export const SettingsFormConfig: Record<SettingsFormKeys, SettingsFormInput> = {
  address: {
    subMessage: "errore",
    label: "Address",
    name: "address",
    placeholder: "address",
    readonly: false,
  },
  apartment: {
    subMessage: "",
    label: "Appartment, Suite, etc.",
    name: "apartment",
    placeholder: "",
    readonly: false,
  },
  city: {
    subMessage: "",
    label: "City",
    name: "city",
    placeholder: "",
    readonly: false,
  },
  country: {
    subMessage: "",
    label: "Country",
    name: "country",
    placeholder: "",
    readonly: false,
    tpye: "select",
    options: fields.fields[0].options,
  },
  phone: {
    subMessage: "",
    label: "Contact Phone Number",
    name: "phone",
    placeholder: "+54 11 111111",
    readonly: false,
  },
  state: {
    subMessage: "",
    label: "State",
    name: "state",
    placeholder: "",
    readonly: false,
  },
  zipCode: {
    subMessage: "",
    label: "Zip Code",
    name: "zipCode",
    placeholder: "",
    readonly: false,
  },
  //READ ONLY INPUTS
  email: {
    subMessage: "",
    label: "Email Address",
    name: "email",
    placeholder: "",
    readonly: true,
  },
  tenantName: {
    subMessage: "",
    label: "Company Name",
    name: "tenantName",
    placeholder: "",
    readonly: true,
  },
};
