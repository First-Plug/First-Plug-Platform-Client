"use client";
import { observer } from "mobx-react-lite";
import { FormProvider } from "react-hook-form";
import {
  type Member,
  useMemberForm,
  useMemberSubmit,
} from "@/features/members";
import { Button, PageLayout, SectionTitle } from "@/shared";
import {
  PersonalData,
  EmployeeData,
  ShipmentData,
  AdditionalData,
} from "@/features/members";
import memberImage from "/public/member.png";

interface MemberFormProps {
  initialData?: Member;
  isUpdate?: boolean;
}

export const MemberForm = observer(
  ({ initialData, isUpdate = false }: MemberFormProps) => {
    const {
      methods,
      handleSubmit,
      formState: { isSubmitting },
    } = useMemberForm(initialData);

    const { handleSaveMember, isButtonDisabled } = useMemberSubmit(
      initialData,
      isUpdate
    );

    return (
      <PageLayout>
        <FormProvider {...methods}>
          <div className="flex flex-col w-full h-full">
            <div className="absolute flex-grow p-4 w-[80%] h-[90%] overflow-y-auto scrollbar-custom">
              <div className="px-4 py-5 border rounded-3xl">
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
                  <AdditionalData
                    isUpdate={isUpdate}
                    initialData={initialData}
                  />
                </section>
              </div>
            </div>
            <aside className="bottom-0 absolute flex justify-end bg-white p-2 border-t w-[80%] h-[10%]">
              <Button
                body={isUpdate ? "Update" : "Save"}
                variant="primary"
                className="disabled:bg-hoverRed rounded-lg"
                size={"big"}
                onClick={() => {
                  handleSubmit(handleSaveMember)();
                }}
                disabled={isSubmitting || isButtonDisabled}
              />
            </aside>
          </div>
        </FormProvider>
      </PageLayout>
    );
  }
);
