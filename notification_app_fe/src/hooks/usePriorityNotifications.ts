import { useEffect, useState } from "react";
import { fetchNotifications } from "../services/notificationApi";
import { logError, logInfo, logWarn } from "../utils/logger";
import { getTopPriorityNotifications } from "../utils/notificationUtils";
import type { PriorityNotification } from "../utils/notificationUtils";

const BATCH_SIZE = 100;
const MAX_PAGES = 50;

export function usePriorityNotifications() {
  const [notifications, setNotifications] = useState<PriorityNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [scannedCount, setScannedCount] = useState(0);

  useEffect(() => {
    let active = true;

    const loadPriorityNotifications = async () => {
      setLoading(true);
      setError(null);
      setScannedCount(0);

      try {
        let page = 1;
        let allNotifications: PriorityNotification[] = [];
        let shouldContinue = true;

        await logInfo("hook", "Priority notifications fetch started");

        while (shouldContinue && page <= MAX_PAGES) {
          const response = await fetchNotifications({
            page,
            limit: BATCH_SIZE,
            notificationType: "All",
          });

          if (!active) {
            return;
          }

          const nextBatch = getTopPriorityNotifications(response.notifications, 10);
          allNotifications = getTopPriorityNotifications(
            [...allNotifications, ...nextBatch],
            10
          );

          setScannedCount((previous) => previous + response.notifications.length);

          shouldContinue =
            response.notifications.length > 0 &&
            (response.hasMore || response.notifications.length === BATCH_SIZE);

          page += 1;
        }

        if (page > MAX_PAGES) {
          await logWarn("hook", "Priority notifications stopped at MAX_PAGES safeguard");
        }

        if (active) {
          setNotifications(allNotifications);
          await logInfo("hook", `Priority notifications ready with ${allNotifications.length} items`);
        }
      } catch (loadError) {
        if (!active) {
          return;
        }

        const message =
          loadError instanceof Error
            ? loadError.message
            : "Unable to load priority notifications.";

        setError(message);
        setNotifications([]);
        await logError("hook", `Priority notifications hook failed: ${message}`);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void loadPriorityNotifications();

    return () => {
      active = false;
    };
  }, []);

  return {
    notifications,
    loading,
    error,
    scannedCount,
  };
}
