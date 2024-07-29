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
          message: "Assigned Email is required",
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
        assignedMember: data[`assignedMember_${index}`],
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

    console.log("productsData", productsData);

    const isCategoryValid = await trigger("category");
    if (!isCategoryValid) {
      return;
    }

    try {
      if (Array.isArray(productsData)) {
        await ProductServices.bulkCreateProducts(productsData);
        setAlert("bulkCreateProductSuccess");
        // router.push("/home/my-stock");
      } else {
        throw new Error(
          "El formato de los datos de los productos no es un array."
        );
      }
    } catch (error) {
      console.error("Error creating products:", error);
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
    return <div>Loading...</div>;
  }

  return (
    <FormProvider {...methods}>
      <PageLayout>
        <SectionTitle>Assign Members</SectionTitle>
        <div className="h-[70vh] w-full overflow-y-auto scrollbar-custom pr-4">
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
              <Button
                body="Save"
                variant="primary"
                size="big"
                type="submit"
                disabled={isSubmitting}
              />
            </aside>
          </form>
        </div>
      </PageLayout>
    </FormProvider>
  );
};

export default observer(BulkCreateForm);
