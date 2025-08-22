"use client";

import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAsideStore, Button } from "@/shared";
import { InputProductForm } from "@/features/assets";
import { useCreateTenant } from "@/features/tenants";

const createTenantSchema = z.object({
  tenantName: z.string().min(1, "Tenant name is required"),
  name: z.string().min(1, "Company name is required"),
  image: z.string().optional(),
});

type CreateTenantFormData = z.infer<typeof createTenantSchema>;

export const CreateTenant = () => {
  const { setAside } = useAsideStore();
  const createTenantMutation = useCreateTenant();

  const methods = useForm<CreateTenantFormData>({
    resolver: zodResolver(createTenantSchema),
    defaultValues: {
      tenantName: "",
      name: "",
      image: "",
    },
  });

  const {
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = methods;

  const onSubmit = async (data: CreateTenantFormData) => {
    try {
      // Transform data to match API expectations
      const createData = {
        tenantName: data.tenantName,
        name: data.name,
        image: data.image || undefined, // Only send if not empty
      };
      await createTenantMutation.mutateAsync(createData);
      setAside(null);
    } catch (error) {
      console.error("Error creating tenant:", error);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto">
        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pr-4">
            <div className="mt-8">
              <InputProductForm
                title="Tenant Name (ID)"
                placeholder="Enter unique tenant identifier (e.g., company-name)"
                value={watch("tenantName")}
                onChange={(e) => {
                  setValue("tenantName", e.target.value);
                }}
                name="tenantName"
              />
              {errors.tenantName && (
                <p className="mt-1 text-red-600 text-sm">
                  {errors.tenantName.message}
                </p>
              )}
            </div>

            <div className="mt-6">
              <InputProductForm
                title="Company Name"
                placeholder="Enter company display name"
                value={watch("name")}
                onChange={(e) => {
                  setValue("name", e.target.value);
                }}
                name="name"
              />
              {errors.name && (
                <p className="mt-1 text-red-600 text-sm">
                  {errors.name.message}
                </p>
              )}
            </div>
          </form>
        </FormProvider>
      </div>

      <aside className="bottom-0 left-0 absolute bg-slate-50 py-2 border-t w-full">
        <div className="flex justify-end gap-2 mx-auto py-2 w-5/6">
          <Button
            variant="primary"
            className="px-8"
            onClick={handleSubmit(onSubmit)}
            disabled={isSubmitting || !watch("name")?.trim()}
          >
            {isSubmitting ? "Creating..." : "Save"}
          </Button>
        </div>
      </aside>
    </div>
  );
};
