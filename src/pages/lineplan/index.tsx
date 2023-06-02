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
  Breadcrumbs,
  Accordion,
  AccordionDetails,
  AccordionSummary,
} from "@mui/material";
import { displayDate } from "~/utils/date";
import LinePlanForm from "~/components/action/create/LinePlanForm";
import { useOrganization } from "@clerk/nextjs";
import { ORGANIZATION_MEMBERSHIP_LIMIT } from "~/utils/user";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

const convertQueryToFilters = (): Omit<
  Parameters<typeof api.linePlan.getByFilters.useQuery>[0],
  "organizationId"
> => {
  return {
    productionLine: "",
    assignedTo: "",
    dueDate: null,
    status: [
      LINE_PLAN_STATUS.IN_PROGRESS,
      LINE_PLAN_STATUS.COMPLETED,
      LINE_PLAN_STATUS.DELAYED,
      LINE_PLAN_STATUS.REJECTED,
      LINE_PLAN_STATUS.DELETED,
    ],
  };
};

const useForm = () => {
  const [filters, setFilters] = React.useState(() => convertQueryToFilters());

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
    onChangeProductionLine,
    onChangeAssignedTo,
    onChangeDueDate,
    onChangeStatus,
  };
};

const LinePlan: NextPage = () => {
  const {
    filters,
    onChangeProductionLine,
    onChangeAssignedTo,
    onChangeDueDate,
    onChangeStatus,
  } = useForm();

  const { organization, membershipList } = useOrganization({
    membershipList: { limit: ORGANIZATION_MEMBERSHIP_LIMIT },
  });

  const linePlans = api.linePlan.getByFilters.useQuery(
    {
      organizationId: organization?.id ?? "",
      ...filters,
    },
    {
      enabled: !!organization?.id,
    }
  );

  return (
    <>
      <Head>
        <title>Line Plans</title>
        <meta name="description" content="Manage Line Plans" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Box component="main">
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h5">Line Plans Filters</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <form>
              <Grid2 container spacing={2}>
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
          <LinePlanForm
            organizationId={organization?.id ?? ""}
            refetch={linePlans.refetch}
          />
        </Box>
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
                        linePlan.status === LINE_PLAN_STATUS.COMPLETED
                          ? "green"
                          : "red",
                    }}
                  >
                    <TableCell>{linePlan.productionLine}</TableCell>
                    <TableCell>
                      <Link href={`lineplan/${linePlan.id}`}>
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

export default LinePlan;
