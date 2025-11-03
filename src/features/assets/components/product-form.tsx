"use client";
import { useState, useCallback, useEffect } from "react";
import { Button, PageLayout, SectionTitle } from "@/shared";
import {
  type Category,
  type Product,
  zodCreateProductModel,
} from "@/features/assets";
import { Member } from "@/features/members";
import { CategoryForm } from "@/features/assets";

import computerData from "@/features/assets/components/JSON/computerform.json";
import audioData from "@/features/assets/components/JSON/audioform.json";
import monitorData from "@/features/assets/components/JSON/monitorform.json";
import peripheralsData from "@/features/assets/components/JSON/peripheralsform.json";
import othersData from "@/features/assets/components/JSON/othersform.json";
import merchandisingData from "@/features/assets/components/JSON/merchandisingform.json";
import {
  DynamicForm,
  GenericAlertDialog,
  BulkCreateForm,
} from "@/features/assets";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { useCreateAsset, useUpdateEntityAsset } from "@/features/assets";
import { useQueryClient } from "@tanstack/react-query";
import { validateOnCreate } from "@/shared";
import { useAsideStore, useAlertStore } from "@/shared";
import { useOffices } from "@/features/settings";

import { useSession } from "next-auth/react";

interface ProductFormProps {
  initialData?: Product;
  isUpdate?: boolean;
}

const categoryComponents = {
  Audio: audioData,
  Computer: computerData,
  Merchandising: merchandisingData,
  Monitor: monitorData,
  Peripherals: peripheralsData,
  Other: othersData,
};

const getEmptyProduct = (): Product => ({
  _id: "",
  name: "",
  category: undefined,
  attributes: [],
  status: "Available",
  productCondition: "Optimal",
  deleted: false,
  recoverable: true,
  acquisitionDate: "",
  createdAt: "",
  updatedAt: "",
  deletedAt: "",
  serialNumber: "",
  location: undefined,
  assignedEmail: undefined,
  assignedMember: undefined,
  lastAssigned: "",
  price: undefined,
  additionalInfo: "",
  fp_shipment: false,
  desirableDate: {
    origin: "",
    destination: "",
  },
  shipmentOrigin: "",
  shipmentDestination: "",
  shipmentId: "",
  origin: "",
  activeShipment: false,
});

