// components/floor/GuestsPage.tsx
import React, { useState, useEffect } from 'react';
import {
    Box,
    Button,
    Paper,
    Table,
    TableHead,
    TableBody,
    TableRow,
    TableCell,
    Typography,
    Snackbar,
    Alert
} from '@mui/material';
import type { FurnitureItem, Guest } from '../types/furniture';
import { getFloors, getFloorData } from '../api/furnitureApi';

type GuestRow = {
    desk: string;
    guest: Guest;
};

export default function GuestsPage() {
    const [rows, setRows] = useState<GuestRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [sendCount, setSendCount] = useState(0);

    useEffect(() => {
        (async () => {
            setLoading(true);
            const floors = await getFloors();
            // fetch each floor’s data
            const datas = await Promise.all(floors.map(f => getFloorData(f.id)));
            // flatten
            const all: GuestRow[] = [];
            datas.forEach(floor => {
                (floor.furniture || []).forEach((item: FurnitureItem) => {
                    (item.guests || []).forEach(g => {
                        all.push({ desk: item.label, guest: g });
                    });
                });
            });
            setRows(all);
            setLoading(false);
        })();
    }, []);

    const handleSendAll = () => {
        rows.forEach(({ desk, guest }) => {
            console.log(`Message to ${guest.name} (${guest.phone}) at desk ${desk}`);
            // e.g. call your SMS/email API here
        });
        setSendCount(rows.length);
    };

    return (
        <Paper sx={{ p: 3, mt: 2, mx: 'auto', maxWidth: 1200, overflowX: 'auto' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">All Reservations</Typography>
                {!loading && rows.length > 0 && (
                    <Button variant="contained" onClick={handleSendAll}>
                        Send All Messages
                    </Button>
                )}
            </Box>

            {loading ? (
                <Typography>Loading…</Typography>
            ) : rows.length === 0 ? (
                <Typography>No reservations yet.</Typography>
            ) : (
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Desk</TableCell>
                            <TableCell>Guest</TableCell>
                            <TableCell>Phone</TableCell>
                            <TableCell align="right">Persons</TableCell>
                            <TableCell>From</TableCell>
                            <TableCell>Until</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {rows.map((r, idx) => (
                            <TableRow key={idx}>
                                <TableCell>{r.desk}</TableCell>
                                <TableCell>{r.guest.name}</TableCell>
                                <TableCell>{r.guest.phone}</TableCell>
                                <TableCell align="right">{r.guest.persons}</TableCell>
                                <TableCell>
                                    {r.guest.reservedAt
                                        ? new Date(r.guest.reservedAt).toLocaleDateString()
                                        : '-'}
                                </TableCell>
                                <TableCell>
                                    {r.guest.reservedUntil
                                        ? new Date(r.guest.reservedUntil).toLocaleTimeString([], {
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })
                                        : '-'}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            )}

            <Snackbar
                open={sendCount > 0}
                autoHideDuration={3000}
                onClose={() => setSendCount(0)}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert severity="success">Sent {sendCount} messages.</Alert>
            </Snackbar>
        </Paper>
    );
}
