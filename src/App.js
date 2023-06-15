import React, { useState, useEffect, useRef, useMemo } from "react";
import { Canvas, useFrame, useThree, extend } from "@react-three/fiber";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";
import { useLoader } from "@react-three/fiber";
import {
  Group,
  TextureLoader,
  RawShaderMaterial,
  DoubleSide,
  GLSL3,
  Mesh,
  NearestFilter,
  OrthographicCamera,
  Scene,
  PlaneGeometry,
  Color,
  WebGLMultipleRenderTargets,
  LinearFilter,
  FloatType,
} from "three";
import { OrbitControls } from "@react-three/drei";
import { vertexShader, fragmentShader, renderer } from "./components/shaders";
import createViewDependenceFunctions from "./components/createViewDependence";
import createNetworkWeightTexture from "./components/createNetworkWeightTexture";
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

extend({ OBJLoader });

function PostProcessingScene({ jsonFile }) {
  const { gl, scene, camera, size } = useThree();
  const renderTargetRef = useRef();
  const network_weights = jsonFile;
  const fragmentShaderSource = createViewDependenceFunctions(network_weights);
  const weightsTexZero = createNetworkWeightTexture(
    network_weights["0_weights"]
  );
  const weightsTexOne = createNetworkWeightTexture(
    network_weights["1_weights"]
  );
  const weightsTexTwo = createNetworkWeightTexture(
    network_weights["2_weights"]
  );

  if (!renderTargetRef.current) {
    renderTargetRef.current = new WebGLMultipleRenderTargets(
      size.width,
      size.height,
      3
    );
    for (let i = 0, il = renderTargetRef.current.texture.length; i < il; i++) {
      renderTargetRef.current.texture[i].minFilter = LinearFilter;
      renderTargetRef.current.texture[i].magFilter = LinearFilter;
      renderTargetRef.current.texture[i].type = FloatType;
    }
  }

  useEffect(() => {
    renderTargetRef.current.setSize(size.width, size.height);
  }, [size]);

  // Create a new scene for post-processing
  const postScene = useMemo(() => new Scene(), []);
  postScene.background = new Color("rgb(255, 255, 255)");

  // Create a new orthographic camera
  const postCamera = useMemo(
    () => new OrthographicCamera(-1, 1, 1, -1, 0, 1),
    []
  );

  // Create the shader materials
  const shaderMaterial = useMemo(
    () =>
      new RawShaderMaterial({
        vertexShader: renderer,
        fragmentShader: fragmentShaderSource,
        uniforms: {
          tDiffuse0x: { value: renderTargetRef.current.texture[0] },
          tDiffuse1x: { value: renderTargetRef.current.texture[1] },
          tDiffuse2x: { value: renderTargetRef.current.texture[2] },
          weightsZero: { value: weightsTexZero },
          weightsOne: { value: weightsTexOne },
          weightsTwo: { value: weightsTexTwo },
        },
        glslVersion: GLSL3,
      }),
    []
  );

  // Create a plane geometry and add it to the scene
  useEffect(() => {
    const planeMesh = new Mesh(new PlaneGeometry(2, 2), shaderMaterial);
    postScene.add(planeMesh);
  }, [shaderMaterial, postScene]);

  // In the render loop, render the post-processing scene
  useFrame(() => {
    gl.setRenderTarget(renderTargetRef.current);
    gl.clearColor();
    gl.clearDepth();
    gl.autoClear = false;
    gl.render(scene, camera);

    gl.setRenderTarget(null);
    gl.clear();
    gl.render(postScene, postCamera);
  });

  return null;
}

const MyScene = ({ objFiles, pngFiles, params }) => {
  const objs = objFiles.map((path) => useLoader(OBJLoader, path));
  const textures = pngFiles.map((path) => {
    const texture = new TextureLoader().load(path);
    texture.magFilter = NearestFilter;
    texture.minFilter = NearestFilter;
    return texture;
  });

  const uniforms = textures.reduce((acc, curr, idx) => {
    acc[`tDiffuse${idx}`] = { value: curr };
    return acc;
  }, {});

  let newmat = new RawShaderMaterial({
    side: DoubleSide,
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
    uniforms,
    glslVersion: GLSL3,
  });

  const group = new Group();
  objs.forEach((model) => {
    if (model.children.length > 0) {
      group.add(model.children[0]);
    }
  });
  group.children.forEach((child) => {
    if (child instanceof Mesh && params.feature) {
      child.material = newmat;
    }
  });

  return (
    <group>
      <primitive object={group} />
    </group>
  );
};

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
            <Canvas
              gl={{
                powerPreference: "high-performance",
                precision: "highp",
                antialias: false,
              }}
              onCreated={({ gl }) => {
                gl.setClearColor(new Color("rgb(0, 0, 0)"), 0.5);
              }}
            >
              <ambientLight />
              <pointLight position={[10, 10, 10]} />
              <MyScene
                objFiles={objFiles}
                pngFiles={pngFiles}
                params={params}
              />
              <OrbitControls autoRotate enableZoom={false} enablePan={false} />
              <PostProcessingScene jsonFile={jsonFile} params={params} />
            </Canvas>
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
                  name="alising"
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
