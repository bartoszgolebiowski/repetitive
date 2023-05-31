import * as React from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import MuiDrawer from "@mui/material/Drawer";
import Toolbar from "@mui/material/Toolbar";
import List from "@mui/material/List";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import HomeIcon from "@mui/icons-material/Home";
import BusinessIcon from "@mui/icons-material/Business";
import WorkplaceIcon from "@mui/icons-material/Workspaces";
import EngineeringIcon from "@mui/icons-material/Engineering";

import Link from "next/link";

import { Roboto } from "next/font/google";
import { styled, useTheme, type Theme } from "@mui/material/styles";
import { OrganizationSwitcher, UserButton } from "@clerk/nextjs";

const roboto = Roboto({
  weight: "400",
  subsets: ["latin"],
});

const DRAWER_WIDTH_OPEN = 240;
const DRAWER_WIDTH_CLOSE = "64px";
const DRAWER_HEIGHT = "64px";

const openedMixin = (theme: Theme) => ({
  width: DRAWER_WIDTH_OPEN,
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: "hidden",
});

const closedMixin = (theme: Theme) => ({
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: "hidden",
  width: `calc(${theme.spacing(7)} + 1px)`,
  [theme.breakpoints.up("sm")]: {
    width: `calc(${theme.spacing(8)} + 1px)`,
  },
});

const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
}));

const Drawer = styled(MuiDrawer, {
  shouldForwardProp: (prop) => prop !== "open",
  //@ts-expect-error some issue with emotion and the sx prop
})(({ theme, open }) => ({
  width: DRAWER_WIDTH_OPEN,
  flexShrink: 0,
  whiteSpace: "nowrap",
  boxSizing: "border-box",
  ...(open && {
    ...openedMixin(theme),
    "& .MuiDrawer-paper": openedMixin(theme),
  }),
  ...(!open && {
    ...closedMixin(theme),
    "& .MuiDrawer-paper": closedMixin(theme),
  }),
}));

type Props = {
  children: React.ReactNode;
};

const drawerItems = [
  {
    text: "Home",
    icon: <HomeIcon />,
    href: "",
  },
  {
    text: "Organization",
    icon: <BusinessIcon />,
    href: "organization",
  },
  {
    text: "Line plan",
    icon: <EngineeringIcon />,
    href: "linePlan",
  },
] as const;

const Navigation = (props: Props) => {
  const { children } = props;
  const theme = useTheme();
  const [open, setOpen] = React.useState(false);

  const handleToggle = () => {
    setOpen((state) => !state);
  };

  const openArrow =
    theme.direction === "rtl" ? <ChevronRightIcon /> : <ChevronLeftIcon />;
  const closeArrow =
    theme.direction === "rtl" ? <ChevronLeftIcon /> : <ChevronRightIcon />;
  const arrow = open ? openArrow : closeArrow;

  return (
    <Box
      className={roboto.className}
      sx={{ ml: DRAWER_WIDTH_CLOSE, mt: DRAWER_HEIGHT }}
    >
      <Box sx={{ flexGrow: 1 }}>
        <AppBar position="fixed">
          <Toolbar>
            <Box sx={{ flexGrow: 1 }}></Box>
            <OrganizationSwitcher />
            <UserButton />
          </Toolbar>
        </AppBar>
      </Box>
      <Drawer variant="permanent" open={open}>
        <DrawerHeader>
          <IconButton onClick={handleToggle}>{arrow}</IconButton>
        </DrawerHeader>
        <Divider />
        <List>
          {drawerItems.map((item) => (
            <ListItem
              key={item.text}
              disablePadding
              sx={{ display: "block" }}
              component={Link}
              href={`/${item.href.toLowerCase()}`}
            >
              <ListItemButton
                sx={{
                  minHeight: 48,
                  justifyContent: open ? "initial" : "center",
                  px: 2.5,
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: open ? 3 : "auto",
                    justifyContent: "center",
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText sx={{ opacity: open ? 1 : 0 }}>
                  {item.text}
                </ListItemText>
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Drawer>
      {children}
    </Box>
  );
};

export default Navigation;
