import { Alert, Box, CircularProgress, Stack, Typography } from "@mui/material";

interface PageFeedbackProps {
  loading?: boolean;
  error?: string | null;
  empty?: boolean;
  emptyTitle?: string;
  emptyMessage?: string;
}

function PageFeedback({
  loading = false,
  error = null,
  empty = false,
  emptyTitle = "Nothing to show right now",
  emptyMessage = "Try changing the filters or come back later.",
}: PageFeedbackProps) {
  if (loading) {
    return (
      <Stack
        spacing={2}
        sx={{
          py: 10,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress />
        <Typography color="text.secondary">Loading notifications...</Typography>
      </Stack>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ borderRadius: 3 }}>
        {error}
      </Alert>
    );
  }

  if (empty) {
    return (
      <Box
        sx={{
          p: 5,
          borderRadius: 4,
          border: "1px dashed",
          borderColor: "divider",
          textAlign: "center",
          backgroundColor: "background.paper",
        }}
      >
        <Typography variant="h6" gutterBottom>
          {emptyTitle}
        </Typography>
        <Typography color="text.secondary">{emptyMessage}</Typography>
      </Box>
    );
  }

  return null;
}

export default PageFeedback;
