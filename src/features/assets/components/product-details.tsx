"use client";
import React, { useState } from "react";
import type { Product } from "@/features/assets";
import { ProductImage } from "./product-image";
import { PrdouctModelDetail } from "./product-model-details";
import { SearchInput } from "@/shared";
import { Button, ArrowLeft, LoaderSpinner } from "@/shared";

import { Badge, badgeVariants } from "@/shared";
import useActions from "@/shared/hooks/useActions";
import { XIcon } from "lucide-react";

import { useQueryClient } from "@tanstack/react-query";
import { GenericAlertDialog } from "@/features/assets";
import { useRouter } from "next/navigation";
import { buildValidationEntities, validateAfterAction } from "@/shared";
import { useShipmentValues } from "@/features/shipments";
import { ShipmentWithFp } from "@/features/shipments";
import { ShipmentStateColors, StatusColors } from "@/features/shipments";
import { Member } from "@/features/members";
import { useSession } from "next-auth/react";
import { useAsideStore } from "@/shared";
import { useFetchMembers } from "@/features/members";
import { CategoryIcons } from "@/features/assets";
import {
  useInternationalShipmentDetection,
  InternationalShipmentWarning,
  CountryFlag,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/shared";
import { countriesByCode } from "@/shared/constants/country-codes";

export type RelocateStatus = "success" | "error" | undefined;
const MembersList = function MembersList({
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
  const { data: members = [] } = useFetchMembers();

  const currentMember = members.find(
    (member) => member.email === product.assignedEmail
  );

  const { setAside } = useAsideStore();
  const {
    data: { user: sessionUser },
  } = useSession();

  const [searchedMembers, setSearchedMembers] = useState<Member[]>(members);
  const [isRelocating, setRelocating] = useState(false);
  const [relocateResult, setRelocateResult] =
    useState<RelocateStatus>(undefined);
  const [selectedMember, setSelectedMember] = useState<Member>();
  const { handleReassignProduct } = useActions();
  const queryClient = useQueryClient();
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [missingMemberData, setMissingMemberData] = useState("");
  const [genericAlertData, setGenericAlertData] = useState({
    title: "",
    description: "",
    isOpen: false,
  });
  const [showInternationalWarning, setShowInternationalWarning] =
    useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);
  const router = useRouter();

  const { isInternationalShipment, buildInternationalValidationEntities } =
    useInternationalShipmentDetection();

  const { isShipmentValueValid, onSubmitDropdown, shipmentValue } =
    useShipmentValues();

  const handleSelectMember = (member: Member) => {
    setSelectedMember(member);
  };

  const handleSearch = (query: string) => {
    setSearchedMembers(
      members.filter(
        (member) =>
          member.firstName.toLowerCase().includes(query.toLowerCase()) ||
          member.lastName.toLowerCase().includes(query.toLowerCase())
      )
    );
  };

  const displayedMembers = searchedMembers.filter(
    (member) => member.email !== currentMember?.email
  );

  const handleRelocateProduct = async () => {
    if (!selectedMember) return;

    const sessionUserData = {
      country: (sessionUser as any)?.country,
      city: (sessionUser as any)?.city,
      state: (sessionUser as any)?.state,
      zipCode: (sessionUser as any)?.zipCode,
      address: (sessionUser as any)?.address,
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

    const missingMessages = await validateAfterAction(source, destination);

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
    }

    const isInternational = isInternationalShipment(source, destination);
    const requiresFpShipment = shipmentValue.shipment === "yes";

    if (isInternational && requiresFpShipment) {
      setPendingAction(() => () => executeRelocation());
      setShowInternationalWarning(true);
      return;
    }

    await executeRelocation();
  };

  const executeRelocation = async () => {
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
      queryClient.invalidateQueries({ queryKey: ["shipments"] });

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

  const handleConfirmInternationalShipment = () => {
    setShowInternationalWarning(false);
    if (pendingAction) {
      pendingAction();
      setPendingAction(null);
    }
  };

  const handleCancelInternationalShipment = () => {
    setShowInternationalWarning(false);
    setPendingAction(null);
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
          queryClient.setQueryData(["selectedMember"], selectedMember);
          setAside("EditMember");
          setShowErrorDialog(false);
        }}
      />
      {selectedMember ? (
        <section className="flex justify-between items-end gap-6 pb-2 w-full">
          <div className="flex items-center gap-2">
            <span className="font-extralight">Relocate To:</span>
            <button
              className="flex items-center gap-2 bg-hoverBlue px-2 py-1 border border-light-grey rounded-md cursor-pointer"
              disabled={
                isRelocating ||
                relocateResult === "success" ||
                !selectedMember ||
                disabled
              }
              onClick={() => setSelectedMember(null)}
            >
              {selectedMember.country && (
                <div className="group relative">
                  <CountryFlag
                    countryName={selectedMember.country}
                    size={16}
                    className="rounded-sm"
                  />
                  <span className="hidden group-hover:block bottom-full left-1/2 z-50 absolute bg-blue/80 mb-2 px-2 py-1 rounded text-white text-xs whitespace-nowrap -translate-x-1/2 transform">
                    {countriesByCode[selectedMember.country] ||
                      selectedMember.country}
                  </span>
                </div>
              )}
              <p className="font-semibold text-black">
                {selectedMember.fullName}
              </p>
              <XIcon size={14} />
            </button>
          </div>

          <div className="flex-1">
            <ShipmentWithFp
              onSubmit={onSubmitDropdown}
              destinationMember={selectedMember}
            />
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
        <div className="flex flex-col items-start gap-2 h-full">
          <p className="mx-2 text-dark-grey">
            Please select the employee to whom this item will be assigned
          </p>

          <div>
            <SearchInput placeholder="Search Member" onSearch={handleSearch} />
          </div>
          <div className="flex flex-col gap-2 pt-4 w-full h-[250px] max-h-[250px] overflow-y-auto">
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
                  <div className="flex items-center gap-2">
                    {member.country && (
                      <TooltipProvider>
                        <Tooltip delayDuration={300}>
                          <TooltipTrigger asChild>
                            <div>
                              <CountryFlag
                                countryName={member.country}
                                size={18}
                                className="rounded-sm"
                              />
                            </div>
                          </TooltipTrigger>
                          <TooltipContent className="bg-blue/80 text-white text-xs">
                            {countriesByCode[member.country] || member.country}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                    <p className="font-bold text-black">
                      {member.firstName} {member.lastName}
                    </p>
                    <span className="text-dark-grey">
                      {typeof member.team === "string"
                        ? member.team
                        : member.team?.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 ml-auto">
                    <CategoryIcons products={member.products || []} />
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      <InternationalShipmentWarning
        isOpen={showInternationalWarning}
        onConfirm={handleConfirmInternationalShipment}
        onCancel={handleCancelInternationalShipment}
      />
    </section>
  );
};

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
export const ProductDetail = ({
  product,
  className = "",
  handleSelect,
  isChecked = false,
  setProductToRemove,
  isRelocating = false,
  onRelocateSuccess,
  disabled,
  isOffboardingStyles,
}: ProductDetailProps) => {
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
      <div className="flex justify-between items-center">
        <section className="flex items-center gap-2">
          <section className="flex items-start gap-2">
            <div className="flex items-start gap-2">
              <ProductImage category={product?.category} />
              <span className="font-semibold">{product?.category}</span>
            </div>

            <hr />

            <PrdouctModelDetail
              product={product}
              isOffboardingStyles={isOffboardingStyles}
              isChecked={isChecked}
            />
          </section>
          {isRelocating && (
            <Button
              variant="outline"
              className="right-0 absolute hover:bg-hoverBlue/50 rounded-sm text-black"
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
};
