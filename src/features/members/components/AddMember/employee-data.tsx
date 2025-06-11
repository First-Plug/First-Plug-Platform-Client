"use client";
import { useEffect, useState } from "react";

import { useQueryClient } from "@tanstack/react-query";
import { useFormContext, Controller } from "react-hook-form";

import { Button, SectionTitle, CustomLink, BarLoader } from "@/shared";
import { type Member } from "@/features/members";
import { useCreateTeam, useFetchTeams } from "@/features/teams";

import { InputProductForm, DropdownInputProductForm } from "@/features/assets";

export const EmployeeData = ({
  isUpdate,
  initialData,
}: {
  isUpdate: boolean;
  initialData: Member;
}) => {
  const {
    setValue,
    watch,
    control,
    formState: { errors },
    clearErrors,
  } = useFormContext();

  const [teamValue, setTeamValue] = useState(
    (initialData?.team as string) || ""
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTeamName, setNewTeamName] = useState("");

  const { data: teams = [], isLoading, isError } = useFetchTeams();

  const createTeamMutation = useCreateTeam();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (initialData?.team) {
      const teamName =
        typeof initialData.team === "object"
          ? initialData.team.name
          : initialData.team;
      setTeamValue(teamName);
      setValue("team", teamName);
    }
  }, [initialData, setValue]);

  const handleTeamChange = (value: string) => {
    setTeamValue(value);
    setValue("team", value);
    clearErrors("team");
  };

  const handleCreateTeam = () => {
    setIsModalOpen(true);
  };

  const handleSaveNewTeam = async () => {
    await createTeamMutation.mutateAsync(
      { name: newTeamName },
      {
        onSuccess: (newTeam) => {
          queryClient.invalidateQueries({ queryKey: ["teams"] });

          setTeamValue(newTeam.name);
          setValue("team", newTeam.name);
          setNewTeamName("");
          setIsModalOpen(false);
        },
        onError: (error) => {
          console.error("Error al crear el equipo:", error);
        },
      }
    );
  };

  if (isLoading) return <BarLoader />;
  if (isError) return <div>Error cargando los equipos</div>;

  return (
    <div>
      <SectionTitle>Employee information</SectionTitle>

      <div
        className={`grid gap-2 ${
          isUpdate ? "grid-cols-1 sm:grid-cols-3" : "grid-cols-1 lg:grid-cols-4"
        }`}
        // className={"grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
      >
        <Controller
          name="team"
          control={control}
          render={({ field: { onChange, value } }) => (
            <>
              <DropdownInputProductForm
                name="team"
                options={
                  Array.isArray(teams) ? teams.map((team) => team.name) : []
                }
                placeholder="Team Name"
                title="Select a Team"
                selectedOption={teamValue}
                onChange={handleTeamChange}
                searchable={true}
              />
              {errors.team && (
                <p className="text-red-500">{String(errors.team?.message)}</p>
              )}
            </>
          )}
        />
        <Controller
          name="position"
          control={control}
          render={({ field }) => (
            <>
              <InputProductForm
                placeholder="Job Position"
                title="Job Position"
                type="text"
                value={field.value || ""}
                onChange={(e) => field.onChange(e.target.value)}
                disabled={!teamValue}
              />
              {errors.position && (
                <p className="text-red-500">
                  {String(errors.position?.message)}
                </p>
              )}
            </>
          )}
        />

        <Controller
          name="startDate"
          control={control}
          render={({ field }) => (
            <InputProductForm
              placeholder="Start Date"
              title="Start Date"
              type="date"
              value={field.value || ""}
              onChange={(e) => field.onChange(e.target.value)}
              allowFutureDates={true}
            />
          )}
        />
      </div>
      <div className="mt-4">
        <p className="font-inter text-[16px] text-dark-grey">
          Does the team not exist yet?{" "}
          <button
            onClick={handleCreateTeam}
            className="focus:outline-none text-blue-500"
          >
            <CustomLink href="" variant="text">
              Create Team
            </CustomLink>
          </button>
        </p>
      </div>
      {isModalOpen && (
        <div className="z-50 fixed inset-0 flex justify-center items-center bg-gray-600 bg-opacity-50">
          <div className="bg-white shadow-md p-4 rounded">
            <h2 className="mb-4 font-bold text-lg">New Team</h2>
            <input
              type="text"
              placeholder="Team Name"
              value={newTeamName}
              onChange={(e) => setNewTeamName(e.target.value)}
              className="mb-4 p-2 border w-full"
            />
            <div className="flex justify-around">
              <Button
                body="Cancel"
                variant="secondary"
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg w-[150px] h-[40px]"
              />

              <Button
                body="Create"
                variant="primary"
                onClick={handleSaveNewTeam}
                className="ml-2 rounded-lg w-[150px] h-[40px]"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
