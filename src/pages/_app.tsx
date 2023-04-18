import { type AppType } from "next/app";
import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { Container, ThemeProvider } from "@mui/material";
import { CacheProvider } from "@emotion/react";

import Navigation from "~/components/navigation/AppNavigation";
import { api } from "~/utils/api";
import { createEmotionCache } from "~/styles/createEmotionCache";
import { theme } from "~/styles/theme";

import "~/styles/globals.css";

const clientSideEmotionCache = createEmotionCache();

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  return (
    <CacheProvider value={clientSideEmotionCache}>
      <ThemeProvider theme={theme}>
        <SessionProvider session={session}>
          <Navigation>
            <Container maxWidth="lg" sx={{ pt: "1rem" }}>
              <Component {...pageProps} />
            </Container>
          </Navigation>
        </SessionProvider>
      </ThemeProvider>
    </CacheProvider>
  );
};

export default api.withTRPC(MyApp);
