import { Box, Tooltip } from "@mui/material";
import { type Comment } from "@prisma/client";
import React from "react";
import { displayDateFull } from "~/utils/date";

type Props = {
  comments: Omit<Comment, "actionId">[];
};

const CommentList = (props: Props) => {
  const { comments } = props;
  return (
    <Box component="ul" sx={{ paddingInlineStart: 2 }}>
      {comments.map((comment) => (
        <Tooltip
          key={comment.id}
          title={`${comment.createdBy} - ${displayDateFull(comment.createdAt)}`}
        >
          <li>{comment.comment}</li>
        </Tooltip>
      ))}
    </Box>
  );
};

export default CommentList;
