import { Button, PageLayout, SectionTitle } from "@/common";
import ProductDetail from "@/common/ProductDetail";
import { Product, User } from "@/types";
import { DropdownInputProductForm } from "../AddProduct/DropDownProductForm";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ProductOffBoarding } from "@/app/home/my-team/requestOffBoarding/[id]/page";
import { useStore } from "@/models";
import { Controller, useFormContext } from "react-hook-form";

const DROPDOWN_OPTIONS = ["My office", "FP warehouse", "New employee"];

const DROPDOWN_OPTIONS_TYPES = [...DROPDOWN_OPTIONS, "None"] as const;

type DropdownOption = (typeof DROPDOWN_OPTIONS_TYPES)[number];

export interface Props {
  product: Product;
  index: number;
  members: any;
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

const validateMemberBillingInfo = (user: User): boolean => {
  const requiredFields = [
    "country",
    "city",
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

export const RequestOffBoardingForm = ({ product, index, members }: Props) => {
  const { data: session } = useSession();
  const router = useRouter();
  const { setValue, watch, control } = useFormContext();
  const {
    aside: { setAside },
    members: { setMemberToEdit },
  } = useStore();

  const selectedMember = watch(`products.${index}.newMember`);
  const relocation = watch(`products.${index}.relocation`);

  const handleDropdown = (relocation: DropdownOption) => {
    if (relocation === "My office") {
      if (!validateBillingInfo(session.user)) {
        setValue(`products.${index}.relocation`, "My office");
        setValue(`products.${index}.available`, false);
      } else {
        setValue(`products.${index}.relocation`, "My office");
        setValue(`products.${index}.available`, true);
      }
    }

    if (relocation === "FP warehouse") {
      setValue(`products.${index}.relocation`, "FP warehouse");
      setValue(`products.${index}.available`, true);
    }

    if (relocation === "New employee") {
      setValue(`products.${index}.relocation`, "New employee");
      setValue(`products.${index}.available`, false);
    }
  };

  const handleDropdownMembers = (memberFullName: string) => {
    const member = members.find(
      (member) => `${member.firstName} ${member.lastName}` === memberFullName
    );

    if (memberFullName === "None") {
      setValue(`products.${index}.relocation`, "");
      setValue(`products.${index}.newMember`, null);
    } else {
      setValue(`products.${index}.relocation`, "New employee");
      setValue(`products.${index}.newMember`, member);
    }
  };

  const getStatus = () => {
    if (relocation === "New employee") {
      const foundMember = members.find(
        (m) => `${m.firstName} ${m.lastName}` === selectedMember
      );
      if (!foundMember) return "selectMembers";
      if (!validateMemberBillingInfo(foundMember))
        return "not-member-available";
      return "is-member-available";
    }

    if (relocation === "My office") {
      if (!validateBillingInfo(session.user)) return "not-billing-information";
    }

    return "none";
  };

  const handleClick = (status: string) => {
    if (status === "not-billing-information") {
      router.push("/home/settings");
    } else if (status === "not-member-available") {
      setMemberToEdit(selectedMember._id);
      setAside("EditMember");
    }
  };

  return (
    <PageLayout>
      <section className="space-y-4">
        <SectionTitle>{`Product ${index + 1}`}</SectionTitle>
        <div className="flex space-x-2">
          <div className="flex-1 p-4">
            <ProductDetail product={product} />
          </div>
          <div className="flex-3 p-4">
            <Controller
              name={`products.${index}.newMember`}
              control={control}
              render={({ field: { onChange, value, name } }) => (
                <DropdownInputProductForm
                  name={name}
                  options={[
                    "None",
                    ...members.map(
                      (member) => `${member.firstName} ${member.lastName}`
                    ),
                  ]}
                  placeholder="Reassigned Member"
                  title="Reassigned Member*"
                  onChange={(selectedValue: string) => {
                    onChange(selectedValue);
                    handleDropdownMembers(selectedValue); // Update location based on member
                  }}
                  searchable={true}
                  selectedOption={value || ""}
                />
              )}
            />
          </div>
          <div className="flex- bg-green-200 p-4">
            <Controller
              name={`products.${index}.relocation`}
              control={control}
              render={({ field: { onChange, value, name } }) => (
                <DropdownInputProductForm
                  name={name}
                  options={DROPDOWN_OPTIONS}
                  placeholder="New Location"
                  title="New Location*"
                  onChange={(selectedValue: string) => {
                    onChange(selectedValue);
                    handleDropdown(selectedValue);
                  }}
                  searchable={true}
                  selectedOption={value || ""}
                />
              )}
            />
          </div>
          <div className="flex-1 p-2 flex items-center">
            {status === "not-billing-information" && (
              <Button size="default" onClick={() => handleClick(status)}>
                Complete Company Details
              </Button>
            )}

            {status === "not-member-available" && (
              <Button
                size="default"
                onClick={() => {
                  setMemberToEdit(selectedMember?._id);
                  setAside("EditMember");
                }}
              >
                Complete Shipment Details
              </Button>
            )}
          </div>
        </div>
      </section>
    </PageLayout>
  );
};
