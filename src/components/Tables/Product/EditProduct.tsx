"use client";
import { Button, PenIcon } from "@/common";
import { useStore } from "@/models";
import { Product } from "@/types";
import { observer } from "mobx-react-lite";

export default observer(function EditProduct({
  product,
}: {
  product: Product;
}) {
  const {
    aside: { setAside },
    products: { setProductIdToEdit },
  } = useStore();

  const handleEditProduct = () => {
    setProductIdToEdit(product._id);
    setAside("EditProduct");
  };
  return (
    <Button variant="text" onClick={handleEditProduct}>
      <PenIcon className="text-dark-grey w-4" strokeWidth={2} />
    </Button>
  );
});
