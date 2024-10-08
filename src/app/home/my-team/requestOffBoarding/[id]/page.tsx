"use client";

import { Button } from "@/common";
import { useEffect, useState } from "react";
import { Memberservices } from "@/services";
import { Product, TeamMember } from "@/types";
import { RequestOffBoardingForm } from "../../../../../components/RequestOffBoarding/Request-off-boarding-form";
import { useStore } from "../../../../../models/root.store";

const DROPDOWN_OPTIONS = ["My office", "FP warehouse", "New member"] as const;

type DropdownOption = (typeof DROPDOWN_OPTIONS)[number];

export interface ProductOffBoarding {
  product: Product;
  relocation: DropdownOption;
  available: boolean;
  newMember?: any;
}

export default function Page({ params }: { params: { id: string } }) {
  const [selectedMember, setSelectedMember] = useState<TeamMember>(null);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [products, setProducts] = useState<ProductOffBoarding[]>([]);
  const {
    members: { setMemberOffBoarding },
  } = useStore();

  useEffect(() => {
    Memberservices.getAllMembers().then(setMembers);
    Memberservices.getOneMember(params.id).then((res) => {
      setMemberOffBoarding(`${res.firstName} ${res.lastName}`);
      setSelectedMember(res);
    });
  }, [params.id]);

  useEffect(() => {
    const storedProducts = localStorage.getItem(`products_${params.id}`);
    if (storedProducts) {
      setProducts(JSON.parse(storedProducts));
    }
  }, [params.id]);

  useEffect(() => {
    // Guardar productos en localStorage cuando cambien
    localStorage.setItem(`products_${params.id}`, JSON.stringify(products));
  }, [products, params.id]);

  const recoverableProducts =
    selectedMember?.products?.filter(
      (product) => product.recoverable === true
    ) || [];

  const isAvailable =
    products.length > 0 &&
    products.every((product) => product.available) &&
    products.length === recoverableProducts.length;

  const [assignAll, setAssignAll] = useState(false);

  const handleAssignAllChange = () => {};

  return (
    <div className="min-h-[90vh] flex flex-col gap-4">
      <div className="flex gap-4">
        <div className="">
          <h2>
            All recoverable assets will be requested and the member will be
            removed from your team.
          </h2>

          <span>Please confirm the relocation of each product.</span>
        </div>
        <div className="flex items-center">
          <input
            type="checkbox"
            className="mr-2"
            checked={assignAll}
            onChange={handleAssignAllChange}
          />

          <p className="text-md font-semibold">
            Apply &quot;Product 1&quot; settings to all Products
          </p>
        </div>
      </div>

      <div className="flex-1">
        {selectedMember?.products
          ?.filter((product) => product.recoverable === true)
          .map((product, index) => {
            const initialProduct =
              products.find((p) => p.product._id === product._id) || null;

            return (
              <RequestOffBoardingForm
                key={product._id}
                product={product}
                index={index}
                setProducts={setProducts}
                initialValue={initialProduct}
                members={members}
              />
            );
          })}
      </div>

      <section className="py-6 border-t">
        <div className="flex items-center justify-end">
          <Button
            variant="primary"
            className="mr-[39px] w-[200px] h-[40px] rounded-lg"
            type="submit"
            disabled={!isAvailable}
          >
            Save
          </Button>
        </div>
      </section>
    </div>
  );
}
