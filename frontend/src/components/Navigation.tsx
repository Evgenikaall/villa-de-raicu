// src/components/Navigation.tsx
import React from "react";
import { AppBar, Button, Toolbar, Typography } from "@mui/material";
import { Link } from "react-router-dom";

const Navigation: React.FC = () => (
  <AppBar position="static">
    <Toolbar>
      <Typography variant="h6" sx={{ flexGrow: 1 }}>
        Villa De Raicu
      </Typography>
      <Button color="inherit" component={Link} to="/desks">
        Desks
      </Button>
      <Button color="inherit" component={Link} to="/guests">
        Guests
      </Button>
      <Button color="inherit" component={Link} to="/history">
        History
      </Button>
    </Toolbar>
  </AppBar>
);

export default Navigation;
