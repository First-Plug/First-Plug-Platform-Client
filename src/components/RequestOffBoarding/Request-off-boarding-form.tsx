import { Button, PageLayout, SectionTitle } from "@/common";
import ProductDetail from "@/common/ProductDetail";
import { Product, User } from "@/types";
import { DropdownInputProductForm } from "../AddProduct/DropDownProductForm";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useStore } from "@/models";
import { Controller, useFormContext } from "react-hook-form";

const DROPDOWN_OPTIONS = ["My office", "FP warehouse", "New employee"];

const DROPDOWN_OPTIONS_TYPES = [...DROPDOWN_OPTIONS, "None"] as const;

type DropdownOption = (typeof DROPDOWN_OPTIONS_TYPES)[number];

export interface Props {
  product: Product;
  index: number;
  members: any;
  totalProducts: number;
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

  return requiredFields.every((field) => user[field]?.trim() !== "");
};

const validateMemberBillingInfo = (user: User): boolean => {
  const requiredFields = [
    "country",
    "city",
    "zipCode",
    "address",
    "apartment",
  ] as const;

  return requiredFields.every((field) => {
    const value = user[field as keyof User];
    return value !== undefined && value !== null && value.trim() !== "";
  });
};

export const RequestOffBoardingForm = ({
  product,
  index,
  members,
  totalProducts,
}: Props) => {
  const { data: session } = useSession();
  const router = useRouter();
  const { setValue, watch, control, clearErrors } = useFormContext();
  const {
    aside: { setAside },
    members: { setMemberToEdit },
  } = useStore();
  const [formStatus, setFormStatus] = useState<string>("none");
  const [applyToAll, setApplyToAll] = useState(false);
  const [isPropagating, setIsPropagating] = useState(false);

  const selectedMember = watch(`products.${index}.newMember`);
  const relocation = watch(`products.${index}.relocation`);

  const propagateFirstProductValues = () => {
    const firstProduct = watch("products.0");
    const { newMember, relocation } = firstProduct || {};

    if (!newMember && !relocation) {
      console.log("No valid selection in first product. Aborting propagation.");
      return;
    }

    const memberEmail = newMember?.email || "";

    setIsPropagating(true);

    for (let i = 1; i < totalProducts; i++) {
      setValue(`products.${i}.newMember`, newMember, { shouldValidate: true });
      setValue(`products.${i}.assignedEmail`, memberEmail, {
        shouldValidate: true,
      });

      const locationToSet = relocation || "";
      setValue(`products.${i}.relocation`, locationToSet, {
        shouldValidate: true,
      });
    }

    setIsPropagating(false);
  };

  const handleAssignAllChange = () => {
    const newApplyToAll = !applyToAll;
    setApplyToAll(newApplyToAll);

    if (newApplyToAll) {
      const firstProduct = watch("products.0");
      if (firstProduct.newMember || firstProduct.relocation) {
        propagateFirstProductValues();
      } else {
        console.log("Select All checked, but no valid selection to propagate.");
      }
    }
  };

  useEffect(() => {
    const subscription = watch((value, { name }) => {
      if (applyToAll && !isPropagating) {
        if (
          name === "products.0.newMember" ||
          name === "products.0.relocation"
        ) {
          propagateFirstProductValues();
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [applyToAll, watch, totalProducts, isPropagating]);

  useEffect(() => {
    const getStatus = () => {
      if (relocation === "New employee") {
        const foundMember = members.find(
          (member) =>
            `${member.firstName} ${member.lastName}` ===
            selectedMember?.fullName
        );

        if (!foundMember) return "selectMembers";
        if (!validateMemberBillingInfo(foundMember))
          return "not-member-available";
        return "is-member-available";
      }

      if (relocation === "My office") {
        if (!validateBillingInfo(session.user))
          return "not-billing-information";
      }

      return "none";
    };

    const newStatus = getStatus();

    setFormStatus(newStatus);
  }, [selectedMember, relocation, members, session.user]);

  const handleDropdown = (relocation: string) => {
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

  // const handleDropdownMembers = (memberFullName: string) => {
  //   const member = members.find(
  //     (member) => `${member.firstName} ${member.lastName}` === memberFullName
  //   );
  //   if (memberFullName === "None") {
  //     setValue(`products.${index}.relocation`, "");
  //     setValue(`products.${index}.newMember`, null);
  //   } else if (member) {
  //     setValue(`products.${index}.relocation`, "New employee");
  //     setValue(`products.${index}.newMember`, member);
  //   }
  //   return member;
  // };

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

  const status = getStatus();

  const handleClick = (status: string) => {
    if (status === "not-billing-information") {
      router.push("/home/settings");
    } else if (status === "not-member-available") {
      setMemberToEdit(selectedMember?._id);
      setAside("EditMember");
    }
  };

  return (
    <PageLayout>
      <section className="space-y-4">
        {index === 0 && totalProducts > 1 && (
          <div className="flex items-center mt-2">
            <input
              type="checkbox"
              className="mr-2"
              checked={applyToAll}
              onChange={handleAssignAllChange}
            />
            <p className="text-md font-semibold">
              Apply &quot;Product 1&quot; settings to all Products
            </p>
          </div>
        )}

        <SectionTitle>{`Product ${index + 1}`}</SectionTitle>
        <div className="flex space-x-2">
          <div className="flex-1 p-4">
            <ProductDetail product={product} />
          </div>
          <div className="flex-3 p-4">
            <Controller
              name={`products.${index}.newMember`}
              control={control}
              render={({ field: { onChange, value, name } }) => {
                const selectedFullName =
                  value && typeof value === "object"
                    ? `${value.firstName} ${value.lastName}`
                    : value === ""
                    ? "None"
                    : value;

                return (
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
                      const selectedMember = members.find(
                        (member) =>
                          `${member.firstName} ${member.lastName}` ===
                          selectedValue
                      );

                      if (selectedValue === "None") {
                        setValue(`products.${index}.newMember`, "None", {
                          shouldValidate: true,
                        });
                        setValue(`products.${index}.relocation`, "", {
                          shouldValidate: true,
                        });
                      } else if (selectedMember) {
                        setValue(
                          `products.${index}.newMember`,
                          selectedMember,
                          {
                            shouldValidate: true,
                          }
                        );
                        setValue(
                          `products.${index}.relocation`,
                          "New employee",
                          {
                            shouldValidate: true,
                          }
                        );
                      }
                      onChange(selectedValue);
                    }}
                    searchable={true}
                    selectedOption={selectedFullName}
                  />
                );
              }}
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
                    if (value !== selectedValue) {
                      onChange(selectedValue);
                      handleDropdown(selectedValue);
                    }
                  }}
                  searchable={true}
                  selectedOption={value || ""}
                />
              )}
            />
          </div>
          <div className="flex-1 p-2 flex items-center">
            {formStatus === "not-billing-information" && (
              <Button size="default" onClick={() => handleClick(formStatus)}>
                Complete Company Details
              </Button>
            )}

            {formStatus === "not-member-available" && (
              <Button size="default" onClick={() => handleClick(formStatus)}>
                Complete Shipment Details
              </Button>
            )}
          </div>
        </div>
      </section>
    </PageLayout>
  );
};
