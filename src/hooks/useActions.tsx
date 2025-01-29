import { useStore } from "@/models";
import { ProductServices } from "@/services";
import { Location, Product, TeamMember } from "@/types";
import { useQueryClient } from "@tanstack/react-query";

export default function useActions() {
  const {
    products: { reassignProduct },
  } = useStore();
  const queryClient = useQueryClient();

  const handleReassignProduct = async ({
    currentMember,
    product,
    selectedMember,
  }: {
    selectedMember: TeamMember;
    currentMember: TeamMember;
    product: Product;
  }) => {
    const isUnusable = product.productCondition === "Unusable";
    const newStatus = isUnusable ? "Unavailable" : "Delivered";
    const newLocation = isUnusable ? product.location : "Employee";

    const updatedProduct: Partial<Product> & { actionType: string } = {
      category: product.category,
      attributes: product.attributes,
      name: product.name,
      assignedEmail: isUnusable ? product.assignedEmail : selectedMember.email,
      assignedMember: isUnusable
        ? product.assignedMember
        : `${selectedMember.firstName} ${selectedMember.lastName}`,
      status: newStatus,
      location: newLocation,
      actionType: "relocate",
      productCondition: product.productCondition || "Optimal",
    };
    if (product.assignedMember) {
      updatedProduct.lastAssigned =
        currentMember?.firstName + " " + currentMember?.lastName || "";
    }

    try {
      await ProductServices.updateProduct(product._id, updatedProduct);
      queryClient.invalidateQueries({ queryKey: ["members"] });
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
    currentMember?: TeamMember;
  }) => {
    const isUnusable = product.productCondition === "Unusable";
    const newStatus = isUnusable ? "Unavailable" : "Available";
    const newLocation = isUnusable ? product.location : location;
    let updatedProduct: Partial<Product> & { actionType: string } = {
      category: product.category,
      attributes: product.attributes,
      name: product.name,
      assignedEmail: "",
      assignedMember: "",
      status: newStatus,
      location: newLocation,
      actionType: "return",
      productCondition: product.productCondition || "Optimal",
    };
    if (product.assignedMember) {
      updatedProduct.lastAssigned =
        currentMember?.firstName + " " + currentMember?.lastName || "";
    }

    try {
      await reassignProduct(product._id, updatedProduct);
      queryClient.invalidateQueries({ queryKey: ["members"] });
      queryClient.invalidateQueries({ queryKey: ["assets"] });
    } catch (error) {
      console.error("Error unassigning product:", error);
    }
  };

  return { handleReassignProduct, unassignProduct };
}
