import { useState } from "react";
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

  const fontSize = 12;
  const padding = 6;
  const lineHeight = fontSize + 4;
  const infoWidth = 180;
  const infoHeight = 4 * lineHeight + padding * 2;

  const canvasWidth = 1000; // актуальная ширина Stage

  const nameText = `👤 ${item.reservation?.name ?? ""}`;
  const phoneText = item.reservation?.phone
    ? `📞 ${item.reservation.phone}`
    : "";
  const fromText = item.reservation?.reservedAt
    ? `🕒 From: ${new Date(item.reservation.reservedAt).toLocaleString([], {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })}`
    : "";
  const untilText = item.reservation?.reservedUntil
    ? `⏳ Until: ${new Date(item.reservation.reservedUntil).toLocaleString([], {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })}`
    : "";

  const showLeftSide = item.x + item.width + infoWidth + 20 > canvasWidth;

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
      {/* Основной прямоугольник */}
      <Rect
        width={item.width}
        height={item.height}
        fill={
          item.reservation
            ? hover || isSelected
              ? "rgba(244,67,54,0.5)"
              : "rgba(244,67,54,0.8)"
            : hover || isSelected
            ? "rgba(33,150,243,0.2)"
            : "rgba(33,150,243,0.4)"
        }
        stroke={
          isSelected ? "#1976d2" : item.reservation ? "#b71c1c" : "#1565c0"
        }
        strokeWidth={isSelected ? 3 : 1.5}
        shadowBlur={hover || isSelected ? 6 : 0}
        cornerRadius={10}
      />

      {/* Название стола над прямоугольником */}
      <Text
        text={item.label}
        fontSize={14}
        fontStyle="bold"
        fill="#212121"
        y={-18}
        x={padding}
        onClick={(e) => {
          e.cancelBubble = true;
          handleDeskNameClick(item);
        }}
        cursor="pointer"
      />

      {/* Всплывающее окно при наведении */}
      {hover && item.reservation && (
        <Group x={showLeftSide ? -infoWidth - 10 : item.width + 10} y={0}>
          <Rect
            width={infoWidth}
            height={infoHeight}
            fill="white"
            opacity={0.95}
            shadowBlur={4}
            cornerRadius={6}
          />

          <Text
            text={nameText}
            x={padding}
            y={padding}
            width={infoWidth - padding * 2}
            wrap="word"
            fontSize={fontSize}
            fontStyle="bold"
            fill="#333"
          />
          <Text
            text={phoneText}
            x={padding}
            y={padding + lineHeight}
            width={infoWidth - padding * 2}
            wrap="word"
            fontSize={fontSize}
            fill="#333"
          />
          <Text
            text={fromText}
            x={padding}
            y={padding + lineHeight * 2}
            width={infoWidth - padding * 2}
            wrap="word"
            fontSize={fontSize}
            fill="#333"
          />
          <Text
            text={untilText}
            x={padding}
            y={padding + lineHeight * 3}
            width={infoWidth - padding * 2}
            wrap="word"
            fontSize={fontSize}
            fill="#333"
          />
        </Group>
      )}

      {/* Иконка удаления */}
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
            opacity={0.9}
            cornerRadius={5}
            shadowBlur={3}
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

      {/* Ручка ресайза */}
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
          shadowBlur={3}
          cursor="nwse-resize"
        />
      )}
    </Group>
  );
}
