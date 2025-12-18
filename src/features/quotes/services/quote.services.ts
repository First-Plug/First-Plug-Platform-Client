import { BASE_URL, HTTPRequests } from "@/config/axios.config";
import type { QuoteProduct, QuoteRequestPayload } from "../types/quote.types";
import { transformProductToBackendFormat } from "../utils/quoteTransformations";

export class QuoteServices {
  static async submitQuoteRequest(
    products: QuoteProduct[]
  ): Promise<{ message: string }> {
    try {
      if (!products || products.length === 0) {
        throw new Error("No products to submit");
      }

      const transformedProducts = products.map((product, index) => {
        try {
          const transformed = transformProductToBackendFormat(product);

          if (!transformed.category) {
            throw new Error(`Product ${index}: category is required`);
          }
          if (!transformed.quantity || transformed.quantity < 1) {
            throw new Error(`Product ${index}: quantity must be at least 1`);
          }
          if (!transformed.country) {
            throw new Error(`Product ${index}: country is required`);
          }

          if (
            transformed.extendedWarranty === true &&
            !transformed.extendedWarrantyYears
          ) {
            throw new Error(
              `Product ${index}: extendedWarrantyYears is required when extendedWarranty is true`
            );
          }

          return transformed;
        } catch (error) {
          throw error;
        }
      });

      const payload: QuoteRequestPayload = {
        products: transformedProducts,
      };

      const response = await HTTPRequests.post(
        `${BASE_URL}/api/quotes`,
        payload
      );

      return response.data;
    } catch (error: any) {
      throw error;
    }
  }
}
