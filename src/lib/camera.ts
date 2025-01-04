import { mat4, vec3 } from "gl-matrix"

export class Camera {
  private position: vec3
  private target: vec3
  private up: vec3
  private viewMatrix: mat4
  private projectionMatrix: mat4

  // Orbit control properties
  private radius = 3
  private phi = Math.PI / 4 // Start rotated 45 degrees around y-axis
  private theta = Math.PI / 4 // Start at 45 degrees from y-axis

  constructor() {
    this.position = vec3.fromValues(0, 0, this.radius)
    this.target = vec3.fromValues(0, 0, 0)
    this.up = vec3.fromValues(0, 1, 0)
    this.viewMatrix = mat4.create()
    this.projectionMatrix = mat4.create()
    this.updateViewMatrix()
  }

  private updateViewMatrix() {
    // Convert spherical coordinates to Cartesian
    this.position[0] = this.radius * Math.sin(this.theta) * Math.sin(this.phi)
    this.position[1] = this.radius * Math.cos(this.theta)
    this.position[2] = this.radius * Math.sin(this.theta) * Math.cos(this.phi)

    mat4.lookAt(this.viewMatrix, this.position, this.target, this.up)
  }

  updateProjection(aspect: number) {
    mat4.perspective(
      this.projectionMatrix,
      (60 * Math.PI) / 180, // FOV in radians
      aspect,
      0.1,
      100.0,
    )
  }

  orbit(deltaX: number, deltaY: number) {
    const sensitivity = 0.01
    this.phi -= deltaX * sensitivity
    this.theta = Math.max(
      0.1, // Prevent camera from going below/above the cube
      Math.min(Math.PI - 0.1, this.theta - deltaY * sensitivity),
    )
    this.updateViewMatrix()
  }

  zoom(delta: number) {
    const sensitivity = 0.01
    this.radius = Math.max(1, Math.min(10, this.radius + delta * sensitivity))
    this.updateViewMatrix()
  }

  getViewMatrix(): mat4 {
    return this.viewMatrix
  }

  getProjectionMatrix(): mat4 {
    return this.projectionMatrix
  }

  getPosition() {
    return this.position
  }
}
