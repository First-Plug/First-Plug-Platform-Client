"use client";
import { Button, PageLayout, SectionTitle } from "@/shared";
import { ProductDetail } from "@/features/assets";
import { Product } from "@/features/assets";
import { User } from "@/features/auth";
import { DropdownInputProductForm } from "@/features/assets";
import { useEffect, useLayoutEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Controller, useFormContext } from "react-hook-form";

import { useAsideStore } from "@/shared";
import { useMemberStore } from "../store/member.store";

const DROPDOWN_OPTIONS = ["My office", "FP warehouse", "New employee"];

interface ExtendedUser extends Partial<User> {
  personalEmail?: string;
  dni?: string | number;
  firstName?: string;
  lastName?: string;
}

export interface Props {
  product: Product;
  index: number;
  members: any;
  totalProducts: number;
  products: Product[];
  className: string;
  setIsButtonDisabled: (param: boolean) => void;
  onFormStatusChange: (status: string) => void;
}

const validateBillingInfo = (user: User): boolean => {
  const requiredFields = [
    "country",
    "city",
    "state",
    "zipCode",
    "address",
    "phone",
  ] as const;

  return requiredFields.every((field) => user[field]?.trim() !== "");
};

export const validateMemberBillingInfo = (user: ExtendedUser): boolean => {
  const requiredFields = [
    "country",
    "city",
    "zipCode",
    "address",
    "personalEmail",
    "phone",
    "dni",
  ] as const;

  const isValid = requiredFields.every((field) => {
    const value = user[field as keyof ExtendedUser];
    const fieldValid =
      value !== undefined &&
      value !== null &&
      (typeof value === "number" || value.toString().trim() !== "");

    return fieldValid;
  });

  return isValid;
};

