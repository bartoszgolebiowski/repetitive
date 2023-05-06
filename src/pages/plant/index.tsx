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

const Plant: NextPage = () => {
  const myPlants = api.plant.getMy.useQuery();

  return (
    <>
      <Head>
        <title>My plants</title>
        <meta name="description" content="Display my plants" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Box component="main">
        <Typography variant="h4" sx={{ pb: "1rem" }}>
          My Plants
        </Typography>
        {myPlants.data && (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Organization</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {myPlants.data.map((plant) => (
                  <TableRow key={plant.id}>
                    <TableCell>
                      <Link href={`plant/${plant.id}`}>{plant.name}</Link>
                    </TableCell>
                    <TableCell>
                      <Link href={`organization/${plant.organizationId}`}>
                        {plant.organization.name}
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

export default Plant;
