import { combineReducers } from "redux";
import { itemReducer } from "./items/reducers";
import { ItemState } from "./items/types";

export interface AppState {
  items: ItemState;
}

export const rootReducer = combineReducers({
  items: itemReducer
});
