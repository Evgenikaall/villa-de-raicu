// components/floor/FurnitureCanvas.tsx
import { useEffect, useMemo, useReducer } from "react";
import { Image as KonvaImage, Layer, Stage } from "react-konva";
import useImage from "use-image";
import type { FurnitureItem, Guest } from "../../types/furniture.ts";
import {
  Alert,
  Box,
  Button,
  FormControlLabel,
  Paper,
  Snackbar,
  Switch,
} from "@mui/material";

import DeskItem from "./DeskItem";
import ReserveDeskDialog from "./ReserveDeskDialog";
import ChangeNameDialog from "./ChangeDeskNameDialog.tsx";
import {
  canvasReducer,
  initialState,
} from "../../reducers/FurnitureReducer.ts";
import { useResizeDesk } from "../../hooks/useResizeDesk.ts";

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
  onSave,
}: Props) {
  const [image] = useImage(imageUrl);
  const [state, dispatch] = useReducer(canvasReducer, {
    ...initialState,
    items,
  });

  const { localSize, startResize, updateSize, endResize } = useResizeDesk(
    image ?? null
  );

  const selectedDesk = useMemo(
    () => state.items.find((i) => i.id === state.selectedDeskId) ?? null,
    [state.items, state.selectedDeskId]
  );

  useEffect(() => {
    dispatch({ type: "SET_ITEMS", payload: items });
  }, [items]);

  useEffect(() => {
    setItems(state.items);
  }, [state.items, setItems]);

  useEffect(() => {
    const onUp = () => dispatch({ type: "SET_RESIZING_ID", payload: null });
    window.addEventListener("mouseup", onUp);
    return () => window.removeEventListener("mouseup", onUp);
  }, []);

  const handleResizeStart = (item: FurnitureItem, e: any) => {
    dispatch({ type: "SET_RESIZING_ID", payload: item.id });
    dispatch({ type: "SET_SELECTED_DESK", payload: item.id });
    startResize(item, e);
  };

  const handleMouseMove = (e: any) => {
    if (state.resizingId === null) return;
    const item = state.items.find((i) => i.id === state.resizingId);
    if (item) updateSize(item, e);
  };

  const handleMouseUp = () => {
    const size = endResize();
    if (size) {
      dispatch({ type: "UPDATE_DESK_SIZE", payload: size });
    }
    dispatch({ type: "SET_RESIZING_ID", payload: null });
  };

  // --- Move desk
  const handleDeskMove = (updated: FurnitureItem) => {
    if (!image) return;
    const item = state.items.find((i) => i.id === updated.id);
    if (!item) return;
    const x = Math.max(0, Math.min(updated.x, image.width - item.width));
    const y = Math.max(0, Math.min(updated.y, image.height - item.height));
    dispatch({
      type: "UPDATE_DESK_POSITION",
      payload: { id: updated.id, x, y },
    });
  };

  // --- Click desk
  const handleDeskClick = (item: FurnitureItem, e?: any) => {
    if (state.isEditMode) {
      dispatch({ type: "SET_SELECTED_DESK", payload: item.id });
    } else {
      dispatch({ type: "SET_SELECTED_DESK", payload: item.id });
      dispatch({ type: "OPEN_RESERVE", payload: true });
    }
    if (e) e.cancelBubble = true;
  };

  const handleDeskNameClick = (item: FurnitureItem) => {
    if (!state.isEditMode) return;
    dispatch({ type: "SET_SELECTED_DESK", payload: item.id });
    dispatch({ type: "OPEN_CHANGE_NAME", payload: true });
  };

  const handleChangeName = (newName: string) => {
    if (!selectedDesk) return;
    dispatch({
      type: "UPDATE_DESK_LABEL",
      payload: { id: selectedDesk.id, label: newName },
    });
  };

  const handleReserve = (guest: Guest) => {
    if (!selectedDesk) return;

    // Найдём текущий стол и обновим его вручную
    const updatedItems = state.items.map((item) =>
      item.id === selectedDesk.id
        ? {
            ...item,
            guest,
            reservedBy: guest.name,
            reservedAt: guest.reservedAt,
            reservedUntil: guest.reservedUntil,
          }
        : item
    );

    dispatch({
      type: "UPDATE_DESK_RESERVATION",
      payload: { id: selectedDesk.id, guest },
    });

    if (onSave) {
      dispatch({ type: "SET_IS_SAVING", payload: true });

      // Используем обновлённый список
      onSave(updatedItems).then(() => {
        dispatch({ type: "SHOW_SAVED", payload: true });
        setTimeout(
          () => dispatch({ type: "SHOW_SAVED", payload: false }),
          2000
        );
        dispatch({ type: "SET_IS_SAVING", payload: false });
      });
    }
  };

  const handleSaveAll = async () => {
    dispatch({ type: "SET_IS_SAVING", payload: true });
    if (onSave) await onSave(state.items);
    dispatch({ type: "SHOW_SAVED", payload: true });
    setTimeout(() => dispatch({ type: "SHOW_SAVED", payload: false }), 2000);
    dispatch({ type: "TOGGLE_EDIT_MODE" });
    dispatch({ type: "SET_IS_SAVING", payload: false });
  };

  const handleAdd = () => {
    if (!image) return;
    const w = 60,
      h = 40,
      x = Math.min(50, image.width - 60),
      y = Math.min(50, image.height - 40);
    dispatch({
      type: "ADD_DESK",
      payload: {
        id: Date.now(),
        label: `Desk ${state.items.length + 1}`,
        x,
        y,
        width: w,
        height: h,
        type: "desk",
      },
    });
  };

  const handleDelete = (id: number) => {
    dispatch({ type: "DELETE_DESK", payload: id });
  };

  console.log(state.items);

  return (
    <Paper sx={{ p: 3, mt: 2 }}>
      <Box display="flex" alignItems="center" gap={2} mb={3}>
        <FormControlLabel
          control={
            <Switch
              checked={state.isEditMode}
              onChange={() => dispatch({ type: "TOGGLE_EDIT_MODE" })}
            />
          }
          label={state.isEditMode ? "Edit Mode" : "Reservation Mode"}
        />
        {state.isEditMode && (
          <>
            <Button onClick={handleAdd} variant="contained">
              Add Desk
            </Button>
            <Button
              onClick={handleSaveAll}
              variant="contained"
              color="success"
              disabled={state.isSaving}
            >
              {state.isSaving ? "Saving..." : "Save"}
            </Button>
          </>
        )}
      </Box>

      <Box
        sx={{
          border: "2px solid #1976d2",
          borderRadius: 3,
          overflow: "hidden",
          background: "#fafbfc",
          display: "inline-block",
          boxShadow: 2,
        }}
      >
        <Stage
          width={image?.width || 900}
          height={image?.height || 600}
          onMouseMove={state.isEditMode ? handleMouseMove : undefined}
          onMouseUp={state.isEditMode ? handleMouseUp : undefined}
        >
          <Layer>
            {image && <KonvaImage image={image} />}
            {state.items.map((item) => {
              const size =
                localSize?.id === item.id
                  ? { width: localSize.width, height: localSize.height }
                  : { width: item.width, height: item.height };

              return (
                <DeskItem
                  key={item.id}
                  item={{ ...item, ...size }}
                  isEditMode={state.isEditMode}
                  isSelected={state.selectedDeskId === item.id}
                  resizingId={state.resizingId}
                  onSelect={state.isEditMode ? handleDeskMove : handleDeskClick}
                  onDelete={handleDelete}
                  onResizeStart={handleResizeStart}
                  handleDeskNameClick={handleDeskNameClick}
                />
              );
            })}
          </Layer>
        </Stage>
      </Box>

      {/* Use your existing ReserveDeskDialog */}
      <ReserveDeskDialog
        open={state.reserveOpen}
        onClose={() => dispatch({ type: "OPEN_RESERVE", payload: false })}
        onSubmit={handleReserve}
        initialData={selectedDesk?.guests?.[0]}
      />

      <ChangeNameDialog
        open={state.changeNameOpen}
        onClose={() => dispatch({ type: "OPEN_CHANGE_NAME", payload: false })}
        onSubmit={handleChangeName}
        initialName={selectedDesk?.label || ""}
      />

      <Snackbar
        open={state.showSaved}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert severity="success">Saved!</Alert>
      </Snackbar>
    </Paper>
  );
}
