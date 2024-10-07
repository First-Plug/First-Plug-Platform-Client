import { Button, SectionTitle } from "@/common";
import ProductDetail from "@/common/ProductDetail";
import { Product, User } from "@/types";
import { DropdownInputProductForm } from "../AddProduct/DropDownProductForm";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { FormProvider, useForm } from "react-hook-form";
import { ProductOffBoarding } from "@/app/home/my-team/requestOffBoarding/[id]/page";
import { useStore } from "@/models";

const DROPDOWN_OPTIONS = ["My office", "FP warehouse", "New member"] as const;
const DROPDOWN_OPTIONS_TYPES = [...DROPDOWN_OPTIONS, "none"] as const;

type DropdownOption = (typeof DROPDOWN_OPTIONS_TYPES)[number];

export interface Props {
  product: Product;
  index: number;
  setProducts: React.Dispatch<React.SetStateAction<ProductOffBoarding[]>>;
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

export const RequestOffBoardingForm = ({
  product,
  index,
  setProducts,
  members,
}: Props) => {
  const { data: session } = useSession();
  const router = useRouter();
  const {
    aside: { setAside },
    members: { setMemberToEdit },
  } = useStore();

  const [status, setStatus] = useState<
    | "not-billing-information"
    | "none"
    | "selectMembers"
    | "is-member-available"
    | "not-member-available"
  >();

  const [selectedMember, setSelectedMember] = useState(null);

  const handleDropdown = (relocation: DropdownOption) => {
    setStatus("none");

    if (relocation === "none") {
      return setProducts((prev) => {
        return prev.filter((item) => item.product._id !== product._id);
      });
    }

    if (relocation === "My office") {
      if (!validateBillingInfo(session.user)) {
        setStatus("not-billing-information");
        return setProducts((prev) => {
          const newProduct: ProductOffBoarding = {
            product,
            relocation: "My office",
            available: false,
          };

          const productExists = prev.some(
            (item) => item.product._id === newProduct.product._id
          );

          if (productExists) {
            return prev.map((item) =>
              item.product._id === newProduct.product._id
                ? { ...item, ...newProduct }
                : item
            );
          } else {
            return [...prev, newProduct];
          }
        });
      } else {
        return setProducts((prev) => {
          const newProduct: ProductOffBoarding = {
            product,
            relocation: "My office",
            available: true,
          };

          const productExists = prev.some(
            (item) => item.product._id === newProduct.product._id
          );

          if (productExists) {
            return prev.map((item) =>
              item.product._id === newProduct.product._id
                ? { ...item, ...newProduct }
                : item
            );
          } else {
            return [...prev, newProduct];
          }
        });
      }
    }

    if (relocation === "FP warehouse") {
      return setProducts((prev) => {
        const newProduct: ProductOffBoarding = {
          product,
          relocation: "FP warehouse",
          available: true,
        };

        const productExists = prev.some(
          (item) => item.product._id === newProduct.product._id
        );

        if (productExists) {
          return prev.map((item) =>
            item.product._id === newProduct.product._id
              ? { ...item, ...newProduct }
              : item
          );
        } else {
          return [...prev, newProduct];
        }
      });
    }

    if (relocation === "New member") {
      setStatus("selectMembers");
      return setProducts((prev) => {
        return prev.filter((item) => item.product._id !== product._id);
      });
    }
  };

  const handleDropdownMembers = (memberFullName: string) => {
    if (memberFullName !== "none") {
      const member = members.find(
        (member) => `${member.firstName} ${member.lastName}` === memberFullName
      );

      const isMemberAvailable = validateMemberBillingInfo(member);
      if (isMemberAvailable) {
        return setProducts((prev) => {
          const newProduct: ProductOffBoarding = {
            product,
            newMember: member,
            relocation: "New member",
            available: true,
          };

          const productExists = prev.some(
            (item) => item.product._id === newProduct.product._id
          );

          if (productExists) {
            return prev.map((item) =>
              item.product._id === newProduct.product._id
                ? { ...item, ...newProduct }
                : item
            );
          } else {
            return [...prev, newProduct];
          }
        });
      }

      setSelectedMember(member);
      return isMemberAvailable
        ? setStatus("is-member-available")
        : setStatus("not-member-available");
    }
  };

  const handleClick = () => {
    if (status === "not-billing-information") {
      router.push("/home/settings");
    }
  };

  return (
    <div>
      <SectionTitle>{`Product ${index + 1}`}</SectionTitle>
      <div className="flex gap-4">
        <ProductDetail product={product} />

        <div>
          <DropdownInputProductForm
            options={DROPDOWN_OPTIONS}
            placeholder="Relocation place"
            title="Relocation place*"
            name={`products.${index}`}
            onChange={handleDropdown}
            searchable={true}
          />
        </div>

        {(status === "selectMembers" ||
          status === "is-member-available" ||
          status === "not-member-available") &&
          members.length && (
            <div>
              <div>
                <DropdownInputProductForm
                  options={members.map(
                    (member) => `${member.firstName} ${member.lastName}`
                  )}
                  placeholder="Selected member"
                  title="Select member*"
                  name={`products.${index}`}
                  onChange={handleDropdownMembers}
                  searchable={true}
                />
              </div>
            </div>
          )}

        {status === "not-billing-information" && (
          <Button size="small" onClick={handleClick}>
            Complete Billing Info
          </Button>
        )}

        {status === "not-member-available" && (
          <Button
            size="small"
            onClick={() => {
              setMemberToEdit(selectedMember._id);
              setAside("EditMember");
            }}
          >
            Complete Shipment Details
          </Button>
        )}
      </div>
    </div>
  );
};
