import type { NextPage } from "next";
import Head from "next/head";

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
import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import React from "react";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

import { api } from "~/utils/api";
import { DAYS, displayDate, getFromMondayToSunday, stableNow } from "~/utils/date";
import type { WorkflowTask } from "@prisma/client";
import WorkflowNavigation from "~/components/WorkplaceNavigation";

const Details = ({ workflowTask }: { workflowTask: WorkflowTask }) => {
  return (
    <Accordion
      sx={{
        backgroundColor:
          workflowTask.status === "DONE" ? "success.main" : "error.main",
      }}
    >
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography>{workflowTask.status}</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <ol>
          <li>Available From: {displayDate(workflowTask.availableFrom)}</li>
          <li>Available To: {displayDate(workflowTask.availableTo)}</li>
        </ol>
      </AccordionDetails>
    </Accordion>
  );
};

const WorkplaceId: NextPage = () => {
  const { workplaceId } = useRouter().query;
  const [selectedDay, setSelectedDay] = React.useState(() => stableNow);
  const week = React.useMemo(
    () => getFromMondayToSunday(selectedDay),
    [selectedDay]
  );

  const monday = week[0];
  const sunday = week[6];

  const workflowTasks = api.workflowTasks.getHistoryByWorkplaceId.useQuery(
    {
      workplaceId: workplaceId as string,
      startDay: monday,
      endDay: sunday,
      timezoneOffsetStart: monday.getTimezoneOffset(),
      timezoneOffsetEnd: sunday.getTimezoneOffset(),
    },
    { enabled: !!workplaceId }
  );

  const displayWeek = (day: string, dayName: string) =>
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    `${dayName} - ${(
      week.find((dayWeek) => dayWeek.getDay() === Number(day)) ?? new Date()
    )
      .toISOString()
      .split("T")[0]!}`;

  return (
    <>
      <Head>
        <title>History</title>
        <meta name="description" content="Workflow history" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <WorkflowNavigation>
        <main>
          <Typography variant="h4" sx={{ pb: "1rem" }}>
            History Week
          </Typography>
          <input
            type="date"
            value={selectedDay.toISOString().split("T")[0]}
            onChange={(e) =>
              e.target.valueAsDate
                ? setSelectedDay(e.target.valueAsDate)
                : void 0
            }
          />
          {workflowTasks.data && (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell></TableCell>
                    {Object.entries(DAYS).map(([day, dayName]) => (
                      <TableCell key={dayName}>
                        {displayWeek(day, dayName)}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {Object.entries(workflowTasks.data).map(
                    ([id, groupedByDays]) => (
                      <TableRow key={id}>
                        <TableCell>{id}</TableCell>
                        {Object.values(groupedByDays).map(
                          (workflowTasks, index) => (
                            <TableCell key={index} sx={{ minWidth: "20rem" }}>
                              {workflowTasks.map((workflowTask) => (
                                <Details
                                  workflowTask={workflowTask}
                                  key={workflowTask.id}
                                />
                              ))}
                            </TableCell>
                          )
                        )}
                      </TableRow>
                    )
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </main>
      </WorkflowNavigation>
    </>
  );
};

export default WorkplaceId;
