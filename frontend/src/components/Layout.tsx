import { Outlet } from "react-router-dom";
import Navigation from "./Navigation";
import { Container, Box } from "@mui/material";

const Layout = () => (
  <>
    <Navigation />
    <Container maxWidth="xl" sx={{ mt: 2 }}>
      <Box>
        <Outlet />
      </Box>
    </Container>
  </>
);

export default Layout;
