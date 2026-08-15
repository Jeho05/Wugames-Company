import { apiFetch } from "@/app/lib/api-client";
import type { NotificationPrefs, UpdateNotificationPrefsPayload } from "@/app/lib/contracts";

export async function getNotificationPrefs(): Promise<NotificationPrefs> {
  return apiFetch<NotificationPrefs>("/notifications-prefs");
}

export async function updateNotificationPrefs(payload: UpdateNotificationPrefsPayload): Promise<NotificationPrefs> {
  return apiFetch<NotificationPrefs>("/notifications-prefs", { method: "PATCH", body: payload });
}