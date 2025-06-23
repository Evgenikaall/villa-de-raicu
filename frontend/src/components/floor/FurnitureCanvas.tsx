// components/floor/FurnitureCanvas.tsx
import React, { useEffect, useRef, useState } from 'react';
import { Image as KonvaImage, Layer, Stage } from 'react-konva';
import useImage from 'use-image';
import type { FurnitureItem, Guest } from '../../types/furniture.ts';
import { Alert, Box, Button, FormControlLabel, Paper, Snackbar, Switch } from '@mui/material';

import DeskItem from './DeskItem';
import ReserveDeskDialog from './ReserveDeskDialog';

type Props = {
    imageUrl: string;
    items: FurnitureItem[];
    setItems: (items: FurnitureItem[]) => void;
    onSave?: (items: FurnitureItem[]) => Promise<void>;
};

export default function FurnitureCanvas({
                                            imageUrl,
                                            items,
                                            setItems,
                                            onSave
                                        }: Props) {
    const [image] = useImage(imageUrl);
    const [resizingId, setResizingId] = useState<number | null>(null);
    const [selectedDeskId, setSelectedDeskId] = useState<number | null>(null);
    const [isEditMode, setIsEditMode] = useState(true);
    const [showSaved, setShowSaved] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Reservation dialog state
    const [reserveOpen, setReserveOpen] = useState(false);
    const [reservationName, setReservationName] = useState('');
    const [reservationPhone, setReservationPhone] = useState('');
    const [reservationPersons, setReservationPersons] = useState('1');
    const [reservationDate, setReservationDate] = useState('');
    const [reservationUntilTime, setReservationUntilTime] = useState('');

    const offset = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
    const selectedDesk = items.find(i => i.id === selectedDeskId) ?? null;

    // End any in-progress resize on mouseup anywhere
    useEffect(() => {
        const onUp = () => setResizingId(null);
        window.addEventListener('mouseup', onUp);
        return () => void window.removeEventListener('mouseup', onUp);
    }, []);

    // --- Resize start
    const handleResizeStart = (item: FurnitureItem, e: any) => {
        setResizingId(item.id);
        setSelectedDeskId(item.id);
        const stage = e.target.getStage();
        const ptr = stage?.getPointerPosition();
        if (ptr) {
            offset.current = {
                x: ptr.x - item.x - item.width,
                y: ptr.y - item.y - item.height
            };
        }
    };

    // --- Resize move
    const handleMouseMove = (e: any) => {
        if (resizingId === null || !image) return;
        const item = items.find(i => i.id === resizingId);
        if (!item) return;
        const ptr = e.target.getStage()?.getPointerPosition();
        if (ptr) {
            const maxW = image.width, maxH = image.height;
            const w = Math.max(30, Math.min(ptr.x - item.x - offset.current.x, maxW - item.x));
            const h = Math.max(20, Math.min(ptr.y - item.y - offset.current.y, maxH - item.y));
            setItems(items.map(i => i.id === item.id ? { ...i, width: w, height: h } : i));
        }
    };

    // --- Resize end
    const handleMouseUp = () => setResizingId(null);

    // --- Move desk
    const handleDeskMove = (updated: FurnitureItem) => {
        if (!image) return;
        const item = items.find(i => i.id === updated.id);
        if (!item) return;
        const maxW = image.width, maxH = image.height;
        const x = Math.max(0, Math.min(updated.x, maxW - item.width));
        const y = Math.max(0, Math.min(updated.y, maxH - item.height));
        setItems(items.map(i => i.id === updated.id ? { ...i, x, y } : i));
        setSelectedDeskId(updated.id);
    };

    // --- Click desk
    const handleDeskClick = (item: FurnitureItem, e?: any) => {
        if (isEditMode) {
            // In edit mode we just select it
            setSelectedDeskId(item.id);
        } else {
            // In reservation mode we open the dialog...
            setSelectedDeskId(item.id);

            // If it already has a guest, prefill the form
            if (item.guests && item.guests.length > 0) {
                const g = item.guests[0];
                setReservationName(g.name);
                setReservationPhone(g.phone);
                setReservationPersons(String(g.persons));
                setReservationDate(g.reservedAt ?? '');
                setReservationUntilTime(g.reservedUntil?.slice(11, 16) ?? '');
            } else {
                // Otherwise clear for a new reservation
                setReservationName('');
                setReservationPhone('');
                setReservationPersons('1');
                setReservationDate('');
                setReservationUntilTime('');
            }

            setReserveOpen(true);
        }
        if (e) e.cancelBubble = true;
    };

    // --- Add / Delete
    const addItem = () => {
        if (!image) return;
        const w = 60, h = 40;
        const x = Math.min(50, image.width - w), y = Math.min(50, image.height - h);
        setItems([...items, {
            id: Date.now(),
            label: `Desk ${items.length + 1}`,
            x, y, width: w, height: h,
            type: 'desk',
            reservedBy: undefined,
            reservedAt: undefined,
            reservedUntil: undefined,
            guests: []
        }]);
    };
    const handleDelete = (id: number) => {
        setItems(items.filter(i => i.id !== id));
        if (selectedDeskId === id) setSelectedDeskId(null);
    };

    // --- Reserve confirm
    const handleReserve = async () => {
        if (!selectedDesk) return setReserveOpen(false);
        const guest: Guest = {
            name: reservationName,
            phone: reservationPhone,
            persons: Number(reservationPersons) || 1,
            reservedAt: reservationDate || undefined,
            reservedUntil: (reservationDate && reservationUntilTime)
                ? `${reservationDate}T${reservationUntilTime}` : undefined
        };
        const updated = items.map(i =>
            i.id === selectedDesk.id
                ? {
                    ...i,
                    reservedBy: guest.name,
                    reservedAt: guest.reservedAt,
                    reservedUntil: guest.reservedUntil,
                    guests: [guest]
                }
                : i
        );
        setItems(updated);
        setReserveOpen(false);
        if (onSave) {
            setIsSaving(true);
            await onSave(updated);
            setShowSaved(true);
            setTimeout(() => setShowSaved(false), 2000);
            setIsSaving(false);
        }
    };

    // --- Save all
    const handleSaveAll = async () => {
        setIsSaving(true);
        if (onSave) await onSave(items);
        setShowSaved(true);
        setTimeout(() => setShowSaved(false), 2000);
        setIsEditMode(false);
        setIsSaving(false);
    };

    return (
        <Paper sx={{ p: 3, mt: 2 }}>
            <Box display="flex" alignItems="center" gap={2} mb={3}>
                <FormControlLabel
                    control={
                        <Switch
                            checked={isEditMode}
                            onChange={() => {
                                setIsEditMode(m => !m);
                                setSelectedDeskId(null);
                            }}
                        />
                    }
                    label={isEditMode ? "Edit Mode" : "Reservation Mode"}
                />
                {isEditMode && (
                    <>
                        <Button onClick={addItem} variant="contained">Add Desk</Button>
                        <Button
                            onClick={handleSaveAll}
                            variant="contained"
                            color="success"
                            disabled={isSaving}
                        >
                            {isSaving ? 'Saving...' : 'Save'}
                        </Button>
                    </>
                )}
            </Box>

            <Box sx={{
                border: '2px solid #1976d2',
                borderRadius: 3,
                overflow: 'hidden',
                background: '#fafbfc',
                display: 'inline-block',
                boxShadow: 2
            }}>
                <Stage
                    width={image?.width || 900}
                    height={image?.height || 600}
                    onMouseMove={isEditMode ? handleMouseMove : undefined}
                    onMouseUp={isEditMode ? handleMouseUp : undefined}
                >
                    <Layer>
                        {image && <KonvaImage image={image}/>}
                        {items.map(item => (
                            <DeskItem
                                key={item.id}
                                item={item}
                                isEditMode={isEditMode}
                                isSelected={selectedDeskId === item.id}
                                resizingId={resizingId}
                                onSelect={isEditMode ? handleDeskMove : handleDeskClick}
                                onDelete={handleDelete}
                                onResizeStart={handleResizeStart}
                            />
                        ))}
                    </Layer>
                </Stage>
            </Box>

            {/* Use your existing ReserveDeskDialog */}
            <ReserveDeskDialog
                open={reserveOpen}
                reservationName={reservationName}
                reservationPhone={reservationPhone}
                reservationPersons={reservationPersons}
                reservationDate={reservationDate}
                reservationUntilTime={reservationUntilTime}
                onChangeName={setReservationName}
                onChangePhone={setReservationPhone}
                onChangePersons={setReservationPersons}
                onChangeDate={setReservationDate}
                onChangeTime={setReservationUntilTime}
                onClose={() => setReserveOpen(false)}
                onReserve={handleReserve}
            />

            <Snackbar open={showSaved} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
                <Alert severity="success">Saved!</Alert>
            </Snackbar>
        </Paper>
    );
}
