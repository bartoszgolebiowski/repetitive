import type { NextPage } from "next";
import Link from "next/link";
import Head from "next/head";
import { api } from "~/utils/api";

import Grid2 from "@mui/material/Unstable_Grid2";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Modal from "@mui/material/Modal";
import Typography from "@mui/material/Typography";
import React from "react";
import FormCard from "~/components/FormCard";
import GroupAddIcon from "@mui/icons-material/GroupAdd";
import FormTitle from "~/components/FormTitle";
import TableContainer from "@mui/material/TableContainer";
import Paper from "@mui/material/Paper";
import MenuItem from "@mui/material/MenuItem";
import {
  FormControl,
  FormLabel,
  FormGroup,
  FormControlLabel,
  Checkbox,
  TableSortLabel,
} from "@mui/material";
import { displayDate } from "~/utils/date";
import { useRouter } from "next/router";
import { ACTION_PRIORITY, ACTION_STATUS } from "~/utils/schema/action/action";
import ActionForm from "~/components/action/ActionForm";

const convertQueryToFilters = (): Omit<
  Parameters<typeof api.action.getByFilters.useQuery>[0]["filters"],
  "actionPlanId"
> => {
  return {
    startDate: null,
    dueDate: null,
    assignedTo: "",
    leader: "",
    priority: [ACTION_PRIORITY.LOW, ACTION_PRIORITY.HIGH] as Array<
      keyof typeof ACTION_PRIORITY
    >,
    status: [
      ACTION_STATUS.COMPLETED,
      ACTION_STATUS.DELEYED,
      ACTION_STATUS.IN_PROGRESS,
      ACTION_STATUS.REJECTED,
    ] as Array<keyof typeof ACTION_STATUS>,
  };
};

const useForm = (actionPlanId: string) => {
  const [filters, setFilters] = React.useState(() => convertQueryToFilters());

  const onChangeDueDate = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters((prev) => ({ ...prev, dueDate: e.target.valueAsDate }));
  };

  const onChangeAssignedTo = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters((prev) => ({ ...prev, assignedTo: e.target.value }));
  };

  const onChangeLeader = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters((prev) => ({ ...prev, leader: e.target.value }));
  };

  const onChangeStartDate = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters((prev) => ({ ...prev, startDate: e.target.valueAsDate }));
  };

  const onChangePriority = (priority: keyof typeof ACTION_PRIORITY) => () => {
    const currentIndex = filters.priority.indexOf(priority);
    const newChecked = [...filters.priority];

    if (currentIndex === -1) {
      newChecked.push(priority);
    } else {
      newChecked.splice(currentIndex, 1);
    }

    setFilters((prev) => ({ ...prev, priority: newChecked }));
  };

  const onChangeStatus = (status: keyof typeof ACTION_STATUS) => () => {
    const currentIndex = filters.status.indexOf(status);
    const newChecked = [...filters.status];

    if (currentIndex === -1) {
      newChecked.push(status);
    } else {
      newChecked.splice(currentIndex, 1);
    }

    setFilters((prev) => ({ ...prev, status: newChecked }));
  };

  return {
    filters: { ...filters, actionPlanId },
    onChangeStartDate,
    onChangeDueDate,
    onChangeAssignedTo,
    onChangeLeader,
    onChangePriority,
    onChangeStatus,
  };
};
type RemoveUndefined<T> = T extends undefined ? never : T;
type OrderBy = RemoveUndefined<
  Parameters<typeof api.action.getByFilters.useQuery>[0]["orderBy"]
>;

const initialOrderBy: OrderBy = {
  field: "dueDate",
  direction: "asc",
};

const useOrderBy = () => {
  const [orderBy, setOrderBy] = React.useState(initialOrderBy);

  const onChangeOrderBy = (field: OrderBy["field"]) => () => {
    setOrderBy((prev) => ({
      field,
      direction:
        prev.field === field
          ? prev.direction === "asc"
            ? "desc"
            : "asc"
          : "asc",
    }));
  };

  return { orderBy, onChangeOrderBy };
};

const TableHaderSort = ({
  children,
  field,
  orderBy,
  onChangeOrderBy,
}: {
  children: React.ReactNode;
  orderBy: OrderBy;
  field: OrderBy["field"];
  onChangeOrderBy: (field: OrderBy["field"]) => () => void;
}) => {
  return (
    <TableSortLabel
      active={orderBy.field === field}
      direction={orderBy.direction}
      onClick={onChangeOrderBy(field)}
    >
      {children}
      {orderBy.field === field ? (
        <Box
          component="span"
          sx={{
            visibility: "hidden",
          }}
        >
          {orderBy.direction === "desc"
            ? "sorted descending"
            : "sorted ascending"}
        </Box>
      ) : null}
    </TableSortLabel>
  );
};

