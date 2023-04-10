import Card from "@mui/material/Card";
import React from "react";

type Props = React.ComponentProps<typeof Card> & {
  size?: "small" | "medium" | "large";
};

const MAX_WIDTHS = {
  small: "20rem",
  medium: "30rem",
  large: "40rem",
};

const FormCard = (props: Props) => {
  const { size = "small", ...rest } = props;
  return (
    <Card
      sx={{
        maxWidth: MAX_WIDTHS[size],
        padding: "2rem",
        margin: "0 auto",
      }}
      {...rest}
    />
  );
};

export default FormCard;
