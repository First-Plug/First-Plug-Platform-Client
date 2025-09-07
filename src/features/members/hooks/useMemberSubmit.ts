"use client";
import { useState } from "react";
import { useAsideStore } from "@/shared";
import { Member, useCreateMember, useUpdateMember } from "@/features/members";
import { useGetOrCreateTeam } from "@/features/teams";
import { QueryClient } from "@tanstack/react-query";
import { type Team } from "@/features/teams";

import { formatAcquisitionDate } from "@/features/members";

export const useMemberSubmit = (initialData?: Member, isUpdate?: boolean) => {
  const { closeAside } = useAsideStore();
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
        (data.team as string).trim() !== ""
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
          data: {
            ...changes,
            ...(teamId && { team: teamId }),
          } as unknown as Member,
        });
      } else {
        if (data.personalEmail === "") {
          delete data.personalEmail;
        }
        const processedData = {
          ...data,
          ...((teamId && { team: teamId }) as unknown as Team),
        };
        if (processedData.dni !== undefined) {
          processedData.dni = String(processedData.dni);
        } else {
          processedData.dni = "";
        }
        await createMemberMutation.mutateAsync(processedData);
      }

      await queryClient.invalidateQueries({
        queryKey: ["member", initialData?._id],
      });
      await queryClient.invalidateQueries({
        queryKey: ["members", initialData?._id],
      });
      await queryClient.invalidateQueries({
        queryKey: ["shipments"],
      });
      await queryClient.refetchQueries({ queryKey: ["members"] });
      await queryClient.invalidateQueries({ queryKey: ["teams"] });

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
