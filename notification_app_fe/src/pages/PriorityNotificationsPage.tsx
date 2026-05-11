import { Grid, Paper, Stack, Typography } from "@mui/material";
import NotificationCard from "../components/NotificationCard";
import PageFeedback from "../components/PageFeedback";
import PageSectionHeader from "../components/PageSectionHeader";
import { usePriorityNotifications } from "../hooks/usePriorityNotifications";

function PriorityNotificationsPage() {
  const { notifications, loading, error, scannedCount } = usePriorityNotifications();

  return (
    <Stack spacing={3.5}>
      <PageSectionHeader
        title="Priority Notifications"
        description="Top 10 notifications ranked with the Stage 6 priority rule: Placement first, then Result, then Event, with newer items winning ties."
      />

      <Paper sx={{ p: { xs: 2, md: 3 } }}>
        <Stack spacing={3}>
          <Paper
            variant="outlined"
            sx={{ p: 2.5, borderRadius: 3, backgroundColor: "#f8fafc" }}
          >
            <Typography variant="body2" color="text.secondary">
              Notifications scanned
            </Typography>
            <Typography variant="h5">{loading ? "..." : scannedCount}</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Efficient ranking keeps only the best 10 candidates while scanning pages.
            </Typography>
          </Paper>

          <PageFeedback
            loading={loading}
            error={error}
            empty={!loading && !error && notifications.length === 0}
            emptyTitle="No priority notifications available"
            emptyMessage="Once the API returns notifications, the top 10 list will appear here."
          />

          {!loading && !error && notifications.length > 0 && (
            <Grid container spacing={2.5}>
              {notifications.map((notification, index) => (
                <Grid key={notification.id} size={{ xs: 12 }}>
                  <NotificationCard
                    notification={notification}
                    rank={index + 1}
                    showPriorityScore
                  />
                </Grid>
              ))}
            </Grid>
          )}
        </Stack>
      </Paper>
    </Stack>
  );
}

export default PriorityNotificationsPage;
