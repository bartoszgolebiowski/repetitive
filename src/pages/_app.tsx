import { type AppType } from "next/app";
import { Box, ThemeProvider } from "@mui/material";
import { CacheProvider } from "@emotion/react";

import Navigation from "~/components/navigation/AppNavigation";
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
          <Navigation>
            <Box sx={{ p: 4 }}>
              <Component {...pageProps} />
            </Box>
          </Navigation>
        </ClerkProvider>
      </ThemeProvider>
    </CacheProvider>
  );
};

export default api.withTRPC(MyApp);
