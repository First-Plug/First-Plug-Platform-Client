"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm, FormProvider } from "react-hook-form";
import { observer } from "mobx-react-lite";
import { Button, PageLayout, SectionTitle } from "@/common";
import { DropdownInputProductForm } from "@/components/AddProduct/DropDownProductForm";
import { InputProductForm } from "@/components/AddProduct/InputProductForm";
import { ProductServices } from "@/services/product.services";
import { Memberservices } from "@/services";
import { cast, Instance } from "mobx-state-tree";
import { AttributeModel, TeamMemberModel } from "@/types";
import ProductDetail from "@/common/ProductDetail";
import { useStore } from "@/models";
import { BarLoader } from "../Loader/BarLoader";

const BulkCreateForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const quantity = searchParams.get("quantity");
  const productData = searchParams.get("productData");

  const numProducts = quantity ? parseInt(quantity as string, 10) : 0;
  const initialData = productData ? JSON.parse(productData as string) : {};

  const {
    alerts: { setAlert },
  } = useStore();

  const methods = useForm({
    defaultValues: initialData,
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
  const [loading, setLoading] = useState(true);
  const [isLocationEnabled, setIsLocationEnabled] = useState<boolean[]>(
    Array(numProducts).fill(false)
  );
  const [selectedLocations, setSelectedLocations] = useState<string[]>(
    Array(numProducts).fill("Location")
  );
  const [assignAll, setAssignAll] = useState(false);

  useEffect(() => {
    const fetchMembers = async () => {
      const fetchedMembers = await Memberservices.getAllMembers();
      setMembers(fetchedMembers as Instance<typeof TeamMemberModel>[]);
      const memberFullNames = [
        "None",
        ...fetchedMembers.map(
          (member: Instance<typeof TeamMemberModel>) =>
            `${member.firstName} ${member.lastName}`
        ),
      ];
      setAssignedEmailOptions(memberFullNames);
      setLoading(false);
    };

    fetchMembers();
  }, []);

  const handleAssignedMemberChange = (
    selectedFullName: string,
    index: number
  ) => {
    const selectedMember = members.find(
      (member) => `${member.firstName} ${member.lastName}` === selectedFullName
    );
    const email = selectedMember?.email || "";
    setValue(`assignedEmail_${index}`, email);
    setValue(`assignedMember_${index}`, selectedFullName);

    const newSelectedLocations = [...selectedLocations];
    newSelectedLocations[index] = selectedFullName === "None" ? "" : "Employee";
    setSelectedLocations(newSelectedLocations);
    setValue(`location_${index}`, newSelectedLocations[index]);

    setIsLocationEnabled((prev) => {
      const newIsLocationEnabled = [...prev];
      newIsLocationEnabled[index] = selectedFullName === "None";
      return newIsLocationEnabled;
    });

    clearErrors([`assignedEmail_${index}`, `location_${index}`]);

    if (assignAll && index === 0) {
      for (let i = 1; i < numProducts; i++) {
        setValue(`assignedEmail_${i}`, email);
        setValue(`assignedMember_${i}`, selectedFullName);
        setValue(`location_${i}`, newSelectedLocations[index]);
        newSelectedLocations[i] = newSelectedLocations[index];
        setIsLocationEnabled((prev) => {
          const newIsLocationEnabled = [...prev];
          newIsLocationEnabled[i] = selectedFullName === "None";
          return newIsLocationEnabled;
        });
        clearErrors([`assignedEmail_${i}`, `location_${i}`]);
      }
      setSelectedLocations(newSelectedLocations);
    }
  };

  const handleLocationChange = (value: string, index: number) => {
    setValue(`location_${index}`, value);
    const newSelectedLocations = [...selectedLocations];
    newSelectedLocations[index] = value;
    setSelectedLocations(newSelectedLocations);
    if (assignAll) {
      for (let i = 0; i < numProducts; i++) {
        setValue(`location_${i}`, value);
        newSelectedLocations[i] = value;
        clearErrors([`location_${i}`]);
      }
      setSelectedLocations(newSelectedLocations); // Actualiza el estado aquí también
    }
  };

  const validateData = async (data: any) => {
    let isValid = true;
    for (let index = 0; index < numProducts; index++) {
      const assignedEmail = data[`assignedEmail_${index}`];
      const assignedMember = data[`assignedMember_${index}`];
      const location = data[`location_${index}`];

      if (!assignedEmail && assignedMember !== "None") {
        methods.setError(`assignedEmail_${index}`, {
          type: "manual",
          message: "Assigned Member is required",
        });
        isValid = false;
      }

      if (!location || location === "Location") {
        methods.setError(`location_${index}`, {
          type: "manual",
          message: "Location is required",
        });
        isValid = false;
      }
    }
    return isValid;
  };

  const handleBulkCreate = async (data: any) => {
    const productsData = Array.from({ length: numProducts }, (_, index) => {
      const assignedMember = data[`assignedMember_${index}`];
      const location = data[`location_${index}`];
      const status = assignedMember === "None" ? "Available" : "Delivered";

      return {
        ...initialData,
        assignedEmail: data[`assignedEmail_${index}`],
        // assignedMember: data[`assignedMember_${index}`],
        location: data[`location_${index}`],
        serialNumber: data[`serialNumber_${index}`],
        status,
        attributes: cast(
          initialData.attributes?.map((attr: any) => {
            const value = data[attr.key];
            return {
              ...attr,
              value: value !== undefined ? value : attr.value,
            };
          }) || []
        ),
      };
    });

    const isCategoryValid = await trigger("category");
    if (!isCategoryValid) {
      return;
    }

    try {
      if (Array.isArray(productsData)) {
        await ProductServices.bulkCreateProducts(productsData);
        setAlert("bulkCreateProductSuccess");
      } else {
        throw new Error(
          "El formato de los datos de los productos no es un array."
        );
      }
    } catch (error) {
      if (error.response?.data?.message === "Serial Number already exists") {
        setAlert("bulkCreateSerialNumberError");
      } else {
        setAlert("bulkCreateProductError");
      }
    }
  };

  const onSubmit = async (data: any) => {
    const isValid = await trigger();
    const isDataValid = await validateData(data);

    if (!isValid || !isDataValid) {
      return;
    }

    handleBulkCreate(data);
  };

  if (!quantity || !productData || loading) {
    return (
      <div>
        <BarLoader />
      </div>
    );
  }

  const handleAssignAllChange = () => {
    setAssignAll(!assignAll);
    const firstAssignedEmail = watch(`assignedEmail_0`);
    const firstAssignedMember = watch(`assignedMember_0`);
    const firstLocation = watch(`location_0`);
    if (!assignAll) {
      const newSelectedLocations = [...selectedLocations];
      for (let index = 1; index < numProducts; index++) {
        setValue(`assignedEmail_${index}`, firstAssignedEmail);
        setValue(`assignedMember_${index}`, firstAssignedMember);
        setValue(`location_${index}`, firstLocation);
        newSelectedLocations[index] = firstLocation;
        setIsLocationEnabled((prev) => {
          const newIsLocationEnabled = [...prev];
          newIsLocationEnabled[index] = firstAssignedMember === "None";
          return newIsLocationEnabled;
        });
        clearErrors([`assignedEmail_${index}`, `location_${index}`]);
      }
      setSelectedLocations(newSelectedLocations);
      for (let index = 1; index < numProducts; index++) {
        setValue(`assignedEmail_${index}`, "");
        setValue(`assignedMember_${index}`, "");
        setValue(`location_${index}`, "Location");
        setIsLocationEnabled((prev) => {
          const newIsLocationEnabled = [...prev];
          newIsLocationEnabled[index] = true;
          return newIsLocationEnabled;
        });
      }
    }
  };

  return (
    <FormProvider {...methods}>
      <PageLayout>
        <SectionTitle>Assign Member to each product</SectionTitle>
        <div className="flex justify-between">
          <div className="w-1/2">
            <ProductDetail product={initialData} />
          </div>
          <div className="w-1/2 p-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                className="mr-2"
                checked={assignAll}
                onChange={handleAssignAllChange}
              />
              Assign all products at once
            </label>
          </div>
        </div>

        <div className="h-[60vh] w-full overflow-y-auto scrollbar-custom pr-4">
          <form onSubmit={handleSubmit(onSubmit)}>
            {Array.from({ length: numProducts }, (_, index) => (
              <div key={index} className="mb-4">
                <SectionTitle>{`Product ${index + 1}`}</SectionTitle>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 ">
                  <div className="w-full">
                    <DropdownInputProductForm
                      options={assignedEmailOptions}
                      placeholder="Assigned Member"
                      title="Assigned Member*"
                      name={`assignedMember_${index}`}
                      selectedOption={watch(`assignedMember_${index}`)}
                      onChange={(selectedFullName: string) =>
                        handleAssignedMemberChange(selectedFullName, index)
                      }
                    />
                    <div className="min-h-[24px]">
                      {errors[`assignedEmail_${index}`] && (
                        <p className="text-red-500">
                          {(errors[`assignedEmail_${index}`] as any).message}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="w-full">
                    {watch(`assignedMember_${index}`) === "None" ||
                    !watch(`assignedMember_${index}`) ? (
                      <>
                        <DropdownInputProductForm
                          options={["Our office", "FP warehouse"]}
                          placeholder="Location"
                          title="Location*"
                          name={`location_${index}`}
                          selectedOption={selectedLocations[index]}
                          onChange={(value: string) => {
                            const newSelectedLocations = [...selectedLocations];
                            newSelectedLocations[index] = value;
                            setSelectedLocations(newSelectedLocations);
                            setValue(`location_${index}`, value);
                            clearErrors(`location_${index}`);
                            handleLocationChange(value, index);
                          }}
                          required="required"
                          className="w-full"
                          disabled={!isLocationEnabled[index]}
                        />
                        <div className="min-h-[24px]">
                          {errors[`location_${index}`] && (
                            <p className="text-red-500">
                              {(errors[`location_${index}`] as any).message}
                            </p>
                          )}
                        </div>
                      </>
                    ) : (
                      <InputProductForm
                        placeholder="Location"
                        title="Location"
                        type="text"
                        name={`location_${index}`}
                        value="Employee"
                        onChange={(e) =>
                          setValue(`location_${index}`, e.target.value)
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
                      name={`serialNumber_${index}`}
                      value={watch(`serialNumber_${index}`)}
                      onChange={(e) =>
                        setValue(`serialNumber_${index}`, e.target.value)
                      }
                      className="w-full"
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
                  onClick={() => router.back()}
                />
                <Button
                  body="Save"
                  variant="primary"
                  size="big"
                  type="submit"
                  disabled={isSubmitting}
                />
              </div>
            </aside>
          </form>
        </div>
      </PageLayout>
    </FormProvider>
  );
};

export default observer(BulkCreateForm);
