import * as THREE from 'three';
import * as BABYLON from 'babylonjs';

export class Camera {
  private camera: THREE.PerspectiveCamera;
  private container: HTMLElement;
  private target: THREE.Vector3 = new THREE.Vector3(0, 0, 0);
  private distance: number = 50;
  private height: number = 30;
  private angle: number = 0;
  private moveSpeed: number = 20;
  private rotateSpeed: number = 1;

  constructor(container: HTMLElement) {
    this.container = container;
    this.camera = new THREE.PerspectiveCamera(
      75,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    
    this.updateCameraPosition();
    this.setupMouseControls();
  }

  private updateCameraPosition(): void {
    const x = this.target.x + Math.cos(this.angle) * this.distance;
    const z = this.target.z + Math.sin(this.angle) * this.distance;
    
    this.camera.position.set(x, this.height, z);
    this.camera.lookAt(this.target);
  }

  private setupMouseControls(): void {
    let isDragging = false;
    let lastMouseX = 0;
    let lastMouseY = 0;

    this.container.addEventListener('mousedown', (event) => {
      if (event.button === 2) {
        isDragging = true;
        lastMouseX = event.clientX;
        lastMouseY = event.clientY;
        event.preventDefault();
      }
    });

    this.container.addEventListener('mousemove', (event) => {
      if (isDragging) {
        const deltaX = event.clientX - lastMouseX;
        const deltaY = event.clientY - lastMouseY;
        
        this.angle -= deltaX * 0.01;
        this.height = Math.max(10, Math.min(100, this.height + deltaY * 0.1));
        
        this.updateCameraPosition();
        
        lastMouseX = event.clientX;
        lastMouseY = event.clientY;
      }
    });

    this.container.addEventListener('mouseup', () => {
      isDragging = false;
    });

    this.container.addEventListener('contextmenu', (event) => {
      event.preventDefault();
    });

    this.container.addEventListener('wheel', (event) => {
      this.distance = Math.max(10, Math.min(100, this.distance + event.deltaY * 0.01));
      this.updateCameraPosition();
      event.preventDefault();
    });
  }

  public setupMovementControls(keys: { [key: string]: boolean }): void {
    this.handleMovement = (deltaTime: number) => {
      let moved = false;
      
      if (keys['KeyW'] || keys['ArrowUp']) {
        this.target.z -= this.moveSpeed * deltaTime;
        moved = true;
      }
      if (keys['KeyS'] || keys['ArrowDown']) {
        this.target.z += this.moveSpeed * deltaTime;
        moved = true;
      }
      if (keys['KeyA'] || keys['ArrowLeft']) {
        this.target.x -= this.moveSpeed * deltaTime;
        moved = true;
      }
      if (keys['KeyD'] || keys['ArrowRight']) {
        this.target.x += this.moveSpeed * deltaTime;
        moved = true;
      }
      if (keys['KeyQ']) {
        this.angle -= this.rotateSpeed * deltaTime;
        moved = true;
      }
      if (keys['KeyE']) {
        this.angle += this.rotateSpeed * deltaTime;
        moved = true;
      }
      
      if (moved) {
        this.updateCameraPosition();
      }
    };
  }

  private handleMovement: (deltaTime: number) => void = () => {};

  public update(deltaTime: number): void {
    this.handleMovement(deltaTime);
  }

  public handleResize(): void {
    this.camera.aspect = this.container.clientWidth / this.container.clientHeight;
    this.camera.updateProjectionMatrix();
  }

  public getCamera(): THREE.PerspectiveCamera {
    return this.camera;
  }

  public focusOn(position: THREE.Vector3): void {
    this.target.copy(position);
    this.updateCameraPosition();
  }
}

export class CameraManager {
    private scene: BABYLON.Scene;
    private canvas: HTMLCanvasElement;
    public camera: BABYLON.ArcRotateCamera;

    constructor(scene: BABYLON.Scene, canvas: HTMLCanvasElement) {
        this.scene = scene;
        this.canvas = canvas;
        this.camera = this.createCamera();
    }

    private createCamera(): BABYLON.ArcRotateCamera {
        // Create an ArcRotateCamera
        const camera = new BABYLON.ArcRotateCamera(
            "arcRotateCamera",
            -Math.PI / 2, // Alpha (rotation around Y axis)
            Math.PI / 3,  // Beta (rotation around X axis)
            50,           // Radius (distance from target)
            new BABYLON.Vector3(0, 0, 0), // Target position
            this.scene
        );

        // Attach camera controls to the canvas
        camera.attachControl(this.canvas, true);

        // Set some camera limits
        camera.lowerRadiusLimit = 10;
        camera.upperRadiusLimit = 150;
        camera.wheelPrecision = 15; // Zoom speed

        // Panning (middle mouse button or Ctrl + Left Click)
        camera.panningSensibility = 1000; // Lower is more sensitive for panning
        camera.useAutoRotationBehavior = false; // Disable auto-rotation

        return camera;
    }

    public getCamera(): BABYLON.ArcRotateCamera {
        return this.camera;
    }

    public setTarget(target: BABYLON.Vector3): void {
        this.camera.setTarget(target);
    }

    public update(): void {
        // Any camera-specific update logic can go here
        // For example, smoothly following a target, if not handled by behaviors
    }

    public dispose(): void {
        this.camera.detachControl();
        this.camera.dispose();
    }
}