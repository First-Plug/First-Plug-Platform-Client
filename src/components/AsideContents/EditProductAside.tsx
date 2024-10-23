import { useStore } from "@/models";
import { ProductServices } from "@/services";
import { Product } from "@/types";
import { observer } from "mobx-react-lite";
import { useEffect, useState } from "react";
import { Loader } from "../Loader";
import ProductForm from "../AddProduct/ProductForm";

export var EditProductAside = observer(() => {
  const {
    products: { productToEdit },
  } = useStore();
  const [product, setProduct] = useState<Product | null>(null);

  useEffect(() => {
    if (productToEdit) {
      ProductServices.getProductById(productToEdit)
        .then((res) => {
          setProduct(res);
        })
        .catch((error) => {
          console.error("Error fetching product:", error);
        });
    }
  }, [productToEdit]);

  return product ? (
    <div>
      <ProductForm initialData={product} isUpdate={true} />
    </div>
  ) : (
    <Loader />
  );
});
