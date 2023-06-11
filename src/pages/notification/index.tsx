import type { NextPage } from "next";
import Head from "next/head";
import { api } from "~/utils/api";

import Box from "@mui/material/Box";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import React from "react";
import TableContainer from "@mui/material/TableContainer";
import TablePagination from "@mui/material/TablePagination";
import Paper from "@mui/material/Paper";

import { NOTIFICATION_CAUSE_MESSAGE } from "~/utils/schema/action/notification";
import { displayDateFull } from "~/utils/date";

const START_PAGE = 0;
const START_ROWS_PER_PAGE = 10;

const replaceVariables = (
  cause: keyof typeof NOTIFICATION_CAUSE_MESSAGE,
  variables: string[]
) =>
  variables.reduce(
    (acc, variable, index) => acc.replace(`{${index}}`, variable),
    NOTIFICATION_CAUSE_MESSAGE[cause]
  );

const usePagination = () => {
  const [page, setPage] = React.useState(START_PAGE);
  const [rowsPerPage, setRowsPerPage] = React.useState(START_ROWS_PER_PAGE);

  const handleChangePage = (
    event: React.MouseEvent<HTMLButtonElement> | null,
    newPage: number
  ) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(START_PAGE);
  };

  return {
    page,
    rowsPerPage,
    handleChangePage,
    handleChangeRowsPerPage,
  };
};

const Notifications: NextPage = () => {
  const { page, rowsPerPage, handleChangePage, handleChangeRowsPerPage } =
    usePagination();

  const notifications = api.notification.getMy.useQuery({
    page,
    pageSize: rowsPerPage,
  });

  return (
    <>
      <Head>
        <title>Notifications</title>
        <meta name="description" content="Manage Notifications" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Box component="main">
        {notifications.data && (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Seen</TableCell>
                  <TableCell>Cause</TableCell>
                  <TableCell>Titile</TableCell>
                  <TableCell>Message</TableCell>
                  <TableCell align="right">Created At</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {notifications.data.data.map((notification) => (
                  <TableRow key={notification.id}>
                    <TableCell>{notification.read}</TableCell>
                    <TableCell>{notification.cause}</TableCell>
                    <TableCell>
                      {replaceVariables(
                        notification.cause,
                        notification.variables
                      )}
                    </TableCell>
                    <TableCell>
                      {replaceVariables(
                        notification.cause,
                        notification.variables
                      )}
                    </TableCell>
                    <TableCell align="right">
                      {displayDateFull(notification.createdAt)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <TablePagination
              component="div"
              count={Number(notifications.data.total)}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </TableContainer>
        )}
      </Box>
    </>
  );
};

export default Notifications;
