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
import PlantNavigation from "~/components/navigation/PlantNavigation";
import useChecklist from "~/components/plant/checklist/useChecklist";
import ChecklistRow from "~/components/plant/checklist/ChecklistRow";

const Checklist: NextPage = () => {
  const { plantId } = useRouter().query;
  const [selectedDay] = React.useState(() => stableNow);
  const [filterDisabled, setFilterDisabled] = React.useState(false);
  const {
    onDoneChange,
    onActionChange,
    onInit,
    selectActionById,
    selectDoneById,
    extractAction,
    extractDone,
  } = useChecklist();

  const prevSelectedDay = React.useMemo(
    () => getPrevDay(selectedDay),
    [selectedDay]
  );

  const definitionTasksChecklist = api.definitionTasks.getByplantId.useQuery(
    {
      plantId: plantId as string,
      startDay: prevSelectedDay,
      endDay: selectedDay,
      timezoneOffsetStart: prevSelectedDay.getTimezoneOffset(),
      timezoneOffsetEnd: selectedDay.getTimezoneOffset(),
    },
    {
      enabled: !!plantId,
    }
  );

  const generateDefinitionTasks =
    api.definitionTasks.generateTestData.useMutation({
      onSettled: async () => {
        await definitionTasksChecklist.refetch();
      },
    });

  const submitChecklist = api.definitionTasks.submit.useMutation({
    onSettled: async () => {
      await definitionTasksChecklist.refetch();
    },
  });

  React.useEffect(() => {
    if (!definitionTasksChecklist.data) return;
    onInit(definitionTasksChecklist.data);
  }, [definitionTasksChecklist.data]);

  const handleSubmitGenerateWorkflowTasks = (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    generateDefinitionTasks.mutate({
      plantId: formData.get("plantId") as string,
    });
  };

  const handleSubmitChecklist = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    submitChecklist.mutate({
      plantId: plantId as string,
      done: extractDone(definitionTasksChecklist.data),
      defect: extractAction(),
    });
  };

  const toggleDisabled = () => setFilterDisabled((prev) => !prev);

  const filterFn = filterDisabled
    ? (definitionTask: { derived: { disabled: boolean } }) =>
        !definitionTask.derived.disabled
    : () => true;

  return (
    <>
      <Head>
        <title>Plant</title>
        <meta name="description" content="Manage plant" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <PlantNavigation>
        <main>
          <div>
            <form onSubmit={handleSubmitGenerateWorkflowTasks}>
              {plantId ? (
                <input type="hidden" name="plantId" value={plantId} />
              ) : null}
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
                        <TableCell align="right">Available from</TableCell>
                        <TableCell align="right">Available to</TableCell>
                        <TableCell align="right">Minutes left</TableCell>
                        <TableCell align="right">Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {definitionTasksChecklist.data
                        .filter(filterFn)
                        .map((definitionTask) => (
                          <ChecklistRow
                            key={definitionTask.id}
                            definitionTask={definitionTask}
                            onDoneChange={onDoneChange(definitionTask.id)}
                            onActionChange={onActionChange(definitionTask.id)}
                            checkedDone={selectDoneById(definitionTask.id)}
                            checkedAction={
                              !!selectActionById(definitionTask.id)
                            }
                          >
                            <TableCell>
                              {definitionTask.definition.name}
                            </TableCell>
                            <TableCell>
                              {definitionTask.definition.description}
                            </TableCell>
                            <TableCell align="right">
                              {displayDate(definitionTask.availableFrom)}
                            </TableCell>
                            <TableCell align="right">
                              {displayDate(definitionTask.availableTo)}
                            </TableCell>
                            <TableCell align="right">
                              {displayRemaining(
                                new Date(),
                                definitionTask.availableTo
                              )}
                            </TableCell>
                          </ChecklistRow>
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
                  <Button variant="outlined" type="button">
                    Clear
                  </Button>
                </Box>
              </form>
            )}
          </div>
        </main>
      </PlantNavigation>
    </>
  );
};

export default Checklist;