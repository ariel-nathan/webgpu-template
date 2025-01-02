export class WebGPU {
  public adapter!: GPUAdapter
  public device!: GPUDevice
  public context!: GPUCanvasContext
  public canvas!: HTMLCanvasElement
  public format!: GPUTextureFormat

  public async init() {
    if (navigator.gpu === undefined)
      throw new Error("WebGPU is not supported in this browser.")
    const adapter = await navigator.gpu.requestAdapter()
    if (!adapter) throw new Error("No adapter is available for WebGPU.")
    this.adapter = adapter
    this.device = await adapter.requestDevice()
    const canvas = document.querySelector<HTMLCanvasElement>("#canvas")
    if (!canvas) throw new Error("Could not find canvas element")
    this.canvas = canvas
    const context = canvas.getContext("webgpu")
    if (!context) throw new Error("Could not get WebGPU context")
    this.context = context
    this.format = navigator.gpu.getPreferredCanvasFormat()
  }

  public createBuffer(label: string, data: Float32Array): GPUBuffer {
    const buffer = this.device.createBuffer({
      label,
      size: data.byteLength,
      usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
      mappedAtCreation: true,
    })
    const bufferView = buffer.getMappedRange()
    new Float32Array(bufferView).set(data)
    buffer.unmap()
    return buffer
  }
}
