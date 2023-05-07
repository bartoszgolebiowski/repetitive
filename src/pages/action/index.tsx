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
import { LINE_PLAN_STATUS } from "~/utils/schema/action/linePlan";
import {
  FormControl,
  FormLabel,
  FormGroup,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import { displayDate, getNextDay } from "~/utils/date";
import LinePlanForm from "~/components/action/create/LinePlanForm";

const convertQueryToFilters = (): Parameters<
  typeof api.linePlan.getByFilters.useQuery
>[0] => {
  return {
    organizationId: "",
    productionLine: "",
    assignedTo: "",
    dueDate: null,
    status: [LINE_PLAN_STATUS.OK, LINE_PLAN_STATUS.NOK] as Array<
      keyof typeof LINE_PLAN_STATUS
    >,
  };
};

const useForm = () => {
  const [filters, setFilters] = React.useState(() => convertQueryToFilters());

  const onChangeOrganization = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters((prev) => ({ ...prev, organizationId: e.target.value }));
  };

  const onChangeProductionLine = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters((prev) => ({ ...prev, productionLine: e.target.value }));
  };

  const onChangeAssignedTo = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters((prev) => ({ ...prev, assignedTo: e.target.value }));
  };

  const onChangeDueDate = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters((prev) => ({ ...prev, dueDate: e.target.valueAsDate }));
  };

  const onChangeStatus = (status: keyof typeof LINE_PLAN_STATUS) => () => {
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
    filters,
    onChangeOrganization,
    onChangeProductionLine,
    onChangeAssignedTo,
    onChangeDueDate,
    onChangeStatus,
  };
};

const Action: NextPage = () => {
  const {
    filters,
    onChangeOrganization,
    onChangeProductionLine,
    onChangeAssignedTo,
    onChangeDueDate,
    onChangeStatus,
  } = useForm();

  const myOrganizations = api.organization.getMy.useQuery();
  const organizationUsers = api.user.getByOrganizationId.useQuery(
    { organizationId: filters.organizationId },
    { enabled: !!filters.organizationId }
  );
  const linePlans = api.linePlan.getByFilters.useQuery(filters, {
    enabled: !!filters.organizationId,
  });

  return (
    <>
      <Head>
        <title>Line Plans</title>
        <meta name="description" content="Manage Line Plans" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Box component="main">
        <FormCard size="large">
          <FormTitle>Filters</FormTitle>
          <form>
            <Grid2 container spacing={2}>
              <Grid2 xs={12}>
                <TextField
                  autoFocus
                  select
                  fullWidth
                  id="organizationId"
                  label="Organization"
                  name="organizationId"
                  value={filters.organizationId}
                  onChange={onChangeOrganization}
                >
                  {Object.values(myOrganizations.data ?? []).map((option) => (
                    <MenuItem key={option.id} value={option.id}>
                      {option.name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid2>
              <Grid2 xs={12}>
                <TextField
                  fullWidth
                  autoFocus
                  id="productionLine"
                  label="Production Line"
                  name="productionLine"
                  value={filters.productionLine}
                  onChange={onChangeProductionLine}
                />
              </Grid2>
              <Grid2 xs={12}>
                <TextField
                  select
                  fullWidth
                  id="assignedTo"
                  label="Assigned To"
                  name="assignedTo"
                  value={filters.assignedTo}
                  onChange={onChangeAssignedTo}
                  disabled={filters.organizationId === ""}
                >
                  <MenuItem value="">
                    <em>None</em>
                  </MenuItem>
                  {organizationUsers.data
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
                    {Object.values(LINE_PLAN_STATUS).map((status) => (
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
        <Typography variant="h4" sx={{ pb: "1rem" }}>
          Line Plans
        </Typography>
        <LinePlanForm organizationId={filters.organizationId} />
        {linePlans.data && (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Production Line</TableCell>
                  <TableCell>Action plan</TableCell>
                  <TableCell>Assigned To</TableCell>
                  <TableCell>Created At</TableCell>
                  <TableCell>Due Date</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {linePlans.data.map((linePlan) => (
                  <TableRow
                    key={linePlan.id}
                    sx={{
                      backgroundColor:
                        linePlan.status === LINE_PLAN_STATUS.OK
                          ? "green"
                          : "red",
                    }}
                  >
                    <TableCell>{linePlan.productionLine}</TableCell>
                    <TableCell>
                      <Link href={`action/${linePlan.id}`}>
                        Navigate to Action Plan
                      </Link>
                    </TableCell>
                    <TableCell>{linePlan.assignedTo}</TableCell>
                    <TableCell align="right">
                      {displayDate(linePlan.createdAt)}
                    </TableCell>
                    <TableCell align="right">
                      {displayDate(linePlan.dueDate)}
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

export default Action;
