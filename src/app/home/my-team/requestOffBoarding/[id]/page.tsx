"use client";

import { SectionTitle } from "@/common";
import ProductDetail from "@/common/ProductDetail";
import { DropdownInputProductForm } from "@/components/AddProduct/DropDownProductForm";
import { Memberservices } from "@/services";
import { TeamMember } from "@/types";
import { useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { RequestOffBoardingForm } from "../../../../../components/RequestOffBoarding/RequestOffBoardingForm";

export default function Page({ params }: { params: { id: string } }) {
  const [selectedMember, setSelectedMember] = useState<TeamMember>(null);
  const [status, setStatus] = useState(null);

  useEffect(() => {
    Memberservices.getOneMember(params.id).then(setSelectedMember);
  }, [params.id]);

  const methods = useForm({});

  const {
    handleSubmit,
    formState: { isSubmitting, errors },
    clearErrors,
    setValue,
    watch,
    trigger,
  } = methods;

  return (
    <FormProvider {...methods}>
      <div className="flex flex-col gap-4">
        <div>
          <h2>
            All recoverable assets will be requested and the member will be
            removed from your team.
          </h2>

          <span>Please confirm the relocation of each product.</span>
        </div>

        <div>
          {selectedMember?.products
            ?.filter((product) => product.recoverable === true)
            .map((product, index) => (
              <RequestOffBoardingForm
                key={product._id}
                product={product}
                index={index}
                methods={methods}
              />
            ))}
        </div>
      </div>
    </FormProvider>
  );
}
