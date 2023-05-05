import { TableRow, TableCell, FormControlLabel, Checkbox } from "@mui/material";
import React, { type ComponentProps, type PropsWithChildren } from "react";
import ActionCheckbox from "./ActionCheckbox";
import { type DefinitionTask } from "./utils";

type Props = {
  definitionTask: DefinitionTask;
  checkedDone: boolean;
  checkedAction: boolean;
  onDoneChange: () => void;
  onActionChange: ComponentProps<typeof ActionCheckbox>["onChange"];
};

const ChecklistRow = (props: PropsWithChildren<Props>) => {
  const {
    children,
    definitionTask,
    checkedAction,
    checkedDone,
    onActionChange,
    onDoneChange,
  } = props;

  return (
    <TableRow key={definitionTask.id}>
      {children}
      <TableCell align="right">
        <FormControlLabel
          disabled={definitionTask.derived.disabled}
          label="Done"
          control={<Checkbox />}
          checked={checkedDone}
          onChange={onDoneChange}
        />
        <ActionCheckbox
          definitionTask={definitionTask}
          checked={checkedAction}
          onChange={onActionChange}
        />
      </TableCell>
    </TableRow>
  );
};

export default ChecklistRow;
