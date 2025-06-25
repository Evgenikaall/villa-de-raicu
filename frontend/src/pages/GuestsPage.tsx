// components/floor/GuestsPage.tsx
import { useState, useEffect } from 'react';
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
import type { FurnitureItem, Reservation } from '../types/furniture';
import { getFloors, getFloorData } from '../api/furnitureApi';

export type ReservationRow = {
    floorName: string;
    deskLabel: string;
    reservation: Reservation;
};

export default function GuestsPage() {
    const [rows, setRows] = useState<ReservationRow[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [sendCount, setSendCount] = useState<number>(0);

    useEffect(() => {
        const fetchReservations = async () => {
            setLoading(true);
            try {
                const floors = await getFloors();
                const floorsData = await Promise.all(floors.map(f => getFloorData(f.id)));

                const all: ReservationRow[] = [];

                floorsData.forEach(floor => {
                    floor.furniture?.forEach((item: FurnitureItem) => {
                        if (item.reservation) {
                            all.push({
                                floorName: floor.name,
                                deskLabel: item.label,
                                reservation: item.reservation
                            });
                        }
                    });
                });

                setRows(all);
            } catch (error) {
                console.error('Failed to load reservations:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchReservations();
    }, []);

    const handleSendAll = () => {
        rows.forEach(({ deskLabel, reservation }) => {
            console.log(`Sending message to ${reservation.name} (${reservation.phone}) at ${deskLabel}`);
            // Здесь можно интегрировать ваш API отправки сообщений
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
                                    {r.reservation.reservedAt
                                        ? new Date(r.reservation.reservedAt).toLocaleString()
                                        : '-'}
                                </TableCell>
                                <TableCell>
                                    {r.reservation.reservedUntil
                                        ? new Date(r.reservation.reservedUntil).toLocaleString()
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
                <Alert severity="success">
                    {`Sent ${sendCount} message${sendCount === 1 ? '' : 's'}.`}
                </Alert>
            </Snackbar>
        </Paper>
    );
}
