import { useStore } from "@/models";
import { observer } from "mobx-react-lite";
import { Loader } from "../Loader";
import ProductForm from "../AddProduct/ProductForm";

export var EditProductAside = observer(() => {
  const {
    products: { productToEdit },
  } = useStore();

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
