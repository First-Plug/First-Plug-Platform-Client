import { Button, SectionTitle } from "@/common";
import ProductDetail from "@/common/ProductDetail";
import { Product, User } from "@/types";
import { DropdownInputProductForm } from "../AddProduct/DropDownProductForm";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ProductOffBoarding } from "@/app/home/my-team/requestOffBoarding/[id]/page";
import { useStore } from "@/models";

const DROPDOWN_OPTIONS = ["My office", "FP warehouse", "New employee"];

const DROPDOWN_OPTIONS_TYPES = [...DROPDOWN_OPTIONS, "None"] as const;

type DropdownOption = (typeof DROPDOWN_OPTIONS_TYPES)[number];

export interface Props {
  product: Product;
  index: number;
  products: ProductOffBoarding[];
  setProducts: React.Dispatch<React.SetStateAction<ProductOffBoarding[]>>;
  members: any;
  initialValue?: ProductOffBoarding;
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
  initialValue,
}: Props) => {
  const { data: session } = useSession();
  const router = useRouter();
  const {
    aside: { setAside },
    members: { setMemberToEdit, members: memberStore },
  } = useStore();

  const [status, setStatus] = useState<
    | "not-billing-information"
    | "none"
    | "selectMembers"
    | "is-member-available"
    | "not-member-available"
  >();

  const [selectedMember, setSelectedMember] = useState(null);
  const [selectedOption, setSelectedOption] = useState<DropdownOption | "">("");
  const [disabledOption, setDisabledOption] = useState(true);
  const [value, setValue] = useState("");
  const [arrayOptions, setArrayOptions] = useState(DROPDOWN_OPTIONS);

  useEffect(() => {
    if (initialValue) {
      setSelectedOption(initialValue.relocation);

      if (initialValue.relocation === "New employee") {
        setValue(initialValue.newMember.fullName);
        if (!validateMemberBillingInfo(initialValue.newMember)) {
          setStatus("not-member-available");
        } else {
        }
      }

      if (initialValue.relocation === "My office") {
        setArrayOptions(arrayOptions.filter((item) => item !== "New employee"));
        setValue("None");
        setDisabledOption(false);
        if (validateBillingInfo(session.user)) {
          setStatus("none");
        } else {
          setStatus("not-billing-information");
        }
      }

      if (initialValue.relocation === "FP warehouse") {
        setValue("None");
        setDisabledOption(false);
        setArrayOptions(arrayOptions.filter((item) => item !== "New employee"));
      }
    }
  }, []);

  const handleDropdown = (relocation: DropdownOption) => {
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
      setStatus("none");
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

    if (relocation === "New employee") {
      setStatus("selectMembers");
      return setProducts((prev) =>
        prev.map((item) =>
          item.product._id === product._id
            ? { ...item, available: false }
            : item
        )
      );
    }
  };

  const handleDropdownMembers = (memberFullName: string) => {
    if (memberFullName === "None") {
      setArrayOptions(arrayOptions.filter((item) => item !== "New employee"));
      setSelectedOption("");
      setDisabledOption(false);
      if (selectedOption === "New employee") {
        setStatus("none");
      }
      return setProducts((prev) => {
        return prev.filter((item) => item.product._id !== product._id);
      });
    }

    setDisabledOption(true);
    setSelectedOption("New employee");
    const member = members.find(
      (member) => `${member.firstName} ${member.lastName}` === memberFullName
    );

    const isMemberAvailable = validateMemberBillingInfo(member);
    if (isMemberAvailable) {
      return setProducts((prev) => {
        const newProduct: ProductOffBoarding = {
          product,
          newMember: member,
          relocation: "New employee",
          available: true,
        };

        const productExists = prev.some(
          (item) => item.product._id === newProduct.product._id
        );

        setStatus("is-member-available");

        if (productExists) {
          return prev.map((item) =>
            item.product._id === newProduct.product._id
              ? {
                  ...item,
                  newMember: member,
                  relocation: "New employee",
                  available: true,
                }
              : item
          );
        } else {
          return [...prev, newProduct];
        }
      });
    } else {
      setSelectedMember(member);
      setStatus("not-member-available");

      const newProduct: ProductOffBoarding = {
        product,
        newMember: member,
        relocation: "New employee",
        available: false,
      };

      return setProducts((prev) => {
        const productExists = prev.some(
          (item) => item.product._id === newProduct.product._id
        );

        if (productExists) {
          return prev.map((item) =>
            item.product._id === newProduct.product._id
              ? {
                  ...item,
                  newMember: member,
                  relocation: "New employee",
                  available: false,
                }
              : item
          );
        } else {
          return [...prev, newProduct];
        }
      });
    }
  };

  const handleClick = () => {
    if (status === "not-billing-information") {
      router.push("/home/settings");
    }
  };

  return (
    <section className="space-y-4">
      <SectionTitle>{`Product ${index + 1}`}</SectionTitle>
      <div className="flex space-x-2">
        <div className="flex-1 p-4">
          <ProductDetail product={product} />
        </div>
        <div className="flex-3 p-4">
          <DropdownInputProductForm
            options={[
              "None",
              ...members.map(
                (member) => `${member.firstName} ${member.lastName}`
              ),
            ]}
            placeholder="Reassigned Member"
            title="Reassigned Member*"
            name={`products.${index}`}
            onChange={handleDropdownMembers}
            searchable={true}
            selectedOption={value}
          />
        </div>
        <div className="flex- bg-green-200 p-4">
          <DropdownInputProductForm
            options={arrayOptions}
            placeholder="New Location"
            title="New Location*"
            name={`products.${index}`}
            onChange={handleDropdown}
            selectedOption={selectedOption}
            searchable={true}
            disabled={disabledOption}
          />
        </div>
        <div className="flex-1 p-2 flex items-center">
          {status === "not-billing-information" && (
            <Button size="default" onClick={handleClick}>
              Complete Company Details
            </Button>
          )}

          {status === "not-member-available" && (
            <Button
              size="default"
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
    </section>
  );
};
