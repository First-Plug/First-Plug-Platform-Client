import { SectionTitle } from "@/common";
import ProductDetail from "@/common/ProductDetail";
import { Product } from "@/types";
import { DropdownInputProductForm } from "../AddProduct/DropDownProductForm";
import { useState } from "react";
import { AuthServices } from "@/services";
import { useSession } from "next-auth/react";

const DROPDOWN_OPTIONS = ["My office", "FP warehouse", "New member"] as const;

type DropdownOption = (typeof DROPDOWN_OPTIONS)[number];

export interface Props {
  product: Product;
  index: number;
  methods: any;
}

export const RequestOffBoardingForm = ({ product, index, methods }: Props) => {
  const { data: session } = useSession();
  const [relocationOption, setRelocationOption] = useState<DropdownOption>();

  const handleDropdown = (relocation: DropdownOption) => {
    console.log(relocation);

    console.log(session);

    // AuthServices.getUserInfro()

    setRelocationOption(relocation);
  };

  return (
    <div key={product._id}>
      <SectionTitle>{`Product ${index + 1}`}</SectionTitle>
      <div className="flex">
        <ProductDetail product={product} />

        <DropdownInputProductForm
          options={DROPDOWN_OPTIONS}
          placeholder="Relocation place"
          title="Relocation place*"
          name={`products.${index}.assignedMember`}
          selectedOption={methods.watch(`products.${index}.assignedMember`)}
          onChange={handleDropdown}
          searchable={true}
        />
        <div className="min-h-[24px]">
          {methods.formState.errors.products &&
            methods.formState.errors.products[index]?.assignedEmail && (
              <p className="text-red-500">
                {methods.formState.errors.products[index].assignedEmail.message}
              </p>
            )}
        </div>
      </div>
    </div>
  );
};
