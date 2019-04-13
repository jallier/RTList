import {
  ItemState,
  CreateAction,
  UpdateAction,
  UPDATE,
  CREATE,
  GET_ALL,
  GetAllAction
} from "./types";

type ItemAction = CreateAction | UpdateAction | GetAllAction;

const defaultState: ItemState = {
  archivedItems: [],
  liveItems: []
};

export function itemReducer(
  state: ItemState = defaultState,
  action: ItemAction
) {
  switch (action.type) {
    case CREATE:
      return Object.assign({}, state, {
        liveItems: [...state.liveItems, action.item]
      });
    case GET_ALL:
      const liveItems = action.items.filter(i => !i.archived);
      const archivedItems = action.items.filter(i => i.archived);
      return Object.assign({}, state, {
        liveItems,
        archivedItems
      });
    default:
      return state;
  }
}
