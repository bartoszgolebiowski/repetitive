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
  Breadcrumbs,
} from "@mui/material";
import { displayDate } from "~/utils/date";
import { useRouter } from "next/router";
import { ACTION_PLAN_STATUS } from "~/utils/schema/action/actionPlan";
import ActionPlanForm from "~/components/action/create/ActionPlanForm";
import { ORGANIZATION_MEMBERSHIP_LIMIT } from "~/utils/user";
import { useOrganization } from "@clerk/nextjs";

const convertQueryToFilters = (): Omit<
  Parameters<typeof api.actionPlan.getByFilters.useQuery>[0],
  "linePlanId"
> => {
  return {
    assignedTo: "",
    dueDate: null,
    status: [
      ACTION_PLAN_STATUS.COMPLETED,
      ACTION_PLAN_STATUS.DELEYED,
      ACTION_PLAN_STATUS.IN_PROGRESS,
    ] as Array<keyof typeof ACTION_PLAN_STATUS>,
  };
};

const useForm = (linePlanId: string) => {
  const [filters, setFilters] = React.useState(() => convertQueryToFilters());

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
    filters: { ...filters, linePlanId },
    onChangeDueDate,
    onChangeAssignedTo,
    onChangeStatus,
  };
};

const ActionPlan: NextPage = () => {
  const { linePlanId } = useRouter().query;

  const { filters, onChangeDueDate, onChangeAssignedTo, onChangeStatus } =
    useForm(linePlanId as string);

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
        </FormCard>

        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            marginBlock: "2rem",
          }}
        >
          <ActionPlanForm
            linePlanId={linePlanId as string}
            refetch={actionPlans.refetch}
          />
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
                  <TableCell>Created By</TableCell>
                  <TableCell align="right">Created At</TableCell>
                  <TableCell align="right">Due Date</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {actionPlans.data.map((actionPlan) => (
                  <TableRow
                    key={actionPlan.id}
                    sx={{
                      backgroundColor:
                        actionPlan.status === ACTION_PLAN_STATUS.COMPLETED
                          ? "green"
                          : "red",
                    }}
                  >
                    <TableCell>{actionPlan.status}</TableCell>
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
                    <TableCell>{actionPlan.createdBy}</TableCell>
                    <TableCell align="right">
                      {displayDate(actionPlan.createdAt)}
                    </TableCell>
                    <TableCell align="right">
                      {displayDate(actionPlan.dueDate)}
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
