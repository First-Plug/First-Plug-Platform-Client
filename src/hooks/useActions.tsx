import { useStore } from "@/models";
import { ProductServices } from "@/services";
import { Location, Product, TeamMember } from "@/types";
import useFetch from "./useFetch";

export default function useActions() {
  const {
    products: { reassignProduct },
  } = useStore();
  const { fetchMembers } = useFetch();

  const taskQueue: (() => Promise<void>)[] = [];
  let isProcessingQueue = false;

  const processQueue = async () => {
    if (isProcessingQueue) return;

    isProcessingQueue = true;

    while (taskQueue.length > 0) {
      const task = taskQueue.shift();
      if (task) {
        try {
          await task();
        } catch (error) {
          console.error("Error processing task:", error);
        }
      }
    }
    isProcessingQueue = false;
    try {
      await fetchMembers();
    } catch (error) {
      console.error("Error fetching members after queue processing:", error);
    }
  };

  const addTaskToQueue = (task: () => Promise<void>, productId: string) => {
    taskQueue.push(task);
    if (!isProcessingQueue) {
      processQueue();
    }
  };

  const handleReassignProduct = async ({
    currentMember,
    product,
    selectedMember,
  }: {
    selectedMember: TeamMember;
    currentMember: TeamMember;
    product: Product;
  }) => {
    const updatedProduct: Partial<Product> = {
      category: product.category,
      attributes: product.attributes,
      name: product.name,
      assignedEmail: selectedMember.email,
      assignedMember: `${selectedMember.firstName} ${selectedMember.lastName}`,
      status: "Delivered",
      location: "Employee",
    };
    if (product.assignedMember) {
      updatedProduct.lastAssigned =
        currentMember?.firstName + " " + currentMember?.lastName || "";
    }

    try {
      await ProductServices.updateProduct(product._id, updatedProduct);
      await fetchMembers();
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
    const task = async () => {
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
        console.error("Error unassigning product:", error);
      }
    };

    addTaskToQueue(task, product._id);
  };

  return { handleReassignProduct, unassignProduct, addTaskToQueue };
}
