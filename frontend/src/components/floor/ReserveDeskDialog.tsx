import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";

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

  const applyPhoneMask = (value: string) => {
    // Оставляем только цифры
    const digits = value.replace(/\D/g, "");

    let masked = "+373 ";

    if (digits.startsWith("373")) {
      const rest = digits.slice(3);
      if (rest.length > 0) masked += "(" + rest.slice(0, 3);
      if (rest.length >= 3) masked += ") " + rest.slice(3, 6);
      if (rest.length >= 6) masked += " " + rest.slice(6, 9);
    } else {
      if (digits.length > 0) masked += "(" + digits.slice(0, 3);
      if (digits.length >= 3) masked += ") " + digits.slice(3, 6);
      if (digits.length >= 6) masked += " " + digits.slice(6, 9);
    }

    return masked;
  };

  const extractPurePhone = (masked: string) => {
    const digits = masked.replace(/\D/g, "");
    return digits.startsWith("373") ? "+" + digits : "+373" + digits;
  };

  const isValid = useMemo(() => {
    const phoneDigits = form.phone.replace(/\D/g, "");

    const start = Date.parse(form.reservedAt ?? "");
    const end = Date.parse(form.reservedUntil ?? "");

    return (
      form.name.trim().length > 0 &&
      phoneDigits.length > 8 &&
      form.persons > 0 &&
      !isNaN(start) &&
      !isNaN(end) &&
      start < end
    );
  }, [form]);

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
          value={applyPhoneMask(form.phone)}
          onChange={(e) =>
            handleChange("phone", extractPurePhone(e.target.value))
          }
          fullWidth
          sx={{ mb: 2 }}
          placeholder="+373 (XXX) XXX XXX"
        />
        <TextField
          label="Persons"
          type="number"
          inputProps={{ min: 1, max: 99 }}
          value={form.persons}
          onChange={(e) => handleChange("persons", e.target.value)}
          fullWidth
          sx={{ mb: 2 }}
        />
        <TextField
          label="Reservation Start"
          type="datetime-local"
          value={form.reservedAt ?? ""}
          onChange={(e) => handleChange("reservedAt", e.target.value)}
          fullWidth
          InputLabelProps={{ shrink: true }}
          sx={{ mb: 2 }}
        />
        <TextField
          label="Reservation End"
          type="datetime-local"
          value={form.reservedUntil ?? ""}
          onChange={(e) => handleChange("reservedUntil", e.target.value)}
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
