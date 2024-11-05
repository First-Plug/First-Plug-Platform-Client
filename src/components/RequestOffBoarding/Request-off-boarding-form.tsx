import { Button, PageLayout, SectionTitle } from "@/common";
import ProductDetail from "@/common/ProductDetail";
import { Product, User } from "@/types";
import { DropdownInputProductForm } from "../AddProduct/DropDownProductForm";
import { useEffect, useLayoutEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useStore } from "@/models";
import { Controller, useFormContext } from "react-hook-form";
import { observer } from "mobx-react-lite";

const DROPDOWN_OPTIONS = ["My office", "FP warehouse", "New employee"];

export interface Props {
  product: Product;
  index: number;
  members: any;
  totalProducts: number;
  products: Product[];
  className: string;
  setIsButtonDisabled: (param: boolean) => void;
}

const validateBillingInfo = (user: User): boolean => {
  const requiredFields = [
    "country",
    "city",
    "state",
    "zipCode",
    "address",
  ] as const;

  return requiredFields.every((field) => user[field]?.trim() !== "");
};

const validateMemberBillingInfo = (user: User): boolean => {
  const requiredFields = [
    "country",
    "city",
    "zipCode",
    "address",
    "personalEmail",
    "phone",
    "dni",
  ] as const;

  return requiredFields.every((field) => {
    const value = user[field as keyof User];
    return (
      value !== undefined &&
      value !== null &&
      (typeof value === "number" || value.trim() !== "") &&
      value.toString().trim() !== ""
    );
  });
};

export const RequestOffBoardingForm = observer(
  ({
    product,
    products,
    index,
    members,
    totalProducts,
    className,
    setIsButtonDisabled,
  }: Props) => {
    const { data: session } = useSession();
    const router = useRouter();
    const { setValue, watch, control } = useFormContext();
    const {
      aside: { setAside, isClosed },
      members: { setMemberToEdit },
    } = useStore();
    const [formStatus, setFormStatus] = useState<string>("none");
    const [applyToAll, setApplyToAll] = useState(false);
    const [isPropagating, setIsPropagating] = useState(false);
    const [dropdownOptions, setDropdownOptions] = useState(DROPDOWN_OPTIONS);
    const [isDisabledDropdown, setIsDisabledDropdown] = useState(true);

    const selectedMember = watch(`products.${index}.newMember`);
    const relocation = watch(`products.${index}.relocation`);

    const propagateFirstProductValues = () => {
      const firstProduct = watch("products.0");
      const { newMember, relocation, available } = firstProduct || {};

      if (!newMember && !relocation) {
        console.log(
          "No valid selection in first product. Aborting propagation."
        );
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
          console.log(
            "Select All checked, but no valid selection to propagate."
          );
        }
      }
    };

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

      setFormStatus(newStatus);
    }, [selectedMember, relocation, members, session.user]);

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
    }, [
      selectedMember,
      relocation,
      members,
      session.user,
      index,
      watch,
      setValue,
    ]);

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

    const handleClick = (status: string) => {
      if (status === "not-billing-information") {
        router.push("/home/settings");
      } else if (status === "not-member-available") {
        const foundMember = members.find(
          (member) =>
            `${member.firstName} ${member.lastName}` === selectedMember
        );
        setMemberToEdit(foundMember?._id);
        setAside("EditMember");
        router.push("/home/my-team");
      }
    };

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

    return (
      <PageLayout>
        <section className={`space-y-4 ${className}`}>
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
                          setValue(
                            `products.${index}.product`,
                            products[index],
                            {
                              shouldValidate: true,
                            }
                          );
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
                          setValue(
                            `products.${index}.product`,
                            products[index],
                            {
                              shouldValidate: true,
                            }
                          );
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
  }
);
