import { useStore } from "@/models";
import { Location, Product, TeamMember } from "@/types";
export default function useActions() {
  const {
    products: { reassignProduct },
  } = useStore();

  const handleReassignProduct = async ({
    currentMember,
    product,
    selectedMember,
  }: {
    selectedMember: TeamMember;
    currentMember: TeamMember;
    product: Product;
  }) => {
    let updatedProduct: Partial<Product> = {
      category: product.category,
      attributes: product.attributes,
      name: product.name,
      assignedEmail: selectedMember.email,
      assignedMember: selectedMember.firstName + " " + selectedMember.lastName,
      status: "Delivered",
      location: "Employee",
    };
    if (product.assignedMember) {
      updatedProduct.lastAssigned =
        currentMember?.firstName + " " + currentMember?.lastName || "";
    }

    try {
      await reassignProduct(product._id, updatedProduct);
    } catch (error) {
      return error;
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
    let updatedProduct: Partial<Product> = {
      category: product.category,
      attributes: product.attributes,
      name: product.name,
      assignedEmail: "",
      assignedMember: "",
      status: "Available",
      location,
    };
    if (product.assignedMember) {
      updatedProduct.lastAssigned =
        currentMember?.firstName + " " + currentMember?.lastName || "";
    }

    try {
      await reassignProduct(product._id, updatedProduct);
    } catch (error) {
      return error;
    }
  };
  return { handleReassignProduct, unassignProduct };
}
