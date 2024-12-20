"use client";
import React, { useState, useCallback, useEffect, useRef } from "react";
import { observer } from "mobx-react-lite";
import { Button, PageLayout, SectionTitle } from "@/common";
import { useStore } from "@/models/root.store";
import {
  Category,
  Product,
  AttributeModel,
  emptyProduct,
  zodCreateProductModel,
  TeamMember,
} from "@/types";
import CategoryForm from "@/components/AddProduct/CategoryForm";
import { cast } from "mobx-state-tree";
import computerData from "@/components/AddProduct/JSON/computerform.json";
import audioData from "@/components/AddProduct/JSON/audioform.json";
import monitorData from "@/components/AddProduct/JSON/monitorform.json";
import peripheralsData from "@/components/AddProduct/JSON/peripheralsform.json";
import othersData from "@/components/AddProduct/JSON/othersform.json";
import merchandisingData from "@/components/AddProduct/JSON/merchandisingform.json";
import DynamicForm from "@/components/AddProduct/DynamicForm";
import { useRouter } from "next/navigation";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import GenericAlertDialog from "@/components/AddProduct/ui/GenericAlertDialog";
import BulkCreateForm from "./BulkCreateForm";
import {
  useBulkCreateAssets,
  useCreateAsset,
  useUpdateAsset,
} from "@/assets/hooks";
import { useQueryClient } from "@tanstack/react-query";
import {
  validateOnCreate,
  validateProductAssignment,
} from "@/lib/validateAfterAction";

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

