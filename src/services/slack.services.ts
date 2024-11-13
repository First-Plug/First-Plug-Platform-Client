import axios from "axios";

export class SlackServices {
  static async postMessage(message: any) {
    return await axios.post("/api/sendToSlack", message);
  }
}
