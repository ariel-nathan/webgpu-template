struct VertexIn {
  @builtin(vertex_index) vertexIndex: u32,
  @location(0) position: vec2<f32>,
  @location(1) color: vec4<f32>,
}

struct VertexOut {
  @builtin(position) position: vec4f,
  @location(0) color: vec4f,
}

@vertex
fn vertex(
  input: VertexIn
) -> VertexOut {
  var out: VertexOut;
  out.position = vec4(input.position, 0.0, 1.0);
  out.color = input.color;
  return out;
}

@fragment
fn fragment(
  input: VertexOut
) -> @location(0) vec4<f32> {
  return input.color;
}
