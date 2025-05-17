"use client";
import React, { useState } from "react";
import type { Product, Team, TeamMember } from "@/types";
import { ProductImage } from "./ProductImage";
import PrdouctModelDetail from "./PrdouctModelDetail";
import { useStore } from "@/models";
import { SearchInput } from "./SearchInput";
import { Button } from "./Button";
import { ArrowLeft } from "./Icons";
import { observer } from "mobx-react-lite";
import { LoaderSpinner } from "./LoaderSpinner";
import { Badge, badgeVariants } from "@/components/ui/badge";
import useActions from "@/hooks/useActions";
import { XIcon } from "lucide-react";
import CategoryIcons from "@/components/AsideContents/EditTeamAside/CategoryIcons";
import { useQueryClient } from "@tanstack/react-query";
import GenericAlertDialog from "@/components/AddProduct/ui/GenericAlertDialog";
import { useRouter } from "next/navigation";
import {
  buildValidationEntities,
  validateAfterAction,
} from "@/lib/validateAfterAction";
import { useShipmentValues } from "@/shipments/hooks/useShipmentValues";
import { ShipmentWithFp } from "@/shipments/components";
import { ShipmentStateColors, StatusColors } from "./StatusColors";

export type RelocateStatus = "success" | "error" | undefined;
const MembersList = observer(function MembersList({
  product,
  setRelocateStauts,
  disabled,
  onRelocateSuccess,
  handleSuccess,
}: {
  product: Product;
  setRelocateStauts: (status: RelocateStatus) => void;
  disabled?: boolean;
  onRelocateSuccess?: () => void;
  handleSuccess?: () => void;
}) {
  const {
    members: {
      members,
      selectedMember: currentMember,
      setRelocateChange,
      setMemberToEdit,
    },
    aside: { setAside },
    user: { user: sessionUser },
  } = useStore();
  const [searchedMembers, setSearchedMembers] = useState<TeamMember[]>(members);
  const [isRelocating, setRelocating] = useState(false);
  const [relocateResult, setRelocateResult] =
    useState<RelocateStatus>(undefined);
  const [selectedMember, setSelectedMember] = useState<TeamMember>();
  const { handleReassignProduct } = useActions();
  const queryClient = useQueryClient();
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [missingMemberData, setMissingMemberData] = useState("");
  const [genericAlertData, setGenericAlertData] = useState({
    title: "",
    description: "",
    isOpen: false,
  });
  const router = useRouter();

  const { isShipmentValueValid, onSubmitDropdown, shipmentValue } =
    useShipmentValues();

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
    if (!selectedMember) return;

    const sessionUserData = {
      country: sessionUser?.country,
      city: sessionUser?.city,
      state: sessionUser?.state,
      zipCode: sessionUser?.zipCode,
      address: sessionUser?.address,
    };

    const currentHolder = members.find(
      (member) => member.email === product.assignedEmail
    );
    const flattenedCurrentHolder = currentHolder
      ? JSON.parse(JSON.stringify(currentHolder))
      : null;

    const flattenedSelectedMember = selectedMember
      ? JSON.parse(JSON.stringify(selectedMember))
      : null;

    const { source, destination } = buildValidationEntities(
      product,
      members,
      flattenedSelectedMember,
      sessionUserData,
      null
    );

    if (!source || !source.data) {
      source.data = flattenedCurrentHolder || {
        firstName: product.assignedMember?.split(" ")[0] || "",
        lastName: product.assignedMember?.split(" ")[1] || "",
        email: product.assignedEmail,
      };
    }

    const missingMessages = validateAfterAction(source, destination);

    if (missingMessages.length > 0) {
      const formattedMessages = missingMessages
        .map(
          (message) =>
            `<div class="mb-2"><span>${message
              .replace(
                /Current holder \((.*?)\)/,
                "Current holder (<strong>$1</strong>)"
              )
              .replace(
                /Assigned member \((.*?)\)/,
                "Assigned member (<strong>$1</strong>)"
              )
              .replace(
                /Assigned location \((.*?)\)/,
                "Assigned location (<strong>$1</strong>)"
              )}</span></div>`
        )
        .join("");

      setGenericAlertData({
        title:
          "The relocation was completed successfully, but details are missing",
        description: formattedMessages,
        isOpen: true,
      });
      console.warn("Validation warnings detected, proceeding with relocation.");
    }

    setRelocating(true);
    try {
      const productToSend = {
        ...product,
        fp_shipment: shipmentValue.shipment === "yes",
        desirableDate: {
          origin: shipmentValue.pickupDate,
          destination: shipmentValue.deliveredDate,
        },
        status: product.status,
      };

      await handleReassignProduct({
        currentMember,
        selectedMember,
        product: productToSend,
      });

      queryClient.invalidateQueries({ queryKey: ["members"] });
      queryClient.invalidateQueries({ queryKey: ["assets"] });

      setRelocateResult("success");
      setRelocateStauts("success");
      handleSuccess();
    } catch (error) {
      setRelocateResult("error");
      setRelocateStauts("error");
    } finally {
      setRelocating(false);
    }
  };

  return (
    <section>
      <GenericAlertDialog
        open={genericAlertData.isOpen}
        onClose={() =>
          setGenericAlertData((prev) => ({ ...prev, isOpen: false }))
        }
        title={genericAlertData.title || "Warning"}
        description={genericAlertData.description || ""}
        buttonText="OK"
        onButtonClick={() =>
          setGenericAlertData((prev) => ({ ...prev, isOpen: false }))
        }
        isHtml={true}
      />
      <GenericAlertDialog
        open={showErrorDialog}
        onClose={() => setShowErrorDialog(false)}
        title="Please complete the missing data: "
        description={missingMemberData}
        buttonText="Update Member"
        onButtonClick={() => {
          router.push(`/home/my-team`);
          setMemberToEdit(selectedMember._id);
          setAside("EditMember");
          setShowErrorDialog(false);
        }}
      />
      {selectedMember ? (
        <section className="flex justify-between items-end w-full gap-6 pb-2">
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

          <div className="flex-1">
            <ShipmentWithFp onSubmit={onSubmitDropdown} />
          </div>

          {relocateResult === "success" ? (
            <Badge className={badgeVariants({ variant: relocateResult })}>
              Successfully relocated ✅
            </Badge>
          ) : (
            <Button
              variant="text"
              onClick={handleRelocateProduct}
              disabled={
                isRelocating ||
                relocateResult !== undefined ||
                !selectedMember ||
                disabled ||
                !isShipmentValueValid()
              }
            >
              {isRelocating ? <LoaderSpinner /> : <span>Confirm ✔️</span>}
            </Button>
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
  onRelocateSuccess?: () => void;
  disabled?: boolean;
  isOffboardingStyles?: boolean;
}
export default function ProductDetail({
  product,
  className = "",
  handleSelect,
  isChecked = false,
  setProductToRemove,
  isRelocating = false,
  onRelocateSuccess,
  disabled,
  isOffboardingStyles,
}: ProductDetailProps) {
  const [showList, setShowList] = useState(false);
  const [relocateStatus, setRelocateStauts] =
    useState<RelocateStatus>(undefined);

  const toggleList = () => setShowList(!showList);

  const colorClass = `${StatusColors[ShipmentStateColors[product.status]]}`;

  return (
    <div
      className={`relative flex flex-col gap-2 border rounded-md p-2 mr-2 text-black mb-2 transition-all duration-300  ${className} ${
        (handleSelect && !product.activeShipment) ||
        (isRelocating && !product.activeShipment)
          ? "cursor-pointer hover:border-blue/80 "
          : ""
      }  ${isChecked && "bg-blue/80 text-white"}`}
      onClick={handleSelect ? () => handleSelect(product) : null}
    >
      <div className="flex items-center  justify-between  ">
        <section className="flex items-center  gap-2  ">
          <section className="flex gap-2 items-start">
            <div className="flex gap-2 items-start">
              <ProductImage category={product?.category} />
              <span className="font-semibold">{product?.category}</span>
            </div>

            <hr />

            <PrdouctModelDetail
              product={product}
              isOffboardingStyles={isOffboardingStyles}
            />
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
      {product.origin && (
        <div
          className={`text-md font-semibold italic mt-2 ${colorClass} py-2 px-4 rounded-sm flex justify-center items-center`}
        >
          <span>
            {product.status} from {product.origin}
          </span>
        </div>
      )}
      {isRelocating && showList && <hr />}

      {isRelocating && showList && (
        <MembersList
          product={product}
          setRelocateStauts={setRelocateStauts}
          onRelocateSuccess={onRelocateSuccess}
          disabled={disabled}
          handleSuccess={onRelocateSuccess}
        />
      )}
    </div>
  );
}
