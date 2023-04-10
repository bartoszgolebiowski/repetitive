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
import { useRouter } from "next/router";
import FormTitle from "~/components/FormTitle";
import TableContainer from "@mui/material/TableContainer";
import Paper from "@mui/material/Paper";

const OrganizationId: NextPage = () => {
  const [open, setOpen] = React.useState(false);
  const { organizationId } = useRouter().query;
  const myWorkplaces = api.workplace.getByOrganizationId.useQuery(
    {
      organizationId: organizationId as string,
    },
    { enabled: !!organizationId }
  );
  const createWorkplace = api.workplace.create.useMutation({
    onSettled: async () => {
      handleClose();
      await myWorkplaces.refetch();
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    createWorkplace.mutate({
      organizationId: formData.get("organizationId") as string,
      name: formData.get("name") as string,
    });
  };

  const handleClose = () => setOpen(false);
  const handleOpen = () => setOpen(true);

  return (
    <>
      <Head>
        <title>Organization workplaces</title>
        <meta
          name="description"
          content="Manage workplace for selected organization"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Box component="main">
        <Modal open={open} onClose={handleClose} disableAutoFocus>
          <FormCard>
            <FormTitle>Create Workplace</FormTitle>
            <form onSubmit={handleSubmit}>
              <input
                type="hidden"
                name="organizationId"
                value={organizationId}
              />
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
          Organization workplaces
        </Typography>
        <Box>
          <Button
            variant="contained"
            onClick={handleOpen}
            disabled={myWorkplaces.status === "loading"}
          >
            Create Workplace
          </Button>
        </Box>
        {myWorkplaces.data && (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Organization</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {myWorkplaces.data.map((workplace) => (
                  <TableRow key={workplace.id}>
                    <TableCell>
                      <Link href={`/workplace/${workplace.id}`}>
                        {workplace.name}
                      </Link>
                    </TableCell>
                    <TableCell>{workplace.description}</TableCell>
                    <TableCell>{workplace.organization.name}</TableCell>
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

export default OrganizationId;
