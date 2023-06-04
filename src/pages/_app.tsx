import { type AppType } from "next/app";
import { Box, ThemeProvider } from "@mui/material";
import { CacheProvider } from "@emotion/react";

import AppNavigation from "~/components/navigation/AppNavigation";
import { api } from "~/utils/api";
import { createEmotionCache } from "~/styles/createEmotionCache";
import { theme } from "~/styles/theme";

import "~/styles/globals.css";
import { ClerkProvider } from "@clerk/nextjs";

const clientSideEmotionCache = createEmotionCache();

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <CacheProvider value={clientSideEmotionCache}>
      <ThemeProvider theme={theme}>
        <ClerkProvider {...pageProps}>
          <AppNavigation>
            <Box sx={{ p: 4 }}>
              <Component {...pageProps} />
            </Box>
          </AppNavigation>
        </ClerkProvider>
      </ThemeProvider>
    </CacheProvider>
  );
};

export default api.withTRPC(MyApp);
