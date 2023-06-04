import React from "react";
import { ACTION_STATUS } from "~/utils/schema/action/action";
import CircleIcon from "@mui/icons-material/Circle";
import { Box } from "@mui/material";

type Props = {
  status: keyof typeof ACTION_STATUS;
};

const StatusCircle = (props: React.PropsWithChildren<Props>) => {
  const { status, children } = props;
  return (
    <Box sx={{ display: "flex", justifyContent: "center", mb: 1 }}>
      <CircleIcon
        fontSize="small"
        sx={{
          mr: 1,
          color:
            status === ACTION_STATUS.COMPLETED
              ? "green"
              : status === ACTION_STATUS.IN_PROGRESS
              ? "yellow"
              : "red",
        }}
      />
      {children}
    </Box>
  );
};

export default StatusCircle;
