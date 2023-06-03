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
import TableContainer from "@mui/material/TableContainer";
import Paper from "@mui/material/Paper";
import MenuItem from "@mui/material/MenuItem";
import {
  FormControl,
  FormLabel,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Breadcrumbs,
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Typography,
} from "@mui/material";
import { displayDate, displayDateFull } from "~/utils/date";
import { useRouter } from "next/router";
import { ACTION_PRIORITY, ACTION_STATUS } from "~/utils/schema/action/action";
import ActionForm from "~/components/action/create/ActionForm";
import { useOrganization } from "@clerk/nextjs";
import { ORGANIZATION_MEMBERSHIP_LIMIT } from "~/utils/user";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ActionCell, {
  SIZE_ACTION_CELL,
} from "~/components/action/table/action/ActionCell";
import CommentCell, {
  SIZE_COMMENT_CELL,
} from "~/components/action/table/action/CommentCell";
import StatusCircle from "~/components/action/table/action/StatusCircle";
import EditActionCell from "~/components/action/table/action/EditActionCell";

const convertQueryToFilters = (): Omit<
  Parameters<typeof api.action.getByFilters.useQuery>[0]["filters"],
  "actionPlanId"
> => {
  return {
    startDate: null,
    dueDate: null,
    assignedTo: "",
    leader: "",
    priority: Object.keys(ACTION_PRIORITY) as (keyof typeof ACTION_PRIORITY)[],
    status: Object.keys(ACTION_STATUS) as (keyof typeof ACTION_STATUS)[],
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

  const { membershipList } = useOrganization({
    membershipList: { limit: ORGANIZATION_MEMBERSHIP_LIMIT },
  });

  const actions = api.action.getByFilters.useQuery(
    { filters },
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

  const markAsRejected = (id: string) => () => {
    updateAction.mutate({
      id,
      status: ACTION_STATUS.REJECTED,
    });
  };

  const handleCommentChange = (id: string) => (comment: string) =>
    updateAction.mutateAsync({
      id,
      comment,
    });

  return (
    <>
      <Head>
        <title>Actions</title>
        <meta name="description" content="Manage Actions" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Box component="main">
        <Accordion sx={{ maxWidth: "40rem" }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h5">Actions Filters</Typography>
          </AccordionSummary>
          <AccordionDetails>
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
                    type="date"
                    fullWidth
                    id="startDate"
                    label="Start Date"
                    name="startDate"
                    value={filters.startDate?.toISOString().split("T")[0] ?? ""}
                    onChange={onChangeStartDate}
                    InputLabelProps={{
                      shrink: true,
                    }}
                  />
                </Grid2>
                <Grid2 xs={12}>
                  <TextField
                    type="date"
                    fullWidth
                    id="dueDate"
                    label="Due Date"
                    name="dueDate"
                    value={filters.dueDate?.toISOString().split("T")[0] ?? ""}
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
          </AccordionDetails>
        </Accordion>
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
          <TableContainer
            component={Paper}
            sx={{
              opacity: updateAction.isLoading ? 0.7 : 1,
            }}
          >
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ minWidth: SIZE_ACTION_CELL }}>
                    Actions
                  </TableCell>
                  <TableCell sx={{ minWidth: SIZE_COMMENT_CELL }}>
                    Comment
                  </TableCell>
                  <TableCell>Priority</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Assigned To</TableCell>
                  <TableCell>Leader</TableCell>
                  <TableCell align="right">Start Date</TableCell>
                  <TableCell align="right">Due Date</TableCell>
                  <TableCell align="right">Created At</TableCell>
                  <TableCell align="right">Updated At</TableCell>
                  <TableCell align="right">Edit</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {actions.data.map((action) => (
                  <TableRow key={action.id}>
                    <ActionCell
                      onCompletedClick={markAsCompleted(action.id)}
                      onRejectedClick={markAsRejected(action.id)}
                      status={updateAction.status}
                    >
                      <StatusCircle status={action.status}>
                        {action.status}
                      </StatusCircle>
                    </ActionCell>
                    <CommentCell
                      comment={action.comment}
                      status={updateAction.status}
                      onSubmit={handleCommentChange(action.id)}
                    >
                      {action.comment}
                    </CommentCell>
                    <TableCell>{action.priority}</TableCell>
                    <TableCell>{action.name}</TableCell>
                    <TableCell>{action.description}</TableCell>
                    <TableCell>{action.assignedTo}</TableCell>
                    <TableCell>{action.leader}</TableCell>
                    <TableCell align="right">
                      {displayDate(action.startDate)}
                    </TableCell>
                    <TableCell align="right">
                      {displayDate(action.dueDate)}
                    </TableCell>
                    <TableCell align="right">
                      {displayDateFull(action.createdAt)}
                    </TableCell>
                    <TableCell align="right">
                      {displayDateFull(action.updatedAt)}
                    </TableCell>
                    <EditActionCell
                      defaultValues={action}
                      status={updateAction.status}
                      onSubmit={updateAction.mutate}
                    />
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
