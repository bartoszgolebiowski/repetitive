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
  Hidden,
} from "@mui/material";
import { displayDate, displayDateFull } from "~/utils/date";
import { useRouter } from "next/router";
import {
  ACTION_PRIORITY,
  ACTION_STATUS,
  actionCSVItemSchemaFactory,
} from "~/utils/schema/action/action";
import ActionForm from "~/components/action/create/ActionForm";
import { useOrganization, useUser } from "@clerk/nextjs";
import { ORGANIZATION_MEMBERSHIP_LIMIT } from "~/utils/user";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ActionCell from "~/components/action/table/action/ActionCell";
import CommentCell from "~/components/action/table/action/CommentCell";
import StatusCircle from "~/components/action/table/action/StatusCircle";
import EditActionCell from "~/components/action/table/action/EditActionCell";
import CommentList from "~/components/action/table/action/CommentList";
import { DatePicker } from "@mui/x-date-pickers";
import { type OnInputInput } from "~/components/action/import/DropzoneImport";
import Import from "~/components/action/import/Import";

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
  const { dueDate, startDate } = useDates();

  const onChangeAssignedTo = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters((prev) => ({ ...prev, assignedTo: e.target.value }));
  };

  const onChangeLeader = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters((prev) => ({ ...prev, leader: e.target.value }));
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
    filters: {
      ...filters,
      actionPlanId,
      startDate: startDate.value,
      dueDate: dueDate.value,
    },
    onChangeAssignedTo,
    onChangeLeader,
    onChangePriority,
    onChangeStatus,
    dueDate,
    startDate,
  };
};

const useDates = () => {
  const [startDate, setStartDate] = React.useState<Date | null>(null);
  const [dueDate, setDueDate] = React.useState<Date | null>(null);

  const handleStartDateChange = (date: Date | null) => {
    setStartDate(date);
  };

  const handleDueDateChange = (date: Date | null) => {
    setDueDate(date);
  };

  return {
    startDate: {
      value: startDate,
      onChange: handleStartDateChange,
    },
    dueDate: {
      value: dueDate,
      onChange: handleDueDateChange,
    },
  };
};

const Actions: NextPage = () => {
  const { linePlanId, actionPlanId } = useRouter().query;

  const {
    filters,
    dueDate,
    startDate,
    onChangeAssignedTo,
    onChangeStatus,
    onChangeLeader,
    onChangePriority,
  } = useForm(actionPlanId as string);
  const userEmailAdresses = useUser().user?.emailAddresses ?? [];

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

  const isAllowedToEdit = (leader: string) =>
    userEmailAdresses
      .map(({ emailAddress }) => emailAddress.trim())
      .includes(leader.trim());

  const utils = api.useContext();
  const emails =
    membershipList?.map((member) => member.publicUserData.identifier) ?? [];
  const atLeastOneEmail = emails.length > 0;
  const schema = actionCSVItemSchemaFactory(emails);

  const importCSV = api.action.import.useMutation({
    onSuccess: async () => {
      await Promise.all([
        utils.actionPlan.getByFilters.invalidate(),
        utils.linePlan.getByFilters.invalidate(),
        utils.action.getByFilters.invalidate(),
      ]);
    },
  });

  const handleImport = (csv: OnInputInput<typeof schema>) => {
    const formatDate = (dateString: string) =>
      new Date(`${dateString}T00:00:00.000Z`);

    const validRows = csv.validRows.map((row) => ({
      ...row,
      dueDate: formatDate(row.dueDate),
      startDate: formatDate(row.startDate),
      actionPlanId: actionPlanId as string,
      priority: row.priority as keyof typeof ACTION_PRIORITY,
    }));

    return importCSV.mutateAsync(validRows);
  };

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
                <Grid2
                  xs={12}
                  sx={{
                    "& > div": {
                      width: "100%",
                    },
                  }}
                >
                  <DatePicker label="Start Date" {...startDate} />
                </Grid2>
                <Grid2
                  xs={12}
                  sx={{
                    "& > div": {
                      width: "100%",
                    },
                  }}
                >
                  <DatePicker label="Due Date" {...dueDate} />
                </Grid2>
                <Grid2 xs={12}>
                  <FormControl
                    sx={{
                      borderRadius: 1,
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
                      borderRadius: 1,
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
            gap: 1,
          }}
        >
          <ActionForm
            actionPlanId={actionPlanId as string}
            linePlanId={linePlanId as string}
          />
          {atLeastOneEmail ? (
            <Import
              onImport={handleImport}
              schema={schema}
              status={importCSV.status}
            />
          ) : null}
          <Breadcrumbs
            sx={{
              paddingInline: 2,
              opacity:
                linePlan.data?.productionLine && actionPlan.data?.name
                  ? 1
                  : 0.7,
            }}
          >
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
          <Hidden smDown>
            <Grid2 container spacing={2} sx={{ paddingInline: 4 }}>
              <Grid2>
                <FormControl
                  sx={{
                    borderRadius: 1,
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
              <Grid2>
                <FormControl
                  sx={{
                    borderRadius: 1,
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
            </Grid2>
          </Hidden>
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
                  <TableCell>Actions</TableCell>
                  <TableCell>Comment</TableCell>
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
                      disabled={!isAllowedToEdit(action.leader)}
                    >
                      <StatusCircle status={action.status}>
                        {action.status}
                      </StatusCircle>
                    </ActionCell>
                    <CommentCell
                      comments={action.comments}
                      status={updateAction.status}
                      onSubmit={handleCommentChange(action.id)}
                    >
                      <CommentList comments={action.comments} />
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
                      disabled={false}
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
