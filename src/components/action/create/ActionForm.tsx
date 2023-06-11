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
} from "@mui/material";
import Grid2 from "@mui/material/Unstable_Grid2";
import { DatePicker } from "@mui/x-date-pickers";
import React from "react";
import FormCard from "~/components/FormCard";
import FormTitle from "~/components/FormTitle";
import TextFieldAutoFocus from "~/components/TextFieldAutoFocus";
import { api } from "~/utils/api";
import {
  ACTION_PRIORITY,
  actionItemSchema,
} from "~/utils/schema/action/action";
import { ACTION_STATUS } from "~/utils/schema/action/action";
import { ORGANIZATION_MEMBERSHIP_LIMIT } from "~/utils/user";

type Props = {
  linePlanId?: string;
  actionPlanId?: string;
  refetch: () => Promise<unknown>;
};

const useForm = (actionPlanId: string | undefined) => {
  const { dueDate, startDate } = useDates();
  const [priority, setPriority] = React.useState<keyof typeof ACTION_PRIORITY>(
    ACTION_PRIORITY.LOW
  );
  const [assignedTo, setAssignee] = React.useState("");
  const [name, setName] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [comment, setComment] = React.useState("");
  const [leader, setLeader] = React.useState("");

  const handleCommentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setComment(e.target.value);
  };
  const handlePriorityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPriority(e.target.value as keyof typeof ACTION_PRIORITY);
  };
  const handleAssigneeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAssignee(e.target.value);
  };
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
  };
  const handleDescriptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDescription(e.target.value);
  };

  const handleLeaderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLeader(e.target.value);
  };

  return {
    values: {
      priority,
      assignedTo,
      name,
      description,
      dueDate: dueDate.value,
      startDate: startDate.value,
      comment,
      leader,
      actionPlanId,
    },
    priority: {
      value: priority,
      onChange: handlePriorityChange,
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
    comment: {
      value: comment,
      onChange: handleCommentChange,
    },
    leader: {
      value: leader,
      onChange: handleLeaderChange,
    },
    dueDate,
    startDate,
  };
};

const useDates = () => {
  const [startDate, setStartDate] = React.useState<Date | null>(null);
  const [dueDate, setDueDate] = React.useState<Date | null>(null);

  const handleStartDateChange = (date: Date | null) => {
    setStartDate(date);
    if (date && dueDate) {
      if (date.getTime() > dueDate.getTime()) {
        setDueDate(null);
      }
    }
  };
  const handleDueDateChange = (date: Date | null) => {
    setDueDate(date);
  };

  return {
    startDate: {
      value: startDate,
      onChange: handleStartDateChange,
      disablePast: true,
    },
    dueDate: {
      value: dueDate,
      onChange: handleDueDateChange,
      disablePast: true,
      minDate: startDate ?? undefined,
      disabled: !startDate,
    },
  };
};

const isValid = (data: ReturnType<typeof useForm>["values"]) => {
  const result = actionItemSchema.safeParse({
    ...data,
    status: ACTION_STATUS.IN_PROGRESS,
  });
  return result.success;
};

const ActionForm = (props: Props) => {
  const { actionPlanId, refetch } = props;
  const ref = React.useRef<HTMLDivElement>(null);
  const [open, setOpen] = React.useState(false);
  const {
    startDate,
    dueDate,
    values,
    comment,
    name,
    assignee,
    leader,
    description,
    priority,
  } = useForm(actionPlanId);
  const { membershipList } = useOrganization({
    membershipList: { limit: ORGANIZATION_MEMBERSHIP_LIMIT },
  });

  const createAction = api.action.create.useMutation({
    onSuccess: async () => {
      await refetch();
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();

    const result = actionItemSchema.safeParse({
      ...values,
      status: ACTION_STATUS.IN_PROGRESS,
    });

    if (result.success) {
      createAction.mutate(result.data);
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
        <FormCard size="large" ref={ref} sx={{ orverflowY: "scroll" }}>
          <FormTitle>Create Action Plan</FormTitle>
          <form onSubmit={handleSubmit}>
            <input type="hidden" name="actionPlanId" value={actionPlanId} />
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
                  autoFocus
                  id="description"
                  label="Description"
                  name="description"
                  multiline
                  {...description}
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
                  {...comment}
                />
              </Grid2>
              <Grid2 xs={12}>
                <DatePicker label="Start Date" {...startDate} />
              </Grid2>
              <Grid2 xs={12}>
                <DatePicker label="Due Date" {...dueDate} />
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
              <Grid2 xs={12}>
                <TextField
                  select
                  fullWidth
                  id="leader"
                  label="Leader"
                  name="leader"
                  defaultValue=""
                  required
                  {...leader}
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
                    {...priority}
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
                  disabled={
                    createAction.status === "loading" || !isValid(values)
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

export default ActionForm;
