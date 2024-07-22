"use client";
import React, { useState, useEffect } from "react";
import { Button, LoaderSpinner, SearchInput } from "@/common";
import { observer } from "mobx-react-lite";
import { TeamMember, Product, LOCATION, Location } from "@/types";
import { useStore } from "@/models";
import useFetch from "@/hooks/useFetch";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ProductServices } from "@/services";
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

  const [isAssigning, setIsAssigning] = useState(false);
  const {
    products: { reassignProduct },
    alerts: { setAlert },
    aside: { setAside },
  } = useStore();

  const { fetchMembers, fetchStock } = useFetch();

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
    setIsAssigning(true);
    try {
      if (selectedMember === null && noneOption) {
        await reassignProduct(currentProduct._id, updatedProduct);
        await fetchMembers();
        await fetchStock();
        setAside(undefined);
        setAlert("assignedProductSuccess");
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

        await ProductServices.updateProduct(currentProduct._id, updatedProduct);
        await fetchMembers();
        await fetchStock();
        setAside(undefined);
        setAlert("assignedProductSuccess");
      }
    } catch (error) {
      setAlert("errorAssignedProduct");
      console.error("Failed to reassign product", error);
    } finally {
      setIsAssigning(false);
    }
  };

  const handleSelectNoneOption = (option: string) => {
    handleSelectedMembers(null);
    setNoneOption(option);
    setValidationError(null);
  };

  const handleSelectMember = (member: TeamMember | null) => {
    handleSelectedMembers(member);
    setNoneOption(null);
    setValidationError(null);
  };

  return (
    <section className="flex flex-col gap-6 h-full ">
      <div className="h-[90%] w-full ">
        {showNoneOption && (
          <section className="flex flex-col gap-2">
            <span className="text-dark-grey font-medium">
              If you want to <strong>return</strong> this product, please select
              the new Location.
            </span>
            <Select
              onValueChange={(value) =>
                handleSelectNoneOption(value as Location)
              }
              value={noneOption || ""}
            >
              <SelectTrigger className="font-semibold text-md w-1/2">
                <SelectValue placeholder="Select Location" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectGroup>
                  <SelectLabel>Location</SelectLabel>
                  {LOCATION.filter((e) => e !== "Employee").map((location) => (
                    <SelectItem value={location} key={location}>
                      {location}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>

            <hr />
          </section>
        )}
        {validationError && (
          <p className="text-red-500 text-md">{validationError}</p>
        )}
        <div className="flex flex-col gap-4 items-start h-[92%]  ">
          {showNoneOption && (
            <p className="text-dark-grey font-medium">
              If you want to <strong>relocate</strong> this product, please
              select the <strong>employee</strong> to whom this item will be
              assigned.
            </p>
          )}

          <div className="w-full">
            <SearchInput
              placeholder="Search Member"
              onSearch={handleSearch}
              className="w-full"
            />
          </div>
          <div className="flex flex-col gap-2 w-full h-[95%] max-h-[95%] overflow-y-auto scrollbar-custom ">
            {displayedMembers.map((member) => (
              <div
                className={`flex gap-2 items-center py-2 px-4 border cursor-pointer rounded-md transition-all duration-300 hover:bg-hoverBlue `}
                key={member._id}
                onClick={() => handleSelectMember(member)}
              >
                <input
                  type="checkbox"
                  checked={member._id === selectedMember?._id}
                />
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
        </div>
      </div>

      <aside className=" absolute  bg-white  py-2    bottom-0   left-0 w-full border-t ">
        <div className="flex    w-5/6 mx-auto gap-2 justify-end">
          <Button
            variant="secondary"
            className="px-8"
            onClick={() => setAside(undefined)}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            className="px-8"
            onClick={handleSaveClick}
            disabled={(!selectedMember && !noneOption) || isAssigning}
          >
            {isAssigning ? <LoaderSpinner /> : "Save"}
          </Button>
        </div>
      </aside>
    </section>
  );
});
