import { DataTexture, NearestFilter, RedFormat, FloatType } from "three";

function createNetworkWeightTexture(network_weights) {
  let width = network_weights.length;
  let height = network_weights[0].length;

  let weightsData = new Float32Array(width * height);
  for (let co = 0; co < height; co++) {
    for (let ci = 0; ci < width; ci++) {
      let index = co * width + ci;
      let weight = network_weights[ci][co];
      weightsData[index] = weight;
    }
  }
  let texture = new DataTexture(
    weightsData,
    width,
    height,
    RedFormat,
    FloatType
  );
  texture.magFilter = NearestFilter;
  texture.minFilter = NearestFilter;
  texture.needsUpdate = true;
  return texture;
}

export default createNetworkWeightTexture;
