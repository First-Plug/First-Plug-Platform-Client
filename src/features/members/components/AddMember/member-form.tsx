"use client";

import { FormProvider } from "react-hook-form";
import {
  type Member,
  useMemberForm,
  useMemberSubmit,
  zodCreateMemberModel,
} from "@/features/members";
import { Button, PageLayout, SectionTitle } from "@/shared";
import {
  PersonalData,
  EmployeeData,
  ShipmentData,
  AdditionalData,
} from "@/features/members";
import memberImage from "/public/member.png";
import { useEffect } from "react";

interface MemberFormProps {
  initialData?: Member;
  isUpdate?: boolean;
}

export const MemberForm = ({
  initialData,
  isUpdate = false,
}: MemberFormProps) => {
  const {
    methods,
    handleSubmit,
    formState: { isSubmitting, isValid, errors },
  } = useMemberForm(initialData);

  const { handleSaveMember, isButtonDisabled } = useMemberSubmit(
    initialData,
    isUpdate
  );

  try {
    zodCreateMemberModel.parse(initialData);
    console.log("Data is valid!");
  } catch (e) {
    console.error("Zod Validation Error:", e.errors);
  }

  return (
    <PageLayout>
      <FormProvider {...methods}>
        <div className="flex flex-col w-full h-full">
          <div className="flex-1 py-4 pr-5 w-full overflow-y-auto scrollbar-custom">
            <div className="px-4 py-5 border rounded-3xl w-full">
              <SectionTitle className="text-[20px]">
                {isUpdate ? "" : "Add Team Member"}
              </SectionTitle>

              <section className="flex flex-col gap-4">
                <PersonalData
                  memberImage={memberImage}
                  isUpdate={isUpdate}
                  initialData={initialData}
                />
                <hr />
                <EmployeeData isUpdate={isUpdate} initialData={initialData} />
                <hr />
                <ShipmentData isUpdate={isUpdate} initialData={initialData} />
                <hr />
                <AdditionalData isUpdate={isUpdate} initialData={initialData} />
              </section>
            </div>
          </div>
          <div className="flex justify-end items-center bg-white -mx-[18px] 2xl:-mx-[23px] border-t w-full">
            <Button
              body={isUpdate ? "Update" : "Save"}
              variant="primary"
              className={`disabled:bg-hoverRed mt-4 rounded-lg ${
                isUpdate ? "h-20" : ""
              }`}
              size={"big"}
              onClick={() => {
                handleSubmit(handleSaveMember)();
              }}
              disabled={isSubmitting || isButtonDisabled || !isValid}
            />
          </div>
        </div>
      </FormProvider>
    </PageLayout>
  );
};
