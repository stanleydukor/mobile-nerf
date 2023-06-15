const viewDependenceNetworkShaderFunctions = `
    precision mediump float;

    layout(location = 0) out vec4 pc_FragColor;

    in vec2 vUv;

    uniform mediump sampler2D tDiffuse0x;
    uniform mediump sampler2D tDiffuse1x;
    uniform mediump sampler2D tDiffuse2x;

    uniform mediump sampler2D weightsZero;
    uniform mediump sampler2D weightsOne;
    uniform mediump sampler2D weightsTwo;

    mediump vec3 evaluateNetwork( mediump vec4 f0, mediump vec4 f1, mediump vec4 viewdir) {
        mediump float intermediate_one[NUM_CHANNELS_ONE] = float[](
            BIAS_LIST_ZERO
        );
        for (int j = 0; j < NUM_CHANNELS_ZERO; ++j) {
            mediump float input_value = 0.0;
            if (j < 4) {
            input_value =
                (j == 0) ? f0.r : (
                (j == 1) ? f0.g : (
                (j == 2) ? f0.b : f0.a));
            } else if (j < 8) {
            input_value =
                (j == 4) ? f1.r : (
                (j == 5) ? f1.g : (
                (j == 6) ? f1.b : f1.a));
            } else {
            input_value =
                (j == 8) ? viewdir.r : (
                (j == 9) ? -viewdir.b : viewdir.g); //switch y-z axes
            }
            for (int i = 0; i < NUM_CHANNELS_ONE; ++i) {
            intermediate_one[i] += input_value *
                texelFetch(weightsZero, ivec2(j, i), 0).x;
            }
        }
        mediump float intermediate_two[NUM_CHANNELS_TWO] = float[](
            BIAS_LIST_ONE
        );
        for (int j = 0; j < NUM_CHANNELS_ONE; ++j) {
            if (intermediate_one[j] <= 0.0) {
                continue;
            }
            for (int i = 0; i < NUM_CHANNELS_TWO; ++i) {
                intermediate_two[i] += intermediate_one[j] *
                    texelFetch(weightsOne, ivec2(j, i), 0).x;
            }
        }
        mediump float result[NUM_CHANNELS_THREE] = float[](
            BIAS_LIST_TWO
        );
        for (int j = 0; j < NUM_CHANNELS_TWO; ++j) {
            if (intermediate_two[j] <= 0.0) {
                continue;
            }
            for (int i = 0; i < NUM_CHANNELS_THREE; ++i) {
                result[i] += intermediate_two[j] *
                    texelFetch(weightsTwo, ivec2(j, i), 0).x;
            }
        }
        for (int i = 0; i < NUM_CHANNELS_THREE; ++i) {
            result[i] = 1.0 / (1.0 + exp(-result[i]));
        }
        return vec3(result[0]*viewdir.a+(1.0-viewdir.a),
                    result[1]*viewdir.a+(1.0-viewdir.a),
                    result[2]*viewdir.a+(1.0-viewdir.a));
      }


    void main() {

        vec4 diffuse0 = texture( tDiffuse0x, vUv );
        if (diffuse0.a < 0.6) discard;
        vec4 diffuse1 = texture( tDiffuse1x, vUv );
        vec4 diffuse2 = texture( tDiffuse2x, vUv );

        //deal with iphone
        diffuse0.a = diffuse0.a*2.0-1.0;
        diffuse1.a = diffuse1.a*2.0-1.0;
        diffuse2.a = diffuse2.a*2.0-1.0;

        //pc_FragColor.rgb  = diffuse1.rgb;
        pc_FragColor.rgb = evaluateNetwork(diffuse1,diffuse2,diffuse0);
        pc_FragColor.a = 1.0;
    }
`;

export default viewDependenceNetworkShaderFunctions;
