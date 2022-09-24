import { ExtendedObject3D, Scene3D, THREE } from 'enable3d';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

// @ts-ignore
export default class MainScene extends Scene3D {
  box: ExtendedObject3D | undefined;

  orbitControls: OrbitControls | undefined;

  pCamera: THREE.PerspectiveCamera | undefined;

  constructor() {
    super({ key: 'MainScene' });
  }

  async create() {
    // const { orbitControls: oc } = await this.warpSpeed('orbitControls');
    // this.orbitControls = oc as OrbitControls;
    this.warpSpeed();

    this.physics.debug?.enable();

    // CAMERA
    this.pCamera = this.camera as THREE.PerspectiveCamera;
    this.pCamera.position.set(10, 10, 20);

    // blue box (without physics)
    this.box = this.add.box({ y: 2 }, { lambert: { color: 'deepskyblue' } });

    // pink box (with physics)
    this.physics.add.box({ y: 10 }, { lambert: { color: 'hotpink' } });
  }

  async init() {
    this.renderer.setPixelRatio(1);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.autoClear = true;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFShadowMap; // PCFSoftShadowMap
    // this.renderer.setClearColor(this.clearColor);
  }

  update() {
    if (this.box) {
      this.box.rotation.x += 0.01;
      this.box.rotation.y += 0.01;
    }
  }
}
