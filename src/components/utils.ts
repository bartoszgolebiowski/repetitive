import { grey } from "@mui/material/colors";

export const iconButtonSx = ({ disabled, color }: { disabled: boolean, color: string }) => ({
    cursor: disabled ? "not-allowed" : "pointer",
    backgroundColor: disabled ? grey[700] : grey[400],
    color: disabled ? grey[500] : color,
    borderRadius: 2,
    "&:hover": {
        backgroundColor: grey[700],
    },
}) 