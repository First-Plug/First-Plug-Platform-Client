"use client";

import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQueryClient } from "@tanstack/react-query";
import { useAsideStore } from "@/shared";
import { Button } from "@/shared";
import { InputProductForm } from "@/features/assets";
import {
  useUpdateAssignedUser,
  AVAILABLE_ROLES,
} from "@/features/assigned-users";
import type {
  AssignedUser,
  UpdateAssignedUserRequest,
} from "@/features/assigned-users";

// Validation schema
const editAssignedUserSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  role: z.enum(AVAILABLE_ROLES, {
    errorMap: () => ({ message: "Please select a valid role" }),
  }),
});

type EditAssignedUserFormData = z.infer<typeof editAssignedUserSchema>;

export const EditAssignedUser = () => {
  const { closeAside } = useAsideStore();
  const queryClient = useQueryClient();

  // Get selected user from query cache
  const selectedUser = queryClient.getQueryData<AssignedUser>([
    "selectedAssignedUser",
  ]);

  const { mutate: updateUser, isPending } = useUpdateAssignedUser();

  const methods = useForm<EditAssignedUserFormData>({
    resolver: zodResolver(editAssignedUserSchema),
    defaultValues: {
      firstName: selectedUser?.firstName || "",
      lastName: selectedUser?.lastName || "",
      role: selectedUser?.role || "user",
    },
  });

  const {
    handleSubmit,
    formState: { errors },
  } = methods;

  const onSubmit = (data: EditAssignedUserFormData) => {
    if (!selectedUser) {
      return;
    }

    // Use id from transformed data (frontend) or _id from original data (backend)
    const userId = (selectedUser as any).id || selectedUser._id;

    if (!userId) {
      return;
    }

    const updateData: UpdateAssignedUserRequest = {
      firstName: data.firstName,
      lastName: data.lastName,
      role: data.role,
    };

    updateUser(
      { userId, data: updateData },
      {
        onSuccess: () => {
          closeAside();
        },
      }
    );
  };

  if (!selectedUser) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-500">No user selected</p>
        </div>
      </div>
    );
  }

  const roleOptions = AVAILABLE_ROLES.map((role) => ({
    label: role.charAt(0).toUpperCase() + role.slice(1),
    value: role,
  }));

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto">
        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pr-4">
            {/* First Name */}
            <div className="mt-8">
              <InputProductForm
                title="First Name"
                placeholder="Enter first name"
                value={methods.watch("firstName")}
                onChange={(e) => methods.setValue("firstName", e.target.value)}
                name="firstName"
              />
              {errors.firstName && (
                <p className="mt-1 text-red-600 text-sm">
                  {errors.firstName.message}
                </p>
              )}
            </div>

            {/* Last Name */}
            <div>
              <InputProductForm
                title="Last Name"
                placeholder="Enter last name"
                value={methods.watch("lastName")}
                onChange={(e) => methods.setValue("lastName", e.target.value)}
                name="lastName"
              />
              {errors.lastName && (
                <p className="mt-1 text-red-600 text-sm">
                  {errors.lastName.message}
                </p>
              )}
            </div>

            {/* Email (Disabled) */}
            <div>
              <div className="relative">
                <label className="block ml-2 font-sans text-dark-grey">
                  Email
                </label>
                <input
                  name="email"
                  type="email"
                  value={selectedUser.email}
                  onChange={() => {}} // No-op since it's disabled
                  placeholder="Email address"
                  className="w-full h-14 py-2 rounded-xl border p-4 font-sans focus:outline-none bg-gray-100 text-gray-500 cursor-not-allowed"
                  disabled={true}
                  readOnly={true}
                />
              </div>
              <p className="mt-1 text-gray-500 text-xs">
                Email cannot be modified
              </p>
            </div>

            {/* Role */}
            <div>
              <label className="block ml-2 font-sans text-dark-grey mb-2">
                Role
              </label>
              <select
                value={methods.watch("role")}
                onChange={(e) =>
                  methods.setValue(
                    "role",
                    e.target.value as "user" | "admin" | "superadmin"
                  )
                }
                className="w-full h-14 py-2 rounded-xl border p-4 font-sans focus:outline-none"
              >
                {roleOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {errors.role && (
                <p className="mt-1 text-red-600 text-sm">
                  {errors.role.message}
                </p>
              )}
            </div>

            {/* Tenant (Disabled) */}
            <div>
              <div className="relative">
                <label className="block ml-2 font-sans text-dark-grey">
                  Assigned Tenant
                </label>
                <input
                  name="tenant"
                  type="text"
                  value={selectedUser.tenantId?.name || "Internal FP"}
                  onChange={() => {}} // No-op since it's disabled
                  placeholder="Tenant name"
                  className="w-full h-14 py-2 rounded-xl border p-4 font-sans focus:outline-none bg-gray-100 text-gray-500 cursor-not-allowed"
                  disabled={true}
                  readOnly={true}
                />
              </div>
              <p className="mt-1 text-gray-500 text-xs">
                Tenant assignment cannot be modified
              </p>
            </div>
          </form>
        </FormProvider>
      </div>

      {/* Footer with buttons */}
      <div className="border-t pt-4 mt-6">
        <div className="flex justify-end space-x-3">
          <Button
            type="button"
            variant="secondary"
            onClick={closeAside}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            onClick={handleSubmit(onSubmit)}
            disabled={isPending}
          >
            {isPending ? "Updating..." : "Update User"}
          </Button>
        </div>
      </div>
    </div>
  );
};
