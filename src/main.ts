import { Debug } from "./lib/debug"
import { WebGPU } from "./lib/webgpu"
import code from "./shader.wgsl?raw"
import "./style.css"

const webgpu = new WebGPU()
await webgpu.init()
const { context, device, format } = webgpu

const debug = new Debug(true)
debug.init()

context.configure({
  device,
  format,
})

const module = device.createShaderModule({
  label: "shader module",
  code,
})

// biome-ignore format: debug
const vertexData = new Float32Array([
  // pos(x, y) color(r, g, b, a)
  // triangle 1
  -0.4,  0.5,   1.0, 0.0, 0.0, 1.0, // top left
  -0.4, -0.5,   0.0, 1.0, 0.0, 1.0, // bottom left
   0.4, -0.5,   0.0, 0.0, 1.0, 1.0, // bottom right
  // triangle 2
   0.4,  0.5,   1.0, 0.0, 0.0, 1.0, // top right
  -0.4,  0.5,   1.0, 0.0, 0.0, 1.0, // top left
   0.4, -0.5,   0.0, 0.0, 1.0, 1.0, // bottom right
])

const vertexBuffer = webgpu.createBuffer("vertex buffer", vertexData)

const pipeline = device.createRenderPipeline({
  label: "pipeline",
  layout: "auto",
  vertex: {
    module,
    buffers: [
      {
        arrayStride: 6 * Float32Array.BYTES_PER_ELEMENT, // x,y + r,g,b,a = 6 floats total per vertex
        attributes: [
          {
            // position attribute
            shaderLocation: 0,
            offset: 0,
            format: "float32x2",
          },
          {
            // color attribute
            shaderLocation: 1,
            offset: 2 * Float32Array.BYTES_PER_ELEMENT, // offset by 2 floats (after position)
            format: "float32x4",
          },
        ],
      },
    ],
  },
  fragment: {
    module,
    targets: [
      {
        format,
      },
    ],
  },
  primitive: {
    topology: "triangle-list",
  },
})

function draw() {
  const commandEncoder = device.createCommandEncoder({
    label: "command encoder",
  })
  const view = context.getCurrentTexture().createView({
    label: "view",
  })

  const passEncoder = commandEncoder.beginRenderPass({
    label: "pass encoder",
    colorAttachments: [
      {
        view,
        clearValue: { r: 0.8, g: 0.8, b: 0.8, a: 1.0 },
        loadOp: "clear",
        storeOp: "store",
      },
    ],
  })

  passEncoder.setPipeline(pipeline)
  passEncoder.setVertexBuffer(0, vertexBuffer)
  passEncoder.draw(6)
  passEncoder.end()

  device.queue.submit([commandEncoder.finish()])
}

function animate() {
  debug.begin()
  draw()
  debug.end()
  requestAnimationFrame(animate)
}

animate()
