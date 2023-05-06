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

const Organization: NextPage = () => {
  const [open, setOpen] = React.useState(false);
  const myOrganizations = api.organization.getMy.useQuery();
  const createOrganization = api.organization.create.useMutation({
    onSettled: async () => {
      handleClose();
      await myOrganizations.refetch();
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    createOrganization.mutate({
      name: formData.get("name") as string,
    });
  };

  const handleClose = () => setOpen(false);
  const handleOpen = () => setOpen(true);

  return (
    <>
      <Head>
        <title>Organizations</title>
        <meta name="description" content="Manage organizations" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Box component="main">
        <Modal open={open} onClose={handleClose} disableAutoFocus>
          <FormCard>
            <FormTitle>Create Organization</FormTitle>
            <form onSubmit={handleSubmit}>
              <Grid2 container spacing={2}>
                <Grid2 xs={12}>
                  <TextField
                    autoFocus
                    required
                    fullWidth
                    id="name"
                    label="Name"
                    name="name"
                    autoComplete="name"
                  />
                </Grid2>
                <Grid2 xs={6}>
                  <Button
                    fullWidth
                    variant="contained"
                    color="secondary"
                    onClick={handleClose}
                  >
                    Cancel
                  </Button>
                </Grid2>
                <Grid2 xs={6}>
                  <Button
                    fullWidth
                    variant="contained"
                    color="primary"
                    type="submit"
                  >
                    Create
                  </Button>
                </Grid2>
              </Grid2>
            </form>
          </FormCard>
        </Modal>
        <Typography variant="h4" sx={{ pb: "1rem" }}>
          Organizations
        </Typography>
        <Box>
          <Button
            variant="contained"
            onClick={handleOpen}
            disabled={myOrganizations.status === "loading"}
          >
            Create Organization
          </Button>
        </Box>
        {myOrganizations.data && (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Members</TableCell>
                  <TableCell align="right">Invite memebrs</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {myOrganizations.data.map((organization) => (
                  <TableRow key={organization.id}>
                    <TableCell>
                      <Link href={`organization/${organization.id}`}>
                        {organization.name}
                      </Link>
                    </TableCell>
                    <TableCell>{organization.memberships.length}</TableCell>
                    <TableCell align="right">
                      <Link href={`organization/${organization.id}/invite`}>
                        <Button variant="contained" color="primary">
                          <GroupAddIcon />
                        </Button>
                      </Link>
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

export default Organization;
