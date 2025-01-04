import { Camera } from "./lib/camera"
import { Debug } from "./lib/debug"
import { WebGPU } from "./lib/webgpu"
import code from "./shader.wgsl?raw"
import "./style.css"

const webgpu = new WebGPU()
await webgpu.init()
const { context, device, format, canvas } = webgpu

const camera = new Camera()
camera.updateProjection(canvas.width / canvas.height)

let isMouseDown = false
let lastMouseX = 0
let lastMouseY = 0

canvas.addEventListener("mousedown", (e) => {
  isMouseDown = true
  lastMouseX = e.clientX
  lastMouseY = e.clientY
})

canvas.addEventListener("mouseup", () => {
  isMouseDown = false
})

canvas.addEventListener("mousemove", (e) => {
  if (!isMouseDown) return
  const deltaX = e.clientX - lastMouseX
  const deltaY = e.clientY - lastMouseY
  camera.orbit(deltaX, deltaY)
  lastMouseX = e.clientX
  lastMouseY = e.clientY
})

canvas.addEventListener("wheel", (e) => {
  e.preventDefault()
  camera.zoom(e.deltaY)
})

const debug = new Debug(true, camera)
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
  // pos(x, y, z)    color(r, g, b, a)
  // Front face (red)
  -0.5, -0.5,  0.5,   1.0, 0.0, 0.0, 1.0,
   0.5, -0.5,  0.5,   1.0, 0.0, 0.0, 1.0,
   0.5,  0.5,  0.5,   1.0, 0.0, 0.0, 1.0,
  -0.5, -0.5,  0.5,   1.0, 0.0, 0.0, 1.0,
   0.5,  0.5,  0.5,   1.0, 0.0, 0.0, 1.0,
  -0.5,  0.5,  0.5,   1.0, 0.0, 0.0, 1.0,

  // Back face (green)
  -0.5, -0.5, -0.5,   0.0, 1.0, 0.0, 1.0,
  -0.5,  0.5, -0.5,   0.0, 1.0, 0.0, 1.0,
   0.5,  0.5, -0.5,   0.0, 1.0, 0.0, 1.0,
  -0.5, -0.5, -0.5,   0.0, 1.0, 0.0, 1.0,
   0.5,  0.5, -0.5,   0.0, 1.0, 0.0, 1.0,
   0.5, -0.5, -0.5,   0.0, 1.0, 0.0, 1.0,

  // Top face (blue)
  -0.5,  0.5, -0.5,   0.0, 0.0, 1.0, 1.0,
  -0.5,  0.5,  0.5,   0.0, 0.0, 1.0, 1.0,
   0.5,  0.5,  0.5,   0.0, 0.0, 1.0, 1.0,
  -0.5,  0.5, -0.5,   0.0, 0.0, 1.0, 1.0,
   0.5,  0.5,  0.5,   0.0, 0.0, 1.0, 1.0,
   0.5,  0.5, -0.5,   0.0, 0.0, 1.0, 1.0,

  // Bottom face (yellow)
  -0.5, -0.5, -0.5,   1.0, 1.0, 0.0, 1.0,
   0.5, -0.5, -0.5,   1.0, 1.0, 0.0, 1.0,
   0.5, -0.5,  0.5,   1.0, 1.0, 0.0, 1.0,
  -0.5, -0.5, -0.5,   1.0, 1.0, 0.0, 1.0,
   0.5, -0.5,  0.5,   1.0, 1.0, 0.0, 1.0,
  -0.5, -0.5,  0.5,   1.0, 1.0, 0.0, 1.0,

  // Right face (magenta)
   0.5, -0.5, -0.5,   1.0, 0.0, 1.0, 1.0,
   0.5,  0.5, -0.5,   1.0, 0.0, 1.0, 1.0,
   0.5,  0.5,  0.5,   1.0, 0.0, 1.0, 1.0,
   0.5, -0.5, -0.5,   1.0, 0.0, 1.0, 1.0,
   0.5,  0.5,  0.5,   1.0, 0.0, 1.0, 1.0,
   0.5, -0.5,  0.5,   1.0, 0.0, 1.0, 1.0,

  // Left face (cyan)
  -0.5, -0.5, -0.5,   0.0, 1.0, 1.0, 1.0,
  -0.5, -0.5,  0.5,   0.0, 1.0, 1.0, 1.0,
  -0.5,  0.5,  0.5,   0.0, 1.0, 1.0, 1.0,
  -0.5, -0.5, -0.5,   0.0, 1.0, 1.0, 1.0,
  -0.5,  0.5,  0.5,   0.0, 1.0, 1.0, 1.0,
  -0.5,  0.5, -0.5,   0.0, 1.0, 1.0, 1.0,
])

