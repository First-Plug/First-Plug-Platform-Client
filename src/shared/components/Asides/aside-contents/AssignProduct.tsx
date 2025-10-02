"use client";

import { useEffect, useState } from "react";
import { Product } from "@/features/assets";

import { Skeleton } from "@/shared";
import { useFetchAssetById } from "@/features/assets";
import { useFetchMembers } from "@/features/members";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/shared";
import { Member, AddMemberForm } from "@/features/members";
import { useAsideStore } from "@/shared";

export const AssignProduct = function () {
  const { getCurrentAside } = useAsideStore();
  const currentAside = getCurrentAside();
  const type = currentAside?.type;

  const queryClient = useQueryClient();

  const currentProductId = queryClient.getQueryData<Product>([
    "selectedProduct",
  ])?._id;

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
};
