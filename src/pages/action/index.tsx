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
import { ACTION_STATUS } from "~/utils/action";
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
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

const convertQueryToFilters = () => {
  return {
    organizationId: "",
    createdBy: "",
    assignedTo: "",
    status: [] as Array<keyof typeof ACTION_STATUS>,
    workplaceId: "",
    definitionId: "",
  };
};

const useForm = () => {
  const [filters, setFilters] = React.useState(() => convertQueryToFilters());

  const onChangeOrganization = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters((prev) => ({ ...prev, organizationId: e.target.value }));
  };

  const onChangeCreatedBy = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters((prev) => ({ ...prev, createdBy: e.target.value }));
  };

  const onChangeAssignedTo = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters((prev) => ({ ...prev, assignedTo: e.target.value }));
  };

  const onChangeStatus = (status: (typeof filters.status)["0"]) => () => {
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
    onChangeCreatedBy,
    onChangeAssignedTo,
    onChangeStatus,
  };
};

const Action: NextPage = () => {
  const {
    filters,
    onChangeOrganization,
    onChangeCreatedBy,
    onChangeAssignedTo,
    onChangeStatus,
  } = useForm();

  const myOrganizations = api.organization.getMyOrganizations.useQuery();
  const organizationUsers = api.user.getByOrganizationId.useQuery(
    { organizationId: filters.organizationId },
    { enabled: !!filters.organizationId }
  );
  const actions = api.action.getByFilters.useQuery(filters, {
    enabled: !!filters.organizationId,
  });

  return (
    <>
      <Head>
        <title>Actions</title>
        <meta name="description" content="Manage actions" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Box component="main">
        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h4">Filters</Typography>
          </AccordionSummary>
          <AccordionDetails>
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
                    select
                    fullWidth
                    id="createdBy"
                    label="Created By"
                    name="createdBy"
                    value={filters.createdBy}
                    onChange={onChangeCreatedBy}
                    disabled={filters.organizationId === ""}
                  >
                    {Object.values(organizationUsers.data ?? [])
                      .map(({ email }) => email)
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
                    id="assignedTo"
                    label="Assigned To"
                    name="assignedTo"
                    value={filters.assignedTo}
                    onChange={onChangeAssignedTo}
                    disabled={filters.organizationId === ""}
                  >
                    {Object.values(organizationUsers.data ?? [])
                      .map(({ email }) => email)
                      .map((option) => (
                        <MenuItem key={String(option)} value={String(option)}>
                          {String(option)}
                        </MenuItem>
                      ))}
                  </TextField>
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
                          control={
                            <Checkbox
                              onChange={onChangeStatus(status)}
                              checked={filters.status.includes(status)}
                            />
                          }
                        />
                      ))}
                    </FormGroup>
                  </FormControl>
                </Grid2>
              </Grid2>
            </form>
          </AccordionDetails>
        </Accordion>
        <Typography variant="h4" sx={{ pb: "1rem" }}>
          Actions
        </Typography>
        {actions.data && (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {actions.data.map((action) => (
                  <TableRow key={action.id}>
                    <TableCell>{action.description}</TableCell>
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
