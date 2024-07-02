"use client";
import { useStore } from "@/models";
import { AddMemberForm } from "../AddMemberForm";
import { useEffect, useState } from "react";
import { Product, TeamMember } from "@/types";
import { observer } from "mobx-react-lite";
import { Memberservices, ProductServices } from "@/services";
import { LoaderSpinner } from "@/common";
import { setAuthInterceptor } from "@/config/axios.config";

export const AssignProduct = observer(() => {
  const {
    products: { currentProductId },
    aside: { type },
  } = useStore();
  const [member, setMember] = useState<TeamMember | null>(null);
  const [selectedProdcut, setSelectedPrduct] = useState<Product>();
  const [filteredMembers, setFilteredMembers] = useState<TeamMember[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      if (sessionStorage.getItem("accessToken")) {
        setAuthInterceptor(sessionStorage.getItem("accessToken"));
        try {
          const productRes = await ProductServices.getProductById(
            currentProductId
          );
          setSelectedPrduct(productRes);

          if (!productRes || !productRes._id) return;

          const members = await Memberservices.getAllMembers();

          const filteredMembers = members.filter(
            (member) => member.email !== productRes.assignedEmail
          );
          setFilteredMembers(filteredMembers);
        } catch (err) {
          console.log(err);
          console.error("Failed to get product for assign", err);
          setError("Failed to load product data. Please try again.");
        } finally {
          setLoading(false);
        }
      }
    };

    fetchData();
  }, []);

  const handleSelectedMembers = (selectedMember: TeamMember | null) => {
    setMember(selectedMember);
  };

  if (loading) {
    return (
      <div className="h-full w-full flex flex-col justify-center items-center gap-2">
        <LoaderSpinner size="bg" />
        <p>Loading.. </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 h-full">
      {error ? (
        <div className="text-red-500">{error}</div>
      ) : (
        <AddMemberForm
          selectedMember={member}
          handleSelectedMembers={handleSelectedMembers}
          members={filteredMembers}
          currentProduct={selectedProdcut}
          showNoneOption={type === "ReassignProduct"}
        />
      )}
    </div>
  );
});
