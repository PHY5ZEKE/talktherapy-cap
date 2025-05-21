import {
  Typography,
  FormControl,
  Select,
  type SelectChangeEvent,
  MenuItem,
  Checkbox,
  ListItemText,
  selectClasses,
  ListSubheader,
  Chip,
  Box,
} from "@mui/material";

import { UnfoldMoreRounded } from "@mui/icons-material";
import { primary } from "config/colors";

export default ({
  placeholder,
  options,
  filters,
  onChange,
}: {
  placeholder: string;
  options: string[];
  filters: string[];
  onChange: (filters: string[]) => void;
}) => {
  const handleChange = (event: SelectChangeEvent<typeof filters>) => {
    const {
      target: { value },
    } = event;
    const newFilters =
      typeof value === "string"
        ? (value.split(",") as string[])
        : (value as string[]);

    // uplift selected to parent
    onChange(newFilters);
  };

  return (
    <FormControl fullWidth>
      <Select
        labelId="demo-multiple-checkbox-label"
        id="demo-multiple-checkbox"
        multiple
        value={filters}
        displayEmpty
        renderValue={(selected) => {
          if (selected.length === 0) return "Select Filters";
          if (selected.length <= 2) return selected.join(", ");
          return (
            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                gap: 0.5,
                maxWidth: "100%",
                overflow: "hidden",
              }}
            >
              {selected.slice(0, 1).map((value) => (
                <Chip
                  key={value}
                  label={value}
                  size="small"
                  sx={{
                    backgroundColor: primary[100],
                    color: primary[900],
                    fontWeight: 500,
                  }}
                />
              ))}
              {selected.length > 1 && (
                <Chip
                  label={`+${selected.length - 1} more`}
                  size="small"
                  sx={{
                    backgroundColor: primary[200],
                    color: primary[900],
                    fontWeight: 600,
                  }}
                />
              )}
            </Box>
          );
        }}
        IconComponent={UnfoldMoreRounded}
        onChange={handleChange}
        sx={{
          maxHeight: 42,
          borderRadius: 2,
          "&.MuiList-root": {
            p: "8px",
          },
          [`& .${selectClasses.select}`]: {
            display: "flex",
            alignItems: "center",
            gap: "2px",
            pl: 1,
            pr: 1,
          },
        }}
      >
        <ListSubheader>{placeholder}</ListSubheader>
        {options.map((status) => (
          <MenuItem
            key={status}
            value={status}
            sx={{
              marginX: 1,
              padding: 1,
              // style if selected
              "&.Mui-selected": {
                backgroundColor: primary[200],
                borderRadius: 2,
              },
              "&:hover": {
                backgroundColor: primary[100],
                borderRadius: 2,
              },
            }}
          >
            <Checkbox checked={filters.includes(status)} />
            <ListItemText
              disableTypography
              primary={
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 600,
                    color: primary[900],
                  }}
                >
                  {status}
                </Typography>
              }
            />
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};
