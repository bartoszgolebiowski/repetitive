import React from "react";
import useMediaQuery from "@mui/material/useMediaQuery";
import { type Theme } from "@mui/material";
import AppNavigationMobile from "./AppNavigationMobile";
import AppNavigationDesktop from "./AppNavigationDesktop";

const AppNavigation = (props: React.PropsWithChildren) => {
  const { children } = props;
  const isMobile = useMediaQuery((theme: Theme) =>
    theme.breakpoints.down("sm")
  );
  
  return isMobile ? (
    <AppNavigationMobile>{children}</AppNavigationMobile>
  ) : (
    <AppNavigationDesktop>{children}</AppNavigationDesktop>
  );
};

export default AppNavigation;
