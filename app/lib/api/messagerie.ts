import { apiFetch } from "@/app/lib/api-client";
import type {
  Conversation,
  CreateConversationPayload,
  Message,
  MessageResponse,
  SendMessagePayload,
} from "@/app/lib/contracts";

export async function listConversations(): Promise<Conversation[]> {
  return apiFetch<Conversation[]>("/messagerie/conversations");
}

export async function createConversation(payload: CreateConversationPayload): Promise<Conversation> {
  return apiFetch<Conversation>("/messagerie/conversations", { method: "POST", body: payload });
}

export async function listMessages(conversationId: string): Promise<Message[]> {
  return apiFetch<Message[]>(`/messagerie/conversations/${conversationId}/messages`);
}

export async function sendMessage(conversationId: string, payload: SendMessagePayload): Promise<Message> {
  return apiFetch<Message>(`/messagerie/conversations/${conversationId}/messages`, {
    method: "POST",
    body: payload,
  });
}

export async function markConversationAsRead(conversationId: string): Promise<MessageResponse> {
  return apiFetch<MessageResponse>(`/messagerie/conversations/${conversationId}/lu`, {
    method: "PATCH",
  });
}