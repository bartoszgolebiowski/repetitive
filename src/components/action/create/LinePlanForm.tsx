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
import { linePlanItemCreateSchema } from "~/utils/schema/action/linePlan";
import { api } from "~/utils/api";

type Props = {
  organizationId?: string;
};

const LinePlanForm = (props: Props) => {
  const { organizationId } = props;
  const ref = React.useRef<HTMLDivElement>(null);
  const [open, setOpen] = React.useState(false);

  const organizationUsers = api.user.getByOrganizationId.useQuery(
    {
      organizationId: organizationId!,
    },
    {
      enabled: !!organizationId,
    }
  );

  const createLinePlan = api.linePlan.create.useMutation();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form)) as Record<
      string,
      unknown
    >;

    const dueDate = String(data.dueDate);
    data.dueDate = new Date(dueDate);
    const result = linePlanItemCreateSchema.safeParse(data);

    if (result.success) {
      createLinePlan.mutate(result.data);
    }
    //todo: handle error
    handleClose();
  };

  const handleClose = () => setOpen(false);
  const handleOpen = () => setOpen(true);

  return (
    <>
      <Button
        variant="contained"
        color="primary"
        onClick={handleOpen}
        disabled={!organizationId}
      >
        Create
      </Button>
      <Modal open={open} onClose={handleClose}>
        <FormCard size="medium" ref={ref}>
          <FormTitle>Create Line Plan</FormTitle>
          <form onSubmit={handleSubmit}>
            <input type="hidden" name="organizationId" value={organizationId} />
            <Grid2 container spacing={2}>
              <Grid2 xs={12}>
                <TextField
                  fullWidth
                  autoFocus
                  id="productionLine"
                  label="Production Line"
                  name="productionLine"
                />
              </Grid2>
              <Grid2 xs={12}>
                <TextField
                  select
                  fullWidth
                  id="assignedTo"
                  label="Assigned To"
                  name="assignedTo"
                >
                  <MenuItem value="">
                    <em>None</em>
                  </MenuItem>
                  {organizationUsers.data
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
                  type="datetime-local"
                  fullWidth
                  id="dueDate"
                  label="Due Date"
                  name="dueDate"
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </Grid2>
              <Grid2 xs={6}>
                <Button
                  fullWidth
                  variant="contained"
                  color="secondary"
                  onClick={handleClose}
                  disabled={createLinePlan.status === "loading"}
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
                  disabled={createLinePlan.status === "loading"}
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

export default LinePlanForm;
