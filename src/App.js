import React, { useState, useEffect } from "react";
import { getFileTypes } from "./components/utils";
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

function App() {
  const [objFiles, setObjFIles] = useState(null);
  const [pngFiles, setPngFIles] = useState(null);
  const [jsonFile, setJsonFile] = useState(null);
  const [renderFiles, setRenderFiles] = useState(MIC);
  const [params, setParams] = useState({
    mesh: true,
    feature: true,
    output: true,
    aliasing: true,
  });
  const handleChange = (e) => {
    let { name, checked } = e.target;
    if (name === "mesh" && checked === false) {
      setParams({
        ...params,
        mesh: false,
        feature: false,
        output: false,
        aliasing: false,
      });
    } else {
      setParams({
        ...params,
        [name]: checked,
      });
    }
  };
  const renderObject = (renderFiles) => {
    let [objFiles, pngFiles, jsonFile] = getFileTypes(renderFiles);
    setObjFIles(objFiles);
    setPngFIles(pngFiles);
    setJsonFile(jsonFile);
  };
  useEffect(() => renderObject(renderFiles), [renderFiles]);
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
            <Viewer
              objFiles={objFiles}
              pngFiles={pngFiles}
              jsonFile={jsonFile}
              params={params}
            />
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
                />
                <FormControlLabel
                  name="feature"
                  onChange={handleChange}
                  control={<Switch defaultChecked color="primary" />}
                  label="Feature Image"
                  labelPlacement="start"
                />
                <FormControlLabel
                  name="output"
                  onChange={handleChange}
                  control={<Switch defaultChecked color="primary" />}
                  label="Final Output"
                  labelPlacement="start"
                />
                <FormControlLabel
                  name="aliasing"
                  onChange={handleChange}
                  control={<Switch defaultChecked color="primary" />}
                  label="Anti-aliasing"
                  labelPlacement="start"
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

export default App;
