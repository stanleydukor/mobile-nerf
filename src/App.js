import React, { useEffect, useRef, useMemo } from "react";
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
import OBJ0 from "./src/shape0_0.obj";
import OBJ1 from "./src/shape0_1.obj";
import OBJ2 from "./src/shape0_2.obj";
import OBJ3 from "./src/shape0_3.obj";
import OBJ4 from "./src/shape0_4.obj";
import OBJ5 from "./src/shape0_5.obj";
import OBJ6 from "./src/shape0_6.obj";
import OBJ7 from "./src/shape0_7.obj";
import PNG0 from "./src/shape0.pngfeat0.png";
import PNG1 from "./src/shape0.pngfeat1.png";
import json from "./src/mlp.json";
import "./App.css";
import createViewDependenceFunctions from "./components/createViewDependence";
import createNetworkWeightTexture from "./components/createNetworkWeightTexture";

const network_weights = json;
const fragmentShaderSource = createViewDependenceFunctions(network_weights);
const weightsTexZero = createNetworkWeightTexture(network_weights["0_weights"]);
const weightsTexOne = createNetworkWeightTexture(network_weights["1_weights"]);
const weightsTexTwo = createNetworkWeightTexture(network_weights["2_weights"]);

extend({ OBJLoader });

function PostProcessingScene() {
  const { gl, scene, camera, size } = useThree();
  const renderTargetRef = useRef();

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

const MyScene = () => {
  // Load the OBJ files using the OBJLoader
  const model1 = useLoader(OBJLoader, OBJ0);
  const model2 = useLoader(OBJLoader, OBJ1);
  const model3 = useLoader(OBJLoader, OBJ2);
  const model4 = useLoader(OBJLoader, OBJ3);
  const model5 = useLoader(OBJLoader, OBJ4);
  const model6 = useLoader(OBJLoader, OBJ5);
  const model7 = useLoader(OBJLoader, OBJ6);
  const model8 = useLoader(OBJLoader, OBJ7);

  // Load the PNG textures using the TextureLoader
  const texture1 = new TextureLoader().load(PNG0);
  texture1.magFilter = NearestFilter;
  texture1.minFilter = NearestFilter;
  const texture2 = new TextureLoader().load(PNG1);
  texture2.magFilter = NearestFilter;
  texture2.minFilter = NearestFilter;

  let newmat = new RawShaderMaterial({
    side: DoubleSide,
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
    uniforms: {
      tDiffuse0: { value: texture1 },
      tDiffuse1: { value: texture2 },
    },
    glslVersion: GLSL3,
  });

  // Create a group to combine the models
  const group = new Group();
  group.add(model1.children[0]);
  group.add(model2.children[0]);
  group.add(model3.children[0]);
  group.add(model4.children[0]);
  group.add(model5.children[0]);
  group.add(model6.children[0]);
  group.add(model7.children[0]);
  group.add(model8.children[0]);

  // Apply textures to the models in the group
  group.children.forEach((child) => {
    if (child instanceof Mesh) {
      child.material = newmat;
    }
  });

  return (
    <group>
      <primitive object={group} />
    </group>
  );
};

function App() {
  return (
    <Canvas style={{ width: 1000, height: 1000 }}>
      <ambientLight />
      <pointLight position={[10, 10, 10]} />
      <MyScene />
      <OrbitControls autoRotate enableZoom={false} enablePan={false} />
      <PostProcessingScene />
    </Canvas>
  );
}

export default App;
