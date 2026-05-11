import { useEffect, useState } from "react";
import {
  AppBar,
  Box,
  Container,
  CssBaseline,
  Tab,
  Tabs,
  Toolbar,
  Typography,
} from "@mui/material";
import AllNotificationsPage from "./pages/AllNotificationsPage";
import PriorityNotificationsPage from "./pages/PriorityNotificationsPage";
import { logInfo } from "./utils/logger";

type DashboardPage = "all" | "priority";

const pageLabels: Record<DashboardPage, string> = {
  all: "All Notifications",
  priority: "Priority Inbox",
};

function getInitialPage(): DashboardPage {
  return window.location.hash === "#priority" ? "priority" : "all";
}

function App() {
  const [activePage, setActivePage] = useState<DashboardPage>(getInitialPage);

  useEffect(() => {
    window.location.hash = activePage === "priority" ? "priority" : "all";
    void logInfo("page", `Opened ${pageLabels[activePage]} view`);
  }, [activePage]);

  useEffect(() => {
    const syncPageWithHash = () => {
      setActivePage(window.location.hash === "#priority" ? "priority" : "all");
    };

    window.addEventListener("hashchange", syncPageWithHash);
    return () => window.removeEventListener("hashchange", syncPageWithHash);
  }, []);

  return (
    <>
      <CssBaseline />
      <Box
        sx={{
          minHeight: "100vh",
          background:
            "linear-gradient(180deg, #eff6ff 0%, #f8fafc 28%, #ffffff 100%)",
        }}
      >
        <AppBar
          position="sticky"
          elevation={0}
          color="transparent"
          sx={{
            borderBottom: "1px solid",
            borderColor: "divider",
            backdropFilter: "blur(18px)",
            backgroundColor: "rgba(248, 250, 252, 0.86)",
          }}
        >
          <Toolbar
            sx={{
              flexDirection: { xs: "column", sm: "row" },
              alignItems: { xs: "flex-start", sm: "center" },
              gap: 2,
              py: { xs: 1.5, sm: 1 },
            }}
          >
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Campus Notification Dashboard
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Stage 7 frontend for browsing and prioritising campus updates
              </Typography>
            </Box>

            <Tabs
              value={activePage}
              onChange={(_, nextPage: DashboardPage) => setActivePage(nextPage)}
              textColor="primary"
              indicatorColor="primary"
              variant="scrollable"
              allowScrollButtonsMobile
              sx={{
                minHeight: 44,
                "& .MuiTab-root": {
                  minHeight: 44,
                  fontWeight: 600,
                },
              }}
            >
              <Tab value="all" label="All Notifications" />
              <Tab value="priority" label="Priority Notifications" />
            </Tabs>
          </Toolbar>
        </AppBar>

        <Container maxWidth="lg" sx={{ py: { xs: 3, md: 5 } }}>
          {activePage === "all" ? (
            <AllNotificationsPage />
          ) : (
            <PriorityNotificationsPage />
          )}
        </Container>
      </Box>
    </>
  );
}

export default App;
