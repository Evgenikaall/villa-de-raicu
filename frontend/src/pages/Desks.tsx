import { useEffect, useRef, useState } from "react";
import FurnitureCanvas from "../components/floor/FurnitureCanvas.tsx";
import type { FurnitureItem, FloorData } from "../types/furniture.ts";
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
} from "@mui/material";

const CANVAS_MAX_WIDTH = 1200;
const CANVAS_MAX_HEIGHT = 800;

const Desks = () => {
  const [floors, setFloors] = useState<FloorData[]>([]);
  const [selectedFloor, setSelectedFloor] = useState<number | null>(null);
  const [items, setItems] = useState<FurnitureItem[]>([]);
  const [imageUrl, setImageUrl] = useState<string>("");
  const lastSavedItems = useRef<FurnitureItem[]>([]);

  useEffect(() => {
    getFloors().then((floors) => {
      setFloors(floors);
      if (floors.length) setSelectedFloor(floors[0].id);
    });
  }, []);

  useEffect(() => {
    if (selectedFloor !== null) {
      getFloorData(selectedFloor).then((floor) => {
        setItems(floor.furniture || []);
        lastSavedItems.current = floor.furniture ? [...floor.furniture] : [];
        setImageUrl(floor.imageUrl);
      });
    }
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
        </Box>
        {imageUrl && (
          <FurnitureCanvas
            imageUrl={imageUrl}
            items={items}
            setItems={setItems}
            onSave={handleSave}
          />
        )}
      </Paper>
    </Box>
  );
};

export default Desks;
