import { ProductServices } from "@/services";
import { Location, Product } from "@/features/assets";
import { Member } from "@/features/members";
import { useQueryClient } from "@tanstack/react-query";

export default function useActions() {
  const queryClient = useQueryClient();

  const handleReassignProduct = async ({
    currentMember,
    product,
    selectedMember,
  }: {
    selectedMember: Member;
    currentMember: Member;
    product: Product;
  }) => {
    const status =
      product.productCondition === "Unusable" ? "Unavailable" : "Delivered";
    const updatedProduct: Partial<Product> & { actionType: string } = {
      category: product.category,
      attributes: product.attributes,
      name: product.name,
      assignedEmail: selectedMember.email,
      assignedMember: `${selectedMember.firstName} ${selectedMember.lastName}`,
      status,
      location: "Employee",
      actionType: "relocate",
      fp_shipment: product.fp_shipment,
      desirableDate: product.desirableDate,
      productCondition: product.productCondition || "Optimal",
    };
    if (product.assignedMember) {
      updatedProduct.lastAssigned =
        currentMember?.firstName + " " + currentMember?.lastName || "";
    }

    try {
      const response = await ProductServices.updateProduct(
        product._id,
        updatedProduct
      );
      queryClient.invalidateQueries({ queryKey: ["members"] });
      return response;
    } catch (error) {
      console.error(`Error relocating product ${product._id}:`, error);
    }
  };

  const unassignProduct = async ({
    location,
    product,
    currentMember,
  }: {
    location: Location;
    product: Product;
    currentMember?: Member;
  }) => {
    const status =
      product.productCondition === "Unusable" ? "Unavailable" : "Available";

    let updatedProduct: Partial<Product> & { actionType: string } = {
      category: product.category,
      attributes: product.attributes,
      name: product.name,
      assignedEmail: "",
      assignedMember: "",
      status,
      location,
      actionType: "return",
      fp_shipment: product.fp_shipment,
      desirableDate: product.desirableDate,
      productCondition: product.productCondition || "Optimal",
    };
    if (product.assignedMember) {
      updatedProduct.lastAssigned =
        currentMember?.firstName + " " + currentMember?.lastName || "";
    }

    try {
      queryClient.invalidateQueries({ queryKey: ["members"] });
      queryClient.invalidateQueries({ queryKey: ["assets"] });
      return await ProductServices.updateProduct(product._id, updatedProduct);
    } catch (error) {
      console.error("Error unassigning product:", error);
    }
  };

  return { handleReassignProduct, unassignProduct };
}
