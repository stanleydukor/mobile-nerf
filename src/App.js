import React, { useEffect } from "react";
import { connect } from "react-redux";
import { viewerActions } from "./store/viewer";
import { selectors as viewerSelectors } from "./store/viewer";
import MIC from "./config/mic";
import AppStyle from "./style";
import Header from "./views/header";
import Footer from "./views/footer";

import {
  List,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Avatar,
} from "@mui/material";
import ImageIcon from "@mui/icons-material/Image";

import Switch from "@mui/material/Switch";
import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormControl from "@mui/material/FormControl";
import Viewer from "./views/viewer";

const imageList = [
  { id: 1, src: "https://picsum.photos/200", title: "Image 1" },
  { id: 2, src: "https://picsum.photos/200", title: "Image 2" },
  { id: 3, src: "https://picsum.photos/200", title: "Image 3" },
  { id: 4, src: "https://picsum.photos/200", title: "Image 4" },
  { id: 5, src: "https://picsum.photos/200", title: "Image 5" },
  { id: 6, src: "https://picsum.photos/200", title: "Image 6" },
];

function App({ objFiles, pngFiles, jsonFile, params, addFiles, handleChange }) {
  useEffect(() => {
    addFiles(MIC);
  }, []);
  if (!objFiles || !pngFiles || !jsonFile) {
    return <div>Loading...</div>;
  }
  return (
    <AppStyle>
      <Header />
      <div className="content">
        <div className="side-content">
          <List>
            {imageList.map((image) => (
              <ListItemButton key={image.id} sx={{ minWidth: "150px" }}>
                <ListItemIcon>
                  <Avatar variant="square" src={image.src}>
                    <ImageIcon />
                  </Avatar>
                </ListItemIcon>
                <ListItemText primary={image.title} />
              </ListItemButton>
            ))}
          </List>
        </div>
        <div className="main-content">
          <div className="canvas">
            <Viewer />
          </div>
          <div className="controls">
            <FormControl component="fieldset">
              <FormGroup aria-label="position" row>
                <FormControlLabel
                  name="mesh"
                  onChange={handleChange}
                  control={<Switch defaultChecked color="primary" />}
                  label="Mesh"
                  labelPlacement="start"
                  checked={params.mesh}
                />
                <FormControlLabel
                  name="feature"
                  onChange={handleChange}
                  control={<Switch defaultChecked color="primary" />}
                  label="Feature Image"
                  labelPlacement="start"
                  checked={params.feature}
                />
                <FormControlLabel
                  name="output"
                  onChange={handleChange}
                  control={<Switch defaultChecked color="primary" />}
                  label="Final Output"
                  labelPlacement="start"
                  checked={params.output}
                />
                <FormControlLabel
                  name="aliasing"
                  onChange={handleChange}
                  control={<Switch defaultChecked color="primary" />}
                  label="Anti-aliasing"
                  labelPlacement="start"
                  checked={params.aliasing}
                />
              </FormGroup>
            </FormControl>
          </div>
        </div>
      </div>

      <Footer />
    </AppStyle>
  );
}

const mapStateToProps = (state) => ({
  objFiles: viewerSelectors.objFiles(state),
  pngFiles: viewerSelectors.pngFiles(state),
  jsonFile: viewerSelectors.jsonFile(state),
  params: viewerSelectors.params(state),
});

const mapDispatchToProps = {
  addFiles: viewerActions.addFiles,
  handleChange: viewerActions.handleChange,
};

export default connect(mapStateToProps, mapDispatchToProps)(App);
