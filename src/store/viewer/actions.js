import { types } from "./constants";

export const viewerActions = {
  addFiles: (payload) => ({ type: types.ADD_FILES, payload: payload }),
  handleChange: (e) => ({ type: types.HANDLE_CHANGE, payload: e.target }),
};
