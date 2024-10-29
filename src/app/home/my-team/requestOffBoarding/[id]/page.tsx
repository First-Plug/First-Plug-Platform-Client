"use client";

import { Button, LoaderSpinner, PageLayout } from "@/common";
import { useEffect, useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { Memberservices, TeamServices } from "@/services";
import { Product, TeamMember } from "@/types";
import { RequestOffBoardingForm } from "../../../../../components/RequestOffBoarding/Request-off-boarding-form";
import { useStore } from "../../../../../models/root.store";
import { observer } from "mobx-react-lite";
import { useRouter } from "next/navigation";
import { transformData } from "@/utils/dataTransformUtil";
import useFetch from "@/hooks/useFetch";
import { useFetchMembers } from "@/members/hooks";
import { useQueryClient } from "@tanstack/react-query";

const DROPDOWN_OPTIONS = ["My office", "FP warehouse", "New employee"] as const;

type DropdownOption = (typeof DROPDOWN_OPTIONS)[number];

export interface ProductOffBoarding {
  product: Product;
  relocation: DropdownOption;
  available: boolean;
  newMember?: any;
}

const Page = ({ params }: { params: { id: string } }) => {
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: members = [] } = useFetchMembers();

  const {
    members: { setMemberOffBoarding },
    aside: { isClosed },
  } = useStore();


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
    const subscription = watch((values) => {
      
      const areProductsValid = values.products.every(
        (product: ProductOffBoarding) => product.relocation && product.available
      );            
      setIsButtonDisabled(!areProductsValid);
    });

    return () => subscription.unsubscribe();
  }, [watch, isClosed]);

  const onSubmit = async (data: any) => {
    const sendData = data.products.map((productToSend) => {
      if (productToSend.newMember !== "None") {
        productToSend.newMember = members.find(
          (member) => member.fullName === productToSend.newMember
        );
      }

      return productToSend;
    });

    setIsLoading(true);
    await Memberservices.offboardingMember(params.id, sendData);
    setIsLoading(false);

    queryClient.invalidateQueries({ queryKey: ["assets"] });
    queryClient.invalidateQueries({ queryKey: ["members"] });


    router.push("/home/my-team");
  };

  return (
    <PageLayout>
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="w-full h-screen overflow-y-auto scrollbar-custom">
            <div className="pr-4">
              <div className="flex flex-col gap-2">
                <div>
                  <h2>
                    All recoverable assets will be requested and the member will
                    be removed from your team.
                  </h2>

                  <span>Please confirm the relocation of each product.</span>
                </div>
              </div>

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
                        totalProducts={selectedMember.products.filter(
                          (product) => product.recoverable === true
                        ).length}
                        members={members.filter(
                          (member) => member.email !== selectedMember.email
                        )}
                        className={isLastItem ? "mb-[300px]" : ""}
                        setIsButtonDisabled={setIsButtonDisabled}
                      />
                    );
                  })}
              </div>
            </div>
            <aside className="absolute flex justify-end items-center bg-white w-[80%] bottom-0 p-2 h-[10%] border-t">
              <Button
                variant="primary"
                className="mr-[39px] w-[200px] h-[40px] rounded-lg"
                type="submit"
                disabled={isButtonDisabled}
              >
                {isLoading ? <LoaderSpinner /> : "Confirm offboard"}
              </Button>
            </aside>
          </div>
        </form>
      </FormProvider>
    </PageLayout>
  );
};

export default observer(Page);
