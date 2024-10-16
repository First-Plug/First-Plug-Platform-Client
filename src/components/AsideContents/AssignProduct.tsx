"use client";
import { useStore } from "@/models";
import { AddMemberForm } from "../AddMemberForm";
import { useEffect, useState } from "react";
import { Product, TeamMember } from "@/types";
import { observer } from "mobx-react-lite";
import { Memberservices, ProductServices } from "@/services";
import { setAuthInterceptor } from "@/config/axios.config";
import { Skeleton } from "../ui/skeleton";
import { useFetchAssetById } from "@/assets/hooks";
import { useFetchMembers } from "@/members/hooks";

export const AssignProduct = observer(() => {
  const {
    products: { currentProductId },
    aside: { type },
  } = useStore();

  const {
    data: product,
    isLoading: loadingProduct,
    error: productError,
  } = useFetchAssetById(currentProductId);
  const {
    data: members,
    isLoading: loadingMembers,
    error: membersError,
  } = useFetchMembers();

  const [member, setMember] = useState<TeamMember | null>(null);
  const [selectedProdcut, setSelectedPrduct] = useState<Product>();
  const [filteredMembers, setFilteredMembers] = useState<TeamMember[]>([]);

  useEffect(() => {
    if (product && members) {
      const filtered = members.filter(
        (member) => member.email !== product.assignedEmail
      );
      setFilteredMembers(filtered);
    }
  }, [product, members]);

  const handleSelectedMembers = (selectedMember: TeamMember | null) => {
    setMember(selectedMember);
  };

  if (loadingProduct || loadingMembers) {
    return (
      <div className="h-full w-full flex flex-col gap-2">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="flex-grow w-full" />
      </div>
    );
  }

  if (productError || membersError) {
    return (
      <div className="text-red-500">Failed to load data. Please try again.</div>
    );
  }

  return (
    <div className="flex flex-col gap-2 h-full">
      <AddMemberForm
        selectedMember={member}
        handleSelectedMembers={handleSelectedMembers}
        members={filteredMembers}
        currentProduct={product}
        showNoneOption={type === "ReassignProduct"}
      />
    </div>
  );
});
