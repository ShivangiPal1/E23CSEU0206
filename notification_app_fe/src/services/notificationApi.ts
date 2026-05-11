import { logError, logInfo } from "../utils/logger";
import {
  normaliseNotification,
} from "../utils/notificationUtils";
import type {
  NotificationFilter,
  NotificationItem,
  RawNotification,
} from "../utils/notificationUtils";

const API_URL = "/evaluation-service/notifications";

export interface NotificationQuery {
  page: number;
  limit: number;
  notificationType: NotificationFilter;
}

export interface NotificationResponse {
  notifications: NotificationItem[];
  total?: number;
  totalPages?: number;
  hasMore: boolean;
}

function getAccessToken() {
  const token = import.meta.env.VITE_ACCESS_TOKEN;

  if (!token) {
    throw new Error("VITE_ACCESS_TOKEN is missing. Add it to notification_app_fe/.env");
  }

  return token;
}

export async function fetchNotifications({
  page,
  limit,
  notificationType,
}: NotificationQuery): Promise<NotificationResponse> {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });

  if (notificationType !== "All") {
    params.set("notification_type", notificationType);
  }

  const requestUrl = `${API_URL}?${params.toString()}`;
  await logInfo("api", `Fetching notifications page=${page} limit=${limit} type=${notificationType}`);

  try {
    const response = await fetch(requestUrl, {
      headers: {
        Authorization: `Bearer ${getAccessToken()}`,
      },
    });

    if (!response.ok) {
      throw new Error(`API responded with status ${response.status}`);
    }

    const payload = await response.json();
    const rawNotifications = extractNotifications(payload);
    const notifications = rawNotifications.map((item, index) =>
      normaliseNotification(item, index)
    );
    const total = extractNumber(payload, [
      "total",
      "count",
      "totalNotifications",
      "total_notifications",
    ]);
    const totalPages =
      extractNumber(payload, ["totalPages", "total_pages"]) ??
      (typeof total === "number" ? Math.ceil(total / limit) : undefined);
    const hasMore =
      typeof totalPages === "number"
        ? page < totalPages
        : notifications.length === limit;

    await logInfo(
      "api",
      `Fetched ${notifications.length} notifications for page=${page} type=${notificationType}`
    );

    return {
      notifications,
      total,
      totalPages,
      hasMore,
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown notification fetch error";
    await logError("api", `Notification fetch failed: ${message}`);
    throw error;
  }
}

function extractNotifications(payload: unknown): RawNotification[] {
  if (Array.isArray(payload)) {
    return payload as RawNotification[];
  }

  if (!payload || typeof payload !== "object") {
    return [];
  }

  const candidate = payload as Record<string, unknown>;

  if (Array.isArray(candidate.notifications)) {
    return candidate.notifications as RawNotification[];
  }

  if (
    candidate.data &&
    typeof candidate.data === "object" &&
    Array.isArray((candidate.data as Record<string, unknown>).notifications)
  ) {
    return (candidate.data as Record<string, unknown>).notifications as RawNotification[];
  }

  return [];
}

function extractNumber(payload: unknown, keys: string[]) {
  if (!payload || typeof payload !== "object") {
    return undefined;
  }

  const direct = payload as Record<string, unknown>;

  for (const key of keys) {
    if (typeof direct[key] === "number") {
      return direct[key] as number;
    }
  }

  if (direct.data && typeof direct.data === "object") {
    const nested = direct.data as Record<string, unknown>;

    for (const key of keys) {
      if (typeof nested[key] === "number") {
        return nested[key] as number;
      }
    }
  }

  return undefined;
}
