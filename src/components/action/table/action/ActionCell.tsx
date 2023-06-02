import { TableCell, Tooltip, IconButton, Box } from "@mui/material";
import { grey, green, red } from "@mui/material/colors";
import React from "react";
import DoneIcon from "@mui/icons-material/Done";
import DeleteIcon from "@mui/icons-material/Delete";

type Props = {
  status: "error" | "success" | "loading" | "idle";
  onCompletedClick: () => void;
  onRejectedClick: () => void;
};

export const SIZE_ACTION_CELL = "15rem";

const ActionCell = (props: React.PropsWithChildren<Props>) => {
  const { status, children, onCompletedClick, onRejectedClick } = props;

  return (
    <TableCell
      sx={{
        minWidth: SIZE_ACTION_CELL,
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
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
          <Tooltip title="Rejectd">
            <IconButton
              aria-label="delete"
              onClick={onRejectedClick}
              disabled={status === "loading"}
              sx={{
                backgroundColor: grey[400],
                color: red[500],
                borderRadius: 2,
                "&:hover": {
                  backgroundColor: grey[700],
                },
              }}
            >
              <DeleteIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Completed">
            <IconButton
              aria-label="completed"
              onClick={onCompletedClick}
              disabled={status === "loading"}
              sx={{
                backgroundColor: grey[400],
                color: green[500],
                borderRadius: 2,
                "&:hover": {
                  backgroundColor: grey[700],
                },
              }}
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
