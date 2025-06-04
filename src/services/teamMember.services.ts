import { Member } from "@/features/members";
import { BASE_URL, HTTPRequests } from "@/config/axios.config";

type CreationMember = Omit<Omit<Member, "_id">, "__v">;

export class Memberservices {
  static async getAllMembers(): Promise<Member[]> {
    const response = await HTTPRequests.get(`${BASE_URL}/api/members`);
    return response.data;
  }

  static async getOneMember(id: Member["_id"]): Promise<Member> {
    const response = await HTTPRequests.get(`${BASE_URL}/api/members/${id}`);
    return response.data;
  }

  static async createMember(data: CreationMember): Promise<Member> {
    const response = await HTTPRequests.post(`${BASE_URL}/api/members`, data);
    return response.data;
  }

  static async offboardingMember(id, data) {
    try {
      const response = await HTTPRequests.post(
        `${BASE_URL}/api/members/offboarding/${id}`,
        data
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  static async updateMember(id, data) {
    try {
      const response = await HTTPRequests.patch(
        `${BASE_URL}/api/members/${id}`,
        data
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  static async deleteMember(id: Member["_id"]): Promise<Member> {
    const response = await HTTPRequests.delete(`${BASE_URL}/api/members/${id}`);
    return response.data;
  }

  static async getAllMembersByTeam(teamId: string): Promise<Member[]> {
    const response = await HTTPRequests.get(
      `${BASE_URL}/api/members/team/${teamId}`
    );
    return response.data;
  }
}
