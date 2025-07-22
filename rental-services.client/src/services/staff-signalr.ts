import * as signalR from "@microsoft/signalr";

const API = import.meta.env.VITE_API_BASE_URL;

export class StaffSignalRService {
    connection: signalR.HubConnection;
    token: string;

    constructor(token: string) {
        this.token = token;
        this.connection = new signalR.HubConnectionBuilder()
            .withUrl(`${API}/hubs/staff`, {
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
}
