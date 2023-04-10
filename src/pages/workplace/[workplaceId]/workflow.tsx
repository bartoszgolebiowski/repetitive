import type { NextPage } from "next";
import Head from "next/head";
import { api } from "~/utils/api";

import Box from "@mui/material/Box";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import { useRouter } from "next/router";
import TableContainer from "@mui/material/TableContainer";
import Paper from "@mui/material/Paper";
import TextField from "@mui/material/TextField";
import FormControl from "@mui/material/FormControl";
import Radio from "@mui/material/Radio";
import FormControlLabel from "@mui/material/FormControlLabel";
import RadioGroup from "@mui/material/RadioGroup";
import FormLabel from "@mui/material/FormLabel";
import { Button, Modal } from "@mui/material";
import Grid2 from "@mui/material/Unstable_Grid2";
import React from "react";
import FormCard from "~/components/FormCard";
import FormTitle from "~/components/FormTitle";
import WorkflowNavigation from "~/components/WorkplaceNavigation";

const WorkplaceId: NextPage = () => {
  const [open, setOpen] = React.useState(false);
  const { workplaceId } = useRouter().query;

  const frequencies = api.frequency.getByWorkplaceId.useQuery(
    {
      workplaceId: workplaceId as string,
    },
    { enabled: !!workplaceId }
  );

  const workflows = api.workflow.getByWorkplaceId.useQuery(
    {
      workplaceId: workplaceId as string,
    },
    { enabled: !!workplaceId }
  );

  const createWorkflow = api.workflow.create.useMutation({
    onSettled: async () => {
      handleClose();
      await workflows.refetch();
    },
  });

  const handleSubmitWorkflow = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    createWorkflow.mutate({
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      frequencyId: formData.get("frequencyId") as string,
      workplaceId: formData.get("workplaceId") as string,
    });
  };

  const handleClose = () => setOpen(false);
  const handleOpen = () => setOpen(true);

  return (
    <>
      <Head>
        <title>Checklist</title>
        <meta name="description" content="Workflow checklist" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <WorkflowNavigation>
        <Box component="main">
          <Modal open={open} onClose={handleClose} disableAutoFocus>
            <FormCard size="medium">
              <FormTitle>Create Workflow</FormTitle>
              <form onSubmit={handleSubmitWorkflow}>
                <input type="hidden" name="workplaceId" value={workplaceId} />
                <Grid2 container spacing={2}>
                  <Grid2 xs={12}>
                    <TextField
                      autoFocus
                      required
                      fullWidth
                      id="name"
                      label="Name"
                      name="name"
                    />
                  </Grid2>
                  <Grid2 xs={12}>
                    <TextField
                      required
                      fullWidth
                      id="description"
                      label="Description"
                      name="description"
                    />
                  </Grid2>
                  <Grid2 xs={12}>
                    <FormControl>
                      <FormLabel id="radio-frequencyId">
                        Frequency Type
                      </FormLabel>
                      <RadioGroup
                        aria-labelledby="radio-frequencyId"
                        name="frequencyId"
                      >
                        {frequencies.data?.map((frequency) => (
                          <FormControlLabel
                            key={frequency.id}
                            value={frequency.id}
                            label={frequency.name}
                            control={<Radio required />}
                          />
                        ))}
                      </RadioGroup>
                    </FormControl>
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
            Workflows
          </Typography>
          <Box>
            <Button
              variant="contained"
              onClick={handleOpen}
              disabled={workflows.status === "loading"}
            >
              Create Workflow
            </Button>
          </Box>
          {workflows.data && (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>Workplace</TableCell>
                    <TableCell>Frequency</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {workflows.data?.map((workflow) => (
                    <TableRow key={workflow.id}>
                      <TableCell>{workflow.name}</TableCell>
                      <TableCell>{workflow.description}</TableCell>
                      <TableCell>{workflow.workplace.name}</TableCell>
                      <TableCell>{workflow.frequency.name}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      </WorkflowNavigation>
    </>
  );
};

export default WorkplaceId;
