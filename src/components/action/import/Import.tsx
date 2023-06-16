import Modal from "@mui/material/Modal";
import React from "react";
import { type z } from "zod";
import FormCard from "~/components/FormCard";
import FormTitle from "~/components/FormTitle";
import DropzoneImport, { type OnInputInput } from "./DropzoneImport";
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
import { cellId, rowId, sxCell, sxRow, zodKeys } from "./utils";
import { log } from "next-axiom";

type Props<T extends z.ZodTypeAny> = {
  schema: T;
  status: "error" | "success" | "loading" | "idle";
  onImport: (csv: OnInputInput<T>) => Promise<unknown>;
};

const ExampleCSV = <T extends z.ZodTypeAny>(
  props: Pick<Props<T>, "schema">
) => {
  const { schema } = props;

  const handleClick = () => {
    const headers = zodKeys(schema).map((header) => header.trim());
    const csvData = [headers.join(",")].join("\n");
    const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `import-example.csv`);
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <a href="#" onClick={handleClick}>
      Download Example CSV
    </a>
  );
};

const Import = <T extends z.ZodTypeAny>(props: Props<T>) => {
  const { schema, onImport, status } = props;
  const [csv, setCSV] = React.useState<OnInputInput<T> | null>(null);
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  const handleClose = () => {
    setOpen(false);
    setCSV(null);
  };
  const handleOpen = () => setOpen(true);
  const handleLoad = setCSV;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (csv) {
      try {
        await onImport(csv);
      } catch (error) {
        log.error("Error importing csv", {
          error,
          csvContent: csv,
          schema,
        });
      }
      handleClose();
    }
  };

  const noRowsValid = !csv?.validRows.length;

  return (
    <>
      <Button variant="contained" color="primary" onClick={handleOpen}>
        Import
      </Button>
      <Modal open={open} onClose={handleClose}>
        <FormCard size="xLarge" ref={ref} sx={{ orverflowY: "scroll" }}>
          {/*eslint-disable-next-line @typescript-eslint/no-misused-promises */}
          <form onSubmit={handleSubmit}>
            <FormTitle>Import</FormTitle>
            <Grid2 container spacing={2}>
              <Grid2 xs={12}>
                <DropzoneImport schema={schema} onLoad={handleLoad} />
                <ExampleCSV schema={schema} />
              </Grid2>
              {csv ? (
                <>
                  <Grid2 xs={12}>
                    <TableContainer component={Paper}>
                      <Table size="small" data-testid="import-table">
                        <TableHead>
                          <TableRow>
                            {csv.header.map((header) => (
                              <TableCell key={header}>{header}</TableCell>
                            ))}
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {csv.allRows.map((row, currentRow) => (
                            <TableRow
                              key={currentRow}
                              data-testId={rowId(
                                csv.validRows,
                                row,
                                currentRow
                              )}
                              sx={sxRow(csv.validRows, row)}
                            >
                              {Object.entries(row).map(
                                ([columnName, cellValue]) => (
                                  <TableCell
                                    key={columnName}
                                    data-testId={cellId(
                                      csv.errors,
                                      columnName,
                                      currentRow
                                    )}
                                    sx={sxCell(
                                      csv.errors,
                                      columnName,
                                      currentRow
                                    )}
                                  >
                                    {cellValue}
                                  </TableCell>
                                )
                              )}
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Grid2>
                </>
              ) : null}

              <Grid2 xs={6}>
                <Button
                  fullWidth
                  variant="contained"
                  color="secondary"
                  onClick={handleClose}
                  disabled={status === "loading"}
                >
                  Close
                </Button>
              </Grid2>
              <Grid2 xs={6}>
                <Button
                  fullWidth
                  variant="contained"
                  color="primary"
                  type="submit"
                  disabled={status === "loading" || noRowsValid}
                >
                  Submit
                </Button>
              </Grid2>
            </Grid2>
          </form>
        </FormCard>
      </Modal>
    </>
  );
};

export default Import;
