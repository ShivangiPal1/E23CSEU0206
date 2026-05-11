import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import {
  NOTIFICATION_FILTERS,
} from "../utils/notificationUtils";
import type { NotificationFilter } from "../utils/notificationUtils";

interface NotificationFiltersProps {
  selectedType: NotificationFilter;
  onTypeChange: (nextType: NotificationFilter) => void;
  limit: number;
  onLimitChange: (nextLimit: number) => void;
}

function NotificationFilters({
  selectedType,
  onTypeChange,
  limit,
  onLimitChange,
}: NotificationFiltersProps) {
  return (
    <Stack
      direction={{ xs: "column", md: "row" }}
      spacing={2}
      sx={{
        justifyContent: "space-between",
        alignItems: { xs: "stretch", md: "center" },
      }}
    >
      <ToggleButtonGroup
        value={selectedType}
        exclusive
        color="primary"
        onChange={(_, nextValue: NotificationFilter | null) => {
          if (nextValue) {
            onTypeChange(nextValue);
          }
        }}
        sx={{ flexWrap: "wrap" }}
      >
        {NOTIFICATION_FILTERS.map((filter) => (
          <ToggleButton key={filter} value={filter}>
            {filter}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>

      <FormControl size="small" sx={{ minWidth: { xs: "100%", md: 140 } }}>
        <InputLabel id="limit-select-label">Per page</InputLabel>
        <Select
          labelId="limit-select-label"
          value={limit}
          label="Per page"
          onChange={(event) => onLimitChange(Number(event.target.value))}
        >
          {[5, 10, 20].map((option) => (
            <MenuItem key={option} value={option}>
              {option}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Stack>
  );
}

export default NotificationFilters;
