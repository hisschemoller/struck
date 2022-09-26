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
    await this.warpSpeed();

    // this.physics.debug?.enable();

    const ground = this.physics.add.box({ mass: 0 });

    const rope = this.physics.add.cylinder({
      height: 2, radiusBottom: 0.05, radiusTop: 0.05, y: 3,
    });
    const box = this.physics.add.box({
      depth: 1, height: 1, width: 1, y: 1.5,
    });

    this.physics.add.constraints.pointToPoint(ground.body, rope.body, {
      pivotA: { y: 4 },
      pivotB: { y: 1 },
    });
    this.physics.add.constraints.pointToPoint(rope.body, box.body, {
      pivotA: { y: -1 },
      pivotB: { y: 0.5 },
    });
  }

  async init() {
    this.renderer.setPixelRatio(1);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.autoClear = true;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFShadowMap; // PCFSoftShadowMap
  }

  update() {
    if (this.box) {
      this.box.rotation.x += 0.01;
      this.box.rotation.y += 0.01;
    }
  }
}
