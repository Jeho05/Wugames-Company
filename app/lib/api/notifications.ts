import { apiFetch } from "@/app/lib/api-client";
import type { Notification } from "@/app/lib/contracts";

export async function listNotifications(): Promise<Notification[]> {
  return apiFetch<Notification[]>("/notifications");
}

export async function unreadCount(): Promise<number> {
  return apiFetch<number>("/notifications/unread-count");
}

export async function markAsRead(id: string): Promise<unknown> {
  return apiFetch("/notifications/read", { method: "PATCH", body: { id } });
}
