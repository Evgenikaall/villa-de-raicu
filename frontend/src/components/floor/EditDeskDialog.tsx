import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField } from '@mui/material';

type EditDeskDialogProps = {
    open: boolean;
    value: string;
    onChange: (val: string) => void;
    onClose: () => void;
    onSave: () => void;
};

export default function EditDeskDialog({ open, value, onChange, onClose, onSave }: EditDeskDialogProps) {
    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth sx={{ '& .MuiDialog-paper': { minWidth: 400 } }}>
            <DialogTitle>Edit Desk</DialogTitle>
            <DialogContent>
                <TextField
                    label="Label"
                    value={value}
                    onChange={e => onChange(e.target.value)}
                    fullWidth
                    autoFocus
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button onClick={onSave} variant="contained">Save</Button>
            </DialogActions>
        </Dialog>
    );
}
