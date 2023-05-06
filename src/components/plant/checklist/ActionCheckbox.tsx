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
import { defectItemSchema, DEFECT_STATUS } from "~/utils/defect";
import { api } from "~/utils/api";
import { stableNow } from "~/utils/date";
import type { DefinitionTask, Defect } from "./utils";

const addZero = (n: number) => (n < 10 ? `0${n}` : n);
const parseDateToInput = (date: Date) => {
  const year = date.getFullYear();
  const month = addZero(date.getMonth() + 1);
  const day = addZero(date.getDate());
  const hours = addZero(date.getHours());
  const minutes = addZero(date.getMinutes());
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

type Props = {
  definitionTask: {
    id: DefinitionTask["id"];
    definition: {
      plantId: DefinitionTask["definition"]["plantId"];
    };
    derived: {
      disabled: DefinitionTask["derived"]["disabled"];
    };
  };
  checked: boolean;
  onChange: (action: Defect | null) => void;
};

const ActionCheckbox = (props: Props) => {
  const { definitionTask, checked, onChange } = props;
  const ref = React.useRef<HTMLDivElement>(null);
  const [open, setOpen] = React.useState(false);

  const plantUsers = api.user.getByPlantId.useQuery({
    plantId: definitionTask.definition.plantId,
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
    const result = defectItemSchema.safeParse(data);

    if (result.success) {
      onChange(result.data);
    }
    //todo: handle error
    handleClose();
  };

  const handleClose = () => setOpen(false);
  const handleToggle = () => {
    if (checked) {
      onChange(null);
    } else {
      setOpen(true);
    }
  };

  return (
    <>
      <FormControlLabel
        disabled={definitionTask.derived.disabled}
        name="action"
        label="Action"
        checked={checked}
        onChange={handleToggle}
        control={<Checkbox />}
      />
      <Modal open={open} onClose={handleClose}>
        <FormCard size="medium" ref={ref}>
          <FormTitle>Create Action</FormTitle>
          <form onSubmit={handleSubmit}>
            <input
              type="hidden"
              name="definitionTaskId"
              value={definitionTask.id}
            />
            <Grid2 container spacing={2}>
              <Grid2 xs={12}>
                <TextField
                  required
                  fullWidth
                  autoFocus
                  id="description"
                  label="Description"
                  name="description"
                />
              </Grid2>
              <Grid2 xs={12}>
                <TextField
                  required
                  defaultValue={parseDateToInput(stableNow)}
                  type="datetime-local"
                  fullWidth
                  id="dueDate"
                  label="Due Date"
                  name="dueDate"
                />
              </Grid2>
              <Grid2 xs={12}>
                <TextField
                  select
                  fullWidth
                  id="assignedTo"
                  label="Assigned To"
                  name="assignedTo"
                  disabled={!plantUsers.data}
                  defaultValue=""
                >
                  <MenuItem value="">
                    <em>None</em>
                  </MenuItem>
                  {plantUsers.data
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
                  <FormLabel id="radio-status">Status</FormLabel>
                  <RadioGroup aria-labelledby="radio-status" name="status">
                    {Object.values(DEFECT_STATUS).map((status) => (
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

export default ActionCheckbox;
