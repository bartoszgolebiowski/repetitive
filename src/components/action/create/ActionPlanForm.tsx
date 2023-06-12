import { useOrganization } from "@clerk/nextjs";
import { Modal, TextField, MenuItem, Button } from "@mui/material";
import Grid2 from "@mui/material/Unstable_Grid2";
import { DatePicker } from "@mui/x-date-pickers";
import React from "react";
import FormCard from "~/components/FormCard";
import FormTitle from "~/components/FormTitle";
import TextFieldAutoFocus from "~/components/TextFieldAutoFocus";
import { api } from "~/utils/api";
import { actionPlanCreateSchema } from "~/utils/schema/action/actionPlan";
import { ORGANIZATION_MEMBERSHIP_LIMIT } from "~/utils/user";

type Props = {
  linePlanId?: string;
  refetch: () => Promise<unknown>;
};

const useForm = (linePlanId?: string) => {
  const { dueDate } = useDates();
  const [assignedTo, setAssignee] = React.useState("");
  const [name, setName] = React.useState("");
  const [description, setDescription] = React.useState("");

  const handleAssigneeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAssignee(e.target.value);
  };
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
  };
  const handleDescriptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDescription(e.target.value);
  };

  return {
    values: {
      assignedTo,
      name,
      description,
      dueDate: dueDate.value,
      linePlanId,
    },
    assignee: {
      value: assignedTo,
      onChange: handleAssigneeChange,
    },
    name: {
      value: name,
      onChange: handleNameChange,
    },
    description: {
      value: description,
      onChange: handleDescriptionChange,
    },
    dueDate,
  };
};

const useDates = () => {
  const [dueDate, setDueDate] = React.useState<Date | null>(null);

  const handleDueDateChange = (date: Date | null) => {
    setDueDate(date);
  };

  return {
    dueDate: {
      value: dueDate,
      onChange: handleDueDateChange,
      disablePast: true,
      minDate: new Date(),
    },
  };
};

const isValid = (data: ReturnType<typeof useForm>["values"]) => {
  const result = actionPlanCreateSchema.safeParse({
    ...data,
  });
  return result.success;
};

const ActionPlanForm = (props: Props) => {
  const { linePlanId, refetch } = props;
  const ref = React.useRef<HTMLDivElement>(null);
  const [open, setOpen] = React.useState(false);
  const { values, assignee, name, description, dueDate } = useForm(linePlanId);

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

    const result = actionPlanCreateSchema.safeParse(values);

    if (result.success) {
      createLinePlan.mutate(result.data);
    }
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
                <TextFieldAutoFocus
                  fullWidth
                  autoFocus
                  id="name"
                  label="Name"
                  name="name"
                  required
                  {...name}
                />
              </Grid2>
              <Grid2 xs={12}>
                <TextField
                  fullWidth
                  id="description"
                  label="Description"
                  name="description"
                  multiline
                  rows={4}
                  required
                  {...description}
                />
              </Grid2>
              <Grid2 xs={12}>
                <TextField
                  select
                  fullWidth
                  id="assignedTo"
                  label="Assigned To"
                  name="assignedTo"
                  required
                  {...assignee}
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
              <Grid2
                xs={12}
                sx={{
                  "& > div": {
                    width: "100%",
                  },
                }}
              >
                <DatePicker label="Due Date *" {...dueDate} />
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
                  disabled={
                    createLinePlan.status === "loading" || !isValid(values)
                  }
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
