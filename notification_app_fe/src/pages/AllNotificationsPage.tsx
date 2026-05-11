import { useMemo, useState } from "react";
import {
  Grid,
  Pagination,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import NotificationCard from "../components/NotificationCard";
import NotificationFilters from "../components/NotificationFilters";
import PageFeedback from "../components/PageFeedback";
import PageSectionHeader from "../components/PageSectionHeader";
import { useNotifications } from "../hooks/useNotifications";
import { logInfo } from "../utils/logger";
import type { NotificationFilter } from "../utils/notificationUtils";

function AllNotificationsPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [notificationType, setNotificationType] =
    useState<NotificationFilter>("All");

  const { notifications, total, totalPages, hasMore, loading, error } =
    useNotifications({
      page,
      limit,
      notificationType,
    });

  const resolvedTotalPages = useMemo(() => {
    if (typeof totalPages === "number" && totalPages > 0) {
      return totalPages;
    }

    if (typeof total === "number" && total > 0) {
      return Math.ceil(total / limit);
    }

    return hasMore ? page + 1 : Math.max(page, 1);
  }, [hasMore, limit, page, total, totalPages]);

  const unreadCount = notifications.filter((item) => !item.viewed).length;

  const handleTypeChange = (nextType: NotificationFilter) => {
    setNotificationType(nextType);
    setPage(1);
    void logInfo("page", `Changed notification filter to ${nextType}`);
  };

  const handleLimitChange = (nextLimit: number) => {
    setLimit(nextLimit);
    setPage(1);
    void logInfo("page", `Changed all notifications page size to ${nextLimit}`);
  };

  return (
    <Stack spacing={3.5}>
      <PageSectionHeader
        title="All Notifications"
        description="Browse every campus notification with server-side pagination and type filters."
      />

      <Paper sx={{ p: { xs: 2, md: 3 } }}>
        <Stack spacing={3}>
          <NotificationFilters
            selectedType={notificationType}
            onTypeChange={handleTypeChange}
            limit={limit}
            onLimitChange={handleLimitChange}
          />

          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <Paper
              variant="outlined"
              sx={{ flex: 1, p: 2, borderRadius: 3, backgroundColor: "#f8fafc" }}
            >
              <Typography variant="body2" color="text.secondary">
                Notifications on this page
              </Typography>
              <Typography variant="h5">{notifications.length}</Typography>
            </Paper>
            <Paper
              variant="outlined"
              sx={{ flex: 1, p: 2, borderRadius: 3, backgroundColor: "#f8fafc" }}
            >
              <Typography variant="body2" color="text.secondary">
                Unread on this page
              </Typography>
              <Typography variant="h5">{unreadCount}</Typography>
            </Paper>
            <Paper
              variant="outlined"
              sx={{ flex: 1, p: 2, borderRadius: 3, backgroundColor: "#f8fafc" }}
            >
              <Typography variant="body2" color="text.secondary">
                Total from API
              </Typography>
              <Typography variant="h5">
                {typeof total === "number" ? total : "Not provided"}
              </Typography>
            </Paper>
          </Stack>

          <PageFeedback
            loading={loading}
            error={error}
            empty={!loading && !error && notifications.length === 0}
            emptyTitle="No notifications found"
            emptyMessage="Try another filter or page size."
          />

          {!loading && !error && notifications.length > 0 && (
            <>
              <Grid container spacing={2.5}>
                {notifications.map((notification) => (
                  <Grid key={notification.id} size={{ xs: 12 }}>
                    <NotificationCard notification={notification} />
                  </Grid>
                ))}
              </Grid>

              <Stack sx={{ pt: 1, alignItems: "center" }}>
                <Pagination
                  page={page}
                  count={resolvedTotalPages}
                  color="primary"
                  onChange={(_, nextPage) => {
                    setPage(nextPage);
                    void logInfo("page", `Moved to all notifications page ${nextPage}`);
                  }}
                />
              </Stack>
            </>
          )}
        </Stack>
      </Paper>
    </Stack>
  );
}

export default AllNotificationsPage;
