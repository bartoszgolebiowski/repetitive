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
  IconButton as IconButton,
  Tooltip,
  TableCell,
} from "@mui/material";
import Grid2 from "@mui/material/Unstable_Grid2";
import React from "react";
import { type z } from "zod";
import FormCard from "~/components/FormCard";
import FormTitle from "~/components/FormTitle";
import {
  ACTION_PRIORITY,
  actionEditItemSchema,
} from "~/utils/schema/action/action";
import { ORGANIZATION_MEMBERSHIP_LIMIT } from "~/utils/user";
import EditIcon from "@mui/icons-material/Edit";
import { blue } from "@mui/material/colors";
import TextFieldAutoFocus from "~/components/TextFieldAutoFocus";
import { iconButtonSx } from "~/components/utils";
import { DatePicker } from "@mui/x-date-pickers";

type Props = {
  defaultValues: z.infer<typeof actionEditItemSchema>;
  status: "error" | "success" | "loading" | "idle";
  disabled: boolean;
  onSubmit: (data: z.infer<typeof actionEditItemSchema>) => void;
};

const useForm = (defaultValues: z.infer<typeof actionEditItemSchema>) => {
  const { dueDate, startDate } = useDates(defaultValues);
  const [priority, setPriority] = React.useState<keyof typeof ACTION_PRIORITY>(
    defaultValues.priority ?? ACTION_PRIORITY.LOW
  );
  const [assignedTo, setAssignee] = React.useState(
    defaultValues.assignedTo ?? ""
  );
  const [name, setName] = React.useState(defaultValues.name ?? "");
  const [description, setDescription] = React.useState(
    defaultValues.description ?? ""
  );
  const [comment, setComment] = React.useState(defaultValues.comment ?? "");
  const [leader, setLeader] = React.useState(defaultValues.leader ?? "");

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
      id: defaultValues.id,
      priority,
      assignedTo,
      name,
      description,
      dueDate: dueDate.value,
      startDate: startDate.value,
      comment,
      leader,
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

const useDates = (defaultValues: z.infer<typeof actionEditItemSchema>) => {
  const [startDate, setStartDate] = React.useState<Date | null>(
    defaultValues.dueDate ?? null
  );
  const [dueDate, setDueDate] = React.useState<Date | null>(
    defaultValues.startDate ?? null
  );

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
      disabled: defaultValues.status === "DELAYED",
    },
    dueDate: {
      value: dueDate,
      onChange: handleDueDateChange,
      disablePast: true,
      minDate: startDate ?? undefined,
      disabled: !startDate || defaultValues.status === "DELAYED",
    },
  };
};

const isValid = (data: ReturnType<typeof useForm>["values"]) => {
  const result = actionEditItemSchema.safeParse({
    ...data,
  });
  return result.success;
};

const EditActionCell = (props: Props) => {
  const { defaultValues, onSubmit, status, disabled } = props;
  const ref = React.useRef<HTMLDivElement>(null);
  const [open, setOpen] = React.useState(false);
  const {
    values,
    priority,
    assignee,
    name,
    description,
    dueDate,
    startDate,
    comment,
    leader,
  } = useForm(defaultValues);
  const { membershipList } = useOrganization({
    membershipList: { limit: ORGANIZATION_MEMBERSHIP_LIMIT },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();

    const result = actionEditItemSchema.safeParse(values);

    if (result.success) {
      onSubmit(result.data);
    }

    toggle();
  };

  const toggle = () => setOpen((prev) => !prev);

  return (
    <>
      <TableCell>
        <Tooltip title={disabled ? "Only leader can edit" : "Edit"}>
          <IconButton
            aria-label="edit"
            onClick={disabled ? undefined : toggle}
            disabled={status === "loading"}
            sx={iconButtonSx({ disabled, color: blue[500] })}
          >
            <EditIcon />
          </IconButton>
        </Tooltip>
      </TableCell>
      <Modal open={open} onClose={toggle}>
        <FormCard size="large" ref={ref} sx={{ orverflowY: "scroll" }}>
          <FormTitle>Update Action</FormTitle>
          <form onSubmit={handleSubmit}>
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
                  required
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
                  rows={4}
                  {...comment}
                />
              </Grid2>
              <Grid2
                xs={12}
                sx={{
                  "& > div": {
                    width: "100%",
                  },
                }}
              >
                <DatePicker label="Start Date *" {...startDate} />
              </Grid2>
              <Grid2
                xs={12}
                sx={{
                  "& > div": {
                    width: "100%",
                  },
                }}
              >
                <DatePicker label="Due Date *" {...dueDate}/>
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
              <Grid2 xs={12}>
                <TextField
                  select
                  fullWidth
                  id="leader"
                  label="Leader"
                  name="leader"
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
                  disabled={status === "loading" || !isValid(values)}
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
