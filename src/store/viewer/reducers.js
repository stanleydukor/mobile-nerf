import { getFileTypes } from "../../components/utils";
import { types } from "./constants";

const initialState = {
  objFiles: null,
  pngFiles: null,
  jsonFile: null,
  params: {
    mesh: true,
    feature: true,
    output: true,
    aliasing: true,
  },
};

export const viewerReducer = (state = initialState, { type, payload }) => {
  switch (type) {
    case types.ADD_FILES:
      let [objFiles, pngFiles, jsonFile] = getFileTypes(payload);
      return {
        ...state,
        objFiles,
        pngFiles,
        jsonFile,
      };
    case types.HANDLE_CHANGE:
      let { name, checked } = payload;
      if (name === "mesh" && checked === false) {
        return {
          ...state,
          params: {
            ...state.params,
            mesh: false,
            feature: false,
            output: false,
            aliasing: false,
          },
        };
      } else {
        return {
          ...state,
          params: {
            ...state.params,
            [name]: checked,
          },
        };
      }
    default: {
      return state;
    }
  }
};
