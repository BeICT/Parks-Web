import * as THREE from 'three';

export class Scene {
    private scene: THREE.Scene;

    constructor() {
        this.scene = new THREE.Scene();
    }

    addObject(object: THREE.Object3D): void {
        this.scene.add(object);
    }

    removeObject(object: THREE.Object3D): void {
        this.scene.remove(object);
    }

    render(camera: THREE.Camera, renderer: THREE.WebGLRenderer): void {
        renderer.render(this.scene, camera);
    }
}