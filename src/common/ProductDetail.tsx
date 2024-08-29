"use client";
import React, { useRef, useState } from "react";
import { Product, Team, TeamMember } from "@/types";
import { ProductImage } from "./ProductImage";
import PrdouctModelDetail from "./PrdouctModelDetail";
import { useStore } from "@/models";
import { SearchInput } from "./SearchInput";
import { Button } from "./Button";
import { ArrowLeft } from "./Icons";
import { observer } from "mobx-react-lite";
import { clone, isAlive } from "mobx-state-tree";
import { LoaderSpinner } from "./LoaderSpinner";
import { Badge, badgeVariants } from "@/components/ui/badge";
import useActions from "@/hooks/useActions";
import useFetch from "@/hooks/useFetch";
import { XIcon } from "lucide-react";
import CategoryIcons from "@/components/AsideContents/EditTeamAside/CategoryIcons";
export type RelocateStatus = "success" | "error" | undefined;
const MembersList = observer(function MembersList({
  product,
  setRelocateStauts,
  addTaskToQueue,
  disabled,
  onRelocateSuccess,
}: {
  product: Product;
  setRelocateStauts: (status: RelocateStatus) => void;
  addTaskToQueue: (task: () => Promise<void>, productId) => void;
  disabled?: boolean;
  onRelocateSuccess?: () => void;
}) {
  const {
    members: { members, selectedMember: currentMember, setRelocateChange },
  } = useStore();
  const [searchedMembers, setSearchedMembers] = useState<TeamMember[]>(members);
  const [isRelocating, setRelocating] = useState(false);
  const [relocateResult, setRelocateResult] =
    useState<RelocateStatus>(undefined);
  const [selectedMember, setSelectedMember] = useState<TeamMember>();
  const { handleReassignProduct } = useActions();
  const { fetchMembers } = useFetch();
  const clonedProduct = clone(product);

  const handleSelectMember = (member: TeamMember) => {
    setSelectedMember(member);
  };

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

  const handleRelocateProduct = async () => {
    if (selectedMember) {
      const task = async () => {
        setRelocating(true);
        try {
          await handleReassignProduct({
            currentMember,
            selectedMember,
            product: clonedProduct,
          });
          // await fetchMembers();
          setRelocateResult("success");
          setRelocateStauts("success");
          if (onRelocateSuccess) {
            onRelocateSuccess();
          }
        } catch (error) {
          setRelocateResult("error");
          setRelocateStauts("error");
        } finally {
          setRelocating(false);
        }
      };
      addTaskToQueue(task, product._id);
      setRelocating(true);
    }
  };

  return (
    <section>
      {selectedMember ? (
        <section className="flex justify-between w-full py-2">
          <div className="flex items-center gap-2">
            <span className="font-extralight">Relocate To:</span>
            <button
              className="border border-light-grey rounded-md px-2 py-1 bg-hoverBlue flex items-center gap-2 cursor-pointer "
              disabled={
                isRelocating ||
                relocateResult === "success" ||
                !selectedMember ||
                disabled
              }
              onClick={() => setSelectedMember(null)}
            >
              <p className="font-semibold text-black">
                {selectedMember.fullName}
              </p>

              <XIcon size={14} />
            </button>
          </div>

          {!relocateResult ? (
            <Button
              variant="text"
              onClick={handleRelocateProduct}
              disabled={
                isRelocating ||
                relocateResult === "success" ||
                !selectedMember ||
                disabled
              }
            >
              {!isRelocating ? <span>Confirm ✔️</span> : <LoaderSpinner />}
            </Button>
          ) : (
            <Badge className={badgeVariants({ variant: relocateResult })}>
              Successfully relocated ✅
            </Badge>
          )}
        </section>
      ) : (
        <div className="flex flex-col gap-2 items-start h-full">
          <p className="text-dark-grey mx-2">
            Please select the employee to whom this item will be assigned
          </p>

          <div>
            <SearchInput placeholder="Search Member" onSearch={handleSearch} />
          </div>
          <div className="flex flex-col gap-2 w-full max-h-[250px] h-[250px] overflow-y-auto pt-4">
            {displayedMembers
              .filter((m) => m._id !== currentMember._id)
              .map((member) => (
                <div
                  className={`flex gap-2 items-center py-2 px-4 border cursor-pointer rounded-md transition-all duration-300 hover:bg-hoverBlue `}
                  key={member._id}
                  onClick={() => handleSelectMember(member)}
                >
                  {selectedMember && (
                    <input
                      type="checkbox"
                      checked={member._id === selectedMember._id}
                      onChange={() => handleSelectMember(member)}
                    />
                  )}
                  <div className="flex gap-2">
                    <p className="text-black font-bold">
                      {member.firstName} {member.lastName}
                    </p>
                    <span className="text-dark-grey">
                      {typeof member.team === "string"
                        ? member.team
                        : member.team?.name}
                    </span>
                    <CategoryIcons products={member.products} />
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </section>
  );
});
interface ProductDetailProps {
  product: Product;
  className?: string;
  isChecked?: boolean;
  isRelocating?: boolean;
  handleSelect?: (productId: Product) => void;
  setProductToRemove?: (product: Product) => void;
  selectedProducts?: Product[];
  addTaskToQueue?: (task: () => Promise<void>, productId) => void;
  onRelocateSuccess?: () => void;
  disabled?: boolean;
}
export default function ProductDetail({
  product,
  className = "",
  handleSelect,
  isChecked = false,
  setProductToRemove,
  isRelocating = false,
  addTaskToQueue,
  onRelocateSuccess,
  disabled,
}: ProductDetailProps) {
  const clonedProduct = useRef(clone(product)).current;
  const [showList, setShowList] = useState(false);
  const [relocateStatus, setRelocateStauts] =
    useState<RelocateStatus>(undefined);

  const toggleList = () => setShowList(!showList);

  return (
    <div
      className={`relative flex flex-col gap-2 border rounded-md p-2 mr-2 text-black mb-2 transition-all duration-300  ${className} ${
        handleSelect || isRelocating
          ? "cursor-pointer hover:border-blue/80 "
          : ""
      }  ${isChecked && "bg-blue/80 text-white"}`}
      onClick={handleSelect ? () => handleSelect(product) : null}
    >
      <div className="flex items-center  justify-between  ">
        <section className="flex items-center  gap-2  ">
          <section className="flex gap-2 items-start">
            <div className="flex gap-2 items-start">
              <ProductImage category={clonedProduct.category} />
              <span className="font-semibold">{clonedProduct.category}</span>
            </div>

            <hr />

            <PrdouctModelDetail product={clonedProduct} />
          </section>
          {isRelocating && (
            <Button
              variant="outline"
              className="text-black absolute right-0 hover:bg-hoverBlue/50 rounded-sm"
              onClick={toggleList}
              disabled={relocateStatus === "success"}
            >
              <p className="text-sm">Select Member</p>
              <ArrowLeft
                className={`w-6 ${
                  showList ? "rotate-[270deg]" : "rotate-180"
                } transition-all duration-300`}
              />
            </Button>
          )}
        </section>
      </div>
      {isRelocating && showList && <hr />}

      {isRelocating && showList && (
        <MembersList
          product={clonedProduct}
          setRelocateStauts={setRelocateStauts}
          addTaskToQueue={addTaskToQueue}
          onRelocateSuccess={onRelocateSuccess}
          disabled={disabled}
        />
      )}
    </div>
  );
}
