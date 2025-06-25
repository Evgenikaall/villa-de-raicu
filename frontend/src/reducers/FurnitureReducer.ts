import type { FurnitureItem, Guest } from "../types/furniture";

export interface CanvasState {
  resizingId: number | null;
  selectedDeskId: number | null;
  isEditMode: boolean;
  showSaved: boolean;
  isSaving: boolean;
  reserveOpen: boolean;
  changeNameOpen: boolean;
  items: FurnitureItem[];
}

export type CanvasAction =
  | { type: "SET_ITEMS"; payload: FurnitureItem[] }
  | { type: "SET_SELECTED_DESK"; payload: number | null }
  | { type: "TOGGLE_EDIT_MODE" }
  | { type: "SET_RESIZING_ID"; payload: number | null }
  | { type: "SHOW_SAVED"; payload: boolean }
  | { type: "SET_IS_SAVING"; payload: boolean }
  | { type: "OPEN_RESERVE"; payload: boolean }
  | { type: "OPEN_CHANGE_NAME"; payload: boolean }
  | {
      type: "UPDATE_DESK_POSITION";
      payload: { id: number; x: number; y: number };
    }
  | {
      type: "UPDATE_DESK_SIZE";
      payload: { id: number; width: number; height: number };
    }
  | { type: "UPDATE_DESK_LABEL"; payload: { id: number; label: string } }
  | { type: "UPDATE_DESK_RESERVATION"; payload: { id: number; guest: Guest } }
  | { type: "ADD_DESK"; payload: FurnitureItem }
  | { type: "DELETE_DESK"; payload: number };

export const initialState: CanvasState = {
  resizingId: null,
  selectedDeskId: null,
  isEditMode: false,
  showSaved: false,
  isSaving: false,
  reserveOpen: false,
  changeNameOpen: false,
  items: [],
};

export function canvasReducer(
  state: CanvasState,
  action: CanvasAction
): CanvasState {
  switch (action.type) {
    case "SET_ITEMS":
      return { ...state, items: action.payload };
    case "SET_SELECTED_DESK":
      return { ...state, selectedDeskId: action.payload };
    case "TOGGLE_EDIT_MODE":
      return {
        ...state,
        isEditMode: !state.isEditMode,
        selectedDeskId: null,
      };
    case "SET_RESIZING_ID":
      return { ...state, resizingId: action.payload };
    case "SHOW_SAVED":
      return { ...state, showSaved: action.payload };
    case "SET_IS_SAVING":
      return { ...state, isSaving: action.payload };
    case "OPEN_RESERVE":
      return { ...state, reserveOpen: action.payload };
    case "OPEN_CHANGE_NAME":
      return { ...state, changeNameOpen: action.payload };
    case "UPDATE_DESK_POSITION":
      return {
        ...state,
        items: state.items.map((item) =>
          item.id === action.payload.id
            ? { ...item, x: action.payload.x, y: action.payload.y }
            : item
        ),
        selectedDeskId: action.payload.id,
      };
    case "UPDATE_DESK_SIZE":
      return {
        ...state,
        items: state.items.map((item) =>
          item.id === action.payload.id
            ? {
                ...item,
                width: action.payload.width,
                height: action.payload.height,
              }
            : item
        ),
      };
    case "UPDATE_DESK_LABEL":
      return {
        ...state,
        items: state.items.map((item) =>
          item.id === action.payload.id
            ? { ...item, label: action.payload.label }
            : item
        ),
        changeNameOpen: false,
      };
    case "UPDATE_DESK_RESERVATION":
      return {
        ...state,
        items: state.items.map((item) =>
          item.id === action.payload.id
            ? {
                ...item,
                reservedBy: action.payload.guest.name,
                reservedAt: action.payload.guest.reservedAt,
                reservedUntil: action.payload.guest.reservedUntil,
                guests: [action.payload.guest],
              }
            : item
        ),
        reserveOpen: false,
      };
    case "ADD_DESK":
      return { ...state, items: [...state.items, action.payload] };
    case "DELETE_DESK":
      return {
        ...state,
        items: state.items.filter((item) => item.id !== action.payload),
        selectedDeskId:
          state.selectedDeskId === action.payload ? null : state.selectedDeskId,
      };
    default:
      return state;
  }
}
