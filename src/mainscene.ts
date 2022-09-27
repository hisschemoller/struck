import { ExtendedObject3D, Scene3D, THREE } from 'enable3d';
import { ClosestRaycaster } from '@enable3d/ammo-physics';

// @ts-ignore
export default class MainScene extends Scene3D {
  // orbitControls: OrbitControls | undefined;

  raycaster: THREE.Raycaster;

  ball: ExtendedObject3D | undefined;

  orb: ExtendedObject3D | undefined;

  constructor() {
    super({ key: 'MainScene' });
    this.raycaster = new THREE.Raycaster();
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

    this.orb = this.physics.add.sphere({
      radius: 3, y: 1.5, mass: 0, collisionFlags: 4,
    }, { phong: { opacity: 0.3, transparent: true } });
    this.orb.castShadow = false;
    this.orb.receiveShadow = false;
    this.orb.name = 'orb';

    this.ball = this.physics.add.sphere({
      radius: 0.5, x: -2, y: 4, mass: 1, collisionFlags: 1,
    });
  }

  async init() {
    this.renderer.setPixelRatio(1);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.autoClear = true;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFShadowMap; // PCFSoftShadowMap

    this.renderer.domElement.addEventListener('touchstart', this.onTouchStart.bind(this));
    this.renderer.domElement.addEventListener('mousedown', this.onTouchStart.bind(this));
  }

  onTouchStart(e: MouseEvent | TouchEvent) {
    if (!this.orb || !this.ball) {
      return;
    }
    const { touches } = e as TouchEvent;
    const x = touches ? touches[0].clientX : (e as MouseEvent).clientX;
    const y = touches ? touches[0].clientY : (e as MouseEvent).clientY;
    const coords = {
      x: (x / window.innerWidth) * 2 - 1,
      y: -(y / window.innerHeight) * 2 + 1,
    };
    this.raycaster.setFromCamera(coords, this.camera);
    const intersects = this.raycaster.intersectObjects([this.orb]);
    if (intersects.length) {
      this.ball.position.copy(intersects[0].point);
      // console.log(this.ball.position);
    }
  }

  update() {}
}
