import ButtonGroup from "@mui/material/ButtonGroup";
import Box from "@mui/material/Box";
import React from "react";
import Button from "@mui/material/Button";
import Link from "next/link";
import { useRouter } from "next/router";

const PlantNavigation = (props: React.PropsWithChildren) => {
  const { plantId } = useRouter().query;
  const isDefinitions = useRouter().pathname.includes("definition");
  const isHistory = useRouter().pathname.includes("history");
  const isFrequency = useRouter().pathname.includes("frequency");
  const isChecklist = !isDefinitions && !isHistory && !isFrequency;

  if (!plantId || Array.isArray(plantId)) {
    return null;
  }

  return (
    <>
      <Box>
        <ButtonGroup
          size="large"
          aria-label="plant-navigation"
          orientation="horizontal"
          sx={{
            display: "flex",
            justifyContent: "center",
          }}
        >
          <Button
            LinkComponent={Link}
            variant={isDefinitions ? "contained" : "outlined"}
            href={`/plant/${plantId}/definition`}
          >
            Definition
          </Button>
          <Button
            LinkComponent={Link}
            variant={isChecklist ? "contained" : "outlined"}
            href={`/plant/${plantId}/`}
          >
            Checklist
          </Button>
          <Button
            LinkComponent={Link}
            variant={isHistory ? "contained" : "outlined"}
            href={`/plant/${plantId}/history`}
          >
            History
          </Button>
          <Button
            LinkComponent={Link}
            variant={isFrequency ? "contained" : "outlined"}
            href={`/plant/${plantId}/frequency`}
          >
            Frequency
          </Button>
        </ButtonGroup>
      </Box>
      {props.children}
    </>
  );
};

export default PlantNavigation;
