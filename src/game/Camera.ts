import * as THREE from 'three';

export class Camera {
  private camera: THREE.PerspectiveCamera;
  private container: HTMLElement;
  private target: THREE.Vector3 = new THREE.Vector3(0, 0, 0);
  private distance: number = 60;
  private height: number = 40;
  private angle: number = Math.PI / 4; // Start at a 45-degree angle
  private moveSpeed: number = 20;
  private rotateSpeed: number = 1;

  constructor(container: HTMLElement) {
    this.container = container;
    
    const width = Math.max(container.clientWidth, 800);
    const height = Math.max(container.clientHeight, 600);
    
    this.camera = new THREE.PerspectiveCamera(
      75,
      width / height,
      0.1,
      1000
    );
    
    console.log('Camera initialized with container dimensions:', width, 'x', height);
    
    this.updateCameraPosition();
    this.setupMouseControls();
    
    console.log('Camera position:', this.camera.position);
    console.log('Camera looking at:', this.target);
  }

  private updateCameraPosition(): void {
    const x = this.target.x + Math.cos(this.angle) * this.distance;
    const z = this.target.z + Math.sin(this.angle) * this.distance;
    
    this.camera.position.set(x, this.height, z);
    this.camera.lookAt(this.target);
    
    console.log('Camera updated - Position:', this.camera.position, 'Target:', this.target);
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
    const width = Math.max(this.container.clientWidth, 800);
    const height = Math.max(this.container.clientHeight, 600);
    
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    
    console.log('Camera resized to aspect ratio:', this.camera.aspect);
  }

  public getCamera(): THREE.PerspectiveCamera {
    return this.camera;
  }

  public focusOn(position: THREE.Vector3): void {
    this.target.copy(position);
    this.updateCameraPosition();
  }
}