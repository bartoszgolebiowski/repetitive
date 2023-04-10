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
import FormControlLabel from "@mui/material/FormControlLabel";
import FormLabel from "@mui/material/FormLabel";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import FormGroup from "@mui/material/FormGroup";
import Modal from "@mui/material/Modal";
import Grid2 from "@mui/material/Unstable_Grid2";
import React from "react";

import FormCard from "~/components/FormCard";
import FormTitle from "~/components/FormTitle";
import { convertCronToUTC, isDays, isHours } from "~/server/frequency/cron";
import WorkplaceNavigation from "~/components/WorkplaceNavigation";
import { DAYS, HOURS } from "~/utils/date";
import { validateCheckboxSection } from "~/utils/form";

const Frequency: NextPage = () => {
  const [open, setOpen] = React.useState(false);
  const { workplaceId } = useRouter().query;

  const frequencies = api.frequency.getByWorkplaceId.useQuery(
    {
      workplaceId: workplaceId as string,
    },
    { enabled: !!workplaceId }
  );

  const createFrequency = api.frequency.create.useMutation({
    onSettled: async () => {
      await frequencies.refetch();
    },
  });

  const handleSubmitFrequency = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const hour = formData.getAll("hour");
    const day = formData.getAll("day");

    if (isHours(hour) && isDays(day)) {
      const crons = convertCronToUTC(hour, day, new Date().getTimezoneOffset());

      return createFrequency.mutate({
        workplaceId: formData.get("workplaceId") as string,
        description: formData.get("description") as string,
        name: formData.get("name") as string,
        cron: crons,
      });
    }

    throw new Error(`
        Invalid days or hours.\n
        offset: ${new Date().getTimezoneOffset()}\n
        days: ${day.join(", ")}\n
        hours: ${hour.join(", ")}`);
  };

  const handleClose = () => setOpen(false);
  const handleOpen = () => setOpen(true);

  return (
    <>
      <Head>
        <title>Frequency</title>
        <meta
          name="description"
          content="Manage frequency for selected wokrplace"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <WorkplaceNavigation>
        <Box component={"main"}>
          <Modal open={open} onClose={handleClose} disableAutoFocus>
            <FormCard size="large">
              <FormTitle>Create Definition</FormTitle>
              <form onSubmit={handleSubmitFrequency}>
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
                    <FormControl
                      sx={{
                        borderRadius: "4px",
                        border: 0,
                        padding: 0,
                        display: "block",
                      }}
                      component={"fieldset"}
                      onChange={validateCheckboxSection(
                        "Please select at least one hour"
                      )}
                    >
                      <FormLabel component="legend">
                        Specific hour (choose one or many)
                      </FormLabel>
                      <FormGroup sx={{ display: "block" }}>
                        {HOURS.map((hour, index) => (
                          <FormControlLabel
                            key={hour}
                            name="hour"
                            id={String(hour)}
                            value={String(hour)}
                            label={hour}
                            control={<Checkbox required={index === 0} />}
                          />
                        ))}
                      </FormGroup>
                    </FormControl>
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
                      onChange={validateCheckboxSection(
                        "Please select at least one day"
                      )}
                    >
                      <FormLabel component="legend">
                        Specific day of the week (choose one or many)
                      </FormLabel>
                      <FormGroup sx={{ display: "block" }}>
                        {Object.entries(DAYS).map(([day, dayName], index) => (
                          <FormControlLabel
                            key={day}
                            name="day"
                            id={day}
                            value={day}
                            label={dayName}
                            control={<Checkbox required={index === 0} />}
                          />
                        ))}
                      </FormGroup>
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
            Frequency
          </Typography>
          <Box>
            <Button
              variant="contained"
              onClick={handleOpen}
              disabled={frequencies.status === "loading"}
            >
              Create Frequency
            </Button>
          </Box>
          {frequencies.data && (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Description</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {frequencies.data?.map((frequency) => (
                    <TableRow key={frequency.id}>
                      <TableCell component="th" scope="row">
                        {frequency.name}
                      </TableCell>
                      <TableCell>{frequency.description}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      </WorkplaceNavigation>
    </>
  );
};

export default Frequency;
