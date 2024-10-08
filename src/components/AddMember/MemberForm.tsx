"use client";
import { Button, SectionTitle, PageLayout } from "@/common";
import React, { useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import { Memberservices, TeamServices } from "@/services";
import { useStore } from "@/models/root.store";
import { TeamMember, zodCreateMembertModel } from "@/types";
import PersonalData from "./PersonalData";
import memberImage from "../../../public/member.png";
import EmployeeData from "./EmployeeData";
import ShipmentData from "./ShipmentData";
import AdditionalData from "./AdditionalData";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { transformData } from "@/utils/dataTransformUtil";
import { useCreateMember, useUpdateMember } from "@/members/hooks";

interface MemberFormProps {
  initialData?: TeamMember;
  isUpdate?: boolean;
}

const MemberForm: React.FC<MemberFormProps> = ({
  initialData,
  isUpdate = false,
}) => {
  const {
    members: { addMember, setMembers, updateMember },
    alerts: { setAlert },
    teams: { getOrCreateTeam, setTeams },
  } = useStore();

  const updateMemberMutation = useUpdateMember();
  const createMemberMutation = useCreateMember();

  const methods = useForm({
    resolver: zodResolver(zodCreateMembertModel),
    defaultValues: initialData || {},
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  // const [isProcessing, setIsProcessing] = useState(false);

  const formatAcquisitionDate = (date: string) => {
    if (!date) return "";
    const d = new Date(date);
    return isNaN(d.getTime()) ? "" : d.toISOString().split("T")[0];
  };

  const handleSaveMember = async (data: TeamMember) => {
    try {
      let teamId: string | "";

      if (data.team && typeof data.team === "object" && data.team._id) {
        teamId = data.team._id;
      } else if (
        data.team &&
        typeof data.team === "string" &&
        data.team.trim() !== ""
      ) {
        const team = await getOrCreateTeam(data.team);
        teamId = team._id;
      } else {
        teamId = undefined;
      }

      let changes: Partial<TeamMember> = {};
      Object.keys(data).forEach((key) => {
        if (key === "dni") {
          const initialDni =
            initialData?.[key] !== undefined
              ? Number(initialData[key])
              : undefined;
          const newDni =
            data[key] !== undefined ? Number(data[key]) : undefined;

          if (newDni !== initialDni) {
            changes[key] = newDni;
          }
        } else if (data[key] !== initialData?.[key]) {
          if (key === "acquisitionDate" || key === "birthDate") {
            changes[key] = data[key] ? formatAcquisitionDate(data[key]) : null;
          } else {
            changes[key] = data[key];
          }
        }
      });

      if (!("dni" in changes) && initialData?.dni) {
        changes.dni = initialData.dni;
      }

      if (changes.products) {
        delete changes.products;
      }

      if (isUpdate && initialData) {
        updateMemberMutation.mutate({
          id: initialData._id,
          data: { ...changes, ...(teamId && { team: teamId }) },
        });

        if (changes.dni === undefined && initialData.dni !== undefined) {
          initialData.dni = initialData.dni;
        }
      } else {
        createMemberMutation.mutate({
          ...data,
          ...(teamId && { team: teamId }),
        });
      }

      const updateMembers = await Memberservices.getAllMembers();
      const updatedTeams = await TeamServices.getAllTeams();
      const transformedMembers = transformData(updateMembers, updatedTeams);

      setMembers(transformedMembers);
      setTeams(updatedTeams);
    } catch (error: any) {}
  };

  return (
    <PageLayout>
      <FormProvider {...methods}>
        <div className=" h-full w-full flex flex-col  ">
          <div className=" absolute h-[90%] w-[80%]  flex-grow overflow-y-auto p-4 scrollbar-custom ">
            <div className=" px-4 py-5 rounded-3xl  border  ">
              <SectionTitle className="text-[20px]">
                {isUpdate ? "" : "Add Team Member"}
              </SectionTitle>

              <section className="flex flex-col gap-4 ">
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
          <aside className="absolute flex justify-end bg-white w-[80%] bottom-0 p-2 h-[10%] border-t">
            <Button
              body={isUpdate ? "Update" : "Save"}
              variant="primary"
              className="  rounded-lg"
              size={"big"}
              onClick={() => {
                handleSubmit(handleSaveMember)();
              }}
              disabled={isSubmitting}
            />
          </aside>
        </div>
      </FormProvider>
    </PageLayout>
  );
};

export default observer(MemberForm);
