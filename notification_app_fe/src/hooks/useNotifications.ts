import { useEffect, useState } from "react";
import {
  fetchNotifications,
} from "../services/notificationApi";
import type {
  NotificationQuery,
  NotificationResponse,
} from "../services/notificationApi";
import { logError, logInfo } from "../utils/logger";

const defaultResponse: NotificationResponse = {
  notifications: [],
  hasMore: false,
};

export function useNotifications(query: NotificationQuery) {
  const { page, limit, notificationType } = query;
  const [data, setData] = useState<NotificationResponse>(defaultResponse);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const loadNotifications = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetchNotifications({
          page,
          limit,
          notificationType,
        });

        if (!active) {
          return;
        }

        setData(response);
        await logInfo("hook", "All notifications hook updated state");
      } catch (loadError) {
        if (!active) {
          return;
        }

        const message =
          loadError instanceof Error
            ? loadError.message
            : "Unable to load notifications.";

        setError(message);
        setData(defaultResponse);
        await logError("hook", `All notifications hook failed: ${message}`);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void loadNotifications();

    return () => {
      active = false;
    };
  }, [limit, notificationType, page]);

  return {
    ...data,
    loading,
    error,
  };
}
