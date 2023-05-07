import { TableRow, TableCell, FormControlLabel, Checkbox } from "@mui/material";
import React, { type ComponentProps, type PropsWithChildren } from "react";
import DefectCheckbox from "./DefectCheckbox";
import { type DefinitionTask } from "./utils";

type Props = {
  definitionTask: DefinitionTask;
  checkedDone: boolean;
  checkedAction: boolean;
  onDoneChange: () => void;
  onActionChange: ComponentProps<typeof DefectCheckbox>["onChange"];
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
        <DefectCheckbox
          definitionTask={definitionTask}
          checked={checkedAction}
          onChange={onActionChange}
        />
      </TableCell>
    </TableRow>
  );
};

export default ChecklistRow;
