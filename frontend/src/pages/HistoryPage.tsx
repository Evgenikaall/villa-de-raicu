import { useEffect, useState } from "react";
import {
  Box,
  Paper,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Typography,
  Button,
} from "@mui/material";

export default function HistoryPage() {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    const stored = localStorage.getItem("reservationHistory");
    if (stored) {
      setRows(JSON.parse(stored));
    }
  }, []);

  const handleClearHistory = () => {
    localStorage.removeItem("reservationHistory");
    setRows([]);
  };

  return (
    <Paper sx={{ p: 3, mt: 2, mx: "auto", maxWidth: 1200, overflowX: "auto" }}>
      <Box display="flex" justifyContent="space-between" mb={2}>
        <Typography variant="h6">Reservation History</Typography>
        <Button color="error" onClick={handleClearHistory}>
          Clear History
        </Button>
      </Box>

      {rows.length === 0 ? (
        <Typography>No past reservations.</Typography>
      ) : (
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Floor</TableCell>
              <TableCell>Desk</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell align="right">Persons</TableCell>
              <TableCell>From</TableCell>
              <TableCell>Until</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((r, idx) => (
              <TableRow key={idx}>
                <TableCell>{r.floorName}</TableCell>
                <TableCell>{r.deskLabel}</TableCell>
                <TableCell>{r.reservation.name}</TableCell>
                <TableCell>{r.reservation.phone}</TableCell>
                <TableCell align="right">{r.reservation.persons}</TableCell>
                <TableCell>
                  {new Date(r.reservation.reservedAt).toLocaleString()}
                </TableCell>
                <TableCell>
                  {new Date(r.reservation.reservedUntil).toLocaleString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </Paper>
  );
}
