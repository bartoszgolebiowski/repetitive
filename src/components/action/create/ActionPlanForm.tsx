import { useOrganization } from "@clerk/nextjs";
import { Modal, TextField, MenuItem, Button } from "@mui/material";
import Grid2 from "@mui/material/Unstable_Grid2";
import React from "react";
import FormCard from "~/components/FormCard";
import FormTitle from "~/components/FormTitle";
import { api } from "~/utils/api";
import { actionPlanCreateSchema } from "~/utils/schema/action/actionPlan";
import { ORGANIZATION_MEMBERSHIP_LIMIT } from "~/utils/user";

type Props = {
  linePlanId?: string;
  refetch: () => Promise<unknown>;
};

const ActionPlanForm = (props: Props) => {
  const { linePlanId, refetch } = props;
  const ref = React.useRef<HTMLDivElement>(null);
  const [open, setOpen] = React.useState(false);

  const { membershipList } = useOrganization({
    membershipList: { limit: ORGANIZATION_MEMBERSHIP_LIMIT },
  });

  const createLinePlan = api.actionPlan.create.useMutation({
    onSuccess: async () => {
      await refetch();
    },
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
    data.dueDate = new Date(dueDate);
    const result = actionPlanCreateSchema.safeParse(data);

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
      <Button variant="contained" color="primary" onClick={handleOpen}>
        Create
      </Button>
      <Modal open={open} onClose={handleClose}>
        <FormCard size="medium" ref={ref}>
          <FormTitle>Create Action Plan</FormTitle>
          <form onSubmit={handleSubmit}>
            <input type="hidden" name="linePlanId" value={linePlanId} />
            <Grid2 container spacing={2}>
              <Grid2 xs={12}>
                <TextField
                  fullWidth
                  autoFocus
                  id="name"
                  label="Name"
                  name="name"
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
                  select
                  fullWidth
                  id="assignedTo"
                  label="Assigned To"
                  name="assignedTo"
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
                  type="date"
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

export default ActionPlanForm;
