import type { NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { redirect } from "next/navigation";
import React from "react";
import { api } from "~/utils/api";

const InviteId: NextPage = () => {
  const timerRef = React.useRef<NodeJS.Timeout | null>(null);
  const { organizationId, invitationId } = useRouter().query;
  const acceptInvitation = api.invitation.accept.useMutation({
    onSuccess: () => {
      timerRef.current = setTimeout(() => {
        redirect("../..");
      }, 5000);
    },
  });

  React.useEffect(() => {
    if (invitationId) {
      acceptInvitation.mutate({
        organizationId: organizationId as string,
        id: invitationId as string,
      });
    }
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [organizationId, invitationId]);

  return (
    <>
      <Head>
        <title>Accept Invitation</title>
        <meta name="description" content="Accept invitation" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex min-h-screen flex-col items-center justify-center">
        {acceptInvitation.status === "success" ? (
          <div className="flex flex-col items-center justify-center">
            <h1 className="text-4xl font-bold">Success!</h1>
            <p className="text-2xl">
              You have successfully joined the organization.
            </p>
            <Link href={"../.."}>Go to organization</Link>
            <p>
              You will be redirected to the organization page in 5 seconds. If
              not, click the link above.
            </p>
          </div>
        ) : acceptInvitation.status === "error" ? (
          <div className="flex flex-col items-center justify-center">
            <h1 className="text-4xl font-bold">Error!</h1>
            <p className="text-2xl">
              {acceptInvitation?.error?.message ?? "Something went wrong."}
            </p>
          </div>
        ) : (
          <div>Processing...</div>
        )}
      </main>
    </>
  );
};

export default InviteId;
