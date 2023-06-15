import viewDependenceNetworkShaderFunctions from "./mlp";

function createViewDependenceFunctions(network_weights) {
  let width = network_weights["0_bias"].length;
  let biasListZero = "";
  for (let i = 0; i < width; i++) {
    let bias = network_weights["0_bias"][i];
    biasListZero += Number(bias).toFixed(7);
    if (i + 1 < width) {
      biasListZero += ", ";
    }
  }

  width = network_weights["1_bias"].length;
  let biasListOne = "";
  for (let i = 0; i < width; i++) {
    let bias = network_weights["1_bias"][i];
    biasListOne += Number(bias).toFixed(7);
    if (i + 1 < width) {
      biasListOne += ", ";
    }
  }

  width = network_weights["2_bias"].length;
  let biasListTwo = "";
  for (let i = 0; i < width; i++) {
    let bias = network_weights["2_bias"][i];
    biasListTwo += Number(bias).toFixed(7);
    if (i + 1 < width) {
      biasListTwo += ", ";
    }
  }

  let channelsZero = network_weights["0_weights"].length;
  let channelsOne = network_weights["0_bias"].length;
  let channelsTwo = network_weights["1_bias"].length;
  let channelsThree = network_weights["2_bias"].length;

  let fragmentShaderSource = viewDependenceNetworkShaderFunctions.replace(
    new RegExp("NUM_CHANNELS_ZERO", "g"),
    channelsZero
  );
  fragmentShaderSource = fragmentShaderSource.replace(
    new RegExp("NUM_CHANNELS_ONE", "g"),
    channelsOne
  );
  fragmentShaderSource = fragmentShaderSource.replace(
    new RegExp("NUM_CHANNELS_TWO", "g"),
    channelsTwo
  );
  fragmentShaderSource = fragmentShaderSource.replace(
    new RegExp("NUM_CHANNELS_THREE", "g"),
    channelsThree
  );

  fragmentShaderSource = fragmentShaderSource.replace(
    new RegExp("BIAS_LIST_ZERO", "g"),
    biasListZero
  );
  fragmentShaderSource = fragmentShaderSource.replace(
    new RegExp("BIAS_LIST_ONE", "g"),
    biasListOne
  );
  fragmentShaderSource = fragmentShaderSource.replace(
    new RegExp("BIAS_LIST_TWO", "g"),
    biasListTwo
  );

  return fragmentShaderSource;
}

export default createViewDependenceFunctions;
