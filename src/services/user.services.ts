import { BASE_URL, HTTPRequests } from "@/config/axios.config";
import { UserZod } from "@/types";
import axios from "axios";

export class UserServices {
  static async updateUser(data: UserZod) {
    const loginRes = await HTTPRequests.patch(`${BASE_URL}/api/user`, data);

    return loginRes;
  }
}
