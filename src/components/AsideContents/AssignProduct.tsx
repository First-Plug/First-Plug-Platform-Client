"use client";
import { useStore } from "@/models";
import { AddMemberForm } from "../AddMemberForm";
import { useEffect, useState } from "react";
import { Product } from "@/types";
import { observer } from "mobx-react-lite";
import { Skeleton } from "@/shared";
import { useFetchAssetById } from "@/features/assets";
import { useFetchMembers } from "@/features/members";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/common";
import { Member } from "@/features/members";

export const AssignProduct = observer(() => {
  const {
    products: { currentProductId },
    aside: { type },
  } = useStore();

  const queryClient = useQueryClient();

  const {
    data: product,
    isLoading: loadingProduct,
    error: productError,
    refetch: refetchProduct,
    isError: isProductError,
  } = useFetchAssetById(currentProductId);

  const {
    data: members,
    isLoading: loadingMembers,
    error: membersError,
    refetch: refetchMembers,
    isError: isMembersError,
  } = useFetchMembers();

  const [member, setMember] = useState<Member | null>(null);
  const [selectedProdcut, setSelectedPrduct] = useState<Product>();
  const [filteredMembers, setFilteredMembers] = useState<Member[]>([]);

  useEffect(() => {
    if (product && members) {
      const filtered = members.filter(
        (member) => member.email !== product.assignedEmail
      );
      setFilteredMembers(filtered);
    }
  }, [product, members]);

  useEffect(() => {
    if (!loadingProduct && !productError && !product) {
      queryClient.invalidateQueries({ queryKey: ["asset", currentProductId] });
      refetchProduct();
    }

    if (
      !loadingMembers &&
      !membersError &&
      (!members || members.length === 0)
    ) {
      queryClient.invalidateQueries({ queryKey: ["members"] });
      refetchMembers();
    }
  }, [
    loadingProduct,
    productError,
    product,
    loadingMembers,
    membersError,
    members,
    queryClient,
    currentProductId,
    refetchProduct,
    refetchMembers,
  ]);

  const handleSelectedMembers = (selectedMember: Member | null) => {
    setMember(selectedMember);
  };

  const handleRetry = () => {
    if (isProductError) refetchProduct();
    if (isMembersError) refetchMembers();
  };

  if (loadingProduct || loadingMembers) {
    return (
      <div className="flex flex-col gap-2 w-full h-full">
        <Skeleton className="w-full h-12" />
        <Skeleton className="flex-grow w-full" />
      </div>
    );
  }

  if (productError || membersError) {
    return (
      <div className="flex flex-col justify-center items-center h-full">
        <div className="mb-4 text-red-500">Opps! Something went wrong</div>
        <Button
          type="button"
          onClick={handleRetry}
          className="px-6 py-4"
          variant="primary"
        >
          Try again
        </Button>
      </div>
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
        actionType={type as "AssignProduct" | "ReassignProduct"}
      />
    </div>
  );
});
