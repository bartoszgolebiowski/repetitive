import Card from "@mui/material/Card";
import React, { forwardRef } from "react";

type Props = React.ComponentProps<typeof Card> & {
  size?: "small" | "medium" | "large";
};

const MAX_WIDTHS = {
  small: "20rem",
  medium: "30rem",
  large: "40rem",
} as const;

const FormCard = forwardRef(
  (props: Props, ref: React.ForwardedRef<HTMLDivElement>) => {
    const { size = "small", sx, ...rest } = props;
    return (
      <Card
        ref={ref}
        sx={{
          maxWidth: MAX_WIDTHS[size],
          maxHeight: "90vh",
          padding: "2rem",
          margin: "0 auto",
          ...sx,
        }}
        {...rest}
      />
    );
  }
);

FormCard.displayName = "FormCard";

export default FormCard;
