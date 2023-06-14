import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";
import React from "react";
import { type z } from "zod";
import FormCard from "~/components/FormCard";
import FormTitle from "~/components/FormTitle";
import DropzoneImport from "./DropzoneImport";
import Grid2 from "@mui/material/Unstable_Grid2";
import {
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";

type Props<T extends z.ZodTypeAny> = {
  schema: T;
  onImport: (
    csv: Parameters<React.ComponentProps<typeof DropzoneImport>["onLoad"]>[0]
  ) => Promise<unknown>;
  refetch: () => Promise<unknown>;
};

const Import = <T extends z.ZodTypeAny>(props: Props<T>) => {
  const { schema, refetch, onImport } = props;
  const [csvContent, setCSVContent] = React.useState<
    Parameters<React.ComponentProps<typeof DropzoneImport>["onLoad"]>[0] | null
  >(null);
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  const handleClose = () => setOpen(false);
  const handleOpen = () => setOpen(true);
  const handleLoad = (
    rows: Parameters<React.ComponentProps<typeof DropzoneImport>["onLoad"]>[0]
  ) => {
    setCSVContent(rows);
  };

  const handleSubmit = async () => {
    if (csvContent) {
      await onImport(csvContent);
      await refetch();
      handleClose();
    }
  };

  return (
    <>
      <Button variant="contained" color="primary" onClick={handleOpen}>
        Import
      </Button>
      <Modal open={open} onClose={handleClose}>
        <FormCard size="large" ref={ref} sx={{ orverflowY: "scroll" }}>
          <form>
            <FormTitle>Import</FormTitle>
            <Grid2 container spacing={2}>
              <Grid2 xs={12}>
                <DropzoneImport schema={schema} onLoad={handleLoad} />
              </Grid2>
              {csvContent ? (
                <Grid2 xs={12}>
                  <TableContainer component={Paper}>
                    <Table size="small">
                      <TableHead>
                        {csvContent.header.map((header) => (
                          <TableCell key={header}>{header}</TableCell>
                        ))}
                      </TableHead>
                      <TableBody>
                        {csvContent.allRows.map((row, i) => (
                          <TableRow
                            key={i}
                            sx={{
                              backgroundColor: csvContent.validRows.some(
                                (validRow) =>
                                  JSON.stringify(validRow) ===
                                  JSON.stringify(row)
                              )
                                ? "green"
                                : "initial",
                            }}
                          >
                            {Object.entries(row).map(([key, value]) => (
                              <TableCell
                                key={key}
                                sx={{
                                  backgroundColor: Object.entries(
                                    csvContent.errors
                                  ).some(
                                    ([rowNumber, field]) =>
                                      Number(rowNumber) === i &&
                                      field.includes(key)
                                  )
                                    ? "red"
                                    : "initial",
                                }}
                              >
                                {value} 
                              </TableCell>
                            ))}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Grid2>
              ) : null}
            </Grid2>
          </form>
        </FormCard>
      </Modal>
    </>
  );
};

export default Import;
