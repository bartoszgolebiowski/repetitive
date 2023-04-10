import ButtonGroup from "@mui/material/ButtonGroup";
import Box from "@mui/material/Box";
import React from "react";
import Button from "@mui/material/Button";
import Link from "next/link";
import { useRouter } from "next/router";

const WorkplaceNavigation = (props: React.PropsWithChildren) => {
  const { workplaceId } = useRouter().query;
  const isDefinitions = useRouter().pathname.includes("definition");
  const isHistory = useRouter().pathname.includes("history");
  const isFrequency = useRouter().pathname.includes("frequency");
  const isChecklist = !isDefinitions && !isHistory && !isFrequency;

  return (
    <>
      <Box>
        <ButtonGroup
          size="large"
          aria-label="workplace-navigation"
          orientation="horizontal"
          sx={{
            display: "flex",
            justifyContent: "center",
          }}
        >
          <Button
            LinkComponent={Link}
            variant={isDefinitions ? "contained" : "outlined"}
            href={{
              pathname: `/workplace/[workplaceId]/definition`,
              query: { workplaceId: workplaceId },
            }}
          >
            Definition
          </Button>
          <Button
            LinkComponent={Link}
            variant={isChecklist ? "contained" : "outlined"}
            href={{
              pathname: `/workplace/[workplaceId]/`,
              query: { workplaceId: workplaceId },
            }}
          >
            Checklist
          </Button>
          <Button
            LinkComponent={Link}
            variant={isHistory ? "contained" : "outlined"}
            href={{
              pathname: `/workplace/[workplaceId]/history`,
              query: { workplaceId: workplaceId },
            }}
          >
            History
          </Button>
          <Button
            LinkComponent={Link}
            variant={isFrequency ? "contained" : "outlined"}
            href={{
              pathname: `/workplace/[workplaceId]/frequency`,
              query: { workplaceId: workplaceId },
            }}
          >
            Frequency
          </Button>
        </ButtonGroup>
      </Box>
      {props.children}
    </>
  );
};

export default WorkplaceNavigation;