const vertexBuffer = webgpu.createBuffer("vertex buffer", vertexData)

const cameraUniformBuffer = device.createBuffer({
  label: "camera uniform buffer",
  size: 2 * 4 * 16, // 2 mat4s (view and projection)
  usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
})

const pipeline = device.createRenderPipeline({
  label: "pipeline",
  layout: device.createPipelineLayout({
    label: "pipeline layout",
    bindGroupLayouts: [
      device.createBindGroupLayout({
        label: "camera bind group layout",
        entries: [
          {
            binding: 0,
            visibility: GPUShaderStage.VERTEX,
            buffer: { type: "uniform" },
          },
        ],
      }),
    ],
  }),
  vertex: {
    module,
    buffers: [
      {
        arrayStride: 7 * Float32Array.BYTES_PER_ELEMENT, // x,y,z + r,g,b,a = 7 floats
        attributes: [
          {
            // position attribute
            shaderLocation: 0,
            offset: 0,
            format: "float32x3",
          },
          {
            // color attribute
            shaderLocation: 1,
            offset: 3 * Float32Array.BYTES_PER_ELEMENT, // offset by 3 floats for x,y,z
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
    cullMode: "back",
  },
  depthStencil: {
    depthWriteEnabled: true,
    depthCompare: "less",
    format: "depth24plus",
  },
})

// Create bind group for camera uniforms
const cameraBindGroup = device.createBindGroup({
  label: "camera bind group",
  layout: pipeline.getBindGroupLayout(0),
  entries: [
    {
      binding: 0,
      resource: { buffer: cameraUniformBuffer },
    },
  ],
})

function draw() {
  const commandEncoder = device.createCommandEncoder({
    label: "command encoder",
  })

  const view = context.getCurrentTexture().createView({
    label: "view",
  })

  const depthTexture = device.createTexture({
    size: [context.canvas.width, context.canvas.height],
    format: "depth24plus",
    usage: GPUTextureUsage.RENDER_ATTACHMENT,
  })

  const depthView = depthTexture.createView({
    label: "depth view",
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
    depthStencilAttachment: {
      view: depthView,
      depthClearValue: 1.0,
      depthLoadOp: "clear",
      depthStoreOp: "store",
    },
  })

  // Update camera uniforms
  const uniformData = new Float32Array(32) // 2 mat4s = 32 floats
  uniformData.set(camera.getViewMatrix() as Float32Array, 0)
  uniformData.set(camera.getProjectionMatrix() as Float32Array, 16)
  device.queue.writeBuffer(cameraUniformBuffer, 0, uniformData)

  passEncoder.setPipeline(pipeline)
  passEncoder.setVertexBuffer(0, vertexBuffer)
  passEncoder.setBindGroup(0, cameraBindGroup)
  passEncoder.draw(36) // 6 faces * 2 triangles * 3 vertices = 36 vertices
  passEncoder.end()

  device.queue.submit([commandEncoder.finish()])

  // Clean up
  depthTexture.destroy()
}

function animate() {
  debug.begin()
  draw()
  debug.end()
  requestAnimationFrame(animate)
}

animate()
