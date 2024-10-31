import { useStore } from "@/models";
import { observer } from "mobx-react-lite";
import { Loader } from "../Loader";
import ProductForm from "../AddProduct/ProductForm";
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Product } from "@/types";

export var EditProductAside = observer(() => {
  // const {
  //   products: { productToEdit },
  // } = useStore();

  const queryClient = useQueryClient();
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);

  useEffect(() => {
    const cachedProduct = queryClient.getQueryData<Product>([
      "selectedProduct",
    ]);
    if (cachedProduct) {
      setProductToEdit(cachedProduct);
    } else {
      console.log("Producto no encontrado en caché, mostrando loader.");
    }

    const unsubscribe = queryClient.getQueryCache().subscribe((event) => {
      if (
        event.query.queryKey[0] === "selectedProduct" &&
        event.query.state.data
      ) {
        setProductToEdit(event.query.state.data as Product);
      }
    });

    return () => unsubscribe();
  }, [queryClient]);

  if (!productToEdit) return <Loader />;

  // useEffect(() => {
  //   if (productToEdit) {
  //     ProductServices.getProductById(productToEdit)
  //       .then((res) => {
  //         setProduct(res);
  //       })
  //       .catch((error) => {
  //         console.error("Error fetching product:", error);
  //       });
  //   }
  // }, [productToEdit]);

  return (
    <div>
      <ProductForm initialData={productToEdit} isUpdate={true} />
    </div>
  );
});
