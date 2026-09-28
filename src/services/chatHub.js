import * as signalR from "@microsoft/signalr";
import { store } from "@/store/store";

let chatHubConnection = null;

export function startChatHubConnection() {
  const token = store.getters.getUser?.token;
  if (!token || chatHubConnection) return;

  chatHubConnection = new signalR.HubConnectionBuilder()
    .withUrl("http://localhost:5001/hubs/chat", {
      accessTokenFactory: () => store.getters.getUser?.token || "",
      withCredentials: false,
    })
    .withAutomaticReconnect()
    .build();

  chatHubConnection.on("ReceiveMessage", (incomingMessage) => {
    window.dispatchEvent(new CustomEvent("buzzup-chat-message", { detail: incomingMessage }));
  });

  chatHubConnection.on("PresenceChanged", (presence) => {
    window.dispatchEvent(new CustomEvent("buzzup-presence-changed", { detail: presence }));
  });

  chatHubConnection.on("ReceiveNotification", (notification) => {
    window.dispatchEvent(new CustomEvent("buzzup-notification", { detail: notification }));
  });

  chatHubConnection.start().catch(() => {
    chatHubConnection = null;
  });
}

export async function stopChatHubConnection() {
  if (!chatHubConnection) return;
  await chatHubConnection.stop();
  chatHubConnection = null;
}
