import React, { useEffect, useRef, useMemo, Suspense, useState } from "react";
import { useSelector } from "react-redux";
import { selectors as viewerSelectors } from "../store/viewer";
import { Canvas, useFrame, useThree, extend } from "@react-three/fiber";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";
import {
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
  MeshStandardMaterial,
} from "three";
import { OrbitControls, Html, useProgress } from "@react-three/drei";
import { vertexShader, fragmentShader, renderer } from "../components/shaders";
import createViewDependenceFunctions from "../components/createViewDependence";
import createNetworkWeightTexture from "../components/createNetworkWeightTexture";

extend({ OBJLoader });

function PostProcessingScene({ jsonFile, renderTargetRef }) {
  const { gl, scene, camera } = useThree();
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

const MyScene = ({ objFiles, pngFiles, params, renderTargetRef }) => {
  const { size, scene } = useThree();
  const [objs, setObjs] = useState([]);
  const [newMat, setNewMat] = useState(null);

  const defaultMat = new MeshStandardMaterial({ color: 0x808080 });

  if (!renderTargetRef.current) {
    renderTargetRef.current = new WebGLMultipleRenderTargets(
      size.width * 2,
      size.height * 2,
      3
    );
    for (let i = 0, il = renderTargetRef.current.texture.length; i < il; i++) {
      renderTargetRef.current.texture[i].minFilter = LinearFilter;
      renderTargetRef.current.texture[i].magFilter = LinearFilter;
      renderTargetRef.current.texture[i].type = FloatType;
    }
  }
  useEffect(() => {
    renderTargetRef.current.setSize(size.width * 2, size.height * 2);
  }, [size]);

  useEffect(() => {
    const loader = new OBJLoader();
    const loadModel = (path) =>
      new Promise((resolve) => {
        loader.load(path, resolve);
      });
    const paths = objFiles;
    Promise.all(paths.map(loadModel)).then(setObjs).catch(console.error);
  }, [objFiles, scene]);

  useEffect(() => {
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

    setNewMat(newmat);
  }, [pngFiles]);

  return (
    <group>
      {objs.map((obj, index) => {
        obj.traverse((child) => {
          if (child.isMesh) {
            child.material = params.feature ? newMat : defaultMat;
          }
        });
        return <primitive key={index} object={obj} />;
      })}
    </group>
  );
};

function Loader() {
  const { progress } = useProgress();
  return <Html center>{progress} % loaded</Html>;
}

function Viewer() {
  const renderTargetRef = useRef();
  const objFiles = useSelector(viewerSelectors.objFiles);
  const pngFiles = useSelector(viewerSelectors.pngFiles);
  const jsonFile = useSelector(viewerSelectors.jsonFile);
  const params = useSelector(viewerSelectors.params);
  return (
    <Canvas
      gl={{
        powerPreference: "high-performance",
        precision: "highp",
        antialias: !params.aliasing,
        pixelRatio: 1,
      }}
    >
      <Suspense fallback={<Loader />}>
        <ambientLight />
        <pointLight position={[10, 10, 10]} />
        <MyScene
          objFiles={objFiles}
          pngFiles={pngFiles}
          params={params}
          renderTargetRef={renderTargetRef}
        />
        <OrbitControls autoRotate enableZoom={false} enablePan={false} />
        {params.output ? (
          <PostProcessingScene
            jsonFile={jsonFile}
            renderTargetRef={renderTargetRef}
          />
        ) : null}
      </Suspense>
    </Canvas>
  );
}

export default Viewer;