const ProductForm: React.FC<ProductFormProps> = ({
  initialData,
  isUpdate = false,
}) => {
  const {
    user: { user: sessionUser },
    aside: { setAside },
    alerts: { setAlert },
  } = useStore();

  const createAsset = useCreateAsset();
  const updateAsset = useUpdateAsset();
  const bulkCreateAssets = useBulkCreateAssets();
  const queryClient = useQueryClient();

  const router = useRouter();
  const methods = useForm({
    resolver: zodResolver(zodCreateProductModel),
    defaultValues: {
      ...emptyProduct,
      ...initialData,
      category: initialData?.category || undefined,
      serialNumber: initialData?.serialNumber || undefined,
      price: initialData?.price || undefined,
      attributes: initialData?.attributes || [],
    },
  });
  const {
    handleSubmit,
    setValue,
    clearErrors,
    trigger,
    formState: { isSubmitting, errors },
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
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
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
          ...emptyProduct,
          category: category,
        });
        setSelectedCategory(category);
        setValue("category", category || undefined);
        setManualChange(false);

        const isRecoverable =
          sessionUser?.isRecoverableConfig?.get(category || "") ??
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
      (model === "Other" && selectedCategory !== "Merchandising") ||
      selectedCategory === "Merchandising"
    ) {
      if (!productName || productName.trim() === "") {
        methods.setError("name", {
          type: "manual",
          message: "Product Name is required.",
        });
        console.log("Model in validateProductName:", model);
        return false;
      }
    } else {
      clearErrors("name");
    }

    return true;
  };

  const amount = watch("price.amount");

  const handleSaveProduct = async (data: Product) => {
    setShowSuccessDialog(false);
    setShowErrorDialog(false);
    setErrorMessage("");
    setGenericAlertData({ title: "", description: "", isOpen: false });

    const isProductNameValid = await validateProductName();
    if (!isProductNameValid) return;

    const finalAssignedEmail = watch("assignedEmail");
    const currentRecoverable = watch("recoverable") ?? formValues.recoverable;
    const allMembers = queryClient.getQueryData<TeamMember[]>(["members"]);
    const selectedMember =
      allMembers?.find((member) => member.email === finalAssignedEmail) || null;

    const adjustedNoneOption = selectedMember
      ? null
      : data.location === "FP warehouse"
      ? "FP warehouse"
      : "Our office";

    let missingMessages: string[] = [];

    if (!isUpdate) {
      missingMessages = await validateOnCreate(
        selectedMember,
        {
          country: sessionUser?.country,
          city: sessionUser?.city,
          state: sessionUser?.state,
          zipCode: sessionUser?.zipCode,
          address: sessionUser?.address,
        },
        adjustedNoneOption
      );
    }

    if (missingMessages.length > 0) {
      const formattedMessages = missingMessages
        .map((msg) => `<div class="mb-2"><span>${msg}</span></div>`)
        .join("");

      setGenericAlertData({
        title:
          "The creation was completed successfully, but details are missing",
        description: formattedMessages,
        isOpen: true,
      });
      setIsGenericAlertOpen(true);
    }

    const formatData: Product = {
      ...emptyProduct,
      ...data,
      ...(amount !== undefined
        ? { price: { amount, currencyCode: data.price?.currencyCode || "USD" } }
        : {}),
      recoverable: currentRecoverable,
      status:
        finalAssignedEmail || data.assignedMember ? "Delivered" : "Available",
      category: selectedCategory || "Other",
      assignedEmail: finalAssignedEmail,
      attributes: cast(
        attributes.map((attr) => {
          const initialAttr = initialData?.attributes.find(
            (ia) => ia.key === attr.key
          );
          return {
            ...AttributeModel.create(attr),
            value:
              attr.value !== ""
                ? attr.value
                : initialAttr
                ? initialAttr.value
                : attr.value,
          };
        })
      ),
      ...(data.serialNumber?.trim()
        ? { serialNumber: data.serialNumber.trim() }
        : {}),
    };

    const model = formatData.attributes.find(
      (attr) => attr.key === "model"
    )?.value;

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

    //validacion de datos faltantes de los members o our office
    if (isUpdate && initialData) {
      const finalAssignedEmail = watch("assignedEmail");
      const allMembers = queryClient.getQueryData<TeamMember[]>(["members"]);

      const updatedMember =
        allMembers?.find((member) => member.email === finalAssignedEmail) ||
        null;

      const sessionUserData = {
        country: sessionUser?.country,
        city: sessionUser?.city,
        state: sessionUser?.state,
        zipCode: sessionUser?.zipCode,
        address: sessionUser?.address,
      };

      const adjustedNoneOption =
        data.location === "FP warehouse" ? "FP warehouse" : noneOption;

      const validationResult = validateProductAssignment(
        initialData,
        finalAssignedEmail,
        updatedMember,
        queryClient,
        (data) => {
          // Mostrar alerta genérica si hay errores
          setGenericAlertData({
            title: data.title,
            description: data.description,
            isOpen: true,
          });
          setIsGenericAlertOpen(true);
        },
        () => {},
        sessionUserData,
        adjustedNoneOption
      );

      if (validationResult.hasErrors) {
        console.warn("Validation errors detected, halting update process.");
      }
    }

    try {
      setIsProcessing(true);
      if (isUpdate && initialData) {
        const changes: Partial<Product> = {};
        const requiredFields = ["name", "category", "location", "status"];
        requiredFields.forEach((field) => {
          changes[field] = formatData[field];
        });

        Object.keys(formatData).forEach((key) => {
          if (formatData[key] !== initialData[key]) {
            changes[key] = formatData[key];
          }
        });

        if (Object.keys(changes).length === 0) {
          console.log("No changes detected");
          setShowSuccessDialog(true);
          return;
        }
        await updateAsset.mutateAsync(
          { id: initialData._id, data: changes },
          {
            onSuccess: () => {
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
        if (quantity > 1) {
          setBulkInitialData(formatData);
          setShowBulkCreate(true);
        } else {
          await createAsset.mutateAsync(formatData, {
            onSuccess: () => {
              setAlert("createProduct");
              methods.reset();
              setSelectedCategory(undefined);
              setAssignedEmail(undefined);
              setShowSuccessDialog(true);
            },
            onError: (error) => handleMutationError(error, true),
          });
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
      ...emptyProduct,
      ...data,
      recoverable: data.recoverable,
      status:
        finalAssignedEmail || data.assignedMember ? "Delivered" : "Available",
      category: selectedCategory || "Other",
      assignedEmail: finalAssignedEmail,
      attributes: cast(
        attributes.map((attr) => {
          const initialAttr = initialData?.attributes.find(
            (ia) => ia.key === attr.key
          );
          return {
            ...AttributeModel.create(attr),
            value:
              attr.value !== ""
                ? attr.value
                : initialAttr
                ? initialAttr.value
                : attr.value,
          };
        })
      ),
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
        <div className="h-full w-full">
          {!showBulkCreate ? (
            <>
              <div className="absolute h-[90%] w-[80%] overflow-y-auto scrollbar-custom pr-4">
                <div className="px-4 py-2 rounded-3xl border">
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
                  <div className="flex flex-col lg:flex:row gap-4 max-h-[100%] h-[90%] w-full mt-4">
                    <div className="px-4 py-6 rounded-3xl border overflow-y-auto max-h-[500px] pb-40 scrollbar-custom">
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
              <aside className="absolute flex justify-end bg-white w-[80%] bottom-0 p-2 h-[10%] border-t">
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
            open={genericAlertData.isOpen}
            onClose={() => {
              setGenericAlertData((prev) => ({ ...prev, isOpen: false }));
              setIsGenericAlertOpen(false);

              if (proceedWithSuccessAlert) {
                setAlert("updateStock");
                setAside(undefined);
                setShowSuccessDialog(true);
              }
            }}
            title={genericAlertData.title || "Warning"}
            description={genericAlertData.description || ""}
            buttonText="OK"
            onButtonClick={() => {
              setGenericAlertData((prev) => ({ ...prev, isOpen: false }));
              setIsGenericAlertOpen(false);

              if (proceedWithSuccessAlert) {
                setAlert("updateStock");
                setAside(undefined);
                setShowSuccessDialog(true);
              }
            }}
            isHtml={true}
          />
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

export default observer(ProductForm);
