import { useOrganization } from "@clerk/nextjs";
import {
  FormControlLabel,
  Modal,
  TextField,
  MenuItem,
  FormControl,
  FormLabel,
  RadioGroup,
  Radio,
  Button,
  IconButton,
  Tooltip,
  TableCell,
} from "@mui/material";
import Grid2 from "@mui/material/Unstable_Grid2";
import React from "react";
import { type z } from "zod";
import FormCard from "~/components/FormCard";
import FormTitle from "~/components/FormTitle";
import { api } from "~/utils/api";
import { defaultValueDate } from "~/utils/date";
import {
  ACTION_PRIORITY,
  actionEditItemSchema,
} from "~/utils/schema/action/action";
import { ORGANIZATION_MEMBERSHIP_LIMIT } from "~/utils/user";
import EditIcon from "@mui/icons-material/Edit";
import { grey, blue } from "@mui/material/colors";
import TextFieldAutoFocus from "~/components/TextFieldAutofocus";

type Props = {
  defaultValues: z.infer<typeof actionEditItemSchema>;
  status: "error" | "success" | "loading" | "idle";
  onSubmit: (data: z.infer<typeof actionEditItemSchema>) => void;
};

const EditActionCell = (props: Props) => {
  const { defaultValues, onSubmit, status } = props;
  const ref = React.useRef<HTMLDivElement>(null);
  const [open, setOpen] = React.useState(false);

  const { membershipList } = useOrganization({
    membershipList: { limit: ORGANIZATION_MEMBERSHIP_LIMIT },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form)) as Record<
      string,
      unknown
    >;

    const dueDate = String(data.dueDate);
    const startDate = String(data.startDate);
    data.dueDate = new Date(dueDate);
    data.startDate = new Date(startDate);
    const result = actionEditItemSchema.safeParse(data);

    if (result.success) {
      onSubmit(result.data);
    }

    toggle();
  };

  const toggle = () => setOpen((prev) => !prev);

  return (
    <>
      <TableCell>
        <Tooltip title="Edit">
          <IconButton
            aria-label="edit"
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
            <EditIcon />
          </IconButton>
        </Tooltip>
      </TableCell>
      <Modal open={open} onClose={toggle}>
        <FormCard size="large" ref={ref} sx={{ orverflowY: "scroll" }}>
          <FormTitle>Update Action Plan</FormTitle>
          <form onSubmit={handleSubmit}>
            <input type="hidden" name="id" defaultValue={defaultValues.id} />
            <Grid2 container spacing={2}>
              <Grid2 xs={12}>
                <TextFieldAutoFocus
                  fullWidth
                  autoFocus
                  id="name"
                  label="Name"
                  name="name"
                  required
                  defaultValue={defaultValues.name}
                />
              </Grid2>
              <Grid2 xs={12}>
                <TextField
                  fullWidth
                  autoFocus
                  id="description"
                  label="Description"
                  name="description"
                  multiline
                  required
                  defaultValue={defaultValues.description}
                />
              </Grid2>
              <Grid2 xs={12}>
                <TextField
                  fullWidth
                  autoFocus
                  id="comment"
                  label="Comment"
                  name="comment"
                  multiline
                  defaultValue={defaultValues.comment}
                />
              </Grid2>
              <Grid2 xs={12}>
                <TextField
                  type="date"
                  fullWidth
                  id="startDate"
                  label="Start Date"
                  name="startDate"
                  InputLabelProps={{
                    shrink: true,
                  }}
                  required
                  defaultValue={defaultValueDate(defaultValues.startDate)}
                />
              </Grid2>
              <Grid2 xs={12}>
                <TextField
                  type="date"
                  fullWidth
                  id="dueDate"
                  label="Due Date"
                  name="dueDate"
                  InputLabelProps={{
                    shrink: true,
                  }}
                  required
                  defaultValue={defaultValueDate(defaultValues.dueDate)}
                />
              </Grid2>
              <Grid2 xs={12}>
                <TextField
                  select
                  fullWidth
                  id="assignedTo"
                  label="Assigned To"
                  name="assignedTo"
                  defaultValue={defaultValues.assignedTo}
                  required
                >
                  <MenuItem value="">
                    <em>None</em>
                  </MenuItem>
                  {membershipList?.map((member) => (
                    <MenuItem
                      key={member.id}
                      value={member.publicUserData.identifier}
                    >
                      {member.publicUserData.identifier}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid2>
              <Grid2 xs={12}>
                <TextField
                  select
                  fullWidth
                  id="leader"
                  label="Leader"
                  name="leader"
                  required
                  defaultValue={defaultValues.leader}
                >
                  <MenuItem value="">
                    <em>None</em>
                  </MenuItem>
                  {membershipList?.map((member) => (
                    <MenuItem
                      key={member.id}
                      value={member.publicUserData.identifier}
                    >
                      {member.publicUserData.identifier}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid2>
              <Grid2 xs={12}>
                <FormControl>
                  <FormLabel id="radio-priority">Priority</FormLabel>
                  <RadioGroup
                    aria-labelledby="radio-priority"
                    name="priority"
                    defaultValue={defaultValues.priority}
                  >
                    {Object.values(ACTION_PRIORITY).map((status) => (
                      <FormControlLabel
                        key={status}
                        value={status}
                        label={status}
                        control={<Radio required />}
                      />
                    ))}
                  </RadioGroup>
                </FormControl>
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
                  Update
                </Button>
              </Grid2>
            </Grid2>
          </form>
        </FormCard>
      </Modal>
    </>
  );
};

export default EditActionCell;
