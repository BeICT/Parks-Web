import * as THREE from 'three';
import Ride from '@/entities/Ride';
import { Visitor } from '@/entities/Visitor';
import { Position } from '@/types';
import { AssetLoader } from '@/utils/AssetLoader';

export class Scene {
  private scene: THREE.Scene;
  private rideObjects: Map<string, THREE.Object3D> = new Map();
  private visitorObjects: Map<string, THREE.Object3D> = new Map();
  private pathObjects: THREE.Object3D[] = [];
  private assetLoader: AssetLoader;

  constructor(assetLoader: AssetLoader) {
    this.scene = new THREE.Scene();
    this.assetLoader = assetLoader;
  }

  public async initialize(): Promise<void> {
    // Set up basic scene
    this.scene.background = new THREE.Color(0x87CEEB);
    this.scene.fog = new THREE.Fog(0x87CEEB, 50, 200);

    // Add lighting
    this.setupLighting();

    // Create terrain
    this.createTerrain();

    // Add some basic scenery
    this.addBasicScenery();

    console.log('Scene initialized');
  }

  private setupLighting(): void {
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    this.scene.add(ambientLight);

    // Directional light (sun)
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(50, 100, 50);
    directionalLight.castShadow = true;
    
    // Configure shadow properties
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 200;
    directionalLight.shadow.camera.left = -50;
    directionalLight.shadow.camera.right = 50;
    directionalLight.shadow.camera.top = 50;
    directionalLight.shadow.camera.bottom = -50;

    this.scene.add(directionalLight);
  }

  private createTerrain(): void {
    // Create a simple ground plane
    const groundGeometry = new THREE.PlaneGeometry(200, 200, 50, 50);
    
    // Get or create a grass texture
    const grassTexture = this.assetLoader.getAsset('default-grass');
    if (grassTexture && grassTexture instanceof THREE.Texture) {
      grassTexture.wrapS = THREE.RepeatWrapping;
      grassTexture.wrapT = THREE.RepeatWrapping;
      grassTexture.repeat.set(20, 20);
    }

    const groundMaterial = new THREE.MeshLambertMaterial({ 
      color: 0x4a7c59,
      map: grassTexture
    });
    
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    ground.name = 'terrain';
    
    this.scene.add(ground);
  }

  private addBasicScenery(): void {
    // Add some trees
    this.addTrees();
    
    // Add park entrance
    this.addParkEntrance();
  }

