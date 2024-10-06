import { Button, SectionTitle } from "@/common";
import ProductDetail from "@/common/ProductDetail";
import { Product, User } from "@/types";
import { DropdownInputProductForm } from "../AddProduct/DropDownProductForm";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

const DROPDOWN_OPTIONS = ["My office", "FP warehouse", "New member"] as const;

type DropdownOption = (typeof DROPDOWN_OPTIONS)[number];

export interface Props {
  product: Product;
  index: number;
  methods: any;
}

const validateBillingInfo = (user: User): boolean => {
  const requiredFields = [
    "country",
    "city",
    "state",
    "zipCode",
    "address",
    "apartment",
  ] as const;

  for (const field of requiredFields) {
    const value = user[field as keyof User];
    if (value === undefined || value === null || value.trim() === "") {
      return false;
    }
  }
  return true;
};

export const RequestOffBoardingForm = ({ product, index, methods }: Props) => {
  const { data: session } = useSession();
  const router = useRouter();

  const [status, setStatus] = useState<"not-billing-information">();

  const handleDropdown = (relocation: DropdownOption) => {
    console.log(relocation);

    if (relocation === "My office") {
      if (!validateBillingInfo(session.user)) {
        console.log("not billing info completed");
        return setStatus("not-billing-information");
      } else {
        return console.log("billing info completed");
      }
    }

    setStatus("");
  };

  const handleClick = () => {
    if (status === "not-billing-information") {
      router.push("/home/settings");
    }
  };

  return (
    <div key={product._id}>
      <SectionTitle>{`Product ${index + 1}`}</SectionTitle>
      <div className="flex gap-4">
        <ProductDetail product={product} />

        <div>
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
                  {
                    methods.formState.errors.products[index].assignedEmail
                      .message
                  }
                </p>
              )}
          </div>
        </div>

        {status === "not-billing-information" && (
          <Button size="small" onClick={handleClick}>
            Complete billing info
          </Button>
        )}
      </div>
    </div>
  );
};
