import {
  TableCell,
  Tooltip,
  IconButton as IconButton,
  Box,
} from "@mui/material";
import { green, red } from "@mui/material/colors";
import React from "react";
import DoneIcon from "@mui/icons-material/Done";
import DeleteIcon from "@mui/icons-material/Delete";
import { iconButtonSx } from "~/components/utils";

type Props = {
  status: "error" | "success" | "loading" | "idle";
  disabled: boolean;
  onCompletedClick: () => void;
  onRejectedClick: () => void;
};

export const SIZE_ACTION_CELL = "10rem";

const ActionCell = (props: React.PropsWithChildren<Props>) => {
  const { status, children, onCompletedClick, onRejectedClick, disabled } =
    props;

  return (
    <TableCell>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "start",
        }}
      >
        {children}
        <Box
          sx={{
            flexGrow: 1,
            display: "flex",
            gap: 1,
            flexDirection: "row-reverse",
          }}
        >
          <Tooltip
            title={disabled ? "Only leader can change status" : "Rejectd"}
          >
            <IconButton
              aria-label="delete"
              onClick={disabled ? undefined : onRejectedClick}
              disabled={status === "loading"}
              sx={iconButtonSx({ disabled, color: red[500] })}
            >
              <DeleteIcon />
            </IconButton>
          </Tooltip>
          <Tooltip
            title={disabled ? "Only leader can change status" : "Completed"}
          >
            <IconButton
              aria-label="completed"
              onClick={disabled ? undefined : onCompletedClick}
              disabled={status === "loading"}
              sx={iconButtonSx({ disabled, color: green[500] })}
            >
              <DoneIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
    </TableCell>
  );
};

export default ActionCell;