export const RequestOffBoardingForm = ({
  product,
  products,
  index,
  members,
  totalProducts,
  className,
  setIsButtonDisabled,
  onFormStatusChange,
}: Props) => {
  const { setSelectedMember } = useMemberStore();

  const { data: session } = useSession();
  const router = useRouter();
  const { setValue, watch, control } = useFormContext();
  const { setAside, isClosed } = useAsideStore();

  const [formStatus, setFormStatus] = useState<string>("none");
  const [applyToAll, setApplyToAll] = useState(false);
  const [isPropagating, setIsPropagating] = useState(false);
  const [dropdownOptions, setDropdownOptions] = useState(DROPDOWN_OPTIONS);
  const [isDisabledDropdown, setIsDisabledDropdown] = useState(true);

  const selectedMember = watch(`products.${index}.newMember`);
  const relocation = watch(`products.${index}.relocation`);

  const handleDropdown = (relocation: string) => {
    if (relocation === "My office") {
      if (!validateBillingInfo(session.user)) {
        setValue(`products.${index}.relocation`, "My office");
        setValue(`products.${index}.available`, false);
        setValue(`products.${index}.newMember`, "None", {
          shouldValidate: true,
        });
        setValue(`products.${index}.product`, products[index], {
          shouldValidate: true,
        });
      } else {
        setValue(`products.${index}.relocation`, "My office");
        setValue(`products.${index}.available`, true);
        setValue(`products.${index}.newMember`, "None", {
          shouldValidate: true,
        });
        setValue(`products.${index}.product`, products[index], {
          shouldValidate: true,
        });
      }
    }

    if (relocation === "FP warehouse") {
      setValue(`products.${index}.relocation`, "FP warehouse");
      setValue(`products.${index}.available`, true);
      setValue(`products.${index}.newMember`, "None", {
        shouldValidate: true,
      });
      setValue(`products.${index}.product`, products[index], {
        shouldValidate: true,
      });
    }

    if (relocation === "New employee") {
      setValue(`products.${index}.relocation`, "New employee");
      setValue(`products.${index}.available`, true);
      setValue(`products.${index}.product`, products[index], {
        shouldValidate: true,
      });
      setIsDisabledDropdown(true);
    } else {
      setIsDisabledDropdown(false);
    }
  };

  const propagateFirstProductValues = () => {
    const firstProduct = watch("products.0");
    const { newMember, relocation, available } = firstProduct || {};

    if (!newMember && !relocation) {
      console.log("No valid selection in first product. Aborting propagation.");
      return;
    }

    setIsPropagating(true);

    for (let i = 1; i < totalProducts; i++) {
      setValue(`products.${i}.newMember`, newMember, {
        shouldValidate: true,
      });
      setValue(`products.${i}.available`, available, {
        shouldValidate: true,
      });

      const locationToSet = relocation || "";
      setValue(`products.${i}.relocation`, locationToSet, {
        shouldValidate: true,
      });
      setValue(`products.${i}.product`, products[i], {
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

  const getStatus = () => {
    if (relocation === "New employee") {
      const foundMember = members.find(
        (m) => `${m.firstName} ${m.lastName}` === selectedMember
      );
      if (!foundMember) return "selectMembers";
      if (!validateMemberBillingInfo(foundMember)) {
        return "not-member-available";
      }
      return "is-member-available";
    }

    if (relocation === "My office") {
      if (!validateBillingInfo(session.user)) {
        return "not-billing-information";
      }
    }

    setDropdownOptions(["My office", "FP warehouse"]);
    if (!applyToAll) {
      setIsDisabledDropdown(false);
    }
    return "none";
  };

  useEffect(() => {
    const newStatus = getStatus();

    if (
      newStatus === "not-member-available" ||
      newStatus === "not-billing-information"
    ) {
      const currentAvailableValue = watch(`products.${index}.available`);

      if (currentAvailableValue !== false) {
        setValue(`products.${index}.available`, false, {
          shouldValidate: true,
        });
      }
    }

    setFormStatus(newStatus);
    onFormStatusChange(newStatus);
  }, [
    selectedMember,
    relocation,
    members,
    session.user,
    index,
    watch,
    setValue,
  ]);

  useEffect(() => {
    let allAvailable = true;

    products.forEach((product, index) => {
      const newStatus = getStatus();

      if (
        newStatus === "not-member-available" ||
        newStatus === "not-billing-information"
      ) {
        const currentAvailableValue = watch(`products.${index}.available`);

        if (currentAvailableValue !== false) {
          setValue(`products.${index}.available`, false, {
            shouldValidate: true,
          });
        }
        allAvailable = false;
      } else {
        const currentAvailableValue = watch(`products.${index}.available`);

        if (currentAvailableValue !== true) {
          setValue(`products.${index}.available`, true, {
            shouldValidate: true,
          });
        }
      }
    });

    if (!allAvailable) {
      setIsButtonDisabled(false);
    } else {
      setIsButtonDisabled(true);
    }
  }, [isClosed]);

  // Control de sincronización `Apply to All`
  useLayoutEffect(() => {
    const subscription = watch((value, { name }) => {
      if (
        applyToAll &&
        name?.startsWith("products.") &&
        name !== "products.0"
      ) {
        const productIndex = Number(name.split(".")[1]);
        if (!isNaN(productIndex)) {
          setTimeout(() => {
            const firstProductNewMember = watch("products.0.newMember");

            const firstProductRelocation = watch("products.0.relocation");

            const currentProductNewMember = watch(
              `products.${productIndex}.newMember`
            );

            const currentProductrelocation = watch(
              `products.${productIndex}.relocation`
            );

            const isEmailDifferent =
              firstProductNewMember !== currentProductNewMember;

            const isLocationDifferent =
              firstProductRelocation !== currentProductrelocation;

            if (isEmailDifferent || isLocationDifferent) {
              setApplyToAll(false);
            }
          }, 100);
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [watch, applyToAll]);

  const handleClick = (status: string) => {
    if (status === "not-billing-information") {
      router.push("/home/settings");
    } else if (status === "not-member-available") {
      const foundMember = members.find(
        (member) => `${member.firstName} ${member.lastName}` === selectedMember
      );

      setSelectedMember(foundMember);
      setAside("EditMember");
    }
  };

  const handleFormStatusChange = (status: string) => {
    setFormStatus(status);
    onFormStatusChange(status);
  };

  useEffect(() => {
    const newStatus = getStatus();
    handleFormStatusChange(newStatus);
  }, [
    selectedMember,
    relocation,
    members,
    session.user,
    index,
    watch,
    setValue,
  ]);

  return (
    <PageLayout>
      <section className={`space-y-4 ${className}`}>
        {index === 0 && totalProducts > 1 && (
          <div className="flex items-center mt-2">
            {/* <input
                type="checkbox"
                className="mr-2"
                checked={applyToAll}
                onChange={handleAssignAllChange}
              />
              <p className="font-semibold text-md">
                Apply &quot;Product 1&quot; settings to all Products
              </p> */}
          </div>
        )}

        <SectionTitle>{`Product ${index + 1}`}</SectionTitle>
        <div className="flex space-x-2">
          <div className="p-4 lg:min-w-[35vw]">
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
                        setValue(`products.${index}.available`, true, {
                          shouldValidate: true,
                        });
                        setValue(`products.${index}.product`, products[index], {
                          shouldValidate: true,
                        });
                        setDropdownOptions(["My office", "FP warehouse"]);
                        setIsDisabledDropdown(false);
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
                        setValue(`products.${index}.available`, true, {
                          shouldValidate: true,
                        });
                        setValue(`products.${index}.product`, products[index], {
                          shouldValidate: true,
                        });
                        setDropdownOptions(DROPDOWN_OPTIONS);
                        setIsDisabledDropdown(true);
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
                  options={dropdownOptions}
                  placeholder="New Location"
                  title="New Location*"
                  onChange={(selectedValue: string) => {
                    if (value !== selectedValue) {
                      onChange(selectedValue);
                      handleDropdown(selectedValue);
                    }
                  }}
                  disabled={isDisabledDropdown}
                  searchable={true}
                  selectedOption={value || ""}
                />
              )}
            />
          </div>
          <div className="flex flex-1 items-center p-2">
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
