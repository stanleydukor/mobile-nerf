import { combineReducers } from "redux";
import { viewerReducer } from "./viewer";

const appReducer = combineReducers({
  viewer: viewerReducer,
});

const rootReducer = (state, action) => {
  return appReducer(state, action);
};

export default rootReducer;
