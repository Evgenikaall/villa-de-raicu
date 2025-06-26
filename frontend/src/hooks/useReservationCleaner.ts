// hooks/useReservationCleaner.ts
import { useEffect } from "react";
import {
  getFloors,
  getFloorData,
  saveFurnitureForFloor,
} from "../api/furnitureApi";

export function useReservationCleaner() {
  useEffect(() => {
    const interval = setInterval(async () => {
      const now = new Date();
      const history = JSON.parse(
        localStorage.getItem("reservationHistory") || "[]"
      );

      const floors = await getFloors();

      for (const floor of floors) {
        const floorData = await getFloorData(floor.id);
        const items = floorData.furniture || [];

        let hasChanges = false;

        const updatedItems = items.map((item) => {
          const isExpired =
            item.reservation?.reservedUntil &&
            new Date(item.reservation.reservedUntil) < now;

          if (isExpired) {
            const exists = history.some(
              (h) =>
                h.deskLabel === item.label &&
                h.reservation?.reservedUntil === item.reservation?.reservedUntil
            );

            if (!exists) {
              history.push({
                floorName: floor.name,
                deskLabel: item.label,
                reservation: item.reservation,
              });
            }

            hasChanges = true;
            return { ...item, reservation: undefined };
          }

          return item;
        });

        if (hasChanges) {
          console.log("uspeh");
          await saveFurnitureForFloor(floor.id, updatedItems);
        }
      }

      localStorage.setItem("reservationHistory", JSON.stringify(history));
    }, 60 * 1000);

    return () => clearInterval(interval);
  }, []);
}
