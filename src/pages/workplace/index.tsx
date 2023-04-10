import type { NextPage } from "next";
import Link from "next/link";
import Head from "next/head";
import { api } from "~/utils/api";

import Box from "@mui/material/Box";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import TableContainer from "@mui/material/TableContainer";
import Paper from "@mui/material/Paper";

const Workplace: NextPage = () => {
  const myWorkplaces = api.workplace.getMyWorkplaces.useQuery();

  return (
    <>
      <Head>
        <title>My workplaces</title>
        <meta name="description" content="Display my workplaces" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Box component="main">
        <Typography variant="h4" sx={{ pb: "1rem" }}>
          My Workplaces
        </Typography>
        {myWorkplaces.data && (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Organization</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {myWorkplaces.data.map((workplace) => (
                  <TableRow key={workplace.id}>
                    <TableCell>
                      <Link href={`workplace/${workplace.id}`}>
                        {workplace.name}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Link href={`organization/${workplace.organizationId}`}>
                        {workplace.organization.name}
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

export default Workplace;
