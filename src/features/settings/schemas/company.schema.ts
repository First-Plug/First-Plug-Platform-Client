import { z } from "zod";

export const companySchema = z.object({
  name: z.string().min(1, "Company name is required"),
  isRecoverableConfig: z.record(z.string(), z.boolean()).optional(),
  computerExpiration: z
    .number()
    .min(0.5, "Computer expiration years must be at least 0.5")
    .max(10, "Computer expiration years cannot exceed 10"),
});

export type CompanyFormData = z.infer<typeof companySchema>;
