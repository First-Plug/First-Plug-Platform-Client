"use client";
import React, { Fragment, useState } from "react";
import { Button, MemberDetail } from "@/common";
import { EmptyCardLayout } from "@/shared";
import { observer } from "mobx-react-lite";
import { useStore } from "@/models/root.store";
import ProductDetail from "@/common/ProductDetail";
import type { Product } from "@/types";
import Image from "next/image";
import { LinkIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { RelacoteProducts, ReturnPage } from "./AsideContents";
import { GenericAlertDialog } from "@/features/assets";
import { DeleteMemberModal } from "./Alerts/DeleteMemberModal";
import { useFetchMember } from "@/features/members";
import { Loader } from "./Loader";

interface MemberAsideDetailsProps {
  className?: string;
}

export const MemberAsideDetails = observer(
  ({ className }: MemberAsideDetailsProps) => {
    const {
      members: {
        memberToEdit,
        selectedMember,
        setMemberToEdit,
        setSelectedMember,
      },
      aside: { setAside },
      alerts: { setAlert },
    } = useStore();

    const { data: member, isLoading, isError } = useFetchMember(memberToEdit);

    const router = useRouter();
    const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
    const [productToRemove, setProductToRemove] = useState<Product>();
    const [relocatePage, setRelocatePage] = useState(false);
    const [returnPage, setReturnPage] = useState(false);
    const [showErrorDialog, setShowErrorDialog] = useState(false);
    const [missingMemberData, setMissingMemberData] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const [id, setId] = useState<null | string>(null);
    const [type, setType] = useState<"NoRecoverable" | "NoProduct" | "None">(
      "None"
    );

    const handleSelectProducts = (product: Product) => {
      if (product.activeShipment) return;

      if (selectedProducts.includes(product)) {
        return setSelectedProducts((s) => s.filter((id) => id !== product));
      }
      setSelectedProducts((s) => [...s, product]);
    };

    if (isLoading) return <Loader />;
    if (isError || !member) return <div>Error loading member data</div>;

    const handleNavtoStock = () => {
      setAside(undefined);
      router.push("/home/my-stock");
    };

    const handleRealocate = (action: "open" | "close") => {
      setRelocatePage(!(action === "close"));
      if (action === "close") {
        setSelectedProducts([]);
      }
    };
    const handleReturn = (action: "open" | "close") => {
      setReturnPage(!(action === "close"));
      if (action === "close") {
        setSelectedProducts([]);
      }
    };

    function capitalizeAndSeparateCamelCase(text: string) {
      const separated = text.replace(/([a-z])([A-Z])/g, "$1 $2");
      return separated.replace(/\b\w/g, (char) => char.toUpperCase());
    }

    const handleRequestOffBoarding = () => {
      const pendingShipments = member.products.filter(
        (product) => product.activeShipment
      );

      if (pendingShipments.length || member.activeShipment) {
        setAlert("pendingShipmentsOffboarding");
        return;
      }

      const allProductsNotRecoverable = member.products.every(
        (product) => !product.recoverable
      );

      const getMissingFields = (selectedMember: any): string[] => {
        const missingFields: string[] = [];

        const isEmptyString = (value: any) =>
          (typeof value === "string" && value.trim() === "") ||
          value === undefined;

        const isInvalidNumber = (value: any) =>
          typeof value === "number" ? value === 0 : !value;
        if (isEmptyString(selectedMember.personalEmail)) {
          missingFields.push("personalEmail");
        }
        if (isEmptyString(selectedMember.phone)) {
          missingFields.push("phone");
        }
        if (isInvalidNumber(selectedMember.dni)) {
          missingFields.push("dni");
        }
        if (isEmptyString(selectedMember.country)) {
          missingFields.push("country");
        }
        if (isEmptyString(selectedMember.city)) {
          missingFields.push("city");
        }
        if (isEmptyString(selectedMember.zipCode)) {
          missingFields.push("zipCode");
        }
        if (isEmptyString(selectedMember.address)) {
          missingFields.push("address");
        }

        return missingFields;
      };

      setId(member._id);

      if (!member.products.length) {
        setType("NoProduct");
        return setIsOpen(true);
      }

      if (allProductsNotRecoverable) {
        setType("NoRecoverable");
        return setIsOpen(true);
      }

      if (!getMissingFields(member).length) {
        setSelectedMember(selectedMember._id);

        router.push(`/home/my-team/request-off-boarding/${selectedMember._id}`);

        setAside(undefined);
      } else {
        const missingFields = getMissingFields(member);

        setMissingMemberData(
          missingFields.reduce((acc, field, index) => {
            if (index === 0) {
              return capitalizeAndSeparateCamelCase(field);
            }
            return acc + " - " + capitalizeAndSeparateCamelCase(field);
          }, "")
        );

        setShowErrorDialog(true);
      }
    };

    return (
      <article
        className={`${className || ""} flex flex-col justify-between h-full`}
      >
        {relocatePage ? (
          <RelacoteProducts
            products={selectedProducts}
            handleBack={handleRealocate}
            setSelectedProducts={setSelectedProducts}
            selectedProducts={selectedProducts}
          />
        ) : returnPage ? (
          <ReturnPage
            products={selectedProducts}
            handleBack={handleReturn}
            setSelectedProducts={setSelectedProducts}
            selectedProducts={selectedProducts}
          />
        ) : (
          <Fragment>
            <div className="flex flex-col gap-6 h-full">
              <MemberDetail memberId={memberToEdit} />
              <div className="flex-grow h-[70%]">
                {member?.products?.length ? (
                  <div className="flex flex-col gap-2 h-full">
                    <div className="flex justify-between">
                      <h1 className="font-semibold text-lg">Products</h1>
                      <p className="place-items-center grid border border-black rounded-full w-6 h-6 font-bold text-black text-sm">
                        {member.products.length || 0}
                      </p>
                    </div>

                    <div className="flex flex-col flex-grow gap-2 mb-6 h-full max-h-full overflow-y-auto scrollbar-custom">
                      {member.products.length
                        ? member.products.map((product) => (
                            <ProductDetail
                              product={product}
                              key={product._id}
                              handleSelect={handleSelectProducts}
                              isChecked={selectedProducts.includes(product)}
                              setProductToRemove={setProductToRemove}
                            />
                          ))
                        : null}
                    </div>
                  </div>
                ) : (
                  <EmptyCardLayout>
                    <section className="flex flex-col justify-center items-center gap-2">
                      <div className="relative w-32 aspect-square">
                        <Image src={"/office.svg"} alt={"first plug sv"} fill />
                      </div>
                      <span className="text-dark-grey text-md">
                        This member doesn&apos;t have any items.
                      </span>

                      <Button
                        variant="text"
                        size="small"
                        className="flex items-center gap-2 rounded-md"
                        onClick={handleNavtoStock}
                      >
                        <LinkIcon size={14} />
                        <p>stock</p>
                      </Button>
                    </section>
                  </EmptyCardLayout>
                )}
              </div>
            </div>
            <aside className="bottom-0 left-0 absolute bg-white py-2 border-t w-full">
              <div className="flex justify-end gap-2 mx-auto w-5/6">
                <Button
                  body={"Request Offboarding"}
                  variant={"secondary"}
                  onClick={() => handleRequestOffBoarding()}
                  className="px-6 w-1/4"
                />
                <Button
                  body={"Return"}
                  variant={"secondary"}
                  disabled={selectedProducts.length === 0}
                  onClick={() => handleReturn("open")}
                  className="px-6 w-1/4"
                />
                <Button
                  body={"Relocate"}
                  variant={"secondary"}
                  disabled={selectedProducts.length === 0}
                  onClick={() => handleRealocate("open")}
                  className="px-6 w-1/4"
                />
              </div>
            </aside>
            <GenericAlertDialog
              open={showErrorDialog}
              onClose={() => setShowErrorDialog(false)}
              title="Please complete the missing data: "
              description={missingMemberData}
              buttonText="Update Member"
              onButtonClick={() => {
                setMemberToEdit(member._id);
                setAside("EditMember");
                setShowErrorDialog(false);
              }}
            />
            <DeleteMemberModal
              id={id}
              isOpen={isOpen}
              setOpen={setIsOpen}
              type={type}
            />
          </Fragment>
        )}
      </article>
    );
  }
);
