import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  InputAdornment,
} from "@mui/material";
import { useEffect, useState } from "react";

type Guest = {
  name: string;
  phone: string;
  persons: number;
  reservedAt?: string;
  reservedUntil?: string;
};

type Props = {
  open: boolean;
  initialData?: Guest;
  onClose: () => void;
  onSubmit: (data: Guest) => void;
};

export default function ReserveDeskDialog({
  open,
  initialData,
  onClose,
  onSubmit,
}: Props) {
  const [form, setForm] = useState<Guest>({
    name: "",
    phone: "",
    persons: 1,
    reservedAt: "",
    reservedUntil: "",
  });

  // при открытии обновляем данные
  useEffect(() => {
    if (open) {
      setForm(
        initialData ?? {
          name: "",
          phone: "",
          persons: 1,
          reservedAt: "",
          reservedUntil: "",
        }
      );
    }
  }, [open, initialData]);

  const handleChange = (field: keyof Guest, value: string) => {
    setForm((prev) => ({
      ...prev,
      [field]: field === "persons" ? Number(value) : value,
    }));
  };

  const isValid =
    form.name.trim() &&
    form.phone.trim() &&
    form.persons > 0 &&
    form.reservedAt &&
    form.reservedUntil;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Reserve Desk</DialogTitle>
      <DialogContent>
        <TextField
          label="Your Name"
          value={form.name}
          onChange={(e) => handleChange("name", e.target.value)}
          fullWidth
          autoFocus
          sx={{ mb: 2 }}
        />
        <TextField
          label="Phone Number"
          value={form.phone}
          onChange={(e) =>
            handleChange("phone", e.target.value.replace(/[^\d+]/g, ""))
          }
          fullWidth
          sx={{ mb: 2 }}
          InputProps={{
            startAdornment: <InputAdornment position="start">+</InputAdornment>,
          }}
        />
        <TextField
          label="Persons"
          value={form.persons}
          type="number"
          inputProps={{ min: 1, max: 99 }}
          onChange={(e) => handleChange("persons", e.target.value)}
          fullWidth
          sx={{ mb: 2 }}
        />
        <TextField
          label="Reservation Date"
          type="date"
          value={form.reservedAt}
          onChange={(e) => handleChange("reservedAt", e.target.value)}
          fullWidth
          InputLabelProps={{ shrink: true }}
          sx={{ mb: 2 }}
        />
        <TextField
          label="Reserve Until (Time)"
          type="time"
          value={form.reservedUntil?.slice(11, 16) ?? ""}
          onChange={(e) =>
            handleChange(
              "reservedUntil",
              `${form.reservedAt}T${e.target.value}`
            )
          }
          fullWidth
          InputLabelProps={{ shrink: true }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={() => onSubmit(form)}
          disabled={!isValid}
          variant="contained"
        >
          Reserve
        </Button>
      </DialogActions>
    </Dialog>
  );
}
