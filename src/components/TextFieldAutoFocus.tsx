import { TextField } from "@mui/material";
import React from "react";

const TextFieldAutoFocus = (props: React.ComponentProps<typeof TextField>) => {
  const ref = React.useRef<HTMLInputElement>(null);
  React.useEffect(() => {
    ref.current?.focus();
  }, []);
  return <TextField inputRef={ref} {...props} />;
};

export default TextFieldAutoFocus;
