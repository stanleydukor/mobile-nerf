import React, { useEffect, useRef, useMemo } from "react";
import { connect } from "react-redux";
import { selectors as viewerSelectors } from "../store/viewer";
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
import { vertexShader, fragmentShader, renderer } from "../components/shaders";
import createViewDependenceFunctions from "../components/createViewDependence";
import createNetworkWeightTexture from "../components/createNetworkWeightTexture";

extend({ OBJLoader });

function PostProcessingScene({ jsonFile, params, renderTargetRef }) {
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
  const { size } = useThree();
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

function Viewer({ objFiles, pngFiles, jsonFile, params }) {
  const renderTargetRef = useRef();
  return (
    <Canvas
      gl={{
        powerPreference: "high-performance",
        precision: "highp",
        antialias: !params.aliasing,
        pixelRatio: 1,
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
        renderTargetRef={renderTargetRef}
      />
      <OrbitControls autoRotate enableZoom={false} enablePan={false} />
      <PostProcessingScene
        jsonFile={jsonFile}
        params={params}
        renderTargetRef={renderTargetRef}
      />
    </Canvas>
  );
}

const mapStateToProps = (state) => ({
  objFiles: viewerSelectors.objFiles(state),
  pngFiles: viewerSelectors.pngFiles(state),
  jsonFile: viewerSelectors.jsonFile(state),
  params: viewerSelectors.params(state),
});

export default connect(mapStateToProps, null)(Viewer);
