import { Product, ProductTable } from "@/features/assets";
import { BASE_URL, HTTPRequests } from "@/config/axios.config";
import { Shipment } from "@/features/shipments";

type CreationProduct = Omit<Omit<Product, "_id">, "__v">;

export class ProductServices {
  static async getAllProducts(): Promise<Product[]> {
    const response = await HTTPRequests.get(`${BASE_URL}/api/products`);
    return response.data;
  }
  static async getTableFormat(): Promise<ProductTable[]> {
    try {
      const response = await HTTPRequests.get(`${BASE_URL}/api/products/table`);
      // Validación defensiva: asegurar que siempre retornemos un array
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      return [];
    }
  }

  static async getProductById(id: Product["_id"]): Promise<Product> {
    const response = await HTTPRequests.get(`${BASE_URL}/api/products/${id}`);
    return response.data;
  }

  static async createProduct(productData: CreationProduct): Promise<Product> {
    const response = await HTTPRequests.post(
      `${BASE_URL}/api/products`,
      productData
    );

    return response.data;
  }

  static async updateProduct(
    id: Product["_id"],
    data: Partial<Product>
  ): Promise<{ message: string; shipment: Shipment }> {
    try {
      const response = await HTTPRequests.patch(
        `${BASE_URL}/api/products/${id}`,
        data
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  static async updateEntityProduct(
    id: Product["_id"],
    data: Partial<Product>
  ): Promise<Product> {
    try {
      const response = await HTTPRequests.patch(
        `${BASE_URL}/api/products/entity/${id}`,
        data
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  static async deleteProduct(id: Product["_id"]): Promise<{ message: string }> {
    const response = await HTTPRequests.delete(
      `${BASE_URL}/api/products/${id}`
    );
    return response.data;
  }

  static async getProductForReassign(id: Product["_id"]): Promise<{
    product: Product;
    options: { email: string; name: string; team: string }[];
    currentMember: { email: string; name: string } | null;
  }> {
    const response = await HTTPRequests.get(
      `${BASE_URL}/api/products/reassign/${id}`
    );
    return response.data;
  }

  static async reassignProduct(
    id: Product["_id"],
    data: Partial<Product>
  ): Promise<Product> {
    const response = await HTTPRequests.patch(
      `${BASE_URL}/api/products/reassign/${id}`,
      data
    );
    return response.data;
  }

  static async getProductForAssign(id: Product["_id"]): Promise<{
    product: Product;
    options: { email: string; name: string; team: string }[];
  }> {
    const response = await HTTPRequests.get(
      `${BASE_URL}/api/products/assign/${id}`
    );
    return response.data;
  }
  static async bulkCreateProducts(
    products: CreationProduct[]
  ): Promise<Product[]> {
    try {
      const response = await HTTPRequests.post(
        `${BASE_URL}/api/products/bulkcreate`,
        products
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  static async exportProductsCsv(): Promise<void> {
    const response = await HTTPRequests.get(
      `${BASE_URL}/api/products/export-csv`,
      {
        responseType: "blob",
      }
    );

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "products_report.csv");
    document.body.appendChild(link);
    link.click();
    link.remove();
  }
}
