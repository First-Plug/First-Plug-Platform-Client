"use client";
import { useState } from "react";
import { useStore } from "@/models/root.store";
import { Member, useCreateMember, useUpdateMember } from "@/features/members";
import { useGetOrCreateTeam } from "@/features/teams";
import { QueryClient } from "@tanstack/react-query";
import { type Team } from "@/types";
import { transformData } from "@/utils/dataTransformUtil";
import { formatAcquisitionDate } from "@/features/members";

export const useMemberSubmit = (initialData?: Member, isUpdate?: boolean) => {
  const {
    members: { setMembers },
    teams: { setTeams },
    aside: { closeAside },
  } = useStore();
  const queryClient = new QueryClient();
  const [isButtonDisabled, setButtonDisabled] = useState(false);

  const updateMemberMutation = useUpdateMember();
  const createMemberMutation = useCreateMember();
  const { getOrCreateTeam } = useGetOrCreateTeam();

  const handleSaveMember = async (data: Member) => {
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

      let changes: Partial<Member> = {};
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

      const updatedMembers = queryClient.getQueryData<Member[]>(["members"]);
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

  return {
    handleSaveMember,
    isButtonDisabled,
  };
};
