"use client";
import { Button, BarLoader } from "@/shared";
import { useFetchTenants } from "@/features/tenants";

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

  const handleTenantChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedTenant = tenants?.find((t) => t.id === e.target.value);
    if (selectedTenant) {
      onFormDataChange("tenant", {
        tenantName: selectedTenant.tenantName,
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
        <label className="block mb-2 font-medium text-gray-700 text-sm">
          Tenant
        </label>
        <select
          value={
            tenants?.find((t) => t.tenantName === formData.tenant?.tenantName)
              ?.id || ""
          }
          onChange={handleTenantChange}
          className="shadow-sm px-3 py-2 border border-gray-300 focus:border-blue-500 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
        >
          <option value="">Selecciona un tenant</option>
          {tenants?.map((tenant) => (
            <option key={tenant.id} value={tenant.id}>
              {tenant.name}
            </option>
          ))}
        </select>
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
