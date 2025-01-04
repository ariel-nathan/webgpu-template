struct CameraUniforms {
    viewMatrix: mat4x4f,
    projectionMatrix: mat4x4f,
}

@binding(0) @group(0) var<uniform> camera: CameraUniforms;

struct VertexOutput {
    @builtin(position) position: vec4f,
    @location(0) color: vec4f,
};

@vertex
fn vertexMain(
    @location(0) position: vec3f,
    @location(1) color: vec4f
) -> VertexOutput {
    var output: VertexOutput;
    output.position = camera.projectionMatrix * camera.viewMatrix * vec4f(position, 1.0);
    output.color = color;
    return output;
}

@fragment
fn fragmentMain(@location(0) color: vec4f) -> @location(0) vec4f {
    return color;
}
