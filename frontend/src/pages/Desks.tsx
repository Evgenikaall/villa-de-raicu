import { useCallback, useEffect, useRef, useState } from "react";
import FurnitureCanvas from "../components/floor/FurnitureCanvas";
import type { FurnitureItem, FloorData } from "../types/furniture";
import {
  getFloorData,
  getFloors,
  saveFurnitureForFloor,
} from "../api/furnitureApi";
import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography,
  Paper,
  Button,
  Switch,
  FormControlLabel,
} from "@mui/material";

const CANVAS_MAX_WIDTH = 1200;

const Desks = () => {
  const [floors, setFloors] = useState<FloorData[]>([]);
  const [selectedFloor, setSelectedFloor] = useState<number | null>(null);
  const [items, setItems] = useState<FurnitureItem[]>([]);
  const [imageUrl, setImageUrl] = useState<string>("");
  const [isEditMode, setIsEditMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [imageSize, setImageSize] = useState<{
    width: number;
    height: number;
  } | null>(null);

  const handleImageLoad = useCallback(
    (size: { width: number; height: number }) => {
      setImageSize((prev) => {
        if (!prev || prev.width !== size.width || prev.height !== size.height) {
          return size;
        }
        return prev;
      });
    },
    []
  );

  const lastSavedItems = useRef<FurnitureItem[]>([]);

  useEffect(() => {
    getFloors().then((floors) => {
      setFloors(floors);
      if (floors.length) setSelectedFloor(floors[0].id);
    });
  }, []);

  useEffect(() => {
    if (selectedFloor === null) return;

    getFloorData(selectedFloor).then((floor) => {
      const cleanedFurniture = (floor.furniture || []).map((item) => {
        if (
          item.reservation?.reservedUntil &&
          new Date(item.reservation.reservedUntil) < new Date()
        ) {
          return { ...item, reservation: undefined };
        }
        return item;
      });

      setItems(cleanedFurniture);
      lastSavedItems.current = [...cleanedFurniture];
      setImageUrl(floor.imageUrl);
    });
  }, [selectedFloor]);

  const handleSave = async (newItems: FurnitureItem[]) => {
    if (selectedFloor !== null) {
      await saveFurnitureForFloor(selectedFloor, newItems);
      lastSavedItems.current = [...newItems];
    }
  };

  const handleFloorChange = async (e: any) => {
    const nextFloor = Number(e.target.value);
    if (selectedFloor !== null) {
      const changed =
        JSON.stringify(items) !== JSON.stringify(lastSavedItems.current);
      if (changed) {
        await handleSave(items);
      }
    }
    setSelectedFloor(nextFloor);
  };

  const handleToggleEditMode = () => {
    setIsEditMode((prev) => !prev);
  };

  const handleAddDesk = () => {
    if (!imageSize) return;
    const w = 60,
      h = 40;
    const x = Math.min(50, imageSize.width - w);
    const y = Math.min(50, imageSize.height - h);
    setItems((prev) => [
      ...prev,
      {
        id: Date.now(),
        label: `Desk ${prev.length + 1}`,
        x,
        y,
        width: w,
        height: h,
        type: "desk",
      },
    ]);
  };

  const handleSaveAll = async () => {
    setIsSaving(true);
    await handleSave(items);
    setIsSaving(false);
    setIsEditMode(false);
  };

  return (
    <Box sx={{ width: "100%", py: 4 }}>
      <Paper
        elevation={2}
        sx={{ p: 3, maxWidth: CANVAS_MAX_WIDTH + 64, mx: "auto", mb: 3 }}
      >
        <Box
          display="flex"
          alignItems="center"
          gap={3}
          mb={3}
          flexWrap="wrap"
          justifyContent="space-between"
        >
          <Box display="flex" alignItems="center" gap={2}>
            <Typography variant="h6" fontWeight={600}>
              Furniture Planner
            </Typography>
            <FormControl size="small" sx={{ minWidth: 180 }}>
              <InputLabel id="floor-select-label">Select Floor</InputLabel>
              <Select
                labelId="floor-select-label"
                value={selectedFloor ?? ""}
                label="Select Floor"
                onChange={handleFloorChange}
              >
                {floors.map((floor) => (
                  <MenuItem key={floor.id} value={floor.id}>
                    {floor.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          <Box display="flex" alignItems="center" gap={2}>
            <FormControlLabel
              control={
                <Switch checked={isEditMode} onChange={handleToggleEditMode} />
              }
              label={isEditMode ? "Edit Mode" : "Reservation Mode"}
            />
            {isEditMode && (
              <>
                <Button onClick={handleAddDesk} variant="contained">
                  Add Desk
                </Button>
                <Button
                  onClick={handleSaveAll}
                  variant="contained"
                  color="success"
                  disabled={isSaving}
                >
                  {isSaving ? "Saving..." : "Save"}
                </Button>
              </>
            )}
          </Box>
        </Box>

        {imageUrl && (
          <FurnitureCanvas
            imageUrl={imageUrl}
            items={items}
            setItems={setItems}
            onSave={handleSave}
            isEditMode={isEditMode}
            isSaving={isSaving}
            onImageLoad={handleImageLoad}
          />
        )}
      </Paper>
    </Box>
  );
};

export default Desks;
