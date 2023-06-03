import {
  TableCell,
  Tooltip,
  IconButton,
  Modal,
  TextField,
  Button,
  Box,
} from "@mui/material";
import React from "react";
import CommentIcon from "@mui/icons-material/Comment";
import { blue, grey } from "@mui/material/colors";
import Grid2 from "@mui/material/Unstable_Grid2";
import FormCard from "~/components/FormCard";
import FormTitle from "~/components/FormTitle";
import TextFieldAutoFocus from "~/components/TextFieldAutoFocus";

type Props = {
  comment: string;
  status: "error" | "success" | "loading" | "idle";
  onSubmit: (comment: string) => Promise<unknown>;
};

export const SIZE_COMMENT_CELL = "10rem";

const CommentCell = (props: React.PropsWithChildren<Props>) => {
  const { children, comment, status, onSubmit } = props;
  const ref = React.useRef<HTMLDivElement>(null);
  const [open, setOpen] = React.useState(false);
  const toggle = () => setOpen((prev) => !prev);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const comment = formData.get("comment") as string;
    await onSubmit(comment);
    toggle();
  };

  return (
    <>
      <TableCell
        sx={{
          minWidth: SIZE_COMMENT_CELL,
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
            <Tooltip title="Comment">
              <IconButton
                aria-label="comment"
                onClick={toggle}
                color="primary"
                disabled={status === "loading"}
                sx={{
                  marginLeft: 1,
                  backgroundColor: grey[400],
                  borderRadius: 2,
                  "&:hover": {
                    backgroundColor: grey[700],
                    color: blue[200],
                  },
                }}
              >
                <CommentIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </TableCell>
      <Modal open={open} onClose={toggle} key={String(open)}>
        <FormCard size="small" ref={ref}>
          <FormTitle>Comment</FormTitle>
          {/* eslint-disable-next-line @typescript-eslint/no-misused-promises */}
          <form onSubmit={handleSubmit}>
            <Grid2 container spacing={2}>
              <Grid2 xs={12}>
                <TextFieldAutoFocus
                  fullWidth
                  id="comment"
                  label="Comment"
                  name="comment"
                  required
                  multiline
                  rows={4}
                  defaultValue={comment}
                />
              </Grid2>
              <Grid2 xs={6}>
                <Button
                  fullWidth
                  variant="contained"
                  color="secondary"
                  onClick={toggle}
                  disabled={status === "loading"}
                >
                  Cancel
                </Button>
              </Grid2>
              <Grid2 xs={6}>
                <Button
                  fullWidth
                  variant="contained"
                  color="primary"
                  type="submit"
                  disabled={status === "loading"}
                >
                  Submit
                </Button>
              </Grid2>
            </Grid2>
          </form>
        </FormCard>
      </Modal>
    </>
  );
};

export default CommentCell;
