import { Item } from "../lib/types";
import { CreateAction, CREATE, GetAllAction, GET_ALL } from "./types";

export function createItem(value: Item): CreateAction {
  return { type: CREATE, item: value };
}

export function getAllItems(value: Item[]): GetAllAction {
  return { type: GET_ALL, items: value };
}
