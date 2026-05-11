import {
  Box,
  Card,
  CardContent,
  Chip,
  Stack,
  Typography,
} from "@mui/material";
import {
  formatNotificationTime,
  getTypeWeight,
} from "../utils/notificationUtils";
import type {
  NotificationItem,
  PriorityNotification,
} from "../utils/notificationUtils";

interface NotificationCardProps {
  notification: NotificationItem | PriorityNotification;
  rank?: number;
  showPriorityScore?: boolean;
}

const typeChipColors: Record<string, "primary" | "success" | "warning" | "default"> = {
  Placement: "primary",
  Result: "success",
  Event: "warning",
};

function NotificationCard({
  notification,
  rank,
  showPriorityScore = false,
}: NotificationCardProps) {
  const isPriorityNotification =
    showPriorityScore && "priorityScore" in notification;

  return (
    <Card
      sx={{
        position: "relative",
        overflow: "hidden",
        backgroundColor: notification.viewed ? "background.paper" : "#eef6ff",
      }}
    >
      <Box
        sx={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: 6,
          backgroundColor:
            getTypeWeight(notification.type) >= 3
              ? "primary.main"
              : getTypeWeight(notification.type) === 2
                ? "secondary.main"
                : "#ed6c02",
        }}
      />
      <CardContent sx={{ pl: 3 }}>
        <Stack spacing={2}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1}
            sx={{
              justifyContent: "space-between",
              alignItems: { xs: "flex-start", sm: "center" },
            }}
          >
            <Stack
              direction="row"
              spacing={1}
              useFlexGap
              sx={{ flexWrap: "wrap" }}
            >
              {typeof rank === "number" && (
                <Chip
                  size="small"
                  label={`Rank #${rank}`}
                  color="primary"
                  variant="outlined"
                />
              )}
              <Chip
                size="small"
                label={notification.type}
                color={typeChipColors[notification.type] ?? "default"}
              />
              <Chip
                size="small"
                label={notification.viewed ? "Viewed" : "Unread"}
                color={notification.viewed ? "default" : "primary"}
                variant={notification.viewed ? "outlined" : "filled"}
              />
              {isPriorityNotification && (
                <Chip
                  size="small"
                  label={`Score ${notification.priorityScore}`}
                  color="secondary"
                  variant="outlined"
                />
              )}
            </Stack>
            <Typography variant="body2" color="text.secondary">
              {formatNotificationTime(notification.timestamp)}
            </Typography>
          </Stack>

          <Typography variant="body1" sx={{ lineHeight: 1.75 }}>
            {notification.message}
          </Typography>
        </Stack>
      </CardContent>
    </Card>
  );
}

export default NotificationCard;
