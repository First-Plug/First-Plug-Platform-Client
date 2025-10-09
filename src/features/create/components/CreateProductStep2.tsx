"use client";
import { Button } from "@/shared";

interface CreateProductStep2Props {
  formData: any;
  onFormDataChange: (field: string, value: any) => void;
  onNext: () => void;
  onPrevious: () => void;
}

export const CreateProductStep2 = ({
  formData,
  onFormDataChange,
  onNext,
  onPrevious,
}: CreateProductStep2Props) => {
  const categories = [
    { id: 1, name: "Computers" },
    { id: 2, name: "Monitors" },
    { id: 3, name: "Peripherals" },
    { id: 4, name: "Audio" },
    { id: 5, name: "Merchandising" },
    { id: 6, name: "Other" },
  ].sort((a, b) => a.name.localeCompare(b.name));

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedCategory = categories.find(
      (c) => c.id === parseInt(e.target.value)
    );
    onFormDataChange("category", selectedCategory);

    // Limpiar datos del Step 3 cuando se cambia la categoría
    onFormDataChange("name", "");
    onFormDataChange("serialNumber", "");
    onFormDataChange("productCondition", null);
    onFormDataChange("recoverable", false);
    onFormDataChange("acquisitionDate", "");
    onFormDataChange("price", { amount: "", currencyCode: "USD" });
    onFormDataChange("additionalInfo", "");
    onFormDataChange("attributes", []);
    onFormDataChange("quantity", 1);
    onFormDataChange("warehouse", null);
  };

  const isNextDisabled = !formData.category;

  return (
    <div className="bg-white shadow-sm p-6 border border-gray-200 rounded-lg">
      <div className="mb-6">
        <h2 className="mb-2 font-semibold text-gray-900 text-xl">
          Step 2: Category
        </h2>
        <p className="text-gray-600">Select the product category</p>
      </div>

      <div className="mb-6">
        <div>
          <label className="block mb-2 font-medium text-gray-700 text-sm">
            Category
          </label>
          <select
            value={formData.category?.id || ""}
            onChange={handleCategoryChange}
            className="shadow-sm px-3 py-2 border border-gray-300 focus:border-blue-500 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
          >
            <option value="">Select a category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex justify-between">
        <Button onClick={onPrevious} variant="outline" className="py-2">
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
