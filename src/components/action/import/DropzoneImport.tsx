import React from "react";
import Button from "@mui/material/Button";
import { useDropzone } from "react-dropzone";
import { grey, blue } from "@mui/material/colors";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import type { z } from "zod";
import { getRowsAndHeaderFromCSVFile } from "./utils";
import { log } from "next-axiom";

type Props<T extends z.ZodType> = {
  schema: T;
  onLoad: (
    rows: Awaited<ReturnType<typeof getRowsAndHeaderFromCSVFile<T>>>
  ) => void;
};

const DropzoneImport = <T extends z.ZodType>(props: Props<T>) => {
  const { onLoad, schema } = props;

  const onDrop = React.useCallback((acceptedFiles: File[]) => {
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    acceptedFiles.forEach(async (file) => {
      try {
        const csvResults = await getRowsAndHeaderFromCSVFile(file, schema);
        onLoad(csvResults);
      } catch (error) {
        log.error("Error importing CSV file", { error, schema });
      }
    });
  }, []);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    maxFiles: 1,
    accept: {
      "text/csv": [],
    },
  });

  return (
    <Button
      {...getRootProps()}
      sx={{
        display: "flex",
        width: "100%",
        flexDirection: "column",
        height: "15rem",
        padding: 2,
        borderRadius: 1,
        borderWidth: 1,
        borderColor: grey[700],
        borderStyle: "dashed",
        backgroundColor: grey[400],
        "&:hover": {
          backgroundColor: grey[700],
          color: blue[500],
        },
      }}
    >
      <input {...getInputProps()} />
      <p>Drop CSV file here</p>
      <div>
        <UploadFileIcon sx={{ fontSize: "4rem" }} />
      </div>
      <p>
        or <strong>click</strong> to select file
      </p>
    </Button>
  );
};

export default DropzoneImport;
