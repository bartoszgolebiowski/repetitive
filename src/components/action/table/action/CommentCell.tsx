import {
  TableCell,
  Tooltip,
  IconButton as IconButton,
  Modal,
  Button,
  Box,
  TextField,
  Divider,
} from "@mui/material";
import React from "react";
import CommentIcon from "@mui/icons-material/Comment";
import { blue } from "@mui/material/colors";
import Grid2 from "@mui/material/Unstable_Grid2";
import FormCard from "~/components/FormCard";
import FormTitle from "~/components/FormTitle";
import TextFieldAutoFocus from "~/components/TextFieldAutoFocus";
import { iconButtonSx } from "~/components/utils";
import { type Comment } from "@prisma/client";
import { displayDateFull } from "~/utils/date";

type Props = {
  comments: Omit<Comment, "actionId">[];
  status: "error" | "success" | "loading" | "idle";
  onSubmit: (comment: string) => Promise<unknown>;
};

export const SIZE_COMMENT_CELL = "10rem";

const CommentCell = (props: React.PropsWithChildren<Props>) => {
  const { children, comments, status, onSubmit } = props;
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

  const label = (comment: (typeof comments)[number]) =>
    `By: ${comment.createdBy}`;
  const date = (comment: (typeof comments)[number]) =>
    `Date: ${displayDateFull(comment.createdAt)}`;
  return (
    <>
      <TableCell>
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
                aria-label="Add comment"
                onClick={toggle}
                color="primary"
                disabled={status === "loading"}
                sx={iconButtonSx({ disabled: false, color: blue[500] })}
              >
                <CommentIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </TableCell>
      <Modal open={open} onClose={toggle} key={String(open)}>
        <FormCard size="medium" ref={ref}>
          <FormTitle>Comments</FormTitle>
          {/* eslint-disable-next-line @typescript-eslint/no-misused-promises */}
          <form onSubmit={handleSubmit}>
            <Grid2 container spacing={2}>
              <Grid2 xs={12}>
                {comments.map((comment) => (
                  <Box key={comment.id}>
                    <Box component={"label"} htmlFor={`comment-${comment.id}`}>
                      {label(comment)}
                    </Box>
                    <Box>{date(comment)}</Box>
                    <TextField
                      inputProps={{
                        id: `comment-${comment.id}`,
                        name: `comment-${comment.id}`,
                      }}
                      fullWidth
                      disabled
                      defaultValue={comment.comment}
                      multiline
                      rows={4}
                    />
                    <Divider sx={{ mb: 1 }} />
                  </Box>
                ))}
              </Grid2>
              <Grid2 xs={12}>
                <TextFieldAutoFocus
                  fullWidth
                  id="comment"
                  label="Comment"
                  name="comment"
                  required
                  multiline
                  disabled={status === "loading"}
                  rows={4}
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
