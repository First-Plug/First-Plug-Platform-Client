"use client";

import React, { useEffect, useLayoutEffect, useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { observer } from "mobx-react-lite";
import { Button, PageLayout, SectionTitle } from "@/common";
import { DropdownInputProductForm } from "@/components/AddProduct/DropDownProductForm";
import { InputProductForm } from "@/components/AddProduct/InputProductForm";
import { getSnapshot, Instance } from "mobx-state-tree";
import { AttributeModel, ProductModel, TeamMemberModel } from "@/types";
import ProductDetail from "@/common/ProductDetail";
import { useStore } from "@/models";
import { BarLoader } from "../Loader/BarLoader";
import { useBulkCreateAssets } from "@/assets/hooks";
import { useQueryClient } from "@tanstack/react-query";
import { useFetchMembers } from "@/members/hooks";
import { getMemberFullName } from "@/members/helpers/getMemberFullName";
import ProductStatusValidator, {
  validateMemberBillingInfo,
} from "./utils/ProductStatusValidator";
import GenericAlertDialog from "./ui/GenericAlertDialog";
import { validateBillingInfo } from "@/lib/utils";
import { prepareBulkCreateSlackPayload } from "@/components/AddProduct/PrepareBulkCreateSlackPayload";
import { sendSlackNotification } from "@/services/slackNotifications.services";
import { useSession } from "next-auth/react";

const BulkCreateForm: React.FC<{
  initialData: any;
  quantity: number;
  onBack: () => void;
  isProcessing?: boolean;
  setIsProcessing?: (isProcessing: boolean) => void;
}> = ({ initialData, quantity, onBack, isProcessing, setIsProcessing }) => {
  const { mutate: bulkCreateAssets, status } = useBulkCreateAssets();
  const isLoading = status === "pending";
  const { data: fetchedMembers } = useFetchMembers();
  const queryClient = useQueryClient();
  const session = useSession();
  const sessionUser = session.data?.user;

  const numProducts = quantity;

  const attributesArray = initialData.attributes.map((attr) =>
    AttributeModel.create({
      _id: attr._id,
      key: attr.key,
      value: attr.value || "",
    })
  );

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
  };

  const productInstance = ProductModel.create(initialProductData);

  const {
    user: { user },
    products: { setProducts },
    alerts: { setAlert },
    members: { setMemberToEdit },
    aside: { setAside, isClosed },
  } = useStore();

  const methods = useForm({
    defaultValues: {
      products: Array.from({ length: numProducts }, () =>
        getSnapshot(productInstance)
      ),
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
  const [members, setMembers] = useState<Instance<typeof TeamMemberModel>[]>(
    []
  );
  const [statusList, setStatusList] = useState<string[]>(
    Array(numProducts).fill("")
  );
  const [loading, setLoading] = useState(true);
  const [isLocationEnabled, setIsLocationEnabled] = useState<boolean[]>(
    Array(numProducts).fill(false)
  );
  const [selectedLocations, setSelectedLocations] = useState<string[]>(
    Array(numProducts).fill("Location")
  );
  const [assignAll, setAssignAll] = useState(false);
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);
  const [showMissingDataDialog, setMissingDataDialog] = useState(false);
  const [missingMemberData, setMissingMemberData] = useState<string>("");
  const [genericAlertData, setGenericAlertData] = useState({
    title: "",
    description: "",
    isOpen: false,
  });
  const [proceedWithSuccess, setProceedWithSuccess] = useState(false);

  useEffect(() => {
    if (status === "pending" && !isProcessing) {
      setIsProcessing(true);
    } else if (status !== "pending" && isProcessing) {
      setIsProcessing(false);
    }
  }, [status, isProcessing]);

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
      setMembers(fetchedMembers as Instance<typeof TeamMemberModel>[]);
      const memberFullNames = [
        "None",
        ...fetchedMembers.map(getMemberFullName),
      ];
      setAssignedEmailOptions(memberFullNames);
      setLoading(false);
    }
  }, [fetchedMembers]);

  const handleStatusChange = (status: string, index: number) => {
    setStatusList((prevStatusList) => {
      if (prevStatusList[index] === status) return prevStatusList;
      const updatedStatusList = [...prevStatusList];
      updatedStatusList[index] = status;
      return updatedStatusList;
    });
  };

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

    handleStatusChange("pending", index);

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

  //invalida la query de members si se cierra el aside
  useEffect(() => {
    if (isClosed) {
      queryClient.invalidateQueries({ queryKey: ["members"] });
    }
  }, [isClosed]);

  //actualiza la lista de estados al cambiar datos de productos y members
  useEffect(() => {
    const subscription = watch((values) => {
      const updatedStatusList = values.products.map(
        (product: any, index: number) => {
          const assignedMember = product.assignedMember;
          const location = product.location;
          const foundMember = members.find(
            (m) => `${m.firstName} ${m.lastName}` === assignedMember
          );

          if (!assignedMember || assignedMember === "None")
            return "location-required";
          if (!location || location === "Location") return "location-required";
          if (!foundMember || !validateMemberBillingInfo(foundMember))
            return "not-member-available";

          return "valid";
        }
      );

      setStatusList(updatedStatusList);

      // Si todos los productos son válidos, habilitamos el botón de "Save"
      const allValid = updatedStatusList.every((status) => status === "valid");
      setIsButtonDisabled(!allValid);
    });

    return () => subscription.unsubscribe();
  }, [watch, members]);

  //valida productos al cerrar el aside y actualiza estados
  useEffect(() => {
    if (isClosed) {
      const products = methods.getValues("products");
      const updatedStatusList = products.map((product, index) => {
        const assignedMember = product.assignedMember;
        const location = product.location;
        const foundMember = members.find(
          (m) => `${m.firstName} ${m.lastName}` === assignedMember
        );

        if (!assignedMember || assignedMember === "None")
          return "location-required";
        if (!location || location === "Location") return "location-required";
        if (!foundMember || !validateMemberBillingInfo(foundMember))
          return "not-member-available";

        return "valid";
      });

      setStatusList(updatedStatusList);

      const allValid = updatedStatusList.every((status) => status === "valid");
      setIsButtonDisabled(!allValid);
    }
  }, [isClosed, members, methods]);

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
    if (isProcessing) return;
    setIsProcessing(true);

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
        ...(price ? { price } : {}),
      };
    });

    const isCategoryValid = await trigger("products.0.category");
    if (!isCategoryValid) {
      return;
    }

    try {
      console.log(
        productsData,
        "ACA MIREMOS LOS DATOS DEL BULK CREATE PRODUCT"
      );

      setIsProcessing(true);
      bulkCreateAssets(productsData, {
        onSuccess: async (data) => {
          setProducts(data);

          const slackPayloads = prepareBulkCreateSlackPayload(
            data.map((product: any) => ({
              assignedMember: product.assignedMember
                ? {
                    firstName: product.assignedMember.split(" ")[0],
                    lastName: product.assignedMember.split(" ")[1] || "",
                    email: product.assignedEmail || "",
                  }
                : null,
              assignedEmail: product.assignedEmail || "",
              location: product.location,
              serialNumber: product.serialNumber,
            })),
            {
              name: initialProductData.name,
              category: initialProductData.category,
              attributes: attributesArray,
            },
            user.tenantName,
            sessionUser,
            members
          );

          // Enviar las notificaciones de Slack
          await Promise.all(
            slackPayloads.map((payload) => sendSlackNotification(payload))
          )
            .then(() => {
              console.log("✅ Slack notifications sent for bulk create");
            })
            .catch((error) => {
              console.error(
                "❌ Error sending Slack notifications for bulk create:",
                error
              );
            });

          await queryClient
            .invalidateQueries({ queryKey: ["assets"] })
            .then(() => {
              setAlert("bulkCreateProductSuccess");
              onBack();
            });
          console.log("✅ Bulk create completed successfully");

          setIsProcessing(false);
        },
        onError: (error) => {
          console.error("Error en bulkCreate:", error);
          if (
            error.response?.data?.message === "Serial Number already exists"
          ) {
            setAlert("bulkCreateSerialNumberError");
          } else {
            setAlert("bulkCreateProductError");
          }
          setIsProcessing(false);
        },
      });
    } catch (error) {
      console.error("Error durante la creación:", error);
      setIsProcessing(false);
    }
  };

  const onSubmit = async (data: any) => {
    const isValid = await trigger();
    const isDataValid = await validateData(data);

    if (!isValid || !isDataValid) {
      return;
    }

    let hasIncompleteMembers = false;
    let hasIncompleteOfficeData = false;

    data.products.forEach((product: any) => {
      if (product.assignedMember !== "None") {
        const foundMember = members.find(
          (m) =>
            `${m.firstName} ${m.lastName}` === product.assignedMember &&
            validateMemberBillingInfo(m)
        );
        if (!foundMember) {
          hasIncompleteMembers = true;
        }
      } else if (product.location === "Our office") {
        if (!validateBillingInfo(user)) {
          hasIncompleteOfficeData = true;
        }
      }
    });

    if (hasIncompleteMembers || hasIncompleteOfficeData) {
      setGenericAlertData({
        title: "Incomplete Data",
        description:
          "Some members or locations have missing information. Please complete the details later to finalize shipments.",
        isOpen: true,
      });
      setProceedWithSuccess(true);
      return;
    }

    handleBulkCreate(data);
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
          <div className="w-1/2 p-4 mt-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                className="mr-2"
                checked={assignAll}
                onChange={handleAssignAllChange}
              />
              <p className="text-md font-semibold">
                Apply &quot;Product 1&quot; settings to all Products
              </p>
            </label>
          </div>
        </div>

        <div className="h-[60vh] w-full overflow-y-auto scrollbar-custom pr-4">
          <form onSubmit={handleSubmit(onSubmit)}>
            {Array.from({ length: numProducts }, (_, index) => (
              <div key={index} className="mb-4">
                <SectionTitle>{`Product ${index + 1}`}</SectionTitle>
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 ">
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
                            {errors.products[index].assignedEmail.message}
                          </p>
                        )}
                    </div>
                  </div>
                  <div className="w-full">
                    {watch(`products.${index}.assignedMember`) === "None" ||
                    !watch(`products.${index}.assignedMember`) ? (
                      <>
                        <DropdownInputProductForm
                          options={["Our office", "FP warehouse"]}
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
                                {errors.products[index].location.message}
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
                    <ProductStatusValidator
                      productIndex={index}
                      selectedMember={watch(`products.${index}.assignedMember`)}
                      relocation={methods.getValues(
                        `products.${index}.location`
                      )}
                      members={members}
                      onStatusChange={(status) =>
                        handleStatusChange(status, index)
                      }
                      setMemberToEdit={setMemberToEdit}
                      setAside={setAside}
                    />
                  </div>
                </div>
              </div>
            ))}
            <aside className="absolute flex justify-end bg-white w-[80%] bottom-0 p-2 h-[10%] border-t">
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
          <GenericAlertDialog
            open={genericAlertData.isOpen}
            onClose={() => {
              setGenericAlertData((prev) => ({ ...prev, isOpen: false }));
              setProceedWithSuccess(false);
              if (proceedWithSuccess) {
                handleBulkCreate(methods.getValues());
              }
            }}
            title={genericAlertData.title || "Warning"}
            description={genericAlertData.description || ""}
            buttonText="OK"
            onButtonClick={() => {
              setGenericAlertData((prev) => ({ ...prev, isOpen: false }));
              setProceedWithSuccess(false);
              if (proceedWithSuccess) {
                handleBulkCreate(methods.getValues());
              }
            }}
            isHtml={true}
          />
          <GenericAlertDialog
            open={showMissingDataDialog}
            onClose={() => setMissingDataDialog(false)}
            title="Incomplete Member Data"
            description={missingMemberData}
            buttonText="OK"
            onButtonClick={() => setMissingDataDialog(false)}
          />
        </div>
      </PageLayout>
    </FormProvider>
  );
};

export default observer(BulkCreateForm);
