import type { NextPage } from "next";
import Head from "next/head";
import { api } from "~/utils/api";

import Grid2 from "@mui/material/Unstable_Grid2";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Modal from "@mui/material/Modal";
import Typography from "@mui/material/Typography";
import React from "react";
import FormCard from "~/components/FormCard";
import { useRouter } from "next/router";
import MenuItem from "@mui/material/MenuItem";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import CancelIcon from "@mui/icons-material/Cancel";
import HourglassBottomIcon from "@mui/icons-material/HourglassBottom";
import QuestionMarkIcon from "@mui/icons-material/QuestionMark";
import Tooltip from "@mui/material/Tooltip";
import DoneIcon from "@mui/icons-material/Done";
import FormTitle from "~/components/FormTitle";
import TableContainer from "@mui/material/TableContainer";
import Paper from "@mui/material/Paper";

const STATUS_ICONS = {
  ACCEPTED: <DoneIcon color="success" />,
  PENDING: <HourglassBottomIcon color="warning" />,
  REJECTED: <CancelIcon color="error" />,
} as const;

const VALID_ROLES = ["ADMIN", "MEMBER"] as const;

const Invite: NextPage = () => {
  const [open, setOpen] = React.useState(false);
  const { organizationId } = useRouter().query;
  const organizationInvitations = api.invitation.getByOrganizationId.useQuery(
    {
      organizationId: organizationId as string,
    },
    { enabled: !!organizationId }
  );

  const createInvitaion = api.invitation.create.useMutation({
    onSettled: async () => {
      handleClose();
      await organizationInvitations.refetch();
    },
  });

  const deleteInvitation = api.invitation.delete.useMutation({
    onSettled: async () => {
      await organizationInvitations.refetch();
    },
  });

  const handleCreate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const role = formData.get("role") as string;
    const organizationId = formData.get("organizationId") as string;

    // create type guard
    const isValidRole = (role: string): role is (typeof VALID_ROLES)[number] =>
      VALID_ROLES.includes(role as (typeof VALID_ROLES)[number]);

    if (isValidRole(role)) {
      return createInvitaion.mutate({
        role,
        organizationId,
        name: self.crypto.randomUUID(),
      });
    }
  };

  const handleDelete = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const id = formData.get("id") as string;
    const organizationId = formData.get("organizationId") as string;

    return deleteInvitation.mutate({ id, organizationId });
  };

  const handleCopy =
    (
      invite: Exclude<
        typeof organizationInvitations.data,
        null | undefined
      >[number]
    ) =>
    async () => {
      const link = (
        invite: Exclude<
          typeof organizationInvitations.data,
          null | undefined
        >[number]
      ) =>
        `${window.location.origin}/organization/${invite.organizationId}/invite/${invite.id}`;

      await navigator.clipboard.writeText(link(invite));
    };

  const handleClose = () => setOpen(false);
  const handleOpen = () => setOpen(true);

  return (
    <>
      <Head>
        <title>Invitations</title>
        <meta name="description" content="Manage organizations" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <Modal open={open} onClose={handleClose} disableAutoFocus>
          <FormCard>
            <FormTitle>Create Invitation</FormTitle>
            <form onSubmit={handleCreate}>
              <input
                type="hidden"
                name="organizationId"
                value={organizationId}
              />
              <Grid2 container spacing={2}>
                <Grid2 xs={12}>
                  <TextField
                    autoFocus
                    required
                    select
                    fullWidth
                    id="role"
                    label="Role"
                    name="role"
                  >
                    {VALID_ROLES.map((option) => (
                      <MenuItem key={option} value={option}>
                        {option}
                      </MenuItem>
                    ))}
                  </TextField>
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
          Invitations
        </Typography>
        <Box>
          <Button
            variant="contained"
            onClick={handleOpen}
            disabled={organizationInvitations.status === "loading"}
          >
            Create Invitation
          </Button>
        </Box>
        {organizationInvitations.data && (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Role</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Link</TableCell>
                  <TableCell align="right">Deactive</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {organizationInvitations.data.map((invitation) => (
                  <TableRow key={invitation.id}>
                    <TableCell>{invitation.role}</TableCell>
                    <TableCell>
                      <Tooltip title={invitation.status}>
                        {STATUS_ICONS[
                          invitation.status as keyof typeof STATUS_ICONS
                        ] ?? <QuestionMarkIcon />}
                      </Tooltip>
                    </TableCell>
                    <TableCell align="right">
                      <Button
                        variant="contained"
                        // eslint-disable-next-line @typescript-eslint/no-misused-promises
                        onClick={handleCopy(invitation)}
                      >
                        <ContentCopyIcon />
                      </Button>
                    </TableCell>
                    <TableCell align="right">
                      <form onSubmit={handleDelete}>
                        <input
                          type="hidden"
                          name="organizationId"
                          value={organizationId}
                        />
                        <input type="hidden" name="id" value={invitation.id} />
                        <Button
                          variant="contained"
                          color="secondary"
                          type="submit"
                        >
                          <CancelIcon />
                        </Button>
                      </form>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </main>
    </>
  );
};

export default Invite;
