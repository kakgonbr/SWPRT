import * as signalR from "@microsoft/signalr";
import type { ChatDTO, ChatMessageDTO } from "../lib/types";

/*const API = import.meta.env.VITE_API_BASE_URL;*/
const API = "http://localhost:5000";

export class ChatSignalRService {
  connection: signalR.HubConnection;
  token: string;

  constructor(token: string) {
    this.token = token;
    this.connection = new signalR.HubConnectionBuilder()
      .withUrl(`${API}/hubs/chat`, {
        accessTokenFactory: () => this.token,
      })
      .withAutomaticReconnect()
      .build();
  }

  async start() {
    if (this.connection.state === "Disconnected") {
      await this.connection.start();
    }
  }

  async joinChat(chatId: number) {
    await this.connection.invoke("JoinChat", chatId);
  }

  async sendMessage(chatId: number, content: string) {
    await this.connection.invoke("SendMessage", chatId, content);
  }

  onReceiveMessage(callback: (msg: ChatMessageDTO) => void) {
    this.connection.on("ReceiveMessage", callback);
  }

  onStaffAssigned(callback: (chat: ChatDTO) => void) {
    this.connection.on("StaffAssigned", callback);
  }
}
