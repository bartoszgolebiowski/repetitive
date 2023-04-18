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
import {
  DAYS,
  displayDate,
  getFromMondayToSunday,
  stableNow,
} from "~/utils/date";
import type { DefinitionTask } from "@prisma/client";
import WorkplaceNavigation from "~/components/navigation/WorkplaceNavigation";

const Details = ({ definitionTask }: { definitionTask: DefinitionTask }) => {
  return (
    <Accordion
      sx={{
        backgroundColor:
          definitionTask.status === "DONE" ? "success.main" : "error.main",
      }}
    >
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography>{definitionTask.status}</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <p>
          {definitionTask.id}
        </p>
        <ol>
          <li>Available From: {displayDate(definitionTask.availableFrom)}</li>
          <li>Available To: {displayDate(definitionTask.availableTo)}</li>
        </ol>
      </AccordionDetails>
    </Accordion>
  );
};

const History: NextPage = () => {
  const { workplaceId } = useRouter().query;
  const [selectedDay, setSelectedDay] = React.useState(() => stableNow);
  const week = React.useMemo(
    () => getFromMondayToSunday(selectedDay),
    [selectedDay]
  );

  const monday = week[0];
  const sunday = week[6];

  const definitionTasks = api.definitionTasks.getHistoryByWorkplaceId.useQuery(
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
        <meta name="description" content="Tasks history" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <WorkplaceNavigation>
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
          {definitionTasks.data && (
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
                  {Object.entries(definitionTasks.data).map(
                    ([id, groupedByDays]) => (
                      <TableRow key={id}>
                        <TableCell sx={{ minWidth: "30rem" }}>{id}</TableCell>
                        {Object.values(groupedByDays).map(
                          (definitionTasks, index) => (
                            <TableCell key={index} sx={{ minWidth: "20rem" }}>
                              {definitionTasks.map((definitionTask) => (
                                <Details
                                  definitionTask={definitionTask}
                                  key={definitionTask.id}
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
      </WorkplaceNavigation>
    </>
  );
};

export default History;
