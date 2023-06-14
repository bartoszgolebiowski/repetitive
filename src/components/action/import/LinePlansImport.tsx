import React from "react";
import { useDropzone } from "react-dropzone";

type Props = {
  refetch: () => Promise<unknown>;
};



const LinePlansImport = (props: Props) => {
  const { getRootProps, getInputProps } = useDropzone({ onDrop });

  return <div></div>;
};

export default LinePlansImport;
