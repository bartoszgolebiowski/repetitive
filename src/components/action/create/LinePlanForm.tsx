import { Modal, TextField, MenuItem, Button } from "@mui/material";
import Grid2 from "@mui/material/Unstable_Grid2";
import React from "react";
import FormCard from "~/components/FormCard";
import FormTitle from "~/components/FormTitle";
import { linePlanItemCreateSchema } from "~/utils/schema/action/linePlan";
import { api } from "~/utils/api";
import { useOrganization } from "@clerk/nextjs";
import { ORGANIZATION_MEMBERSHIP_LIMIT } from "~/utils/user";
import { DatePicker } from "@mui/x-date-pickers";

type Props = {
  organizationId?: string;
  refetch: () => Promise<unknown>;
};

const useForm = (organizationId?: string) => {
  const { dueDate } = useDates();
  const [assignedTo, setAssignee] = React.useState("");
  const [productionLine, setProductionLine] = React.useState("");

  const handleAssigneeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAssignee(e.target.value);
  };

  const handleProductionLineChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setProductionLine(e.target.value);
  };

  return {
    values: {
      assignedTo,
      productionLine,
      dueDate: dueDate.value,
      organizationId,
    },
    assignee: {
      value: assignedTo,
      onChange: handleAssigneeChange,
    },
    productionLine: {
      value: productionLine,
      onChange: handleProductionLineChange,
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
  const result = linePlanItemCreateSchema.safeParse({
    ...data,
  });
  return result.success;
};

const LinePlanForm = (props: Props) => {
  const { organizationId, refetch } = props;
  const ref = React.useRef<HTMLDivElement>(null);
  const [open, setOpen] = React.useState(false);
  const { values, assignee, productionLine, dueDate } = useForm(organizationId);
  const { membershipList } = useOrganization({
    membershipList: { limit: ORGANIZATION_MEMBERSHIP_LIMIT },
  });

  const createLinePlan = api.linePlan.create.useMutation({
    onSuccess: async () => {
      await refetch();
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();

    const result = linePlanItemCreateSchema.safeParse(values);

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
                  autoFocus
                  fullWidth
                  id="productionLine"
                  label="Production Line"
                  name="productionLine"
                  required
                  {...productionLine}
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

export default LinePlanForm;
