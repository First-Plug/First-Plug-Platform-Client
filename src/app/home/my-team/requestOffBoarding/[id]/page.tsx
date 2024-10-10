"use client";

import { Button, PageLayout } from "@/common";
import { useEffect, useState } from "react";
import { useForm, FormProvider, Form } from "react-hook-form";
import { Memberservices } from "@/services";
import { Product, TeamMember } from "@/types";
import { RequestOffBoardingForm } from "../../../../../components/RequestOffBoarding/Request-off-boarding-form";
import { useStore } from "../../../../../models/root.store";

const DROPDOWN_OPTIONS = ["My office", "FP warehouse", "New employee"] as const;

type DropdownOption = (typeof DROPDOWN_OPTIONS)[number];

export interface ProductOffBoarding {
  product: Product;
  relocation: DropdownOption;
  available: boolean;
  newMember?: any;
}

export default function Page({ params }: { params: { id: string } }) {
  const [selectedMember, setSelectedMember] = useState<TeamMember>(null);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [products, setProducts] = useState<ProductOffBoarding[]>([]);

  const {
    members: { setMemberOffBoarding },
  } = useStore();

  const methods = useForm({
    defaultValues: {
      products: [],
    },
  });

  const { handleSubmit, watch, reset } = methods;

  useEffect(() => {
    Memberservices.getAllMembers().then(setMembers);
    Memberservices.getOneMember(params.id).then((res) => {
      setMemberOffBoarding(`${res.firstName} ${res.lastName}`);
      setSelectedMember(res);
    });
  }, [params.id]);

  useEffect(() => {
    const storedProducts = localStorage.getItem(`products_${params.id}`);
    if (storedProducts) {
      setProducts(JSON.parse(storedProducts));
    }
  }, [params.id]);

  useEffect(() => {
    const subscription = watch((values) => {
      localStorage.setItem(
        `products_${params.id}`,
        JSON.stringify(values.products)
      );
    });
    return () => subscription.unsubscribe();
  }, [watch, params.id]);

  const onSubmit = (data: any) => {
    console.log("Form Data Submitted:", data);
    alert("Confirmando offboarding");
  };

  const recoverableProducts =
    selectedMember?.products?.filter(
      (product) => product.recoverable === true
    ) || [];

  const isAvailable =
    products.length > 0 &&
    products.every((product) => product.available) &&
    products.length === recoverableProducts.length;

  return (
    <PageLayout>
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="h-full w-full">
            <div className="absolute h-[90%] w-[80%] overflow-y-auto scrollbar-custom pr-4">
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
                  .map((product, index) => {
                    const initialProduct =
                      products?.length > 0 && product?._id
                        ? products.find((p) => p.product?._id === product._id)
                        : null;

                    return (
                      <RequestOffBoardingForm
                        key={product._id}
                        product={product}
                        index={index}
                        // products={products}
                        // setProducts={setProducts}
                        // initialValue={initialProduct}
                        members={members}
                      />
                    );
                  })}
              </div>
            </div>
            <aside className="absolute flex justify-end bg-white w-[80%] bottom-0 p-2 h-[10%] border-t">
              <Button
                variant="primary"
                className="mr-[39px] w-[200px] h-[40px] rounded-lg"
                type="submit"
                disabled={!isAvailable}
                onClick={() => {
                  alert("Confirmando offboarding");
                }}
              >
                Confirm offboard
              </Button>
            </aside>
          </div>
        </form>
      </FormProvider>
    </PageLayout>
  );
}