  private addTrees(): void {
    const treeGeometry = new THREE.ConeGeometry(2, 8, 8);
    const treeMaterial = new THREE.MeshLambertMaterial({ color: 0x228B22 });
    
    const trunkGeometry = new THREE.CylinderGeometry(0.5, 0.7, 3);
    const trunkMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });

    // Place trees randomly around the park
    for (let i = 0; i < 20; i++) {
      const tree = new THREE.Group();
      tree.name = `tree_${i}`;
      
      // Trunk
      const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
      trunk.position.y = 1.5;
      trunk.castShadow = true;
      tree.add(trunk);
      
      // Leaves
      const leaves = new THREE.Mesh(treeGeometry, treeMaterial);
      leaves.position.y = 5;
      leaves.castShadow = true;
      tree.add(leaves);
      
      // Random position
      tree.position.x = (Math.random() - 0.5) * 180;
      tree.position.z = (Math.random() - 0.5) * 180;
      
      // Avoid placing trees in the center
      if (Math.abs(tree.position.x) < 20 && Math.abs(tree.position.z) < 20) {
        continue;
      }
      
      this.scene.add(tree);
    }
  }

  private addParkEntrance(): void {
    // Simple entrance gate
    const gateGeometry = new THREE.BoxGeometry(2, 6, 0.5);
    const gateMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
    
    const leftGate = new THREE.Mesh(gateGeometry, gateMaterial);
    leftGate.position.set(-3, 3, -90);
    leftGate.castShadow = true;
    leftGate.name = 'entrance_left';
    this.scene.add(leftGate);
    
    const rightGate = new THREE.Mesh(gateGeometry, gateMaterial);
    rightGate.position.set(3, 3, -90);
    rightGate.castShadow = true;
    rightGate.name = 'entrance_right';
    this.scene.add(rightGate);
    
    // Entrance sign
    const signGeometry = new THREE.BoxGeometry(8, 2, 0.2);
    const signMaterial = new THREE.MeshLambertMaterial({ color: 0xDEB887 });
    
    const sign = new THREE.Mesh(signGeometry, signMaterial);
    sign.position.set(0, 7, -90);
    sign.castShadow = true;
    sign.name = 'entrance_sign';
    this.scene.add(sign);
  }

  public addRide(ride: Ride): void {
    const rideObject = this.createRideObject(ride);
    rideObject.position.set(ride.position.x, ride.position.y, ride.position.z);
    this.scene.add(rideObject);
    this.rideObjects.set(ride.id, rideObject);
  }

  private createRideObject(ride: Ride): THREE.Object3D {
    const group = new THREE.Group();

    switch (ride.type) {
      case 'roller_coaster':
        return this.createRollerCoaster();
      case 'ferris_wheel':
        return this.createFerrisWheel();
      case 'carousel':
        return this.createCarousel();
      default:
        return this.createGenericRide(ride.name);
    }
  }

  private createRollerCoaster(): THREE.Object3D {
    const group = new THREE.Group();
    
    // Base platform
    const platformGeometry = new THREE.BoxGeometry(8, 1, 12);
    const platformMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
    const platform = new THREE.Mesh(platformGeometry, platformMaterial);
    platform.position.y = 0.5;
    platform.castShadow = true;
    group.add(platform);

    // Track supports
    for (let i = 0; i < 3; i++) {
      const supportGeometry = new THREE.CylinderGeometry(0.2, 0.2, 8);
      const supportMaterial = new THREE.MeshLambertMaterial({ color: 0x666666 });
      const support = new THREE.Mesh(supportGeometry, supportMaterial);
      support.position.set(-3 + i * 3, 4, 0);
      support.castShadow = true;
      group.add(support);
    }

    // Simple track
    const trackGeometry = new THREE.BoxGeometry(12, 0.5, 1);
    const trackMaterial = new THREE.MeshLambertMaterial({ color: 0x4169E1 });
    const track = new THREE.Mesh(trackGeometry, trackMaterial);
    track.position.y = 8;
    track.castShadow = true;
    group.add(track);

    return group;
  }

  private createFerrisWheel(): THREE.Object3D {
    const group = new THREE.Group();
    
    // Support structure
    const supportGeometry = new THREE.CylinderGeometry(0.5, 1, 15);
    const supportMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
    const support = new THREE.Mesh(supportGeometry, supportMaterial);
    support.position.y = 7.5;
    support.castShadow = true;
    group.add(support);

    // Wheel
    const wheelGeometry = new THREE.TorusGeometry(8, 0.5, 8, 24);
    const wheelMaterial = new THREE.MeshLambertMaterial({ color: 0xFF6347 });
    const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
    wheel.position.y = 10;
    wheel.rotation.x = Math.PI / 2;
    wheel.castShadow = true;
    group.add(wheel);

    // Gondolas
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const gondolaGeometry = new THREE.BoxGeometry(1.5, 2, 1.5);
      const gondolaMaterial = new THREE.MeshLambertMaterial({ color: 0x4169E1 });
      const gondola = new THREE.Mesh(gondolaGeometry, gondolaMaterial);
      gondola.position.set(
        Math.cos(angle) * 8,
        10 + Math.sin(angle) * 8,
        0
      );
      gondola.castShadow = true;
      group.add(gondola);
    }

    return group;
  }

  private createCarousel(): THREE.Object3D {
    const group = new THREE.Group();
    
    // Base platform
    const platformGeometry = new THREE.CylinderGeometry(6, 6, 1);
    const platformMaterial = new THREE.MeshLambertMaterial({ color: 0xFFD700 });
    const platform = new THREE.Mesh(platformGeometry, platformMaterial);
    platform.position.y = 0.5;
    platform.castShadow = true;
    group.add(platform);

    // Center pole
    const poleGeometry = new THREE.CylinderGeometry(0.3, 0.3, 8);
    const poleMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
    const pole = new THREE.Mesh(poleGeometry, poleMaterial);
    pole.position.y = 4;
    pole.castShadow = true;
    group.add(pole);

    // Roof
    const roofGeometry = new THREE.ConeGeometry(7, 3);
    const roofMaterial = new THREE.MeshLambertMaterial({ color: 0xFF1493 });
    const roof = new THREE.Mesh(roofGeometry, roofMaterial);
    roof.position.y = 9.5;
    roof.castShadow = true;
    group.add(roof);

    // Horses
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const horseGeometry = new THREE.BoxGeometry(0.8, 1.5, 2);
      const horseMaterial = new THREE.MeshLambertMaterial({ 
        color: new THREE.Color().setHSL(Math.random(), 0.8, 0.6) 
      });
      const horse = new THREE.Mesh(horseGeometry, horseMaterial);
      horse.position.set(
        Math.cos(angle) * 4,
        1.5,
        Math.sin(angle) * 4
      );
      horse.castShadow = true;
      group.add(horse);
    }

    return group;
  }

  private createGenericRide(name: string): THREE.Object3D {
    const group = new THREE.Group();
    
    const geometry = new THREE.BoxGeometry(4, 3, 4);
    const material = new THREE.MeshLambertMaterial({ color: 0x9932CC });
    const ride = new THREE.Mesh(geometry, material);
    ride.position.y = 1.5;
    ride.castShadow = true;
    group.add(ride);

    return group;
  }

  public removeRide(rideId: string): void {
    const rideObject = this.rideObjects.get(rideId);
    if (rideObject) {
      this.scene.remove(rideObject);
      this.rideObjects.delete(rideId);
    }
  }

  public addVisitor(visitor: Visitor): void {
    const visitorObject = this.createVisitorObject();
    visitorObject.position.set(visitor.position.x, visitor.position.y, visitor.position.z);
    this.scene.add(visitorObject);
    this.visitorObjects.set(visitor.id, visitorObject);
  }

  private createVisitorObject(): THREE.Object3D {
    const group = new THREE.Group();
    
    // Body
    const bodyGeometry = new THREE.CylinderGeometry(0.3, 0.3, 1.5);
    const bodyMaterial = new THREE.MeshLambertMaterial({ 
      color: new THREE.Color().setHSL(Math.random(), 0.5, 0.6) 
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 0.75;
    body.castShadow = true;
    group.add(body);

    // Head
    const headGeometry = new THREE.SphereGeometry(0.25);
    const headMaterial = new THREE.MeshLambertMaterial({ color: 0xFFDBB5 });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.y = 1.7;
    head.castShadow = true;
    group.add(head);

    return group;
  }

  public updateVisitor(visitor: Visitor): void {
    const visitorObject = this.visitorObjects.get(visitor.id);
    if (visitorObject) {
      visitorObject.position.set(visitor.position.x, visitor.position.y, visitor.position.z);
    }
  }

  public removeVisitor(visitorId: string): void {
    const visitorObject = this.visitorObjects.get(visitorId);
    if (visitorObject) {
      this.scene.remove(visitorObject);
      this.visitorObjects.delete(visitorId);
    }
  }

  public addPath(position: Position): void {
    const pathGeometry = new THREE.PlaneGeometry(2, 2);
    const pathMaterial = new THREE.MeshLambertMaterial({ color: 0x696969 });
    const path = new THREE.Mesh(pathGeometry, pathMaterial);
    path.rotation.x = -Math.PI / 2;
    path.position.set(position.x, 0.01, position.z);
    path.receiveShadow = true;
    this.scene.add(path);
    this.pathObjects.push(path);
  }

  public addDecoration(position: Position): void {
    // Simple tree decoration
    const group = new THREE.Group();
    
    // Trunk
    const trunkGeometry = new THREE.CylinderGeometry(0.2, 0.3, 3);
    const trunkMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
    const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
    trunk.position.y = 1.5;
    trunk.castShadow = true;
    group.add(trunk);

    // Leaves
    const leavesGeometry = new THREE.SphereGeometry(1.5);
    const leavesMaterial = new THREE.MeshLambertMaterial({ color: 0x228B22 });
    const leaves = new THREE.Mesh(leavesGeometry, leavesMaterial);
    leaves.position.y = 3.5;
    leaves.castShadow = true;
    group.add(leaves);

    group.position.set(position.x, 0, position.z);
    this.scene.add(group);
  }

  public update(deltaTime: number): void {
    // Animate rides
    this.rideObjects.forEach((rideObject, rideId) => {
      // Simple rotation animation
      rideObject.rotation.y += deltaTime * 0.5;
    });

    // Animate scene elements if needed
    // For example, rotate trees slightly for a breeze effect
    this.scene.children.forEach(child => {
      if (child.name.startsWith('tree_')) {
        child.rotation.y += Math.sin(Date.now() * 0.001) * 0.001;
      }
    });
  }

  public getScene(): THREE.Scene {
    return this.scene;
  }

  public addObject(object: THREE.Object3D): void {
    this.scene.add(object);
  }

  public removeObject(object: THREE.Object3D): void {
    this.scene.remove(object);
  }

  public dispose(): void {
    // Dispose of geometries and materials
    this.scene.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        if (object.geometry) {
          object.geometry.dispose();
        }
        if (object.material) {
          if (Array.isArray(object.material)) {
            object.material.forEach(material => material.dispose());
          } else {
            object.material.dispose();
          }
        }
      }
    });

    // Clear the scene
    while (this.scene.children.length > 0) {
      this.scene.remove(this.scene.children[0]);
    }

    console.log('Scene disposed');
  }
}