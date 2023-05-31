import type { NextPage } from "next";
import Head from "next/head";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import Typography from "@mui/material/Typography";
import React from "react";
import { CreateOrganization, OrganizationProfile } from "@clerk/nextjs";

const Organization: NextPage = () => {
  const [open, setOpen] = React.useState(false);

  const handleClose = () => setOpen(false);
  const handleOpen = () => setOpen(true);

  return (
    <>
      <Head>
        <title>Organizations</title>
        <meta name="description" content="Manage organizations" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Box component="main">
        <Modal
          open={open}
          onClose={handleClose}
          disableAutoFocus
          sx={{
            "& .cl-rootBox": {
              margin: "0 auto",
            },
          }}
        >
          <CreateOrganization />
        </Modal>
        <Typography variant="h4" sx={{ pb: "1rem" }}>
          Organizations
        </Typography>
        <Box sx={{ pb: "1rem" }}>
          <Button variant="contained" onClick={handleOpen}>
            Create Organization
          </Button>
        </Box>
        <OrganizationProfile />
      </Box>
    </>
  );
};

export default Organization;
