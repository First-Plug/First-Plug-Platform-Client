"use client";

import React, { useEffect, useLayoutEffect, useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { Button, PageLayout, SectionTitle, BarLoader } from "@/shared";

import {
  DropdownInputProductForm,
  InputProductForm,
  useBulkCreateAssets,
  BulkCreateValidator,
  validateCompanyBillingInfo,
  validateMemberInfo,
} from "@/features/assets";

import { ProductDetail } from "@/features/assets";

import { useQueryClient } from "@tanstack/react-query";
import {
  useFetchMembers,
  getMemberFullName,
  useMemberStore,
} from "@/features/members";

import { useSession } from "next-auth/react";

import type { Member } from "@/features/members";
import { useAlertStore, useAsideStore } from "@/shared";

export const BulkCreateForm: React.FC<{
  initialData: any;
  quantity: number;
  onBack: () => void;
  isProcessing?: boolean;
  setIsProcessing?: (isProcessing: boolean) => void;
}> = ({ initialData, quantity, onBack, isProcessing, setIsProcessing }) => {
  const { mutate: bulkCreateAssets, status } = useBulkCreateAssets();
  const session = useSession();
  const sessionUser = session.data?.user;
  const { data: fetchedMembers } = useFetchMembers();
  const isLoading = status === "pending";

  const queryClient = useQueryClient();

  const { setAside } = useAsideStore();
  const { setSelectedMember } = useMemberStore();

  const numProducts = quantity;

  const attributesArray = initialData.attributes.map((attr) => attr);

  const initialProductData = {
    _id: initialData._id || "new_id",
    name: initialData.name || "",
    category: initialData.category || "Other",
    attributes: attributesArray,
    status: initialData.status || "Available",
    deleted: initialData.deleted || false,
    recoverable:
      initialData.recoverable !== undefined ? initialData.recoverable : true,
    acquisitionDate: initialData.acquisitionDate || "",
    createdAt: initialData.createdAt || "",
    updatedAt: initialData.updatedAt || "",
    deletedAt: initialData.deletedAt || null,
    location: initialData.location || "",
    assignedEmail: initialData.assignedEmail || "",
    assignedMember: initialData.assignedMember || "",
    serialNumber: initialData.serialNumber || "",
    lastAssigned: initialData.lastAssigned || "",
    price: initialData.price,
    productCondition: initialData.productCondition || "Optimal",
    additionalInfo: initialData.additionalInfo || "",
    fp_shipment: undefined,
    desirableDate: undefined,
    shipmentOrigin: undefined,
    shipmentDestination: undefined,
    shipmentId: undefined,
    origin: undefined,
    activeShipment: false,
  };

  const productInstance = initialProductData;

  const { setAlert } = useAlertStore();

  const methods = useForm({
    defaultValues: {
      products: Array.from({ length: numProducts }, () => productInstance),
    },
  });

  const {
    handleSubmit,
    formState: { isSubmitting, errors },
    clearErrors,
    setValue,
    watch,
    trigger,
  } = methods;

  const [assignedEmailOptions, setAssignedEmailOptions] = useState<string[]>(
    []
  );
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLocationEnabled, setIsLocationEnabled] = useState<boolean[]>(
    Array(numProducts).fill(false)
  );
  const [selectedLocations, setSelectedLocations] = useState<string[]>(
    Array(numProducts).fill("Location")
  );
  const [assignAll, setAssignAll] = useState(false);
  const [productStatuses, setProductStatuses] = useState<string[]>([]);
  const [genericAlertData, setGenericAlertData] = useState({
    isOpen: false,
    title: "",
    description: "",
  });
  const [proceedWithBulkCreate, setProceedWithBulkCreate] = useState(false);

  //Desactiva Apply All si hay diferencias entre productos
  useLayoutEffect(() => {
    const subscription = watch((value, { name }) => {
      if (assignAll && name?.startsWith("products.") && name !== "products.0") {
        const productIndex = Number(name.split(".")[1]);
        if (!isNaN(productIndex)) {
          setTimeout(() => {
            const firstProductAssignedEmail = watch("products.0.assignedEmail");
            const firstProductAssignedMember = watch(
              "products.0.assignedMember"
            );
            const firstProductLocation = watch("products.0.location");

            const currentProductAssignedEmail = watch(
              `products.${productIndex}.assignedEmail`
            );
            const currentProductAssignedMember = watch(
              `products.${productIndex}.assignedMember`
            );
            const currentProductLocation = watch(
              `products.${productIndex}.location`
            );

            const isEmailDifferent =
              firstProductAssignedEmail !== currentProductAssignedEmail;
            const isMemberDifferent =
              firstProductAssignedMember !== currentProductAssignedMember;
            const isLocationDifferent =
              firstProductLocation !== currentProductLocation;

            if (isEmailDifferent || isMemberDifferent || isLocationDifferent) {
              setAssignAll(false);
            }
          }, 100);
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [watch, assignAll]);

  //carga inicial de members y sus opciones de mail
  useEffect(() => {
    if (fetchedMembers) {
      setMembers(fetchedMembers as Member[]);
      const memberFullNames = [
        "None",
        ...fetchedMembers.map(getMemberFullName),
      ];
      setAssignedEmailOptions(memberFullNames);
      setLoading(false);
    }
  }, []);

  const handleAssignedMemberChange = (
    selectedFullName: string,
    index: number
  ) => {
    const selectedMember = members.find(
      (member) => `${member.firstName} ${member.lastName}` === selectedFullName
    );
    const email = selectedMember?.email || "";
    setValue(`products.${index}.assignedEmail`, email);
    setValue(`products.${index}.assignedMember`, selectedFullName);

    const newSelectedLocations = [...selectedLocations];
    newSelectedLocations[index] = selectedFullName === "None" ? "" : "Employee";
    setSelectedLocations(newSelectedLocations);
    setValue(`products.${index}.location`, newSelectedLocations[index]);

    setIsLocationEnabled((prev) => {
      const newIsLocationEnabled = [...prev];
      newIsLocationEnabled[index] = selectedFullName === "None";
      return newIsLocationEnabled;
    });

    clearErrors([
      `products.${index}.assignedEmail`,
      `products.${index}.location`,
    ]);

    if (assignAll && index === 0) {
      for (let i = 1; i < numProducts; i++) {
        setValue(`products.${i}.assignedEmail`, email);
        setValue(`products.${i}.assignedMember`, selectedFullName);
        setValue(`products.${i}.location`, newSelectedLocations[index]);
        newSelectedLocations[i] = newSelectedLocations[index];
        setIsLocationEnabled((prev) => {
          const newIsLocationEnabled = [...prev];
          newIsLocationEnabled[i] = selectedFullName === "None";
          return newIsLocationEnabled;
        });
        clearErrors([`products.${i}.assignedEmail`, `products.${i}.location`]);
      }
      setSelectedLocations(newSelectedLocations);
    }
  };

  const handleLocationChange = (value: string, index: number) => {
    setValue(`products.${index}.location`, value);
    const newSelectedLocations = [...selectedLocations];
    newSelectedLocations[index] = value;
    setSelectedLocations(newSelectedLocations);

    const firstProductLocation = watch("products.0.location");
    if (assignAll && firstProductLocation !== value) {
      setAssignAll(false);
      return;
    }

    if (assignAll) {
      for (let i = 0; i < numProducts; i++) {
        if (i !== index) {
          setValue(`products.${i}.location`, value);
          newSelectedLocations[i] = value;
          clearErrors([`products.${i}.location`]);
        }
      }
      setSelectedLocations(newSelectedLocations);
    }
  };

  const validateData = async (data: any) => {
    let isValid = true;
    for (let index = 0; index < numProducts; index++) {
      const assignedEmail = data.products[index].assignedEmail;
      const assignedMember = data.products[index].assignedMember;
      const location = data.products[index].location;

      if (!assignedEmail && assignedMember !== "None") {
        methods.setError(`products.${index}.assignedEmail`, {
          type: "manual",
          message: "Assigned Member is required",
        });
        isValid = false;
      }

      if (!location || location === "Location") {
        methods.setError(`products.${index}.location`, {
          type: "manual",
          message: "Location is required",
        });
        isValid = false;
      }
    }
    return isValid;
  };

  const handleBulkCreate = async (data: any) => {
    await queryClient.invalidateQueries({ queryKey: ["members"] });
    const updatedMembers = queryClient.getQueryData<Member[]>(["members"]);
    if (!updatedMembers) {
      console.error("❌ No se pudieron obtener los miembros actualizados");
      return;
    }

    const firstProductPrice = data.products[0].price;
    const productsData = data.products.map((productData: any) => {
      const assignedMember = productData.assignedMember;
      const location = productData.location;
      const status = assignedMember === "None" ? "Available" : "Delivered";
      const price =
        firstProductPrice?.amount !== undefined
          ? {
              amount: firstProductPrice.amount,
              currencyCode: firstProductPrice.currencyCode || "USD",
            }
          : undefined;

      return {
        ...initialProductData,
        assignedEmail: productData.assignedEmail,
        location: productData.location,
        serialNumber: productData.serialNumber,
        recoverable: productData.recoverable,
        status,
        attributes: productData.attributes,
        productCondition: "Optimal",
        ...(price ? { price } : {}),
      };
    });

    const isCategoryValid = await trigger("products.0.category");
    if (!isCategoryValid) {
      return;
    }

    setIsProcessing(true);

    try {
      await bulkCreateAssets(productsData, {
        onSuccess: async () => {
          queryClient.invalidateQueries({ queryKey: ["assets"] });

          setIsProcessing(false);
          setAlert("bulkCreateProductSuccess");
        },
        onError: (error) => {
          setIsProcessing(false);
          if (error.response?.data?.error === "Serial Number already exists") {
            setAlert("bulkCreateSerialNumberError");
          } else {
            setAlert("bulkCreateProductError");
          }
        },
      });
    } catch (error) {
      setIsProcessing(false);
    }
  };

  const checkIncompleteData = (data: any): boolean => {
    const updatedMembers =
      queryClient.getQueryData<Member[]>(["members"]) || [];
    let hasIncompleteData = false;

    data.products.forEach((product: any, index: number) => {
      const { assignedMember, location } = product;

      if (assignedMember !== "None") {
        const foundMember = updatedMembers.find(
          (m) =>
            `${m.firstName} ${m.lastName}`.trim().toLowerCase() ===
            assignedMember.trim().toLowerCase()
        );

        if (foundMember) {
          const isMemberValid = validateMemberInfo(foundMember);

          if (!isMemberValid) {
            hasIncompleteData = true;
          }
        } else {
          hasIncompleteData = true;
        }
      }

      if (location === "Our office") {
        const isBillingValid = validateCompanyBillingInfo(sessionUser);

        if (!isBillingValid) {
          hasIncompleteData = true;
        }
      }
    });

    return hasIncompleteData;
  };

  const onSubmit = async (data: any) => {
    const isValid = await trigger();
    const isDataValid = await validateData(data);

    if (!isValid || !isDataValid) return;

    const hasIncompleteData = checkIncompleteData(data);

    if (hasIncompleteData) {
      setAlert("incompleteBulkCreateData");
    }

    await handleBulkCreate(data);
  };

  if (loading) {
    return (
      <div>
        <BarLoader />
      </div>
    );
  }

  const handleAssignAllChange = () => {
    setAssignAll(!assignAll);
    const firstAssignedEmail = watch(`products.0.assignedEmail`);
    const firstAssignedMember = watch(`products.0.assignedMember`);
    const firstLocation = watch(`products.0.location`);

    if (!assignAll) {
      const newSelectedLocations = [...selectedLocations];
      for (let index = 1; index < numProducts; index++) {
        setValue(`products.${index}.assignedEmail`, firstAssignedEmail);
        setValue(`products.${index}.assignedMember`, firstAssignedMember);
        setValue(`products.${index}.location`, firstLocation);
        newSelectedLocations[index] = firstLocation;
        setIsLocationEnabled((prev) => {
          const newIsLocationEnabled = [...prev];
          newIsLocationEnabled[index] = firstAssignedMember === "None";
          return newIsLocationEnabled;
        });
        clearErrors([
          `products.${index}.assignedEmail`,
          `products.${index}.location`,
        ]);
      }
      setSelectedLocations(newSelectedLocations);
    }
  };

  return (
    <FormProvider {...methods}>
      <PageLayout>
        <SectionTitle>Assign Member to each product</SectionTitle>
        <div className="flex justify-between">
          <div className="w-1/2">
            <ProductDetail product={initialProductData} />
          </div>
          <div className="mt-2 p-4 w-1/2">
            <label className="flex items-center">
              <input
                type="checkbox"
                className="mr-2"
                checked={assignAll}
                onChange={handleAssignAllChange}
              />
              <p className="font-semibold text-md">
                Apply &quot;Product 1&quot; settings to all Products
              </p>
            </label>
          </div>
        </div>

        <div className="pr-4 w-full h-[60vh] overflow-y-auto scrollbar-custom">
          <form onSubmit={handleSubmit(onSubmit)}>
            {Array.from({ length: numProducts }, (_, index) => (
              <div key={index} className="mb-4">
                <SectionTitle>{`Product ${index + 1}`}</SectionTitle>
                <div className="gap-4 grid grid-cols-1 lg:grid-cols-4">
                  <div className="w-full">
                    <DropdownInputProductForm
                      options={assignedEmailOptions}
                      placeholder="Assigned Member"
                      title="Assigned Member*"
                      name={`products.${index}.assignedMember`}
                      selectedOption={watch(`products.${index}.assignedMember`)}
                      onChange={(selectedFullName: string) =>
                        handleAssignedMemberChange(selectedFullName, index)
                      }
                      searchable={true}
                    />
                    <div className="min-h-[24px]">
                      {errors.products &&
                        errors.products[index]?.assignedEmail && (
                          <p className="text-red-500">
                            {
                              errors.products[index].assignedEmail
                                .message as string
                            }
                          </p>
                        )}
                    </div>
                  </div>
                  <div className="w-full">
                    {watch(`products.${index}.assignedMember`) === "None" ||
                    !watch(`products.${index}.assignedMember`) ? (
                      <>
                        <DropdownInputProductForm
                          options={["Our office"]}
                          placeholder="Location"
                          title="Location*"
                          name={`products.${index}.location`}
                          selectedOption={selectedLocations[index]}
                          onChange={(value: string) => {
                            const newSelectedLocations = [...selectedLocations];
                            newSelectedLocations[index] = value;
                            setSelectedLocations(newSelectedLocations);
                            setValue(`products.${index}.location`, value);
                            clearErrors(`products.${index}.location`);
                            handleLocationChange(value, index);
                          }}
                          required="required"
                          className="w-full"
                          disabled={!isLocationEnabled[index]}
                        />
                        <div className="min-h-[24px]">
                          {errors.products &&
                            errors.products[index]?.location && (
                              <p className="text-red-500">
                                {
                                  errors.products[index].location
                                    .message as string
                                }
                              </p>
                            )}
                        </div>
                      </>
                    ) : (
                      <InputProductForm
                        placeholder="Location"
                        title="Location"
                        type="text"
                        name={`products.${index}.location`}
                        value="Employee"
                        onChange={(e) =>
                          setValue(`products.${index}.location`, e.target.value)
                        }
                        className="w-full"
                        readOnly
                      />
                    )}
                  </div>
                  <div className="w-full">
                    <InputProductForm
                      placeholder="Serial Number"
                      title="Serial Number"
                      type="text"
                      name={`products.${index}.serialNumber`}
                      value={watch(`products.${index}.serialNumber`)}
                      onChange={(e) =>
                        setValue(
                          `products.${index}.serialNumber`,
                          e.target.value
                        )
                      }
                      className="w-full"
                    />
                  </div>
                  <div className="w-full">
                    <BulkCreateValidator
                      productIndex={index}
                      selectedMember={watch(`products.${index}.assignedMember`)}
                      relocation={watch(`products.${index}.location`)}
                      members={members}
                      onStatusChange={(status, i) => {
                        setProductStatuses((prev) => {
                          const newStatuses = [...prev];
                          newStatuses[i] = status;
                          return newStatuses;
                        });
                      }}
                      setAside={setAside}
                    />
                  </div>
                </div>
              </div>
            ))}
            <aside className="bottom-0 absolute flex justify-end bg-white p-2 border-t w-[80%] h-[10%]">
              <div className="flex space-x-2">
                <Button
                  body="Back"
                  variant="secondary"
                  className="rounded lg"
                  size="big"
                  onClick={onBack}
                />
                <Button
                  body="Save"
                  variant="primary"
                  size="big"
                  type="submit"
                  disabled={isSubmitting || isLoading}
                />
              </div>
            </aside>
          </form>
        </div>
      </PageLayout>
    </FormProvider>
  );
};
