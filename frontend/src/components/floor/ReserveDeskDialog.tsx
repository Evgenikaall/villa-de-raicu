import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, InputAdornment } from '@mui/material';

type ReserveDeskDialogProps = {
    open: boolean;
    reservationName: string;
    reservationPhone: string;
    reservationPersons: string;
    reservationDate: string;
    reservationUntilTime: string;
    onChangeName: (val: string) => void;
    onChangePhone: (val: string) => void;
    onChangePersons: (val: string) => void;
    onChangeDate: (val: string) => void;
    onChangeTime: (val: string) => void;
    onClose: () => void;
    onReserve: () => void;
};

export default function ReserveDeskDialog({
                                              open,
                                              reservationName,
                                              reservationPhone,
                                              reservationPersons,
                                              reservationDate,
                                              reservationUntilTime,
                                              onChangeName,
                                              onChangePhone,
                                              onChangePersons,
                                              onChangeDate,
                                              onChangeTime,
                                              onClose,
                                              onReserve,
                                          }: ReserveDeskDialogProps) {
    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth sx={{ '& .MuiDialog-paper': { minWidth: 400 } }}>
            <DialogTitle>Reserve Desk</DialogTitle>
            <DialogContent>
                <TextField
                    label="Your Name"
                    value={reservationName}
                    onChange={e => onChangeName(e.target.value)}
                    fullWidth
                    autoFocus
                    sx={{ mb: 2 }}
                />
                <TextField
                    label="Phone Number"
                    value={reservationPhone}
                    onChange={e => onChangePhone(e.target.value.replace(/[^\d+]/g, ""))}
                    fullWidth
                    sx={{ mb: 2 }}
                    InputProps={{
                        startAdornment: <InputAdornment position="start">+</InputAdornment>,
                    }}
                />
                <TextField
                    label="Persons"
                    value={reservationPersons}
                    onChange={e => {
                        const value = e.target.value.replace(/\D/g, '').slice(0, 2);
                        onChangePersons(value);
                    }}
                    fullWidth
                    sx={{ mb: 2 }}
                />
                <TextField
                    label="Reservation Date"
                    type="date"
                    value={reservationDate}
                    onChange={e => onChangeDate(e.target.value)}
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                    sx={{ mb: 2 }}
                />
                <TextField
                    label="Reserve Until (Time)"
                    type="time"
                    value={reservationUntilTime}
                    onChange={e => onChangeTime(e.target.value)}
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button
                    onClick={onReserve}
                    variant="contained"
                    disabled={
                        !reservationName.trim() ||
                        !reservationPhone.trim() ||
                        !reservationPersons.trim() ||
                        !reservationDate ||
                        !reservationUntilTime
                    }
                >
                    Reserve
                </Button>
            </DialogActions>
        </Dialog>
    );
}
