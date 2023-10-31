import axios from "axios";

export class TeamMemberServices {
  static async getAllMembers() {
    return await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/api/teamMembers`
    );
  }
  static async getOneMember(id) {
    return await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/api/teamMembers/${id}`
    );
  }

  static async createMember(data) {
    return await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/api/teamMembers`,
      data
    );
  }
  static async updateMember(id, data) {
    return await axios.put(
      `${process.env.NEXT_PUBLIC_API_URL}/api/teamMembers/${id}`,
      data
    );
  }
  static async deleteMember(id) {
    return await axios.delete(
      `${process.env.NEXT_PUBLIC_API_URL}/api/teamMembers/${id}`
    );
  }
}
