const vertexShader = `
    in vec3 position;
    in vec2 uv;

    out vec2 vUv;
    out vec3 vPosition;
    out vec3 rayDirection;

    uniform mat4 modelViewMatrix;
    uniform mat4 projectionMatrix;
    uniform mat4 modelMatrix;
    uniform vec3 cameraPosition;

    void main() {
        vUv = uv;
        vPosition = position;
        gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
        rayDirection = (modelMatrix * vec4( position, 1.0 )).rgb - cameraPosition;
    }
`;

const fragmentShader = `
    precision highp float;

    layout(location = 0) out vec4 gColor0;
    layout(location = 1) out vec4 gColor1;
    layout(location = 2) out vec4 gColor2;

    uniform mediump sampler2D tDiffuse0;
    uniform mediump sampler2D tDiffuse1;

    in vec2 vUv;
    in vec3 vPosition;
    in vec3 rayDirection;

    void main() {
        // write color to G-Buffer
        gColor1 = texture( tDiffuse0, vUv );
        if (gColor1.r == 0.0) discard;
        gColor0 = vec4( normalize(rayDirection), 1.0 );
        gColor2 = texture( tDiffuse1, vUv );

    }
`;

const renderer = `
    in vec3 position;
    in vec2 uv;

    out vec2 vUv;

    uniform mat4 modelViewMatrix;
    uniform mat4 projectionMatrix;

    void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
    }
`;

export { vertexShader, fragmentShader, renderer };
