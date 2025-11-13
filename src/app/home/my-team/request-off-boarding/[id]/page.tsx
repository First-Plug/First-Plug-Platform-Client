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

import {
  useAsideStore,
  useAlertStore,
  useInternationalShipmentDetection,
  InternationalShipmentWarning,
} from "@/shared";
import { useSession } from "next-auth/react";
import { useOffices } from "@/features/settings/hooks/use-offices";

const DROPDOWN_OPTIONS = ["My office", "FP warehouse", "New employee"] as const;

type DropdownOption = (typeof DROPDOWN_OPTIONS)[number];

export interface ProductOffBoarding {
  product: Product;
  relocation: DropdownOption;
  available: boolean;
  newMember?: any;
  officeId?: string;
}

export default function RequestOffBoardingPage({
  params,
}: {
  params: { id: string };
}) {
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [showInternationalWarning, setShowInternationalWarning] =
    useState(false);
  const [pendingOffboardingData, setPendingOffboardingData] = useState<
    any | null
  >(null);
  const router = useRouter();
  const queryClient = useQueryClient();

  const { shipmentValue, onSubmitDropdown, isShipmentValueValid } =
    useShipmentValues();

  const { data: members = [] } = useFetchMembers();
  const { offices } = useOffices();
  const { data: session } = useSession();

  const { setAlert } = useAlertStore();
  const { isClosed } = useAsideStore();
  const { setMemberOffBoarding } = useMemberStore();

  const { isInternationalShipment, buildInternationalValidationEntities } =
    useInternationalShipmentDetection();

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
      const payload: any = {
        product: productToSend.product,
        relocation: productToSend.relocation,
        available: productToSend.available,
        fp_shipment: shipmentValue.shipment === "yes",
        desirableDate: {
          origin: shipmentValue.pickupDate,
          destination: shipmentValue.deliveredDate,
        },
      };

      if (productToSend.newMember !== "None") {
        payload.newMember = members.find(
          (member) => member.fullName === productToSend.newMember
        );
      }

      if (productToSend.officeId) {
        payload.officeId = productToSend.officeId;
      }

      return payload;
    });

    const requiresFpShipment = shipmentValue.shipment === "yes";
    let hasInternationalShipment = false;

    if (requiresFpShipment && selectedMember) {
      const sessionUserData = {
        country: (session?.user as any)?.country,
        city: (session?.user as any)?.city,
        state: (session?.user as any)?.state,
        zipCode: (session?.user as any)?.zipCode,
        address: (session?.user as any)?.address,
        phone: (session?.user as any)?.phone,
      };

      for (const productData of sendData) {
        const product = productData.product;
        const destinationMember = productData.newMember;
        const officeId = productData.officeId;

        const { source, destination } = buildInternationalValidationEntities(
          product,
          members,
          destinationMember || null,
          sessionUserData,
          destinationMember ? null : productData.relocation,
          officeId || null
        );

        if (isInternationalShipment(source, destination)) {
          hasInternationalShipment = true;
          break;
        }
      }
    }

    if (hasInternationalShipment) {
      setPendingOffboardingData(sendData);
      setShowInternationalWarning(true);
      return;
    }

    await executeOffboarding(sendData);
  };

  const executeOffboarding = async (sendData: any) => {
    setIsLoading(true);

    try {
      const response = await Memberservices.offboardingMember(params.id, sendData);

      setAlert("successOffboarding");

      queryClient.invalidateQueries({ queryKey: ["assets"] });
      queryClient.invalidateQueries({ queryKey: ["members"] });
      queryClient.invalidateQueries({ queryKey: ["offices"] });

      // Si se creó al menos un shipment, esperar refetch y redirigir
      // El backend puede devolver un array de shipments o un solo shipment
      if (response && response.shipments && response.shipments.length > 0) {
        // Esperar a que se refetchee la query de shipments
        await queryClient.invalidateQueries({ queryKey: ["shipments"] });
        await queryClient.refetchQueries({ queryKey: ["shipments"] });
        // Redirigir al primer shipment creado
        router.push(`/home/shipments?id=${response.shipments[0]._id}`);
      } else if (response && response.shipment && response.shipment._id) {
        // Si devuelve un solo shipment
        await queryClient.invalidateQueries({ queryKey: ["shipments"] });
        await queryClient.refetchQueries({ queryKey: ["shipments"] });
        router.push(`/home/shipments?id=${response.shipment._id}`);
      } else {
        // Si no hay shipments, redirigir a la página de my-team
        router.push("/home/my-team");
      }
    } catch (error) {
      setAlert("errorOffboarding");
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmInternationalShipment = () => {
    setShowInternationalWarning(false);
    if (pendingOffboardingData) {
      executeOffboarding(pendingOffboardingData);
      setPendingOffboardingData(null);
    }
  };

  const handleCancelInternationalShipment = () => {
    setShowInternationalWarning(false);
    setPendingOffboardingData(null);
  };

  return (
    <PageLayout>
      <div className="flex flex-col h-full">
        {/* Header Section */}
        <div className="flex-shrink-0 mb-4">
          <div className="flex flex-col gap-2 mb-4">
            <div>
              <h2>
                All recoverable assets will be requested and the member will be
                removed from your team.
              </h2>
              <span>Please confirm the relocation of each product.</span>
            </div>
          </div>
          <div className="w-80">
            <ShipmentWithFp
              onSubmit={onSubmitDropdown}
              destinationMember={selectedMember}
            />
          </div>
        </div>

        {/* Main Content - Scrollable */}
        <FormProvider {...methods}>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col flex-1 min-h-0"
          >
            <div className="flex-1 pr-4 overflow-y-auto scrollbar-custom">
              {selectedMember?.products
                ?.filter((product) => product.recoverable === true)
                .map((product, index, array) => {
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
                      className=""
                      setIsButtonDisabled={setIsButtonDisabled}
                      onFormStatusChange={handleFormStatusChange}
                    />
                  );
                })}
            </div>

            {/* Footer - Fixed at Bottom */}
            <div className="flex flex-shrink-0 justify-end items-center bg-white mt-4 py-4 border-t">
              <Button
                variant="primary"
                className="mr-8 rounded-lg w-[200px] h-[40px]"
                type="submit"
                disabled={isButtonDisabled || !isShipmentValueValid()}
              >
                {isLoading ? <LoaderSpinner /> : "Confirm offboard"}
              </Button>
            </div>
          </form>
        </FormProvider>

        <InternationalShipmentWarning
          isOpen={showInternationalWarning}
          onConfirm={handleConfirmInternationalShipment}
          onCancel={handleCancelInternationalShipment}
        />
      </div>
    </PageLayout>
  );
}
