"use client";
import React, { useState, useEffect } from "react";
import { observer } from "mobx-react-lite";
import { Button, PageLayout, SectionTitle } from "@/common";
import { useStore } from "@/models/root.store";
import {
  Category,
  Product,
  emptyProduct,
  zodCreateProductModel,
  Location,
  ProductFormData,
} from "@/types";
import CategoryForm from "@/components/AddProduct/CategoryForm";
import computerData from "@/components/AddProduct/JSON/computerform.json";
import audioData from "@/components/AddProduct/JSON/audioform.json";
import monitorData from "@/components/AddProduct/JSON/monitorform.json";
import peripheralsData from "@/components/AddProduct/JSON/peripheralsform.json";
import othersData from "@/components/AddProduct/JSON/othersform.json";
import merchandisingData from "@/components/AddProduct/JSON/merchandisingform.json";
import DynamicForm from "@/components/AddProduct/DynamicForm";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import GenericAlertDialog from "@/components/AddProduct/ui/GenericAlertDialog";
import BulkCreateForm from "./BulkCreateForm";
import { useCreateAsset, useUpdateAsset } from "@/assets/hooks";
import {
  validateCategory,
  validateAttributes,
  validateProductName,
  validateForNext,
} from "./utils/ProductFormValidations";
import { handleCategoryChange } from "./utils/CategoryHelpers";
import { prepareProductData } from "./utils/PrepareProductData";
import {
  formatMissingFieldsMessage,
  getMissingFields,
  validateBillingInfo,
} from "@/lib/utils";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

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
    aside: { setAside },
    alerts: { setAlert },
    members,
  } = useStore();

  const createAsset = useCreateAsset();
  const updateAsset = useUpdateAsset();

  const methods = useForm<ProductFormData>({
    resolver: zodResolver(zodCreateProductModel),
    defaultValues: {
      ...emptyProduct,
      ...initialData,
      category: initialData?.category || undefined,
      serialNumber: initialData?.serialNumber || undefined,
      price: initialData?.price || undefined,
      location: (initialData?.location as Location) || undefined,
      name: initialData?.name || undefined,
      attributes: initialData?.attributes || [],
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

  const session = useSession();
  const user = session.data?.user;
  const router = useRouter();

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
  const [missingMemberData, setMissingMemberData] = useState("");
  const [showMissingDataDialog, setShowMissingDataDialog] = useState(false);
  const [memberToEdit, setMemberToEdit] = useState(null);
  const [selectedAssignedMember, setSelectedAssignedMember] =
    useState<string>("");
  const [selectedLocation, setSelectedLocation] = useState<
    string | undefined
  >();
  const [missingDataType, setMissingDataType] = useState<
    "member" | "billing"
  >();

  const userRecoverableConfig = user?.isRecoverableConfig
    ? (new Map(user.isRecoverableConfig.entries()) as Map<Category, boolean>)
    : undefined;

  const onCategoryChange = (category: Category | undefined) => {
    handleCategoryChange({
      category,
      isUpdate: false,
      methods,
      setSelectedCategory: (cat) => {
        setSelectedCategory(cat);
        setValue("category", cat);
      },
      setValue,
      setFormValues: () => {},
      userRecoverableConfig,
      setManualChange: () => {},
    });
  };

  const validateForm = async (forNext = false): Promise<boolean> => {
    const isCategoryValid = await validateCategory(trigger);

    const isAttributesValid = validateAttributes(
      attributes,
      selectedCategory,
      setCustomErrors
    );

    const isProductNameValid = await validateProductName(
      watch,
      selectedCategory,
      methods.setError,
      clearErrors
    );

    let isNextSpecificValid = true;
    if (forNext) {
      isNextSpecificValid = validateForNext(
        attributes,
        selectedCategory,
        watch,
        methods,
        setCustomErrors
      );
    }

    return (
      isCategoryValid &&
      isAttributesValid &&
      isProductNameValid &&
      isNextSpecificValid
    );
  };

  const handleCreateProduct = async (data: ProductFormData) => {
    const currentRecoverable = watch("recoverable") ?? formValues.recoverable;
    const preparedData = prepareProductData(
      data,
      isUpdate,
      selectedCategory,
      initialData,
      attributes,
      currentRecoverable,
      watch("price.amount"),
      watch("assignedEmail")
    );

    if (quantity > 1 && selectedCategory === "Merchandising" && !data.name) {
      setCustomErrors((prevErrors) => ({
        ...prevErrors,
        name: "Name is required for this category.",
      }));
      return;
    }

    try {
      setIsProcessing(true);
      if (quantity > 1) {
        setBulkInitialData(preparedData);
        setShowBulkCreate(true);
      } else {
        createAsset.mutate(preparedData, {
          onSuccess: () => {
            setAlert("createProduct");
            methods.reset();
            setSelectedCategory(undefined);
            setAssignedEmail(undefined);
            setShowSuccessDialog(true);
          },
          onError: (error) => handleMutationError(error, false),
        });
      }
    } catch (error) {
      handleMutationError(error, false);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUpdateProduct = async (data: ProductFormData) => {
    const assignedEmail =
      selectedAssignedMember === "None" ? "" : data.assignedEmail || "";

    const preparedData = prepareProductData(
      { ...data, assignedEmail },
      isUpdate,
      selectedCategory,
      initialData,
      attributes,
      formValues.recoverable,
      watch("price.amount"),
      // watch("assignedEmail")
      assignedEmail
    );

    let hasError = false;
    const attributeErrors: Record<string, string> = {};

    if (preparedData.category !== "Merchandising") {
      const brand = preparedData.attributes.find(
        (attr) => attr.key === "brand"
      )?.value;
      const model = preparedData.attributes.find(
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

    if (hasError) {
      setCustomErrors(attributeErrors);
      return;
    }

    try {
      setIsProcessing(true);
      if (initialData) {
        const changes: Partial<Product> = {};

        const requiredFields = ["name", "category", "location", "status"];
        requiredFields.forEach((field) => {
          changes[field] = preparedData[field];
        });

        Object.keys(preparedData).forEach((key) => {
          if (preparedData[key] !== initialData[key]) {
            changes[key] = preparedData[key];
          }
        });

        if (Object.keys(changes).length === 0) {
          setShowSuccessDialog(true);
          return;
        }

        await updateAsset.mutateAsync(
          { id: initialData._id, data: changes },
          {
            onSuccess: () => {
              setAlert("updateStock");
              setAside(undefined);
              setShowSuccessDialog(true);
            },
            onError: (error) => handleMutationError(error, true),
          }
        );
      }
    } catch (error) {
      console.error("Unexpected error during update:", error);
      handleMutationError(error, true);
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    if (!isUpdate) {
      if (selectedAssignedMember === "None") {
        if (selectedLocation) {
          setValue("location", selectedLocation);
        } else {
          setValue("location", "Our office");
        }
      } else {
        setValue("location", "Employee");
      }
      clearErrors("location");
    }
  }, [
    isUpdate,
    selectedAssignedMember,
    selectedLocation,
    setValue,
    clearErrors,
  ]);

  const handleSaveProduct = async (data: ProductFormData) => {
    const isAttributesValid = validateAttributes(
      attributes,
      selectedCategory,
      setCustomErrors
    );

    if (!isAttributesValid) {
      console.error("Attributes validation failed.");
      return;
    }

    const isProductNameValid = await validateProductName(
      watch,
      selectedCategory,
      methods.setError,
      clearErrors
    );

    if (!isProductNameValid) {
      console.error("Product Name validation failed");
      return;
    }

    const location = watch("location");

    if (!location) {
      setErrorMessage("Location is required but missing.");
      setShowErrorDialog(true);
      return;
    }

    const assignedEmail =
      selectedAssignedMember === "None" ? "" : watch("assignedEmail");
    const selectedMember = members.members.find(
      (member) => member.email === assignedEmail
    );
    if (selectedMember) {
      const missingFields = getMissingFields(selectedMember);
      if (missingFields.length > 0) {
        setMissingMemberData(formatMissingFieldsMessage(missingFields));
        setMemberToEdit(selectedMember);
        setShowMissingDataDialog(true);
        return;
      }
    }
    if (
      selectedAssignedMember === "None" &&
      selectedLocation === "Our office"
    ) {
      const { isValid, missingFields } = validateBillingInfo(user);
      if (!isValid) {
        setMissingMemberData(
          formatMissingFieldsMessage(missingFields.split(", "))
        );
        setMissingDataType("billing");
        setErrorMessage(
          "Billing information is incomplete. Please check settings."
        );
        setShowMissingDataDialog(true);
        return;
      }
    }
    const currentRecoverable = watch("recoverable") ?? formValues.recoverable;
    const isValid = await validateForm();

    if (!isValid) {
      console.error("Validation failed");
      return;
    }
    const preparedData = prepareProductData(
      data,
      isUpdate,
      selectedCategory,
      initialData,
      attributes,
      currentRecoverable,
      watch("price.amount"),
      watch("assignedEmail")
    );

    if (isUpdate) {
      await handleUpdateProduct(preparedData);
    } else {
      await handleCreateProduct(preparedData);
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
    const currentRecoverable = watch("recoverable") ?? formValues.recoverable;
    const isFormValid = await validateForm(true);
    if (!isFormValid) return;

    const data = methods.getValues();
    const formattedData = prepareProductData(
      data,
      isUpdate,
      selectedCategory,
      initialData,
      attributes,
      currentRecoverable,
      watch("price.amount"),
      watch("assignedEmail")
    );

    setBulkInitialData(formattedData);
    setShowBulkCreate(true);
  };

  useEffect(() => {
    if (quantity > 1) {
      clearErrors(["assignedEmail", "assignedMember", "location"]);
    }
  }, [quantity, clearErrors]);

  const modelValue = (watch("attributes") || []).find(
    (attr) => attr.key === "model"
  )?.value;

  const handleLocationChange = (location: string) => {
    setSelectedLocation(location);
    setValue("location", location);
  };

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
                        handleCategoryChange={onCategoryChange}
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
                        selectedAssignedMember={selectedAssignedMember}
                        setSelectedAssignedMember={setSelectedAssignedMember}
                        selectedLocation={selectedLocation}
                        onLocationChange={handleLocationChange}
                        setSelectedLocation={setSelectedLocation}
                        setMissingDataType={setMissingDataType}
                        missingDataType={missingDataType}
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
        <div className="z-50">
          <GenericAlertDialog
            open={showMissingDataDialog}
            onClose={() => {
              setShowMissingDataDialog(false);
              setMissingMemberData("");
              setMissingDataType(undefined);
            }}
            title="Please complete the missing data: "
            description={missingMemberData}
            buttonText={
              missingDataType === "member" ? "Update Member" : "Go to Settings"
            }
            onButtonClick={() => {
              if (missingDataType === "member") {
                members.setMemberToEdit(memberToEdit._id);
                setAside("EditMember", undefined, { stackable: true });
              } else {
                router.push("/home/settings");
              }
              setShowErrorDialog(false);
              setMissingMemberData("");
              setMissingDataType(undefined);
            }}
          />
        </div>
      </PageLayout>
    </FormProvider>
  );
};

export default observer(ProductForm);
