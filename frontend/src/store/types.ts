import { Item } from "../lib/types";

export interface ItemState {
  liveItems: Item[];
  archivedItems: Item[];
}

export const UPDATE = "UPDATE";
export const CREATE = "CREATE";
export const GET_ALL = "GET_ALL";
export const DELETE = "DELETE";

export interface UpdateAction {
  type: typeof UPDATE;
  item: Item;
}

export interface CreateAction {
  type: typeof CREATE;
  item: Item;
}

export interface GetAllAction {
  type: typeof GET_ALL;
  items: Item[];
}

export interface DeleteAction {
  type: typeof DELETE;
  itemUuid: string;
}
