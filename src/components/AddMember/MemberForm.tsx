"use client";
import { Button, SectionTitle, PageLayout } from "@/common";
import { observer } from "mobx-react-lite";
import { useStore } from "@/models/root.store";
import {
  Product,
  ProductTable,
  Team,
  TeamMember,
  zodCreateMembertModel,
} from "@/types";
import PersonalData from "./PersonalData";
import memberImage from "../../../public/member.png";
import EmployeeData from "./EmployeeData";
import ShipmentData from "./ShipmentData";
import AdditionalData from "./AdditionalData";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { transformData } from "@/utils/dataTransformUtil";
import { useCreateMember, useUpdateMember } from "@/members/hooks";
import { useGetOrCreateTeam } from "@/teams/hooks";
import { QueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

interface MemberFormProps {
  initialData?: TeamMember;
  isUpdate?: boolean;
}

const MemberForm: React.FC<MemberFormProps> = ({
  initialData,
  isUpdate = false,
}) => {
  const {
    members: { setMembers },
    alerts: { setAlert },
    teams: { setTeams },
    aside: { closeAside },
  } = useStore();
  const queryClient = new QueryClient();

  const updateMemberMutation = useUpdateMember();
  const createMemberMutation = useCreateMember();

  const [isButtonDisabled, setButtonDisabled] = useState(false);

  const methods = useForm({
    resolver: zodResolver(zodCreateMembertModel),
    defaultValues: {
      ...initialData,
      dni: initialData?.dni === undefined ? "" : initialData.dni,
    },
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const searchParams = useSearchParams();
  const assignerEmail = searchParams.get("email");

  useEffect(() => {
    if (assignerEmail) {
      methods.setValue("email", assignerEmail);
    }
  }, [assignerEmail, methods]);

  const formatAcquisitionDate = (date: string) => {
    if (!date) return "";
    const d = new Date(date);
    return isNaN(d.getTime()) ? "" : d.toISOString().split("T")[0];
  };
  const { getOrCreateTeam } = useGetOrCreateTeam();
  const handleSaveMember = async (data: TeamMember) => {
    setButtonDisabled(true);
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
          const initialDni = initialData?.dni ?? "";
          const newDni = data.dni ?? "";

          if (newDni !== initialDni) {
            changes.dni = newDni;
          }
        } else if (data[key] !== initialData?.[key]) {
          if (key === "acquisitionDate" || key === "birthDate") {
            changes[key] = data[key] ? formatAcquisitionDate(data[key]) : null;
          } else {
            changes[key] = data[key];
          }
        }
      });

      if (changes.products) {
        delete changes.products;
      }

      if (isUpdate && initialData) {
        await updateMemberMutation.mutateAsync({
          id: initialData._id,
          data: { ...changes, ...(teamId && { team: teamId }) },
        });
      } else {
        if (data.personalEmail === "") {
          delete data.personalEmail;
        }
        const processedData = {
          ...data,
          ...(teamId && { team: teamId }),
        };
        if (processedData.dni !== undefined) {
          processedData.dni = String(processedData.dni);
        } else {
          processedData.dni = "";
        }
        await createMemberMutation.mutateAsync(processedData);
      }

      await queryClient.refetchQueries({ queryKey: ["members"] });
      await queryClient.invalidateQueries({ queryKey: ["teams"] });

      closeAside();

      // Actualiza el estado global de MobX si es necesario
      const updatedMembers = queryClient.getQueryData<TeamMember[]>([
        "members",
      ]);
      const updatedTeams = queryClient.getQueryData<Team[]>(["teams"]);

      const transformedMembers = transformData(updatedMembers, updatedTeams);

      setMembers(transformedMembers);
      setTeams(updatedTeams);

      closeAside();
    } catch (error: any) {
      console.error("Error al guardar miembro:", error);
    } finally {
      setButtonDisabled(false);
    }
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
              className="rounded-lg disabled:bg-hoverRed"
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
};

export default observer(MemberForm);