const Actions: NextPage = () => {
  const { linePlanId, actionPlanId } = useRouter().query;

  const {
    filters,
    onChangeDueDate,
    onChangeAssignedTo,
    onChangeStatus,
    onChangeLeader,
    onChangePriority,
    onChangeStartDate,
  } = useForm(actionPlanId as string);
  const { orderBy, onChangeOrderBy } = useOrderBy();

  const linePlanUsers = api.user.getByLinePlanId.useQuery(
    {
      linePlanId: linePlanId as string,
    },
    {
      enabled: !!linePlanId,
    }
  );

  const actions = api.action.getByFilters.useQuery(
    { filters, orderBy },
    {
      enabled: !!linePlanId,
    }
  );

  return (
    <>
      <Head>
        <title>Action Plan</title>
        <meta name="description" content="Manage Action Plans" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Box component="main">
        <FormCard size="large">
          <FormTitle>Filters</FormTitle>
          <form>
            <Grid2 container spacing={2}>
              <Grid2 xs={12}>
                <TextField
                  select
                  fullWidth
                  id="assignedTo"
                  label="Assigned To"
                  name="assignedTo"
                  value={filters.assignedTo}
                  onChange={onChangeAssignedTo}
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
                  value={filters.leader}
                  onChange={onChangeLeader}
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
                  type="datetime-local"
                  fullWidth
                  id="startDate"
                  label="Start Date"
                  name="startDate"
                  value={filters.startDate ?? ""}
                  onChange={onChangeStartDate}
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </Grid2>
              <Grid2 xs={12}>
                <TextField
                  type="datetime-local"
                  fullWidth
                  id="dueDate"
                  label="Due Date"
                  name="dueDate"
                  value={filters.dueDate ?? ""}
                  onChange={onChangeDueDate}
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </Grid2>
              <Grid2 xs={12}>
                <FormControl
                  sx={{
                    borderRadius: "4px",
                    border: 0,
                    padding: 0,
                    display: "block",
                  }}
                  component={"fieldset"}
                >
                  <FormLabel component="legend">Priority</FormLabel>
                  <FormGroup sx={{ display: "block" }}>
                    {Object.values(ACTION_PRIORITY).map((status) => (
                      <FormControlLabel
                        key={status}
                        name="status"
                        id={String(status)}
                        value={String(status)}
                        label={status}
                        onChange={onChangePriority(status)}
                        checked={filters.priority.includes(status)}
                        control={<Checkbox />}
                      />
                    ))}
                  </FormGroup>
                </FormControl>
              </Grid2>
              <Grid2 xs={12}>
                <FormControl
                  sx={{
                    borderRadius: "4px",
                    border: 0,
                    padding: 0,
                    display: "block",
                  }}
                  component={"fieldset"}
                >
                  <FormLabel component="legend">Status</FormLabel>
                  <FormGroup sx={{ display: "block" }}>
                    {Object.values(ACTION_STATUS).map((status) => (
                      <FormControlLabel
                        key={status}
                        name="status"
                        id={String(status)}
                        value={String(status)}
                        label={status}
                        onChange={onChangeStatus(status)}
                        checked={filters.status.includes(status)}
                        control={<Checkbox />}
                      />
                    ))}
                  </FormGroup>
                </FormControl>
              </Grid2>
            </Grid2>
          </form>
        </FormCard>
        <ActionForm
          actionPlanId={actionPlanId as string}
          linePlanId={linePlanId as string}
        />
        <Typography variant="h4" sx={{ pb: "1rem" }}>
          Action Plan
        </Typography>
        <form id="sorting"></form>
        {actions.data && (
          <TableContainer component={Paper}>
            <Table>
              {/* <TableHead>
                <TableRow>
                  <TableCell>Status</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Comment</TableCell>
                  <TableCell align="right">
                    <div>Assigned To /</div>
                    <div>Leader</div>
                  </TableCell>
                  <TableCell align="right">
                    <div>Created By /</div>
                    <div>Created At</div>
                  </TableCell>
                  <TableCell align="right">
                    <div>Updated By /</div>
                    <div>Updated At</div>
                  </TableCell>
                  <TableCell align="right">
                    <div>Start Date /</div>
                    <div>Due Date</div>
                  </TableCell>
                </TableRow>
              </TableHead> */}
              {/* {actions.data.map((action) => (
                  <TableRow
                    key={action.id}
                    sx={{
                      backgroundColor:
                        action.status === ACTION_STATUS.COMPLETED
                          ? "green"
                          : ACTION_STATUS.IN_PROGRESS
                          ? "yellow"
                          : "red",
                    }}
                  >
                    <TableCell>{action.status}</TableCell>
                    <TableCell>{action.name}</TableCell>
                    <TableCell>{action.description}</TableCell>
                    <TableCell>{action.comment}</TableCell>
                    <TableCell align="right">
                      <div>{action.assignedTo}</div>
                      <div>{action.leader}</div>
                    </TableCell>
                    <TableCell align="right">
                      <div>{action.createdBy}</div>
                      <div>{displayDate(action.createdAt)}</div>
                    </TableCell>
                    <TableCell align="right">
                      <div>{action.updatedBy}</div>
                      <div>{displayDate(action.updatedAt)}</div>
                    </TableCell>
                    <TableCell align="right">
                      <div>{displayDate(action.startDate)}</div>
                      <div>{displayDate(action.dueDate)}</div>
                    </TableCell>
                  </TableRow>
                ))} */}
              <TableHead>
                <TableRow>
                  <TableCell>
                    <TableHaderSort
                      field="priority"
                      onChangeOrderBy={onChangeOrderBy}
                      orderBy={orderBy}
                    >
                      Priority
                    </TableHaderSort>
                  </TableCell>
                  <TableCell>
                    <TableHaderSort
                      field="status"
                      onChangeOrderBy={onChangeOrderBy}
                      orderBy={orderBy}
                    >
                      Status
                    </TableHaderSort>
                  </TableCell>
                  <TableCell>
                    <TableHaderSort
                      field="name"
                      onChangeOrderBy={onChangeOrderBy}
                      orderBy={orderBy}
                    >
                      Name
                    </TableHaderSort>
                  </TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Comment</TableCell>

                  <TableCell>
                    <TableHaderSort
                      field="assignedTo"
                      onChangeOrderBy={onChangeOrderBy}
                      orderBy={orderBy}
                    >
                      Assigned To
                    </TableHaderSort>
                  </TableCell>

                  <TableCell>
                    <TableHaderSort
                      field="leader"
                      onChangeOrderBy={onChangeOrderBy}
                      orderBy={orderBy}
                    >
                      Leader
                    </TableHaderSort>
                  </TableCell>
                  <TableCell>
                    <TableHaderSort
                      field="startDate"
                      onChangeOrderBy={onChangeOrderBy}
                      orderBy={orderBy}
                    >
                      Start Date
                    </TableHaderSort>
                  </TableCell>
                  <TableCell>
                    <TableHaderSort
                      field="dueDate"
                      onChangeOrderBy={onChangeOrderBy}
                      orderBy={orderBy}
                    >
                      Due Date
                    </TableHaderSort>
                  </TableCell>
                  <TableCell>Created By</TableCell>
                  <TableCell>
                    <TableHaderSort
                      field="createdAt"
                      onChangeOrderBy={onChangeOrderBy}
                      orderBy={orderBy}
                    >
                      Created At
                    </TableHaderSort>
                  </TableCell>
                  <TableCell>
                    <TableHaderSort
                      field="updatedAt"
                      onChangeOrderBy={onChangeOrderBy}
                      orderBy={orderBy}
                    >
                      Updated At
                    </TableHaderSort>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {actions.data.map((action) => (
                  <TableRow
                    key={action.id}
                    sx={{
                      backgroundColor:
                        action.status === ACTION_STATUS.COMPLETED
                          ? "green"
                          : ACTION_STATUS.IN_PROGRESS
                          ? "yellow"
                          : "red",
                    }}
                  >
                    <TableCell>{action.priority}</TableCell>
                    <TableCell>{action.status}</TableCell>
                    <TableCell>{action.name}</TableCell>
                    <TableCell>{action.description}</TableCell>
                    <TableCell>{action.comment}</TableCell>
                    <TableCell>{action.assignedTo}</TableCell>
                    <TableCell>{action.leader}</TableCell>
                    <TableCell>{displayDate(action.startDate)}</TableCell>
                    <TableCell>{displayDate(action.dueDate)}</TableCell>
                    <TableCell>{action.createdBy}</TableCell>
                    <TableCell>{displayDate(action.createdAt)}</TableCell>
                    <TableCell>{action.updatedBy}</TableCell>
                    <TableCell>{displayDate(action.updatedAt)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>
    </>
  );
};

export default Actions;
