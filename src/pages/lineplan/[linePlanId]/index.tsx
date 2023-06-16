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
import {
  ACTION_PLAN_STATUS,
  actionPlanCSVItemSchemaFactory,
} from "~/utils/schema/action/actionPlan";
import ActionPlanForm from "~/components/action/create/ActionPlanForm";
import { ORGANIZATION_MEMBERSHIP_LIMIT } from "~/utils/user";
import { useOrganization } from "@clerk/nextjs";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import StatusCircle from "~/components/action/table/action/StatusCircle";
import { DatePicker } from "@mui/x-date-pickers";
import { type OnInputInput } from "~/components/action/import/DropzoneImport";
import Import from "~/components/action/import/Import";

const convertQueryToFilters = (): Omit<
  Parameters<typeof api.actionPlan.getByFilters.useQuery>[0],
  "linePlanId"
> => {
  return {
    assignedTo: "",
    dueDate: null,
    status: Object.keys(
      ACTION_PLAN_STATUS
    ) as (keyof typeof ACTION_PLAN_STATUS)[],
  };
};

const useForm = (linePlanId: string) => {
  const [filters, setFilters] = React.useState(() => convertQueryToFilters());
  const { dueDate } = useDates();

  const onChangeDueDate = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters((prev) => ({ ...prev, dueDate: e.target.valueAsDate }));
  };

  const onChangeAssignedTo = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters((prev) => ({ ...prev, assignedTo: e.target.value }));
  };

  const onChangeStatus = (status: keyof typeof ACTION_PLAN_STATUS) => () => {
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
    filters: { ...filters, linePlanId, dueDate: dueDate.value },
    onChangeDueDate,
    onChangeAssignedTo,
    onChangeStatus,
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
    },
  };
};

const ActionPlan: NextPage = () => {
  const { linePlanId } = useRouter().query;

  const { filters, onChangeAssignedTo, onChangeStatus, dueDate } = useForm(
    linePlanId as string
  );

  const { membershipList } = useOrganization({
    membershipList: { limit: ORGANIZATION_MEMBERSHIP_LIMIT },
  });

  const actionPlans = api.actionPlan.getByFilters.useQuery(filters, {
    enabled: !!linePlanId,
  });

  const linePlan = api.linePlan.getById.useQuery(
    { id: linePlanId as string },
    {
      enabled: !!linePlanId,
    }
  );

  const utils = api.useContext();
  const emails =
    membershipList?.map((member) => member.publicUserData.identifier) ?? [];
  const atLeastOneEmail = emails.length > 0;
  const schema = actionPlanCSVItemSchemaFactory(emails);

  const importCSV = api.actionPlan.import.useMutation({
    onSuccess: async () => {
      await Promise.all([
        utils.actionPlan.getByFilters.invalidate(),
        utils.linePlan.getByFilters.invalidate(),
      ]);
    },
  });

  const handleImport = (csv: OnInputInput<typeof schema>) => {
    const formatDate = (dateString: string) =>
      new Date(`${dateString}T00:00:00.000Z`);

    const validRows = csv.validRows.map((row) => ({
      ...row,
      dueDate: formatDate(row.dueDate),
      linePlanId: linePlanId as string,
    }));

    return importCSV.mutateAsync(validRows);
  };

  return (
    <>
      <Head>
        <title>Action Plans</title>
        <meta name="description" content="Manage Action Plans" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Box component="main">
        <Accordion sx={{ maxWidth: "40rem" }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h5">Action Plans Filters</Typography>
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
                    <FormLabel component="legend">Status</FormLabel>
                    <FormGroup sx={{ display: "block" }}>
                      {Object.values(ACTION_PLAN_STATUS).map((status) => (
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
          <ActionPlanForm linePlanId={linePlanId as string} />
          {atLeastOneEmail ? (
            <Import
              onImport={handleImport}
              schema={schema}
              status={importCSV.status}
            />
          ) : null}
          <Breadcrumbs sx={{ paddingInline: "1rem" }}>
            <Breadcrumbs separator="-" aria-label="breadcrumb">
              <Link color="inherit" href="/lineplan">
                Line Plan - {linePlan.data?.productionLine}
              </Link>
            </Breadcrumbs>
          </Breadcrumbs>
        </Box>
        {actionPlans.data && (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Assigned To</TableCell>
                  <TableCell align="right">Due Date</TableCell>
                  <TableCell align="right">Created At</TableCell>
                  <TableCell align="right">Updated At</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {actionPlans.data.map((actionPlan) => (
                  <TableRow key={actionPlan.id}>
                    <TableCell sx={{ display: "flex" }}>
                      <StatusCircle status={actionPlan.status}>
                        {actionPlan.status}
                      </StatusCircle>
                    </TableCell>
                    <TableCell>
                      <Link
                        href={`/lineplan/${String(linePlanId)}/${
                          actionPlan.id
                        }`}
                      >
                        Navigate to Actions
                      </Link>
                    </TableCell>
                    <TableCell>{actionPlan.name}</TableCell>
                    <TableCell>{actionPlan.description}</TableCell>
                    <TableCell>{actionPlan.assignedTo}</TableCell>
                    <TableCell align="right">
                      {displayDate(actionPlan.dueDate)}
                    </TableCell>
                    <TableCell align="right">
                      {displayDateFull(actionPlan.createdAt)}
                    </TableCell>
                    <TableCell align="right">
                      {displayDateFull(actionPlan.updatedAt)}
                    </TableCell>
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

export default ActionPlan;
