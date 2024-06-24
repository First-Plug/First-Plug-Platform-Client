"use client";
import React, { useState, useEffect } from "react";
import { Button, SearchInput } from "@/common";
import { observer } from "mobx-react-lite";
import { TeamMember, Product } from "@/types";
import { useStore } from "@/models";
interface AddMemberFormProps {
  members: TeamMember[];
  selectedMember?: TeamMember | null;
  handleSelectedMembers: (member: TeamMember | null) => void;
  currentProduct?: Product | null;
  currentMember?: TeamMember | null;
  showNoneOption?: boolean;
}

export const AddMemberForm = observer(function ({
  members = [],
  selectedMember,
  handleSelectedMembers,
  currentProduct,
  currentMember,
  showNoneOption,
}: AddMemberFormProps) {
  const [searchedMembers, setSearchedMembers] = useState<TeamMember[]>(members);
  const [noneOption, setNoneOption] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const {
    products: { reassignProduct },
    alerts: { setAlert },
    aside: { setAside },
  } = useStore();

  useEffect(() => {
    setSearchedMembers(members);
  }, [members]);

  const handleSearch = (query: string) => {
    setSearchedMembers(
      members.filter(
        (member) =>
          member.firstName.toLowerCase().includes(query.toLowerCase()) ||
          member.lastName.toLowerCase().includes(query.toLowerCase()) ||
          member.email.toLowerCase().includes(query.toLowerCase())
      )
    );
  };

  const displayedMembers = searchedMembers.filter(
    (member) => member.email !== currentMember?.email
  );

  const handleSaveClick = async () => {
    if (!currentProduct) return;

    if (selectedMember === null && !noneOption) {
      setValidationError("Please select a location");
      return;
    }

    let updatedProduct: Partial<Product> = {
      assignedEmail: "",
      assignedMember: "",
      status: "Available",
      location: noneOption,
      category: currentProduct.category,
      attributes: currentProduct.attributes,
      name: currentProduct.name,
    };

    if (selectedMember === null && noneOption) {
      try {
        await reassignProduct(currentProduct._id, updatedProduct);
        setAside(undefined);
        setAlert("assignedProductSuccess");
      } catch (error) {
        setAlert("errorAssignedProduct");
        console.error("Failed to reassign product", error);
      }
    } else if (selectedMember) {
      updatedProduct = {
        ...updatedProduct,
        assignedEmail: selectedMember.email,
        assignedMember:
          selectedMember.firstName + " " + selectedMember.lastName,
        status: "Delivered",
        location: "Employee",
      };

      if (currentProduct.assignedMember) {
        updatedProduct.lastAssigned =
          currentMember?.firstName + " " + currentMember?.lastName || "";
      }

      try {
        await reassignProduct(currentProduct._id, updatedProduct);
        setAside(undefined);
        setAlert("assignedProductSuccess");
      } catch (error) {
        setAlert("errorAssignedProduct");
      }
    }
  };

  const handleSelectNoneOption = (option: string) => {
    setNoneOption(option);
    setValidationError(null);
  };

  const handleSelectMember = (member: TeamMember | null) => {
    handleSelectedMembers(member);
    setNoneOption(null);
    setValidationError(null);
  };

  return (
    <section className="flex flex-col gap-6 h-full">
      <SearchInput placeholder="Search Member" onSearch={handleSearch} />
      <div className="flex flex-col gap-3 mt-3 flex-grow overflow-y-auto">
        {showNoneOption && (
          <>
            <div
              className={`flex gap-2 items-center py-2 px-4 border cursor-pointer rounded-md transition-all duration-300 hover:bg-hoverBlue ${
                selectedMember === null ? "bg-hoverBlue" : ""
              }`}
              onClick={() => {
                handleSelectMember(null);
              }}
            >
              <div className="flex gap-2">
                <p className="text-black font-bold">None</p>
              </div>
            </div>
            {selectedMember === null && (
              <div className="flex flex-col gap-2 ml-6">
                <div
                  className={`flex gap-2 items-center py-2 px-4 border cursor-pointer rounded-md transition-all duration-300 hover:bg-hoverBlue ${
                    noneOption === "FP warehouse" ? "bg-hoverBlue" : ""
                  }`}
                  onClick={() => handleSelectNoneOption("FP warehouse")}
                >
                  <div className="flex gap-2">
                    <p className="text-black font-bold">FP warehouse</p>
                  </div>
                </div>
                <div
                  className={`flex gap-2 items-center py-2 px-4 border cursor-pointer rounded-md transition-all duration-300 hover:bg-hoverBlue ${
                    noneOption === "Our office" ? "bg-hoverBlue" : ""
                  }`}
                  onClick={() => handleSelectNoneOption("Our office")}
                >
                  <div className="flex gap-2">
                    <p className="text-black font-bold">Our office</p>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
        {validationError && (
          <p className="text-red-500 text-md">{validationError}</p>
        )}
        {displayedMembers.map((member) => (
          <div
            className={`flex gap-2 items-center py-2 px-4 border cursor-pointer rounded-md transition-all duration-300 hover:bg-hoverBlue ${
              member.email === selectedMember?.email ? "bg-hoverBlue" : ""
            }`}
            key={member._id}
            onClick={() => {
              handleSelectedMembers(member);
            }}
          >
            <div className="flex gap-2">
              <p className="text-black font-bold">
                {member.firstName} {member.lastName}
              </p>
              <span className="text-dark-grey">
                {typeof member.team === "string"
                  ? member.team
                  : member.team?.name}
              </span>
            </div>
          </div>
        ))}
      </div>

      <aside className="absolute flex justify-end bg-white w-[80%] bottom-0 p-2 h-[10%] border-t space-x-4">
        <Button
          variant="secondary"
          size="big"
          className="flex-grow rounded-md"
          onClick={() => setAside(undefined)}
        >
          Cancel
        </Button>
        <Button
          variant="primary"
          size="big"
          className="flex-grow rounded-md"
          onClick={handleSaveClick}
        >
          Save
        </Button>
      </aside>
    </section>
  );
});
