import * as THREE from 'three';
import { AssetLoader } from '../utils/AssetLoader';

export class Scene {
  private scene: THREE.Scene;
  private assetLoader: AssetLoader;

  constructor(assetLoader: AssetLoader) {
    this.scene = new THREE.Scene();
    this.assetLoader = assetLoader;
  }

  public async initialize(): Promise<void> {
    console.log('Initializing Scene...');
    this.scene.background = new THREE.Color(0x87CEEB);
    this.scene.fog = new THREE.Fog(0x87CEEB, 50, 200);

    this.setupLighting();
    console.log('Lighting setup complete');
    
    this.createTerrain();
    console.log('Terrain created');
    
    this.addBasicScenery();
    console.log('Basic scenery added');

    console.log('Scene initialized with', this.scene.children.length, 'objects');
    console.log('Scene children:', this.scene.children.map(child => child.name || child.type));
  }

  private setupLighting(): void {
    // Increase ambient light to make everything more visible
    const ambientLight = new THREE.AmbientLight(0x404040, 1.0);
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
    directionalLight.position.set(50, 100, 50);
    directionalLight.castShadow = true;
    
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 200;
    directionalLight.shadow.camera.left = -50;
    directionalLight.shadow.camera.right = 50;
    directionalLight.shadow.camera.top = 50;
    directionalLight.shadow.camera.bottom = -50;

    this.scene.add(directionalLight);
    
    console.log('Lighting setup - Ambient:', ambientLight.intensity, 'Directional:', directionalLight.intensity);
  }

  private createTerrain(): void {
    const groundGeometry = new THREE.PlaneGeometry(200, 200, 50, 50);
    
    // Start with a simple bright green color first, then add texture if available
    const groundMaterial = new THREE.MeshLambertMaterial({ 
      color: 0x228B22 // Bright green
    });
    
    const grassTexture = this.assetLoader.getAsset('grass-texture');
    console.log('Retrieved grass texture:', grassTexture);
    
    if (grassTexture && grassTexture instanceof THREE.Texture) {
      grassTexture.wrapS = THREE.RepeatWrapping;
      grassTexture.wrapT = THREE.RepeatWrapping;
      grassTexture.repeat.set(20, 20);
      groundMaterial.map = grassTexture;
    }
    
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    ground.name = 'terrain';
    
    this.scene.add(ground);
    console.log('Terrain added to scene at position:', ground.position);
  }

  private addBasicScenery(): void {
    this.addTrees();
    this.addParkEntrance();
    this.addTestCube();
  }

  private addTestCube(): void {
    // Add a bright red cube in the center for testing visibility
    const cubeGeometry = new THREE.BoxGeometry(5, 5, 5);
    const cubeMaterial = new THREE.MeshLambertMaterial({ color: 0xff0000 });
    const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
    cube.position.set(0, 2.5, 0);
    cube.castShadow = true;
    cube.name = 'test_cube';
    this.scene.add(cube);
    console.log('Added test cube at position:', cube.position);
    
    // Add a wireframe cube to help with debugging
    const wireframeCube = new THREE.Mesh(
      new THREE.BoxGeometry(10, 10, 10),
      new THREE.MeshBasicMaterial({ 
        color: 0x00ff00, 
        wireframe: true 
      })
    );
    wireframeCube.position.set(10, 5, 10);
    wireframeCube.name = 'wireframe_cube';
    this.scene.add(wireframeCube);
    console.log('Added wireframe cube at position:', wireframeCube.position);
    
    // Add grid helper
    const gridHelper = new THREE.GridHelper(100, 50);
    gridHelper.name = 'grid_helper';
    this.scene.add(gridHelper);
    console.log('Added grid helper');
  }

  private addTrees(): void {
    const treeGeometry = new THREE.ConeGeometry(2, 8, 8);
    const treeMaterial = new THREE.MeshLambertMaterial({ color: 0x228B22 });
    
    const trunkGeometry = new THREE.CylinderGeometry(0.5, 0.7, 3);
    const trunkMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });

    for (let i = 0; i < 20; i++) {
      const tree = new THREE.Group();
      tree.name = `tree_${i}`;
      
      const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
      trunk.position.y = 1.5;
      trunk.castShadow = true;
      tree.add(trunk);
      
      const leaves = new THREE.Mesh(treeGeometry, treeMaterial);
      leaves.position.y = 5;
      leaves.castShadow = true;
      tree.add(leaves);
      
      tree.position.x = (Math.random() - 0.5) * 180;
      tree.position.z = (Math.random() - 0.5) * 180;
      
      if (Math.abs(tree.position.x) < 20 && Math.abs(tree.position.z) < 20) {
        continue;
      }
      
      this.scene.add(tree);
    }
  }

  private addParkEntrance(): void {
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
    
    const signGeometry = new THREE.BoxGeometry(8, 2, 0.2);
    const signMaterial = new THREE.MeshLambertMaterial({ color: 0xDEB887 });
    
    const sign = new THREE.Mesh(signGeometry, signMaterial);
    sign.position.set(0, 7, -90);
    sign.castShadow = true;
    sign.name = 'entrance_sign';
    this.scene.add(sign);
  }

  public update(deltaTime: number): void {
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

    while (this.scene.children.length > 0) {
      this.scene.remove(this.scene.children[0]);
    }

    console.log('Scene disposed');
  }
}