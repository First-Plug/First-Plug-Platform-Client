"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, FormProvider } from "react-hook-form";

import { type Product } from "@/features/assets";
import { Button, LoaderSpinner, PageLayout } from "@/shared";

import { useFetchMembers, useMemberStore } from "@/features/members";
import { RequestOffBoardingForm } from "@/features/members";
import { useQueryClient } from "@tanstack/react-query";
import { validateMemberBillingInfo } from "@/features/members";
import { useShipmentValues } from "@/features/shipments";
import { ShipmentWithFp } from "@/features/shipments";

import { Member } from "@/features/members";
import { Memberservices } from "@/features/members";

import { useAsideStore, useAlertStore } from "@/shared";

const DROPDOWN_OPTIONS = ["My office", "FP warehouse", "New employee"] as const;

type DropdownOption = (typeof DROPDOWN_OPTIONS)[number];

export interface ProductOffBoarding {
  product: Product;
  relocation: DropdownOption;
  available: boolean;
  newMember?: any;
}

export default function RequestOffBoardingPage({
  params,
}: {
  params: { id: string };
}) {
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const queryClient = useQueryClient();

  const { shipmentValue, onSubmitDropdown, isShipmentValueValid } =
    useShipmentValues();

  const { data: members = [] } = useFetchMembers();

  const { setAlert } = useAlertStore();
  const { isClosed } = useAsideStore();
  const { setMemberOffBoarding } = useMemberStore();

  const methods = useForm({
    defaultValues: {
      products: [],
    },
  });

  const { handleSubmit, watch } = methods;

  useEffect(() => {
    Memberservices.getOneMember(params.id).then((res) => {
      setMemberOffBoarding(`${res.firstName} ${res.lastName}`);
      setSelectedMember(res);
    });
  }, [params.id, isClosed]);

  useEffect(() => {
    if (isClosed) {
      const products = methods.getValues("products");
      const updatedProducts = products.map((product) => {
        if (product.relocation === "New employee" && product.newMember) {
          const foundMember = members.find(
            (member) =>
              `${member.firstName} ${member.lastName}` === product.newMember
          );
          if (foundMember && validateMemberBillingInfo(foundMember)) {
            return { ...product, available: true };
          }
        }
        return product;
      });

      methods.setValue("products", updatedProducts, { shouldValidate: true });

      const areProductsValid = updatedProducts.every(
        (product) => product.relocation && product.available
      );

      setTimeout(() => setIsButtonDisabled(!areProductsValid), 0);
    }
  }, [isClosed, members, methods]);

  const handleFormStatusChange = (status: string) => {
    if (status === "is-member-available" || status === "none") {
      const products = methods.getValues("products");

      const updatedProducts = products.map((product) => {
        if (product.relocation === "New employee" && product.newMember) {
          const foundMember = members.find(
            (member) =>
              `${member.firstName} ${member.lastName}` === product.newMember
          );
          if (foundMember && validateMemberBillingInfo(foundMember)) {
            return { ...product, available: true };
          }
        }
        return product;
      });

      methods.setValue("products", updatedProducts, { shouldValidate: true });

      const areProductsValid = updatedProducts.every(
        (product: ProductOffBoarding) => product.relocation && product.available
      );

      setIsButtonDisabled(!areProductsValid);
    }
  };

  useEffect(() => {
    const subscription = watch((values) => {
      const areProductsValid = values.products.every(
        (product: ProductOffBoarding) => product.relocation && product.available
      );
      setIsButtonDisabled(!areProductsValid);
    });

    return () => subscription.unsubscribe();
  }, [isClosed]);

  const onSubmit = async (data: any) => {
    const sendData = data.products.map((productToSend) => {
      if (productToSend.newMember !== "None") {
        productToSend.newMember = members.find(
          (member) => member.fullName === productToSend.newMember
        );
      }

      productToSend.fp_shipment = shipmentValue.shipment === "yes";
      productToSend.desirableDate = {
        origin: shipmentValue.pickupDate,
        destination: shipmentValue.deliveredDate,
      };

      return productToSend;
    });

    setIsLoading(true);

    try {
      await Memberservices.offboardingMember(params.id, sendData);

      setAlert("successOffboarding");

      queryClient.invalidateQueries({ queryKey: ["assets"] });
      queryClient.invalidateQueries({ queryKey: ["members"] });

      router.push("/home/my-team");
    } catch (error) {
      console.error("Error al realizar offboarding:", error);
      setAlert("errorOffboarding");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PageLayout>
      <div className="flex flex-col gap-2">
        <div>
          <h2>
            All recoverable assets will be requested and the member will be
            removed from your team.
          </h2>

          <span>Please confirm the relocation of each product.</span>
        </div>
      </div>
      <div className="mt-4 w-80">
        <ShipmentWithFp
          onSubmit={onSubmitDropdown}
          destinationMember={selectedMember}
        />
      </div>
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="w-full h-screen overflow-y-auto scrollbar-custom">
            <div className="pr-4">
              <div className="flex-1">
                {selectedMember?.products
                  ?.filter((product) => product.recoverable === true)
                  .map((product, index, array) => {
                    const isLastItem = index === array.length - 1;

                    return (
                      <RequestOffBoardingForm
                        key={product._id}
                        product={product}
                        products={selectedMember?.products?.filter(
                          (product) => product.recoverable === true
                        )}
                        index={index}
                        totalProducts={
                          selectedMember.products.filter(
                            (product) => product.recoverable === true
                          ).length
                        }
                        members={members.filter(
                          (member) => member.email !== selectedMember.email
                        )}
                        className={isLastItem ? "mb-[300px]" : ""}
                        setIsButtonDisabled={setIsButtonDisabled}
                        onFormStatusChange={handleFormStatusChange}
                      />
                    );
                  })}
              </div>
            </div>
            <aside className="bottom-0 absolute flex justify-end items-center bg-white p-2 border-t w-[80%] h-[10%]">
              <Button
                variant="primary"
                className="mr-[39px] rounded-lg w-[200px] h-[40px]"
                type="submit"
                disabled={isButtonDisabled || !isShipmentValueValid()}
              >
                {isLoading ? <LoaderSpinner /> : "Confirm offboard"}
              </Button>
            </aside>
          </div>
        </form>
      </FormProvider>
    </PageLayout>
  );
}
