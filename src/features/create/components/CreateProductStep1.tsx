"use client";
import { Button, BarLoader } from "@/shared";
import { useFetchTenants } from "@/features/tenants";
import { DropdownInputProductForm } from "@/features/assets";

interface CreateProductStep1Props {
  formData: any;
  onFormDataChange: (field: string, value: any) => void;
  onNext: () => void;
  onPrevious: () => void;
}

export const CreateProductStep1 = ({
  formData,
  onFormDataChange,
  onNext,
  onPrevious,
}: CreateProductStep1Props) => {
  const { data: tenants, isLoading, error } = useFetchTenants();

  const sortedTenants = tenants
    ? [...tenants].sort((a, b) => a.tenantName.localeCompare(b.tenantName))
    : [];

  const handleTenantChange = (tenantName: string) => {
    const selectedTenant = sortedTenants.find(
      (t) => t.tenantName === tenantName
    );
    if (selectedTenant) {
      onFormDataChange("tenant", {
        id: selectedTenant.id,
        tenantName: selectedTenant.tenantName,
        name: selectedTenant.name,
        recoverableConfig: selectedTenant.recoverableConfig,
      });
    }
  };

  const isNextDisabled = !formData.tenant;

  if (isLoading) {
    return (
      <div className="bg-white shadow-sm p-6 border border-gray-200 rounded-lg">
        <div className="flex justify-center items-center h-32">
          <BarLoader />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white shadow-sm p-6 border border-gray-200 rounded-lg">
        <div className="flex justify-center items-center h-32">
          <p className="text-red-600">
            Error cargando tenants: {error.message}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-sm p-6 border border-gray-200 rounded-lg">
      <div className="mb-6">
        <h2 className="mb-2 font-semibold text-gray-900 text-xl">
          Step 1: Select Tenant
        </h2>
        <p className="text-gray-600">
          Select the tenant you want to create products for
        </p>
      </div>

      <div className="mb-6">
        <DropdownInputProductForm
          title=""
          placeholder="Select a tenant"
          options={sortedTenants.map((t) => t.tenantName)}
          selectedOption={formData.tenant?.tenantName || ""}
          onChange={handleTenantChange}
          name="tenant"
          searchable={true}
        />
      </div>

      <div className="flex justify-between">
        <Button
          onClick={onPrevious}
          variant="outline"
          disabled={true}
          className="py-2"
        >
          Previous
        </Button>
        <Button
          onClick={onNext}
          disabled={isNextDisabled}
          className="bg-gray-800 px-6 py-2"
        >
          Next
        </Button>
      </div>
    </div>
  );
};
