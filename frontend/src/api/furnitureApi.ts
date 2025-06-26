import type { FurnitureItem, FloorData } from "../types/furniture";

const USE_MOCK_API = true; // Set to false to use real API

// Mock data for multiple floors
let mockFloors: FloorData[] = [
  {
    id: 1,
    name: "Main Floor",
    imageUrl: "/floor-1.png", // Make sure this image is in your /public directory
    furniture: [],
  },
  {
    id: 2,
    name: "Second Floor",
    imageUrl: "/floor-2.png",
    furniture: [],
  },
];

// Load from localStorage if available
const stored = localStorage.getItem("mockFloors");
if (stored) {
  try {
    mockFloors = JSON.parse(stored);
  } catch {
    /* ignore */
  }
}

function saveMockFloors() {
  localStorage.setItem("mockFloors", JSON.stringify(mockFloors));
}

/**
 * Get list of floors (excluding full furniture to keep it lightweight for selectors, but can include it if needed)
 */
export async function getFloors(): Promise<FloorData[]> {
  if (USE_MOCK_API) {
    return Promise.resolve(
      mockFloors.map((floor) => ({
        id: floor.id,
        name: floor.name,
        imageUrl: floor.imageUrl,
        furniture: floor.furniture || [],
      }))
    );
  }
  // If we ever call with USE_MOCK_API === false, throw an error
  throw new Error("Not implemented");
}

/**
 * Get full data for a specific floor (including all furniture and guests)
 */
export async function getFloorData(floorId: number): Promise<FloorData> {
  if (USE_MOCK_API) {
    const floor = mockFloors.find((f) => f.id === floorId);
    if (!floor) throw new Error("Floor not found");
    return Promise.resolve(floor);
  }
  // Replace with real API call if needed
  // const res = await fetch(`/api/floors/${floorId}`);
  // return res.json();
  throw new Error("Not implemented");
}

/**
 * Save the full furniture array for a given floorId
 */
export async function saveFurnitureForFloor(
  floorId: number,
  items: FurnitureItem[]
) {
  // 👇 This is what you'd send to backend (for development/debug)
  const payload = {
    floorId,
    furniture: items,
  };

  if (USE_MOCK_API) {
    const floor = mockFloors.find((f) => f.id === floorId);
    if (floor) {
      floor.furniture = JSON.parse(JSON.stringify(items));
      saveMockFloors();
    }
    return Promise.resolve();
  }
  // Example for real API:
  // await fetch(`/api/floors/${floorId}/furniture`, {
  //     method: 'POST',
  //     headers: { 'Content-Type': 'application/json' },
  //     body: JSON.stringify(payload)
  // });
  return Promise.reject(new Error("Not implemented"));
}
