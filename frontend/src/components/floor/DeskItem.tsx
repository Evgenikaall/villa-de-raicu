import React, { useState } from "react";
import { Group, Rect, Text, Circle } from "react-konva";
import type { FurnitureItem } from "../../types/furniture.ts";
import type { KonvaEventObject } from "konva/lib/Node";

type DeskItemProps = {
  item: FurnitureItem;
  isEditMode: boolean;
  isSelected: boolean;
  resizingId: number | null;
  onSelect: (item: FurnitureItem, e?: any) => void;
  onDelete: (id: number) => void;
  handleDeskNameClick: (item: FurnitureItem) => void;
  onResizeStart: (item: FurnitureItem, e: KonvaEventObject<MouseEvent>) => void;
};

const HANDLE_RADIUS = 8;
const DELETE_BOX = 20;

export default function DeskItem({
  item,
  isEditMode,
  isSelected,
  resizingId,
  onSelect,
  onDelete,
  handleDeskNameClick,
  onResizeStart,
}: DeskItemProps) {
  const [hover, setHover] = useState(false);

  const strokeColor = isSelected
    ? "#1976d2"
    : item.reservedBy
    ? "#b71c1c"
    : "black";

  const fillColor =
    hover || isSelected
      ? item.reservedBy
        ? "rgba(244,67,54,0.2)"
        : "rgba(33,150,243,0.2)"
      : item.reservedBy
      ? "rgba(244,67,54,0.4)"
      : "rgba(33,150,243,0.3)";

  return (
    <Group
      x={item.x}
      y={item.y}
      draggable={isEditMode && resizingId !== item.id}
      onDragEnd={(e) => onSelect({ ...item, x: e.target.x(), y: e.target.y() })}
      onClick={(e) => onSelect(item, e)}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {/* Main rectangle */}
      <Rect
        width={item.width}
        height={item.height}
        fill={fillColor}
        stroke={strokeColor}
        strokeWidth={isSelected ? 3 : 1}
        cornerRadius={10}
        listening={true}
      />

      {/* Desk label */}
      <Text
        text={item.label}
        fontSize={14}
        fontStyle="bold"
        fill="#212121"
        y={-18}
        x={4}
        onClick={(e) => {
          e.cancelBubble = true;
          handleDeskNameClick(item);
        }}
        cursor="pointer"
      />

      {/* Reservation info */}
      {item.reservedBy && (
        <Text
          text={
            `Reserved: ${item.reservedBy}` +
            (item.reservedAt ? `\nFrom: ${item.reservedAt}` : "") +
            (item.reservedUntil
              ? `\nUntil: ${item.reservedUntil.slice(11, 16)}`
              : "")
          }
          fontSize={12}
          fill="#b71c1c"
          y={item.height + 4}
          x={4}
        />
      )}

      {/* Delete icon */}
      {isEditMode && (
        <Group
          x={item.width - DELETE_BOX}
          y={-DELETE_BOX}
          onClick={(e) => {
            e.cancelBubble = true;
            onDelete(item.id);
          }}
          cursor="pointer"
        >
          <Rect
            width={DELETE_BOX}
            height={DELETE_BOX}
            fill="white"
            opacity={0.8}
            cornerRadius={5}
          />
          <Text
            text="🗑"
            fontSize={16}
            width={DELETE_BOX}
            height={DELETE_BOX}
            align="center"
            verticalAlign="middle"
            fill="#b71c1c"
          />
        </Group>
      )}

      {/* Resize handle */}
      {item.type === "desk" && isEditMode && (
        <Circle
          x={item.width}
          y={item.height}
          radius={HANDLE_RADIUS}
          fill="#1976d2"
          stroke="white"
          strokeWidth={2}
          onMouseDown={(e) => {
            e.cancelBubble = true;
            onResizeStart(item, e);
          }}
          cursor="nwse-resize"
        />
      )}
    </Group>
  );
}
