export class Camera {
    private position: THREE.Vector3;
    private target: THREE.Vector3;
    private camera: THREE.PerspectiveCamera;

    constructor(fov: number, aspect: number, near: number, far: number) {
        this.position = new THREE.Vector3(0, 5, 10);
        this.target = new THREE.Vector3(0, 0, 0);
        this.camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
        this.camera.position.copy(this.position);
        this.camera.lookAt(this.target);
    }

    setPosition(x: number, y: number, z: number): void {
        this.position.set(x, y, z);
        this.camera.position.copy(this.position);
    }

    setTarget(x: number, y: number, z: number): void {
        this.target.set(x, y, z);
        this.camera.lookAt(this.target);
    }

    update(): void {
        // Update camera logic if needed
        this.camera.position.copy(this.position);
        this.camera.lookAt(this.target);
    }

    getCamera(): THREE.PerspectiveCamera {
        return this.camera;
    }
}