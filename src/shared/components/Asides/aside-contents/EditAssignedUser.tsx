"use client";

import { useEffect, useRef, useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/shared";
import { InputProductForm, DropdownInputProductForm } from "@/features/assets";
import { useAsideStore, useAlertStore } from "@/shared";
import { AssignedUser } from "@/features/assigned-users";
import { useQueryClient } from "@tanstack/react-query";

const editAssignedUserSchema = z.object({
  assignedTenant: z.string(),
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email format"),
  role: z.enum(["User", "Admin", "Super Admin"]),
});

type EditAssignedUserFormData = z.infer<typeof editAssignedUserSchema>;

export const EditAssignedUser = () => {
  const { setAside } = useAsideStore();
  const { setAlert } = useAlertStore();
  const queryClient = useQueryClient();

  const selectedUser = queryClient.getQueryData<AssignedUser>([
    "selectedAssignedUser",
  ]);

  const methods = useForm<EditAssignedUserFormData>({
    resolver: zodResolver(editAssignedUserSchema),
    defaultValues: {
      assignedTenant: selectedUser?.assignedTenant || "Tenant",
      name: selectedUser?.name || "",
      email: selectedUser?.email || "",
      role: (selectedUser?.role as "User" | "Admin" | "Super Admin") || "User",
    },
  });

  const {
    handleSubmit,
    formState: { isSubmitting, errors, isDirty },
    watch,
    setValue,
    reset,
  } = methods;

  const watchedRole = watch("role");

  useEffect(() => {
    if (watchedRole === "Super Admin") {
      setValue("assignedTenant", "", { shouldDirty: false });
    } else if (watch("assignedTenant") === "") {
      setValue("assignedTenant", "", { shouldDirty: false });
    }
  }, [watchedRole, setValue, watch]);

  const contentRef = useRef<HTMLDivElement>(null);
  const [needsPadding, setNeedsPadding] = useState(false);

  useEffect(() => {
    const checkForScroll = () => {
      if (contentRef.current) {
        const element = contentRef.current;
        const hasScroll = element.scrollHeight > element.clientHeight;
        setNeedsPadding(hasScroll);
      }
    };

    checkForScroll();
    window.addEventListener("resize", checkForScroll);

    return () => window.removeEventListener("resize", checkForScroll);
  }, []);

  const closeAside = () => {
    setAside(undefined);
    queryClient.removeQueries({ queryKey: ["selectedAssignedUser"] });
  };

  const onSubmit = async (data: EditAssignedUserFormData) => {
    try {
      console.log("Updating user:", data);

      setAlert("dataUpdatedSuccessfully");
      closeAside();
    } catch (error) {
      console.error("Error updating user:", error);
      setAlert("errorUpdateTeam");
    }
  };

  if (!selectedUser) {
    return (
      <div className="flex justify-center items-center h-full">
        <p className="text-gray-500">Selected user not found</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div
        ref={contentRef}
        className={`flex-1 overflow-y-auto scrollbar-custom ${
          needsPadding ? "pb-20" : ""
        }`}
      >
        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="mt-8">
              <InputProductForm
                title="Name"
                placeholder="Enter full name"
                value={watch("name")}
                onChange={(e) => {
                  setValue("name", e.target.value, { shouldDirty: true });
                }}
                name="name"
              />
              {errors.name && (
                <p className="mt-1 text-red-600 text-sm">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div>
              <InputProductForm
                title="Email"
                placeholder="Enter email address"
                type="email"
                value={watch("email")}
                onChange={(e) => {
                  setValue("email", e.target.value, { shouldDirty: true });
                }}
                name="email"
              />
              {errors.email && (
                <p className="mt-1 text-red-600 text-sm">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <DropdownInputProductForm
                title="Role"
                placeholder="Select role"
                options={["User", "Admin", "Super Admin"]}
                selectedOption={watch("role")}
                onChange={(value) => {
                  setValue("role", value as "User" | "Admin" | "Super Admin", {
                    shouldDirty: true,
                  });
                }}
                name="role"
                searchable={false}
              />
              {errors.role && (
                <p className="mt-1 text-red-600 text-sm">
                  {errors.role.message}
                </p>
              )}
            </div>

            <div>
              <DropdownInputProductForm
                title="Assigned Tenant"
                placeholder="Select tenant"
                options={["Tenant"]}
                selectedOption={
                  watchedRole === "Super Admin"
                    ? "Internal FP"
                    : watch("assignedTenant") || "Select tenant"
                }
                onChange={(value) => {
                  setValue("assignedTenant", value, {
                    shouldDirty: true,
                  });
                }}
                name="assignedTenant"
                disabled={watchedRole === "Super Admin"}
                searchable={false}
              />
              {errors.assignedTenant && (
                <p className="mt-1 text-red-600 text-sm">
                  {errors.assignedTenant.message}
                </p>
              )}
            </div>

            {watchedRole === "Super Admin" && (
              <div className="bg-blue-50 p-3 border border-blue-200 rounded-md">
                <p className="text-blue-700 text-sm">
                  Super Admin users are automatically assigned to Internal FP
                  tenant.
                </p>
              </div>
            )}
          </form>
        </FormProvider>
      </div>

      <aside className="bottom-0 left-0 absolute bg-slate-50 py-2 border-t w-full">
        <div className="flex justify-end gap-2 mx-auto py-2 w-5/6">
          <Button
            variant="primary"
            className="px-8"
            onClick={handleSubmit(onSubmit)}
            disabled={isSubmitting || !isDirty}
          >
            {isSubmitting ? "Saving..." : "Save"}
          </Button>
        </div>
      </aside>
    </div>
  );
};
