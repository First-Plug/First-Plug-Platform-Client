"use client";

import React, { useEffect, useLayoutEffect, useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import {
  Button,
  PageLayout,
  SectionTitle,
  BarLoader,
  CountryFlag,
} from "@/shared";

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
import { useOffices } from "@/features/settings";
import SelectDropdownOptions from "@/shared/components/select-dropdown-options";
import { countriesByCode } from "@/shared/constants/country-codes";

import { useSession } from "next-auth/react";

import type { Member } from "@/features/members";
import { useAlertStore, useAsideStore } from "@/shared";
import {
  useOfficeStore,
  useOfficeCreationContext,
} from "@/features/settings";

export const BulkCreateForm: React.FC<{
  initialData: any;
  quantity: number;
  onBack: () => void;
  isProcessing?: boolean;
  setIsProcessing?: (isProcessing: boolean) => void;
}> = ({ initialData, quantity, onBack, isProcessing, setIsProcessing }) => {
  const { mutate: bulkCreateAssets, status } = useBulkCreateAssets();

  const ADD_OFFICE_VALUE = "__ADD_OFFICE__";
  const session = useSession();
  const sessionUser = session.data?.user;
  const { data: fetchedMembers } = useFetchMembers();
  const { offices } = useOffices();
  const isLoading = status === "pending";

  const queryClient = useQueryClient();

  const { pushAside } = useAsideStore();
  const { setSelectedMember } = useMemberStore();
  const { newlyCreatedOffice, creationContext, clearNewlyCreatedOffice } =
    useOfficeStore();
  const { setProductIndex: setOfficeCreationContext } =
    useOfficeCreationContext();

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
  const [locationOptionGroups, setLocationOptionGroups] = useState<
    Array<{
      label: string;
      options: Array<string | { display: React.ReactNode; value: string }>;
    }>
  >([]);
  const [selectedOfficeIds, setSelectedOfficeIds] = useState<(string | null)[]>(
    Array(numProducts).fill(null)
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
  }, [fetchedMembers]);

  useEffect(() => {
    // Ordenar oficinas para que la por defecto aparezca primero
    const sortedOffices = offices
      ? [...offices].sort((a, b) => {
          if (a.isDefault && !b.isDefault) return -1;
          if (!a.isDefault && b.isDefault) return 1;
          return 0;
        })
      : [];

    // Crear grupos de opciones para el dropdown con banderas
    const groups = [
      {
        label: "Our offices",
        options: [
          ...(sortedOffices && sortedOffices.length > 0
            ? sortedOffices.map((office) => {
                const countryName = office.country
                  ? countriesByCode[office.country] || office.country
                  : "";
                const displayLabel = `${countryName} - ${office.name}`;

                return {
                  display: (
                    <>
                      {office.country && (
                        <CountryFlag
                          countryName={office.country}
                          size={16}
                          className="rounded-sm"
                        />
                      )}
                      <span className="truncate">{displayLabel}</span>
                    </>
                  ),
                  value: displayLabel,
                };
              })
            : []),
          {
            display: (
              <span className="font-medium text-blue">+ Add Office</span>
            ),
            value: ADD_OFFICE_VALUE,
          },
        ],
      },
    ];
    setLocationOptionGroups(groups);
  }, [offices]);

  // Detectar cuando se crea una nueva oficina
  useEffect(() => {
    if (newlyCreatedOffice && creationContext !== null) {
      // Seleccionar automáticamente la nueva oficina
      const countryName = newlyCreatedOffice.country
        ? countriesByCode[newlyCreatedOffice.country] ||
          newlyCreatedOffice.country
        : "";
      const displayLabel = `${countryName} - ${newlyCreatedOffice.name}`;

      // Aplicar solo al producto específico que activó la creación
      const newSelectedLocations = [...selectedLocations];
      const newSelectedOfficeIds = [...selectedOfficeIds];

      const currentAssignedMember = watch(
        `products.${creationContext}.assignedMember`
      );
      if (currentAssignedMember === "None" || !currentAssignedMember) {
        newSelectedLocations[creationContext] = displayLabel;
        newSelectedOfficeIds[creationContext] = newlyCreatedOffice._id;

        setValue(`products.${creationContext}.location`, "Our office");
        (setValue as any)(
          `products.${creationContext}.officeId`,
          newlyCreatedOffice._id
        );
        clearErrors(`products.${creationContext}.location`);
      }

      setSelectedLocations(newSelectedLocations);
      setSelectedOfficeIds(newSelectedOfficeIds);

      // Limpiar la oficina recién creada después de usarla
      clearNewlyCreatedOffice();
    }
  }, [
    newlyCreatedOffice,
    creationContext,
    numProducts,
    watch,
    setValue,
    clearErrors,
    selectedLocations,
    selectedOfficeIds,
    clearNewlyCreatedOffice,
  ]);

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

    // Si se selecciona un member (Employee), resetear el officeId
    const newSelectedOfficeIds = [...selectedOfficeIds];
    if (selectedFullName !== "None") {
      newSelectedOfficeIds[index] = null;
      (setValue as any)(`products.${index}.officeId`, undefined);
    }
    setSelectedOfficeIds(newSelectedOfficeIds);

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

        // También resetear officeId para todos si se selecciona member
        if (selectedFullName !== "None") {
          newSelectedOfficeIds[i] = null;
          (setValue as any)(`products.${i}.officeId`, undefined);
        }

        setIsLocationEnabled((prev) => {
          const newIsLocationEnabled = [...prev];
          newIsLocationEnabled[i] = selectedFullName === "None";
          return newIsLocationEnabled;
        });
        clearErrors([`products.${i}.assignedEmail`, `products.${i}.location`]);
      }
      setSelectedLocations(newSelectedLocations);
      setSelectedOfficeIds(newSelectedOfficeIds);
    }
  };

  const handleLocationChange = (displayValue: string, index: number) => {
    if (displayValue === ADD_OFFICE_VALUE) {
      setOfficeCreationContext(index);
      pushAside("CreateOffice");
      return;
    }
    setValue(`products.${index}.location`, "Our office"); // Siempre enviar "Our office" cuando se selecciona una oficina
    const newSelectedLocations = [...selectedLocations];
    newSelectedLocations[index] = displayValue;
    setSelectedLocations(newSelectedLocations);

    // Buscar la oficina seleccionada por el formato "country - name" y guardar su ID
    const selectedOffice = offices?.find((office) => {
      const countryName = office.country
        ? countriesByCode[office.country] || office.country
        : "";
      return `${countryName} - ${office.name}` === displayValue;
    });
    const newSelectedOfficeIds = [...selectedOfficeIds];

    if (selectedOffice) {
      newSelectedOfficeIds[index] = selectedOffice._id;
      (setValue as any)(`products.${index}.officeId`, selectedOffice._id);
    } else {
      newSelectedOfficeIds[index] = null;
      (setValue as any)(`products.${index}.officeId`, undefined);
    }
    setSelectedOfficeIds(newSelectedOfficeIds);

    const firstProductLocation = watch("products.0.location");
    if (assignAll && firstProductLocation !== "Our office") {
      setAssignAll(false);
      return;
    }

    if (assignAll) {
      for (let i = 0; i < numProducts; i++) {
        if (i !== index) {
          setValue(`products.${i}.location`, "Our office");
          newSelectedLocations[i] = displayValue;

          // También propagar el officeId
          if (selectedOffice) {
            newSelectedOfficeIds[i] = selectedOffice._id;
            (setValue as any)(`products.${i}.officeId`, selectedOffice._id);
          } else {
            newSelectedOfficeIds[i] = null;
            (setValue as any)(`products.${i}.officeId`, undefined);
          }

          clearErrors([`products.${i}.location`]);
        }
      }
      setSelectedLocations(newSelectedLocations);
      setSelectedOfficeIds(newSelectedOfficeIds);
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

      if (
        (!assignedMember || assignedMember === "None") &&
        (!location || location === "" || location === "Location")
      ) {
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
        officeId:
          location && location !== "Employee"
            ? productData.officeId
            : undefined,
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

      if (location && location !== "Employee") {
        // Si el location es una oficina (no "Employee"), validar la información de billing
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
                        <SelectDropdownOptions
                          label="Location*"
                          placeholder="Location"
                          value={selectedLocations[index] || ""}
                          onChange={(value: string) =>
                            handleLocationChange(value, index)
                          }
                          optionGroups={locationOptionGroups}
                          className="w-full"
                          disabled={!isLocationEnabled[index]}
                          required
                          productFormStyle={true}
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
                      setAside={pushAside}
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
