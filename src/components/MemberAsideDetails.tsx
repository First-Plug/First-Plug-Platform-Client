"use client";
import React, { Fragment, useState } from "react";
import { Button, EmptyCardLayout, MemberDetail } from "@/common";
import { observer } from "mobx-react-lite";
import { useStore } from "@/models/root.store";
import ProductDetail from "@/common/ProductDetail";
import { Product } from "@/types";
import Image from "next/image";
import { LinkIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { RelacoteProducts, ReturnPage } from "./AsideContents";
import GenericAlertDialog from "./AddProduct/ui/GenericAlertDialog";
import { DeleteMemberModal } from "./Alerts/DeleteMemberModal";

interface MemberAsideDetailsProps {
  className?: string;
}

export const MemberAsideDetails = observer(function ({
  className,
}: MemberAsideDetailsProps) {
  const {
    members: { members, selectedMember, setMemberToEdit, setSelectedMember },
    aside: { setAside },
    alerts: { setAlert },
    products,
  } = useStore();

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
    if (selectedProducts.includes(product)) {
      return setSelectedProducts((s) => s.filter((id) => id !== product));
    }

    setSelectedProducts((s) => [...s, product]);
  };

  const handleNavtoStock = () => {
    setAside(undefined);
    router.push("/home/my-stock");
  };

  const handleRealocate = (action: "open" | "close") => {
    setRelocatePage(!(action === "close"));
  };
  const handleReturn = (action: "open" | "close") => {
    setReturnPage(!(action === "close"));
  };

  function capitalizeAndSeparateCamelCase(text: string) {
    const separated = text.replace(/([a-z])([A-Z])/g, "$1 $2");
    return separated.replace(/\b\w/g, (char) => char.toUpperCase());
  }

  const handleRequestOffBoarding = () => {
    const allProductsNotRecoverable = selectedMember.products.every(
      (product) => !product.recoverable
    );

    const getMissingFields = (selectedMember: any): string[] => {
      const missingFields: string[] = [];

      const isEmptyString = (value: any) =>
        typeof value === "string" && value.trim() === "";

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

    setId(selectedMember._id);

    if (!selectedMember.products.length) {
      setType("NoProduct");
      return setIsOpen(true);
    }

    if (allProductsNotRecoverable) {
      setType("NoRecoverable");
      return setIsOpen(true);
    }

    if (!getMissingFields(selectedMember).length) {
      // TODO: next history v2

      setSelectedMember(selectedMember._id);

      router.push(`/home/my-team/requestOffBoarding/${selectedMember._id}`);

      setAside(undefined);
    } else {
      const missingFields = getMissingFields(selectedMember);

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
        />
      ) : returnPage ? (
        <ReturnPage products={selectedProducts} handleBack={handleReturn} />
      ) : (
        <Fragment>
          <div className="flex flex-col gap-6   h-full   ">
            <MemberDetail />
            <div className=" flex-grow h-[70%]  ">
              {selectedMember?.products?.length ? (
                <div className="flex flex-col gap-2 h-full">
                  <div className="flex justify-between">
                    <h1 className="font-semibold text-lg">Products</h1>
                    <p className="border border-black text-black font-bold  rounded-full h-6 w-6  grid place-items-center  text-sm">
                      {selectedMember.products.length || 0}
                    </p>
                  </div>

                  <div className="flex flex-col gap-2 overflow-y-auto  scrollbar-custom flex-grow max-h-full h-full  mb-6 ">
                    {selectedMember.products.length
                      ? selectedMember.products.map((product) => (
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
                  <section className="flex flex-col gap-2 items-center justify-center">
                    <div className="w-32 aspect-square relative">
                      <Image src={"/office.svg"} alt={"first plug sv"} fill />
                    </div>
                    <span className="text-md text-dark-grey">
                      This member doesn&apos;t have any items.
                    </span>

                    <Button
                      variant="text"
                      size="small"
                      className="rounded-md flex gap-2 items-center"
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
          <aside className=" absolute  bg-white  py-2    bottom-0   left-0 w-full border-t ">
            <div className="flex    w-5/6 mx-auto gap-2 justify-end">
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
              setMemberToEdit(selectedMember._id);
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
});
