"use Client";
import React, { useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import { Button, SectionTitle } from "@/common";
import { InputProductForm } from "../AddProduct/InputProductForm";
import { CustomLink } from "@/common";
import { useFormContext, Controller } from "react-hook-form";
import { DropdownInputProductForm } from "../AddProduct/DropDownProductForm";
import { TeamServices } from "@/services/team.services";

const EmployeeData = function ({ isUpdate, initialData }) {
  const {
    setValue,
    watch,
    control,
    formState: { errors },
    clearErrors,
  } = useFormContext();

  const [teamValue, setTeamValue] = useState(initialData?.team || "");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTeamName, setNewTeamName] = useState("");
  const [teams, setTeams] = useState<string[]>([]);

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const allTeams = await TeamServices.getAllTeams();
        setTeams(allTeams.map((team) => team.name));

        if (initialData?.team) {
          const teamName =
            typeof initialData.team === "object"
              ? initialData.team.name
              : initialData.team;
          setTeamValue(teamName);
          setValue("team", teamName);
        }
      } catch (error) {
        throw error;
      }
    };

    fetchTeams();
  }, [setTeams, setValue, initialData]);

  const handleTeamChange = (value: string) => {
    setTeamValue(value);
    setValue("team", value);
    clearErrors("team");
  };

  const handleCreateTeam = () => {
    setIsModalOpen(true);
  };

  const handleSaveNewTeam = () => {
    setTeams([...teams, newTeamName]);
    setTeamValue(newTeamName);
    setValue("team", newTeamName);
    setNewTeamName("");
    setIsModalOpen(false);
  };

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
                options={teams}
                placeholder="Team Name"
                title="Select a Team"
                selectedOption={teamValue}
                onChange={handleTeamChange}
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
            className="text-blue-500 focus:outline-none"
          >
            <CustomLink href="" variant="text">
              Create Team
            </CustomLink>
          </button>
        </p>
      </div>
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-600 bg-opacity-50 z-50">
          <div className="bg-white p-4 rounded shadow-md">
            <h2 className="text-lg font-bold mb-4">New Team</h2>
            <input
              type="text"
              placeholder="Team Name"
              value={newTeamName}
              onChange={(e) => setNewTeamName(e.target.value)}
              className="border p-2 w-full mb-4"
            />
            <div className="flex justify-around">
              <Button
                body="Cancel"
                variant="secondary"
                onClick={() => setIsModalOpen(false)}
                className="w-[150px] h-[40px] rounded-lg"
              />

              <Button
                body="Create"
                variant="primary"
                onClick={handleSaveNewTeam}
                className="w-[150px] h-[40px] rounded-lg ml-2"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default observer(EmployeeData);
