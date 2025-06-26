import { useEffect, useMemo, useReducer } from "react";
import { Image as KonvaImage, Layer, Stage } from "react-konva";
import useImage from "use-image";
import type { FurnitureItem, Reservation } from "../../types/furniture";
import { Box, Paper, Snackbar, Alert } from "@mui/material";

import DeskItem from "./DeskItem";
import ReserveDeskDialog from "./ReserveDeskDialog";
import ChangeNameDialog from "./ChangeDeskNameDialog";
import { canvasReducer, initialState } from "../../reducers/FurnitureReducer";
import { useResizeDesk } from "../../hooks/useResizeDesk";

type Props = {
  imageUrl: string;
  items: FurnitureItem[];
  setItems: (items: FurnitureItem[]) => void;
  onSave?: (items: FurnitureItem[]) => Promise<void>;
  isEditMode: boolean;
  isSaving: boolean;
  onImageLoad?: (size: { width: number; height: number }) => void;
};

export default function FurnitureCanvas({
  imageUrl,
  items,
  setItems,
  onSave,
  isEditMode,
  isSaving,
  onImageLoad,
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

  useEffect(() => {
    if (image && onImageLoad) {
      onImageLoad({ width: image.width, height: image.height });
    }
  }, [image, onImageLoad]);

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

  const handleDeskClick = (item: FurnitureItem, e?: any) => {
    if (isEditMode) {
      dispatch({ type: "SET_SELECTED_DESK", payload: item.id });
    } else {
      dispatch({ type: "SET_SELECTED_DESK", payload: item.id });
      dispatch({ type: "OPEN_RESERVE", payload: true });
    }
    if (e) e.cancelBubble = true;
  };

  const handleDeskNameClick = (item: FurnitureItem) => {
    if (!isEditMode) return;
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

  const handleReserve = (reservation: Reservation) => {
    if (!selectedDesk) return;

    const updatedItems = state.items.map((item) =>
      item.id === selectedDesk.id
        ? {
            ...item,
            reservation,
          }
        : item
    );

    dispatch({
      type: "UPDATE_DESK_RESERVATION",
      payload: { id: selectedDesk.id, reservation },
    });

    if (onSave) {
      dispatch({ type: "SET_IS_SAVING", payload: true });

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

  return (
    <Paper sx={{ p: 3, mt: 2 }}>
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
          onMouseMove={isEditMode ? handleMouseMove : undefined}
          onMouseUp={isEditMode ? handleMouseUp : undefined}
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
                  isEditMode={isEditMode}
                  isSelected={state.selectedDeskId === item.id}
                  resizingId={state.resizingId}
                  onSelect={isEditMode ? handleDeskMove : handleDeskClick}
                  onDelete={(id) =>
                    dispatch({ type: "DELETE_DESK", payload: id })
                  }
                  onResizeStart={handleResizeStart}
                  handleDeskNameClick={handleDeskNameClick}
                />
              );
            })}
          </Layer>
        </Stage>
      </Box>

      <ReserveDeskDialog
        open={state.reserveOpen}
        onClose={() => dispatch({ type: "OPEN_RESERVE", payload: false })}
        onSubmit={handleReserve}
        initialData={selectedDesk?.reservation}
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
