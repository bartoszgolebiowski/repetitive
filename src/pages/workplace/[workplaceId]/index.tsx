import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import type { NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import React from "react";
import { api } from "~/utils/api";
import {
  displayDate,
  displayRemaining,
  getPrevDay,
  stableNow,
} from "~/utils/date";
import FormControlLabel from "@mui/material/FormControlLabel";
import Typography from "@mui/material/Typography";
import Checkbox from "@mui/material/Checkbox";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import WorkplaceNavigation from "~/components/WorkplaceNavigation";

const Checklist: NextPage = () => {
  const { workplaceId } = useRouter().query;
  const [selectedDay] = React.useState(() => stableNow);
  const [filterDisabled, setFilterDisabled] = React.useState(false);
  const [resetKey, setResetKey] = React.useState(
    Math.random().toString(36).substring(7)
  );
  const prevSelectedDay = React.useMemo(
    () => getPrevDay(selectedDay),
    [selectedDay]
  );

  const definitionTasksChecklist = api.definitionTasks.getByWorkplaceId.useQuery(
    {
      workplaceId: workplaceId as string,
      startDay: prevSelectedDay,
      endDay: selectedDay,
      timezoneOffsetStart: prevSelectedDay.getTimezoneOffset(),
      timezoneOffsetEnd: selectedDay.getTimezoneOffset(),
    },
    {
      enabled: !!workplaceId,
      select: (data) => {
        if (!data) return [];
        type RemoveUndefined<T> = T extends undefined ? never : T;
        type DefinitionTask = RemoveUndefined<typeof data>[0];

        const now = new Date();
        const sortByDate =
          (key: "availableFrom" | "availableTo") =>
          (a: DefinitionTask, b: DefinitionTask) =>
            new Date(a[key]).getTime() - new Date(b[key]).getTime();

        const mapper = (task: DefinitionTask) => ({
          ...task,
          derived: {
            ...task.derived,
            minutesLeft: displayRemaining(now, task.availableTo),
          },
        });

        return data.sort(sortByDate("availableFrom")).map(mapper) ?? [];
      },
    }
  );

  const generateDefinitionTasks = api.definitionTasks.generateTestData.useMutation({
    onSettled: async () => {
      await definitionTasksChecklist.refetch();
    },
  });

  const submitChecklist = api.definitionTasks.submit.useMutation({
    onSettled: async () => {
      await definitionTasksChecklist.refetch();
    },
  });

  const handleSubmitGenerateWorkflowTasks = (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    generateDefinitionTasks.mutate({
      workplaceId: formData.get("workplaceId") as string,
    });
  };

  const handleSubmitChecklist = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const done = formData.getAll("done");

    if (Array.isArray(done)) {
      const ids = done.map(String);
      submitChecklist.mutate(ids);
    }
  };

  const toggleDisabled = () => setFilterDisabled((prev) => !prev);
  const onClearClick = () =>
    setResetKey(Math.random().toString(36).substring(7));

  return (
    <>
      <Head>
        <title>Workplace</title>
        <meta name="description" content="Manage workplace" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <WorkplaceNavigation>
        <main>
          <div>
            <form onSubmit={handleSubmitGenerateWorkflowTasks}>
              <input type="hidden" name="workplaceId" value={workplaceId} />
              <button type="submit">Generate mock data</button>
            </form>
            <Typography variant="h4" sx={{ pb: "1rem" }}>
              Checklist
            </Typography>
            <FormControlLabel
              control={
                <Checkbox checked={filterDisabled} onChange={toggleDisabled} />
              }
              label="Hide disabled"
            />
            {definitionTasksChecklist.data && (
              <form onSubmit={handleSubmitChecklist}>
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Name</TableCell>
                        <TableCell>Description</TableCell>
                        <TableCell>Available from</TableCell>
                        <TableCell>Available to</TableCell>
                        <TableCell>Minutes left</TableCell>
                        <TableCell>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {definitionTasksChecklist.data
                        .filter((definitionTask) => {
                          if (filterDisabled) {
                            return !definitionTask.derived.disabled;
                          }
                          return true;
                        })
                        .map((definitionTask) => (
                          <TableRow key={definitionTask.id}>
                            <TableCell>
                              {definitionTask.definition.name}
                            </TableCell>
                            <TableCell>
                              {definitionTask.definition.description}
                            </TableCell>
                            <TableCell>
                              {displayDate(definitionTask.availableFrom)}
                            </TableCell>
                            <TableCell>
                              {displayDate(definitionTask.availableTo)}
                            </TableCell>
                            <TableCell>
                              {definitionTask.derived.minutesLeft}
                            </TableCell>
                            <TableCell>
                              <FormControlLabel
                                key={resetKey}
                                disabled={definitionTask.derived.disabled}
                                control={
                                  <Checkbox
                                    name="done"
                                    value={definitionTask.id}
                                    defaultChecked={
                                      definitionTask.derived.value
                                    }
                                  />
                                }
                                label="Done"
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "row-reverse",
                    pt: "1rem",
                    gap: 1,
                  }}
                >
                  <Button variant="contained" type="submit">
                    Submit
                  </Button>
                  <Button
                    variant="outlined"
                    type="button"
                    onClick={onClearClick}
                  >
                    Clear
                  </Button>
                </Box>
              </form>
            )}
          </div>
        </main>
      </WorkplaceNavigation>
    </>
  );
};

export default Checklist;
