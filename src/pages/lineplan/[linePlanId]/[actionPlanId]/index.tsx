import type { NextPage } from "next";
import Link from "next/link";
import Head from "next/head";
import { api } from "~/utils/api";

import Grid2 from "@mui/material/Unstable_Grid2";
import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import React from "react";
import FormCard from "~/components/FormCard";
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
  Breadcrumbs,
} from "@mui/material";
import { displayDate } from "~/utils/date";
import { useRouter } from "next/router";
import { ACTION_PRIORITY, ACTION_STATUS } from "~/utils/schema/action/action";
import ActionForm from "~/components/action/create/ActionForm";
import { useOrganization } from "@clerk/nextjs";
import { ORGANIZATION_MEMBERSHIP_LIMIT } from "~/utils/user";

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
      ACTION_STATUS.DELETED,
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
    <TableCell>
      <TableSortLabel
        active={orderBy.field === field}
        direction={orderBy.direction}
        onClick={onChangeOrderBy(field)}
      >
        {children}
      </TableSortLabel>
    </TableCell>
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

  const { membershipList } = useOrganization({
    membershipList: { limit: ORGANIZATION_MEMBERSHIP_LIMIT },
  });

  const actions = api.action.getByFilters.useQuery(
    { filters, orderBy },
    {
      enabled: !!linePlanId,
    }
  );
  const linePlan = api.linePlan.getById.useQuery(
    { id: linePlanId as string },
    {
      enabled: !!linePlanId,
    }
  );

  const actionPlan = api.actionPlan.getById.useQuery(
    {
      id: actionPlanId as string,
    },
    {
      enabled: !!actionPlanId,
    }
  );

  const updateAction = api.action.update.useMutation({
    onSuccess: async () => {
      await actions.refetch();
    },
  });

  const markAsCompleted = (id: string) => () => {
    updateAction.mutate({
      id,
      status: ACTION_STATUS.COMPLETED,
    });
  };

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
                  value={filters.leader}
                  onChange={onChangeLeader}
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
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            marginBlock: "2rem",
          }}
        >
          <ActionForm
            actionPlanId={actionPlanId as string}
            linePlanId={linePlanId as string}
            refetch={actions.refetch}
          />
          <Breadcrumbs sx={{ paddingInline: "1rem" }}>
            <Breadcrumbs separator="-" aria-label="breadcrumb">
              <Link color="inherit" href="/lineplan">
                Line Plan - {linePlan.data?.productionLine}
              </Link>
            </Breadcrumbs>
            <Breadcrumbs separator="-" aria-label="breadcrumb">
              <Link color="inherit" href={`/lineplan/${String(linePlanId)}`}>
                Action Plan - {actionPlan.data?.name}
              </Link>
            </Breadcrumbs>
          </Breadcrumbs>
        </Box>
        {actions.data && (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableHaderSort
                    field="priority"
                    onChangeOrderBy={onChangeOrderBy}
                    orderBy={orderBy}
                  >
                    Priority
                  </TableHaderSort>

                  <TableHaderSort
                    field="status"
                    onChangeOrderBy={onChangeOrderBy}
                    orderBy={orderBy}
                  >
                    Status
                  </TableHaderSort>

                  <TableHaderSort
                    field="name"
                    onChangeOrderBy={onChangeOrderBy}
                    orderBy={orderBy}
                  >
                    Name
                  </TableHaderSort>

                  <TableHaderSort
                    field="description"
                    onChangeOrderBy={onChangeOrderBy}
                    orderBy={orderBy}
                  >
                    Description
                  </TableHaderSort>

                  <TableCell>Comment</TableCell>

                  <TableHaderSort
                    field="assignedTo"
                    onChangeOrderBy={onChangeOrderBy}
                    orderBy={orderBy}
                  >
                    Assigned To
                  </TableHaderSort>

                  <TableHaderSort
                    field="leader"
                    onChangeOrderBy={onChangeOrderBy}
                    orderBy={orderBy}
                  >
                    Leader
                  </TableHaderSort>

                  <TableHaderSort
                    field="startDate"
                    onChangeOrderBy={onChangeOrderBy}
                    orderBy={orderBy}
                  >
                    Start Date
                  </TableHaderSort>

                  <TableHaderSort
                    field="dueDate"
                    onChangeOrderBy={onChangeOrderBy}
                    orderBy={orderBy}
                  >
                    Due Date
                  </TableHaderSort>

                  <TableCell>Created By</TableCell>

                  <TableHaderSort
                    field="createdAt"
                    onChangeOrderBy={onChangeOrderBy}
                    orderBy={orderBy}
                  >
                    Created At
                  </TableHaderSort>

                  <TableCell>Updated By</TableCell>

                  <TableHaderSort
                    field="updatedAt"
                    onChangeOrderBy={onChangeOrderBy}
                    orderBy={orderBy}
                  >
                    Updated At
                  </TableHaderSort>
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
                    <TableCell>
                      <FormControlLabel
                        label={action.status}
                        onChange={markAsCompleted(action.id)}
                        checked={action.status === ACTION_STATUS.COMPLETED}
                        disabled={action.status === ACTION_STATUS.COMPLETED}
                        control={<Checkbox />}
                      />
                    </TableCell>
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
