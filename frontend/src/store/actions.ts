import { Item } from "../lib/types";
import {
  CreateAction,
  CREATE,
  GetAllAction,
  GET_ALL,
  UpdateAction,
  UPDATE,
  DeleteAction,
  DELETE
} from "./types";

export function createItem(value: Item): CreateAction {
  return { type: CREATE, item: value };
}

export function getAllItems(value: Item[]): GetAllAction {
  return { type: GET_ALL, items: value };
}

export function updateItem(value: Item): UpdateAction {
  return { type: UPDATE, item: value };
}

export function deleteItem(value: string): DeleteAction {
  return { type: DELETE, itemUuid: value };
}
