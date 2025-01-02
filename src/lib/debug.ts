import Stats from "stats.js"
import { Pane } from "tweakpane"

export type DebugParams = {
  level: number
  name: string
  active: boolean
}

export class Debug {
  private stats?: Stats
  private pane?: Pane
  private params?: DebugParams

  constructor(debug: boolean) {
    if (!debug) return

    this.stats = new Stats()
    this.stats.showPanel(0) // 0: fps, 1: ms, 2: mb, 3+: custom
    this.stats.dom.style.top = "8px"
    this.stats.dom.style.left = "8px"

    this.pane = new Pane({
      title: "Debug",
    })

    this.params = {
      level: 0,
      name: "Test",
      active: true,
    }
  }

  public init() {
    if (!this.stats || !this.pane || !this.params) return
    document.body.appendChild(this.stats.dom)
    this.pane.addBinding(this.params, "level", { min: 0, max: 100 })
    this.pane.addBinding(this.params, "name")
    this.pane.addBinding(this.params, "active")
  }

  public begin() {
    if (!this.stats) return
    this.stats.begin()
  }

  public end() {
    if (!this.stats) return
    this.stats.end()
  }
}
