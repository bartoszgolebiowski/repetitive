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
import Typography from "@mui/material/Typography";
import React from "react";
import TableContainer from "@mui/material/TableContainer";
import Paper from "@mui/material/Paper";
import MenuItem from "@mui/material/MenuItem";
import {
  LINE_PLAN_STATUS,
  linePlanCSVItemSchemaFactory,
} from "~/utils/schema/action/linePlan";
import {
  FormControl,
  FormLabel,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Accordion,
  AccordionDetails,
  AccordionSummary,
} from "@mui/material";
import { displayDate, displayDateFull } from "~/utils/date";
import LinePlanForm from "~/components/action/create/LinePlanForm";
import { useOrganization } from "@clerk/nextjs";
import { ORGANIZATION_MEMBERSHIP_LIMIT } from "~/utils/user";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import StatusCircle from "~/components/action/table/action/StatusCircle";
import { DatePicker } from "@mui/x-date-pickers";
import Import from "~/components/action/import/Import";
import { type OnInputInput } from "~/components/action/import/DropzoneImport";

const convertQueryToFilters = (): Omit<
  Parameters<typeof api.linePlan.getByFilters.useQuery>[0],
  "organizationId"
> => {
  return {
    productionLine: "",
    assignedTo: "",
    dueDate: null,
    status: Object.keys(LINE_PLAN_STATUS) as (keyof typeof LINE_PLAN_STATUS)[],
  };
};

const useForm = () => {
  const [filters, setFilters] = React.useState(() => convertQueryToFilters());
  const { dueDate } = useDates();

  const onChangeProductionLine = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters((prev) => ({ ...prev, productionLine: e.target.value }));
  };

  const onChangeAssignedTo = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters((prev) => ({ ...prev, assignedTo: e.target.value }));
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
    filters: {
      ...filters,
      dueDate: dueDate.value,
    },
    onChangeProductionLine,
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

const LinePlan: NextPage = () => {
  const {
    filters,
    onChangeProductionLine,
    onChangeAssignedTo,
    dueDate,
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

  const emails =
    membershipList?.map((member) => member.publicUserData.identifier) ?? [];
  const atLeastOneEmail = emails.length > 0;
  const schema = linePlanCSVItemSchemaFactory(emails);

  const importCSV = api.linePlan.import.useMutation({
    onSuccess: async () => {
      await linePlans.refetch();
    },
  });

  const handleImport = (csv: OnInputInput<typeof schema>) => {
    const formatDate = (dateString: string) =>
      new Date(`${dateString}T00:00:00.000Z`);

    const validRows = csv.validRows.map((row) => ({
      ...row,
      dueDate: formatDate(row.dueDate),
      organizationId: organization?.id ?? "",
    }));

    return importCSV.mutateAsync(validRows);
  };

  return (
    <>
      <Head>
        <title>Line Plans</title>
        <meta name="description" content="Manage Line Plans" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Box component="main">
        <Accordion sx={{ maxWidth: "40rem" }}>
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
            gap: 1,
          }}
        >
          <LinePlanForm organizationId={organization?.id ?? ""} />
          {atLeastOneEmail ? (
            <Import
              onImport={handleImport}
              schema={schema}
              status={importCSV.status}
            />
          ) : null}
        </Box>
        {linePlans.data && (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Status</TableCell>
                  <TableCell>Production Line</TableCell>
                  <TableCell>Action plan</TableCell>
                  <TableCell>Assigned To</TableCell>
                  <TableCell align="right">Due Date</TableCell>
                  <TableCell align="right">Created At</TableCell>
                  <TableCell align="right">Updated At</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {linePlans.data.map((linePlan) => (
                  <TableRow key={linePlan.id}>
                    <TableCell sx={{ display: "flex" }}>
                      <StatusCircle status={linePlan.status}>
                        {linePlan.status}
                      </StatusCircle>
                    </TableCell>
                    <TableCell>
                      <Link href={`lineplan/${linePlan.id}`}>
                        Navigate to Action Plans
                      </Link>
                    </TableCell>
                    <TableCell>{linePlan.productionLine}</TableCell>
                    <TableCell>{linePlan.assignedTo}</TableCell>
                    <TableCell align="right">
                      {displayDate(linePlan.dueDate)}
                    </TableCell>
                    <TableCell align="right">
                      {displayDateFull(linePlan.createdAt)}
                    </TableCell>
                    <TableCell align="right">
                      {displayDateFull(linePlan.updatedAt)}
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
