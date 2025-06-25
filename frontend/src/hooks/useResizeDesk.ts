// hooks/useResizeDesk.ts
import { useRef, useState } from "react";
import type { FurnitureItem } from "../types/furniture";

export function useResizeDesk(image: HTMLImageElement | null) {
  const offset = useRef({ x: 0, y: 0 });
  const [localSize, setLocalSize] = useState<{
    id: number;
    width: number;
    height: number;
  } | null>(null);

  const startResize = (item: FurnitureItem, e: any) => {
    const stage = e.target.getStage();
    const ptr = stage?.getPointerPosition();
    if (ptr) {
      offset.current = {
        x: ptr.x - item.x - item.width,
        y: ptr.y - item.y - item.height,
      };
    }
    setLocalSize({ id: item.id, width: item.width, height: item.height });
  };

  const updateSize = (item: FurnitureItem, e: any) => {
    if (!image) return;
    const ptr = e.target.getStage()?.getPointerPosition();
    if (!ptr) return;
    const newWidth = Math.max(
      30,
      Math.min(ptr.x - item.x - offset.current.x, image.width - item.x)
    );
    const newHeight = Math.max(
      20,
      Math.min(ptr.y - item.y - offset.current.y, image.height - item.y)
    );
    setLocalSize({ id: item.id, width: newWidth, height: newHeight });
  };

  const endResize = () => {
    const size = localSize;
    setLocalSize(null);
    return size;
  };

  return { localSize, startResize, updateSize, endResize };
}