export const ProductForm: React.FC<ProductFormProps> = ({
  initialData,
  isUpdate = false,
}) => {
  const { setAside } = useAsideStore();
  const { setAlert } = useAlertStore();
  const {
    data: { user: sessionUser },
  } = useSession();

  const createAsset = useCreateAsset();
  const updateEntityAsset = useUpdateEntityAsset();
  const queryClient = useQueryClient();
  const { offices } = useOffices();

  const methods = useForm({
    resolver: zodResolver(zodCreateProductModel),
    defaultValues: {
      ...getEmptyProduct(),
      ...initialData,
      category: initialData?.category || undefined,
      serialNumber: initialData?.serialNumber || undefined,
      price: initialData?.price || undefined,
      attributes: initialData?.attributes || [],
      productCondition: initialData?.productCondition || undefined,
      additionalInfo: initialData?.additionalInfo || undefined,
    },
  });
  const {
    handleSubmit,
    setValue,
    clearErrors,
    trigger,
    formState: { isSubmitting },
    watch,
  } = methods;

  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<
    Category | undefined
  >(initialData?.category);
  const [assignedEmail, setAssignedEmail] = useState(
    initialData?.assignedEmail
  );
  const [attributes, setAttributes] = useState(initialData?.attributes || []);
  const [customErrors, setCustomErrors] = useState({});
  const [showBulkCreate, setShowBulkCreate] = useState(false);
  const [bulkInitialData, setBulkInitialData] = useState<Product | undefined>(
    initialData
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const [formValues, setFormValues] = useState({
    recoverable: initialData?.recoverable || false,
  });
  const [manualChange, setManualChange] = useState(false);
  const [genericAlertData, setGenericAlertData] = useState({
    title: "",
    description: "",
    isOpen: false,
  });
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [noneOption, setNoneOption] = useState<string | null>(null);
  const [proceedWithSuccessAlert, setProceedWithSuccessAlert] = useState(false);
  const [isGenericAlertOpen, setIsGenericAlertOpen] = useState(false);

  useEffect(() => {
    if (!selectedMember) {
      setNoneOption("Our office");
    } else {
      setNoneOption(null);
    }
  }, [selectedMember]);

  const handleCategoryChange = useCallback(
    (category: Category | undefined) => {
      if (!isUpdate) {
        methods.reset({
          ...getEmptyProduct(),
          category: category,
        });
        setSelectedCategory(category);
        setValue("category", category || undefined);
        setManualChange(false);

        // Resetear assigned member y location
        setAssignedEmail(undefined);
        setSelectedMember(null);
        setValue("assignedEmail", "");
        setValue("assignedMember", "");
        setValue("location", undefined);
        clearErrors(["assignedEmail", "assignedMember", "location"]);

        const isRecoverable =
          sessionUser?.isRecoverableConfig[category || ""] ??
          category !== "Merchandising";

        setValue("recoverable", isRecoverable);
        setFormValues((prev) => ({ ...prev, recoverable: isRecoverable }));
      }
    },
    [
      isUpdate,
      setValue,
      methods,
      sessionUser?.isRecoverableConfig,
      setFormValues,
      clearErrors,
    ]
  );

  const validateCategory = async () => {
    const isCategoryValid = await trigger("category");
    if (!isCategoryValid) {
      return false;
    }
    return true;
  };

  const validateAttributes = (attributes, category) => {
    let hasError = false;
    const newErrors: Record<string, string> = {};
    if (category !== "Merchandising") {
      const brand = attributes.find((attr) => attr.key === "brand")?.value;
      const model = attributes.find((attr) => attr.key === "model")?.value;

      if (!brand) {
        newErrors["brand"] = "Brand is required.";
        hasError = true;
      }

      if (!model) {
        newErrors["model"] = "Model is required.";
        hasError = true;
      }
    }

    setCustomErrors(newErrors);
    return !hasError;
  };

  const validateProductName = async () => {
    const attributes = watch("attributes");
    const model = attributes.find((attr) => attr.key === "model")?.value;
    const productName = watch("name");

    if (
      selectedCategory === "Merchandising" &&
      (!productName || productName.trim() === "")
    ) {
      methods.setError("name", {
        type: "manual",
        message: "Product Name is required for Merchandising.",
      });
      return false;
    }

    if (model === "Other" && (!productName || productName.trim() === "")) {
      methods.setError("name", {
        type: "manual",
        message: "Product Name is required when model is Other.",
      });
      return false;
    } else {
      clearErrors("name");
    }

    return true;
  };

  const amount = watch("price.amount");
  const condition = watch("productCondition");

  const handleSaveProduct = async (data: Product) => {
    setShowSuccessDialog(false);
    setShowErrorDialog(false);
    setErrorMessage("");
    setGenericAlertData({ title: "", description: "", isOpen: false });

    const isProductNameValid = await validateProductName();
    if (!isProductNameValid) return;

    const finalAssignedEmail = watch("assignedEmail");
    if (finalAssignedEmail === undefined || finalAssignedEmail === null) {
      methods.setError("assignedEmail", {
        type: "manual",
        message: "Assigned Member is required.",
      });
      return;
    }

    // Validar location si no hay member seleccionado
    const location = watch("location");
    if (
      (!finalAssignedEmail || finalAssignedEmail === "None") &&
      (!location || location === "")
    ) {
      methods.setError("location", {
        type: "manual",
        message: "Location is required",
      });
      return;
    }

    const currentRecoverable = watch("recoverable") ?? formValues.recoverable;
    const allMembers = queryClient.getQueryData<Member[]>(["members"]);
    const selectedMember =
      allMembers?.find((member) => member.email === finalAssignedEmail) || null;

    const adjustedNoneOption = selectedMember ? null : data.location;

    let missingMessages: string[] = [];

    if (!isUpdate) {
      missingMessages = await validateOnCreate(
        selectedMember,
        {
          country: (sessionUser as any)?.country,
          city: (sessionUser as any)?.city,
          state: (sessionUser as any)?.state,
          zipCode: (sessionUser as any)?.zipCode,
          address: (sessionUser as any)?.address,
          phone: (sessionUser as any)?.phone,
        },
        adjustedNoneOption,
        data.officeId
      );
    }

    let status: "Available" | "Delivered" | "Deprecated" | "Unavailable" =
      "Available";

    if (data.productCondition === "Unusable") {
      status = "Unavailable";
    } else {
      // Si se ha asignado un miembro y la ubicación es "Employee", el status es "Delivered"
      if (finalAssignedEmail && data.location === "Employee") {
        status = "Delivered";
      } else if (data.location !== "Employee") {
        // Si no es "Employee", es una oficina, por lo tanto está "Available"
        status = "Available";
      }
    }

    const formatData: Product = {
      ...getEmptyProduct(),
      ...data,
      ...(amount !== undefined
        ? { price: { amount, currencyCode: data.price?.currencyCode || "USD" } }
        : {}),
      recoverable: currentRecoverable,
      status,
      category: selectedCategory || "Other",
      assignedEmail: finalAssignedEmail,
      productCondition:
        data.productCondition ?? initialData?.productCondition ?? "Optimal",
      additionalInfo: data.additionalInfo || "",
      officeId: data.location === "Our office" ? data.officeId : undefined,
      attributes: attributes.map((attr) => {
        const initialAttr = initialData?.attributes.find(
          (ia) => ia.key === attr.key
        );
        return {
          _id: initialAttr?._id || "",
          key: attr.key,
          value:
            attr.value !== ""
              ? attr.value
              : initialAttr
              ? initialAttr.value
              : attr.value,
        };
      }),
      ...(data.serialNumber?.trim()
        ? { serialNumber: data.serialNumber.trim() }
        : {}),
    };

    const model = formatData.attributes.find(
      (attr) => attr.key === "model"
    )?.value;

    if (isUpdate && initialData) {
      if (!model) {
      } else if (model !== "Other") {
        formatData.name = "";
      }
    }

    const isAttributesValid = validateAttributes(
      formatData.attributes,
      selectedCategory
    );

    if (quantity === 1 && !isAttributesValid) {
      return;
    }

    if (quantity > 1 && selectedCategory === "Merchandising" && !data.name) {
      setCustomErrors((prevErrors) => ({
        ...prevErrors,
        name: "Name is required for this category.",
      }));
      return;
    }

    let hasError = false;
    const attributeErrors: Record<string, string> = {};

    if (formatData.category !== "Merchandising") {
      const brand = formatData.attributes.find(
        (attr) => attr.key === "brand"
      )?.value;
      if (!brand) {
        attributeErrors["brand"] = "Brand is required.";
        hasError = true;
        methods.setError("attributes", {
          type: "manual",
          message: "Brand is required.",
        });
      }
      if (!model) {
        attributeErrors["model"] = "Model is required.";
        hasError = true;
        methods.setError("attributes", {
          type: "manual",
          message: "Model is required.",
        });
      }
    }

    if (
      formatData.category !== "Merchandising" &&
      formatData.category !== "Other" &&
      model === "Other" &&
      !formatData.name
    ) {
      attributeErrors["name"] = "Name is required for this model.";
      hasError = true;
      methods.setError("name", {
        type: "manual",
        message: "Name is required for this model.",
      });
    }
    setCustomErrors(attributeErrors);

    const isCategoryValid = await validateCategory();
    if (!isCategoryValid || hasError) return;

    let source = null;

    if (!isUpdate) {
      if (adjustedNoneOption && adjustedNoneOption !== "Employee") {
        // Buscar la oficina correspondiente por nombre
        const selectedOffice = offices?.find(
          (office) => office.name === adjustedNoneOption
        );
        if (selectedOffice) {
          source = {
            type: "office",
            data: { ...selectedOffice, location: selectedOffice.name },
          };
        }
      }
    } else if (isUpdate && initialData) {
      if (initialData.location === "Employee" && initialData.assignedEmail) {
        const currentMember = allMembers?.find(
          (member) => member.email === initialData.assignedEmail
        );
        if (currentMember) {
          source = {
            type: "member",
            data: currentMember,
          };
        }
      } else {
        // Buscar la oficina correspondiente por nombre
        const selectedOffice = offices?.find(
          (office) => office.name === initialData.location
        );
        if (selectedOffice) {
          source = {
            type: "office",
            data: { ...selectedOffice, location: selectedOffice.name },
          };
        }
      }
    }

    try {
      setIsProcessing(true);

      if (isUpdate && initialData) {
        const changes: Partial<Product> = {};
        const requiredFields = [
          "name",
          "category",
          "location",
          "status",
          "productCondition",
        ];
        requiredFields.forEach((field) => {
          // Normalizar "location" a "FP warehouse" si es "FP Warehouse"
          if (
            field === "location" &&
            formatData[field]?.toLowerCase() === "fp warehouse"
          ) {
            changes[field] = "FP warehouse";
          } else {
            changes[field] = formatData[field];
          }
        });

        Object.keys(formatData).forEach((key) => {
          // Excluir solo "officeId" del update
          if (key !== "officeId" && formatData[key] !== initialData[key]) {
            // Normalizar "location" a "FP warehouse" si es "FP Warehouse"
            if (
              key === "location" &&
              formatData[key]?.toLowerCase() === "fp warehouse"
            ) {
              changes[key] = "FP warehouse";
            } else {
              changes[key] = formatData[key];
            }
          }
        });

        if (Object.keys(changes).length === 0) {
          setShowSuccessDialog(true);
          return;
        }

        if (changes.price?.amount === undefined) {
          changes.price = null;
        }

        await updateEntityAsset.mutateAsync(
          { id: initialData._id, data: changes },
          {
            onSuccess: async () => {
              if (!isGenericAlertOpen) {
                setAlert("updateStock");
                setAside(undefined);
                setShowSuccessDialog(true);
              } else {
                setProceedWithSuccessAlert(true);
              }
            },
            onError: (error) => handleMutationError(error, true),
          }
        );
      } else {
        // Validar que "FP warehouse" no se use en create
        if (formatData.location === "FP warehouse") {
          setErrorMessage(
            "FP warehouse location is not allowed for product creation. Please use 'Our office' instead."
          );
          setShowErrorDialog(true);
          setIsProcessing(false);
          return;
        }

        if (quantity > 1) {
          setBulkInitialData(formatData);
          setShowBulkCreate(true);
        } else {
          await createAsset.mutateAsync(formatData, {
            onError: (error) => handleMutationError(error, true),
          });
          if (missingMessages.length > 0) {
            const formattedMessages = missingMessages
              .map((msg) => `<div class="mb-2"><span>${msg}</span></div>`)
              .join("");

            setAlert("dynamicWarning", {
              title: "Details Missing",
              description: formattedMessages,
              isHtml: true,
              onClose: () => {
                setAlert("createProduct");
                methods.reset();
                setSelectedCategory(undefined);
                setAssignedEmail(undefined);
                setShowSuccessDialog(true);
              },
            });
          } else {
            setAlert("createProduct");
            methods.reset();
            setSelectedCategory(undefined);
            setAssignedEmail(undefined);
            setShowSuccessDialog(true);
          }
        }
      }
    } catch (error) {
      handleMutationError(error, isUpdate);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleMutationError = (error: any, isUpdate: boolean) => {
    if (error.response?.data?.message === "Serial Number already exists") {
      setErrorMessage("Serial Number already exists");
    } else {
      setErrorMessage(
        `Error ${
          isUpdate ? "updating" : "creating"
        } your product, please check the data and try again.`
      );
    }
    setShowErrorDialog(true);
  };

  const FormConfig = categoryComponents[selectedCategory] || { fields: [] };

  const handleNext = async () => {
    const isProductNameValid = await validateProductName();
    if (!isProductNameValid) return;

    const data = methods.getValues();
    const finalAssignedEmail = watch("assignedEmail");

    const formattedData: Product = {
      ...getEmptyProduct(),
      ...data,
      recoverable: data.recoverable,
      status:
        finalAssignedEmail || data.assignedMember ? "Delivered" : "Available",
      category: selectedCategory || "Other",
      assignedEmail: finalAssignedEmail,
      attributes: attributes.map((attr) => {
        const initialAttr = initialData?.attributes.find(
          (ia) => ia.key === attr.key
        );
        return {
          _id: initialAttr?._id || "",
          key: attr.key,
          value:
            attr.value !== ""
              ? attr.value
              : initialAttr
              ? initialAttr.value
              : attr.value,
        };
      }),
      serialNumber: data.serialNumber?.trim() === "" ? "" : data.serialNumber,
    };

    const model = formattedData.attributes.find(
      (attr) => attr.key === "model"
    )?.value;

    Object.keys(formattedData).forEach((key) => {
      if (
        key !== "attributes" &&
        formattedData.attributes.find((attr) => attr.key === key)
      ) {
        delete formattedData[key];
      }
    });

    let hasError = false;
    const attributeErrors: Record<string, string> = {};

    if (formattedData.category !== "Merchandising") {
      const brand = formattedData.attributes.find(
        (attr) => attr.key === "brand"
      )?.value;
      const model = formattedData.attributes.find(
        (attr) => attr.key === "model"
      )?.value;

      if (!brand) {
        attributeErrors["brand"] = "Brand is required.";
        hasError = true;
        methods.setError("attributes", {
          type: "manual",
          message: "Brand is required.",
        });
      }
      if (!model) {
        attributeErrors["model"] = "Model is required.";
        hasError = true;
        methods.setError("attributes", {
          type: "manual",
          message: "Model is required.",
        });
      }
    }

    if (
      formattedData.category !== "Merchandising" &&
      formattedData.category !== "Other" &&
      model === "Other" &&
      !formattedData.name
    ) {
      attributeErrors["name"] = "Name is required for this model.";
      hasError = true;
      methods.setError("name", {
        type: "manual",
        message: "Name is required for this model.",
      });
    }
    setCustomErrors(attributeErrors);

    const isCategoryValid = await validateCategory();
    if (!isCategoryValid || hasError) return;

    setBulkInitialData(formattedData);
    setShowBulkCreate(true);
  };

  useEffect(() => {
    if (quantity > 1) {
      clearErrors(["assignedEmail", "assignedMember", "location"]);
    }
  }, [quantity, clearErrors]);

  const modelValue = watch("attributes").find(
    (attr) => attr.key === "model"
  )?.value;

  return (
    <FormProvider {...methods}>
      <PageLayout>
        <div className="w-full h-full">
          {!showBulkCreate ? (
            <>
              <div className="absolute pr-4 w-[80%] h-[90%] overflow-y-auto scrollbar-custom">
                <div className="px-4 py-2 border rounded-3xl">
                  <SectionTitle className="text-[20px]">
                    {isUpdate ? "" : "Add Product"}
                  </SectionTitle>
                  <section>
                    <div className="flex items-center">
                      <CategoryForm
                        handleCategoryChange={handleCategoryChange}
                        selectedCategory={selectedCategory}
                        setAssignedEmail={(email) =>
                          setValue("assignedEmail", email)
                        }
                        formState={methods.getValues()}
                        clearErrors={
                          clearErrors as (name?: string | string[]) => void
                        }
                        isUpdate={isUpdate}
                        quantity={quantity}
                        setQuantity={setQuantity}
                        model={modelValue}
                        formValues={formValues}
                        setFormValues={setFormValues}
                        setManualChange={setManualChange}
                        manualChange={manualChange}
                      />
                    </div>
                  </section>
                </div>
                {selectedCategory && (
                  <div className="flex flex-col gap-4 mt-4 w-full h-[90%] max-h-[100%] lg:flex:row">
                    <div className="px-4 py-6 pb-40 border rounded-3xl max-h-[500px] overflow-y-auto scrollbar-custom">
                      <section>
                        <DynamicForm
                          fields={FormConfig.fields}
                          handleAttributesChange={setAttributes}
                          isUpdate={isUpdate}
                          initialValues={initialData}
                          customErrors={customErrors}
                          setCustomErrors={setCustomErrors}
                        />
                      </section>
                    </div>
                  </div>
                )}
              </div>
              <aside className="bottom-0 absolute flex justify-end bg-white p-2 border-t w-[80%] h-[10%]">
                {quantity > 1 ? (
                  <Button
                    body="Next"
                    variant="secondary"
                    className="rounded lg"
                    size="big"
                    onClick={handleNext}
                    disabled={quantity <= 1}
                  />
                ) : (
                  <Button
                    body={isUpdate ? "Update" : "Save"}
                    variant="primary"
                    className="rounded lg"
                    size="big"
                    onClick={handleSubmit(handleSaveProduct)}
                    disabled={isSubmitting || isProcessing}
                  />
                )}
              </aside>
            </>
          ) : (
            <BulkCreateForm
              initialData={bulkInitialData}
              quantity={quantity}
              onBack={() => setShowBulkCreate(false)}
              isProcessing={isProcessing}
              setIsProcessing={setIsProcessing}
            />
          )}
        </div>
        <div className="z-50">
          <GenericAlertDialog
            open={showErrorDialog}
            onClose={() => setShowErrorDialog(false)}
            title="Error"
            description={errorMessage}
            buttonText="OK"
            onButtonClick={() => {
              setShowErrorDialog(false);
            }}
          />
        </div>
      </PageLayout>
    </FormProvider>
  );
};
