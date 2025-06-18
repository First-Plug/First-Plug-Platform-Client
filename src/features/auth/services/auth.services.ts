import { BASE_URL, HTTPRequests } from "@/config/axios.config";
import {
  LoggedInUser,
  LoginUser,
  RegisterUser,
  RegisterUserPlatforms,
} from "@/features/auth";
import axios from "axios";
import { Session } from "next-auth";
import { JWT } from "next-auth/jwt";

export class AuthServices {
  static async changePassword(data: {
    oldPassword: string;
    newPassword: string;
  }): Promise<LoggedInUser> {
    const res = await HTTPRequests.post(
      `${BASE_URL}/api/auth/change-password`,
      data
    );
    return res.data;
  }
  static async getUserInfro(id: string): Promise<LoggedInUser> {
    const res = await axios.post(`${BASE_URL}/api/auth/user`, { id });
    return res.data;
  }
  static async register(data: RegisterUser) {
    return await axios.post(`${BASE_URL}/api/auth/register`, data);
  }

  static async registerByProviders(user: RegisterUserPlatforms) {
    try {
      return await axios.post(`${BASE_URL}/api/auth/register-providers`, user);
    } catch (error) {
      console.error(error);
    }
  }

  static async login(data: LoginUser) {
    const loginRes = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: data.email,
      password: data.password,
    });

    return loginRes;
  }

  static async getBackendTokens(user: RegisterUserPlatforms): Promise<Session> {
    try {
      const tokens = await axios.post(`${BASE_URL}/api/auth/get-tokens`, user);
      return tokens.data;
    } catch (error) {
      console.error(error);
    }
  }

  static async refreshToken(refreshToken: string): Promise<JWT> {
    try {
      const response = await axios.post(
        `${BASE_URL}/api/auth/refresh`,
        {},
        {
          headers: {
            authorization: `Refresh ${refreshToken}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}
