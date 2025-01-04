import Stats from "stats.js"
import { Pane } from "tweakpane"
import type { Camera } from "./camera"

export type DebugParams = {
  camera: {
    position: {
      x: number
      y: number
      z: number
    }
  }
}

export class Debug {
  private stats?: Stats
  private pane?: Pane
  private params?: DebugParams
  private camera?: Camera

  constructor(debug: boolean, camera: Camera) {
    if (!debug) return

    this.camera = camera
    this.stats = new Stats()
    this.stats.showPanel(0)
    this.stats.dom.style.top = "8px"
    this.stats.dom.style.left = "8px"

    this.pane = new Pane({
      title: "Debug",
    })

    const position = camera.getPosition()

    this.params = {
      camera: {
        position: {
          x: position[0],
          y: position[1],
          z: position[2],
        },
      },
    }
  }

  public updateCameraPosition() {
    if (!this.params || !this.pane || !this.camera) return
    const position = this.camera.getPosition()
    this.params.camera.position.x = position[0]
    this.params.camera.position.y = position[1]
    this.params.camera.position.z = position[2]

    // Force refresh the entire pane
    this.pane.refresh()
  }

  public init() {
    if (!this.stats || !this.pane || !this.params) return
    document.body.appendChild(this.stats.dom)

    // Create a folder for camera controls
    const cameraFolder = this.pane.addFolder({
      title: "Camera",
    })

    cameraFolder.addBinding(this.params.camera, "position", {
      disabled: true,
    })
  }

  public begin() {
    if (!this.stats) return
    this.stats.begin()
    this.updateCameraPosition()
  }

  public end() {
    if (!this.stats) return
    this.stats.end()
  }
}
