import {
  FormControlLabel,
  Checkbox,
  Modal,
  TextField,
  MenuItem,
  FormControl,
  FormLabel,
  RadioGroup,
  Radio,
  Button,
} from "@mui/material";
import Grid2 from "@mui/material/Unstable_Grid2";
import React from "react";
import FormCard from "~/components/FormCard";
import FormTitle from "~/components/FormTitle";
import { api } from "~/utils/api";
import { ACTION_PRIORITY, actionItemSchema } from "~/utils/schema/action/action";
import { ACTION_STATUS } from "~/utils/schema/action/action";

type Props = {
  linePlanId?: string;
  actionPlanId?: string;
};

const ActionForm = (props: Props) => {
  const { linePlanId, actionPlanId } = props;
  const ref = React.useRef<HTMLDivElement>(null);
  const [open, setOpen] = React.useState(false);

  const linePlanUsers = api.user.getByLinePlanId.useQuery(
    {
      linePlanId: linePlanId as string,
    },
    {
      enabled: !!linePlanId,
    }
  );

  const createAction = api.action.create.useMutation();

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
    const result = actionItemSchema.safeParse(data);

    if (result.success) {
      createAction.mutate(result.data);
    }
    console.log(result)
    //todo: handle error
    handleClose();
  };

  const handleClose = () => setOpen(false);
  const handleOpen = () => setOpen(true);

  return (
    <>
      <Button variant="contained" color="primary" onClick={handleOpen}>
        Create
      </Button>
      <Modal open={open} onClose={handleClose}>
        <FormCard size="medium" ref={ref}>
          <FormTitle>Create Action Plan</FormTitle>
          <form onSubmit={handleSubmit}>
            <input type="hidden" name="actionPlanId" value={actionPlanId} />
            <Grid2 container spacing={2}>
              <Grid2 xs={12}>
                <TextField
                  fullWidth
                  autoFocus
                  id="name"
                  label="Name"
                  name="name"
                  required
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
                />
              </Grid2>
              <Grid2 xs={12}>
                <TextField
                  type="datetime-local"
                  fullWidth
                  id="startDate"
                  label="Start Date"
                  name="startDate"
                  InputLabelProps={{
                    shrink: true,
                  }}
                  required
                />
              </Grid2>
              <Grid2 xs={12}>
                <TextField
                  type="datetime-local"
                  fullWidth
                  id="dueDate"
                  label="Due Date"
                  name="dueDate"
                  InputLabelProps={{
                    shrink: true,
                  }}
                  required
                />
              </Grid2>
              <Grid2 xs={12}>
                <TextField
                  select
                  fullWidth
                  id="assignedTo"
                  label="Assigned To"
                  name="assignedTo"
                  defaultValue=""
                  required
                >
                  <MenuItem value="">
                    <em>None</em>
                  </MenuItem>
                  {linePlanUsers.data
                    ?.map(({ email }) => email)
                    .map((option) => (
                      <MenuItem key={String(option)} value={String(option)}>
                        {String(option)}
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
                  defaultValue=""
                  required
                >
                  <MenuItem value="">
                    <em>None</em>
                  </MenuItem>
                  {linePlanUsers.data
                    ?.map(({ email }) => email)
                    .map((option) => (
                      <MenuItem key={String(option)} value={String(option)}>
                        {String(option)}
                      </MenuItem>
                    ))}
                </TextField>
              </Grid2>
              <Grid2 xs={12}>
                <FormControl>
                  <FormLabel id="radio-priority">Priority</FormLabel>
                  <RadioGroup aria-labelledby="radio-priority" name="priority">
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
              <Grid2 xs={12}>
                <FormControl>
                  <FormLabel id="radio-status">Status</FormLabel>
                  <RadioGroup aria-labelledby="radio-status" name="status">
                    {Object.values(ACTION_STATUS).map((status) => (
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
                  onClick={handleClose}
                  disabled={createAction.status === "loading"}
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
                  disabled={createAction.status === "loading"}
                >
                  Create
                </Button>
              </Grid2>
            </Grid2>
          </form>
        </FormCard>
      </Modal>
    </>
  );
};

export default ActionForm;
