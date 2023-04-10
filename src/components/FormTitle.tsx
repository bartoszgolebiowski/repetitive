import Typography from "@mui/material/Typography";
import React from "react";

const FormTitle = (props: React.PropsWithChildren) => {
  return <Typography variant="h5" sx={{ pb: "1rem" }} {...props} />;
};

export default FormTitle;
