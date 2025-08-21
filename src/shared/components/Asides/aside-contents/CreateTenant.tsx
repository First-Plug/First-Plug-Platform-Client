"use client";

import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAsideStore, useAlertStore, Button } from "@/shared";
import { InputProductForm } from "@/features/assets";

const createTenantSchema = z.object({
  name: z.string().min(1, "Tenant name is required"),
});

type CreateTenantFormData = z.infer<typeof createTenantSchema>;

export const CreateTenant = () => {
  const { setAside } = useAsideStore();
  const { setAlert } = useAlertStore();

  const methods = useForm<CreateTenantFormData>({
    resolver: zodResolver(createTenantSchema),
    defaultValues: {
      name: "",
    },
  });

  const {
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isDirty, isSubmitting },
  } = methods;

  const onSubmit = async (data: CreateTenantFormData) => {
    try {
      console.log("Creating tenant:", data);
      setAlert("createTeam"); // Usar alerta de creación exitosa
      setAside(null);
    } catch (error) {
      console.error("Error creating tenant:", error);
      setAlert("errorCreateTeam");
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto">
        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pr-4">
            <div className="mt-8">
              <InputProductForm
                title="Tenant Name"
                placeholder="Enter tenant name"
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
