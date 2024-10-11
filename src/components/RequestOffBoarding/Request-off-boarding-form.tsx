import { Button, PageLayout, SectionTitle } from "@/common";
import ProductDetail from "@/common/ProductDetail";
import { Product, User } from "@/types";
import { DropdownInputProductForm } from "../AddProduct/DropDownProductForm";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ProductOffBoarding } from "@/app/home/my-team/requestOffBoarding/[id]/page";
import { useStore } from "@/models";
import { Controller, useFormContext, useWatch } from "react-hook-form";

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
  const [selectedLocations, setSelectedLocations] = useState<string[]>(
    Array(totalProducts).fill("")
  );

  const selectedMember = watch(`products.${index}.newMember`);
  const relocation = watch(`products.${index}.relocation`);

  const firstProductMember = useWatch({ name: "products.0.newMember" });
  const firstProductRelocation = useWatch({ name: "products.0.relocation" });

  // useEffect(() => {
  //   if (applyToAll && index === 0) {
  //     for (let i = 1; i < totalProducts; i++) {
  //       setValue(`products.${i}.newMember`, firstProductMember);
  //       setValue(`products.${i}.relocation`, firstProductRelocation);
  //       clearErrors([`products.${i}.newMember`, `products.${i}.relocation`]);
  //     }
  //   }
  // }, [
  //   applyToAll,
  //   firstProductMember,
  //   firstProductRelocation,
  //   totalProducts,
  //   setValue,
  //   clearErrors,
  // ]);

  const handleAssignAllChange = () => {
    const newApplyToAll = !applyToAll;
    setApplyToAll(newApplyToAll);

    // Capturar valores del primer producto
    const firstAssignedMember = watch(`products.0.newMember`);
    const firstRelocation = watch(`products.0.relocation`);

    console.log("Apply to All:", newApplyToAll);
    console.log("First Assigned Member:", firstAssignedMember);
    console.log("First Relocation:", firstRelocation);

    // Comprobar si hay valores y manejar el caso "None"
    if (firstAssignedMember === undefined) {
      console.log("First Assigned Member is undefined");
    } else if (firstAssignedMember === "None") {
      console.log("First Assigned Member is 'None'");
    } else {
      console.log("First Assigned Member:", firstAssignedMember);
    }

    if (newApplyToAll) {
      // Si el checkbox está activo, replicar los valores a todos los productos
      for (let i = 1; i < totalProducts; i++) {
        console.log(`Product ${i} before setting:`);
        console.log(`New Member: ${watch(`products.${i}.newMember`)}`);
        console.log(`Relocation: ${watch(`products.${i}.relocation`)}`);

        // Replicar el valor de "None" explícitamente
        if (firstAssignedMember === "None") {
          setValue(`products.${i}.newMember`, "None");
          console.log(`Product ${i} newMember set to: None`);
        } else if (firstAssignedMember) {
          setValue(`products.${i}.newMember`, firstAssignedMember);
          console.log(`Product ${i} newMember set to:`, firstAssignedMember);
        }

        if (firstRelocation) {
          setValue(`products.${i}.relocation`, firstRelocation);
          console.log(`Product ${i} relocation set to:`, firstRelocation);
        }

        // Limpiar errores
        clearErrors([`products.${i}.newMember`, `products.${i}.relocation`]);
      }
    }
  };

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

  const handleDropdownMembers = (memberFullName: string) => {
    const member = members.find(
      (member) => `${member.firstName} ${member.lastName}` === memberFullName
    );
    if (memberFullName === "None") {
      setValue(`products.${index}.relocation`, "");
      setValue(`products.${index}.newMember`, null);
    } else if (member) {
      setValue(`products.${index}.relocation`, "New employee");
      setValue(`products.${index}.newMember`, member);
    }
    return member;
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
                    : value || "";

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
                      const selectedMember =
                        handleDropdownMembers(selectedValue);
                      onChange(selectedMember);
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
