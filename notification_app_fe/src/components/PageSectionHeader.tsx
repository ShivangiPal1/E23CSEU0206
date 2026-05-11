import { Stack, Typography } from "@mui/material";

interface PageSectionHeaderProps {
  title: string;
  description: string;
}

function PageSectionHeader({ title, description }: PageSectionHeaderProps) {
  return (
    <Stack spacing={1} sx={{ mb: 3 }}>
      <Typography variant="h4">{title}</Typography>
      <Typography color="text.secondary" sx={{ maxWidth: 760 }}>
        {description}
      </Typography>
    </Stack>
  );
}

export default PageSectionHeader;
