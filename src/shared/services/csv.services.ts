import { BASE_URL, HTTPRequests } from "@/config/axios.config";
import { PrdouctModelZod } from "@/features/assets";
import { CreateMemberZodModel } from "@/features/members";

export class CsvServices {
  static async bulkCreateProducts(data: PrdouctModelZod[]) {
    const response = await HTTPRequests.post(
      `${BASE_URL}/api/products/bulkcreate`,
      data
    );
    return response.data;
  }
  static async bulkCreateTeams(data: CreateMemberZodModel[]) {
    const response = await HTTPRequests.post(
      `${BASE_URL}/api/members/bulkcreate`,
      data
    );
    return response.data;
  }
}
