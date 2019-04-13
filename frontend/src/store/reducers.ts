import {
  ItemState,
  CreateAction,
  UpdateAction,
  UPDATE,
  CREATE,
  GET_ALL,
  GetAllAction
} from "./types";
import { Item } from "../lib/types";

type ItemAction = CreateAction | UpdateAction | GetAllAction;

const defaultState: ItemState = {
  archivedItems: [],
  liveItems: []
};

export function itemReducer(
  state: ItemState = defaultState,
  action: ItemAction
) {
  let liveItems: Item[];
  let archivedItems: Item[];
  switch (action.type) {
    case CREATE:
      return Object.assign({}, state, {
        liveItems: [...state.liveItems, action.item]
      });
    case GET_ALL:
      liveItems = action.items.filter(i => !i.archived);
      archivedItems = action.items.filter(i => i.archived);
      return Object.assign({}, state, {
        liveItems,
        archivedItems
      });
    case UPDATE:
      liveItems = state.liveItems.map(i => {
        if (i.uuid === action.item.uuid) {
          return action.item;
        }
        return i;
      });
      archivedItems = state.archivedItems.map(i => {
        if (i.uuid === action.item.uuid) {
          return action.item;
        }
        return i;
      });
      return Object.assign({}, state, {
        liveItems,
        archivedItems
      });
    default:
      return state;
  }
}
