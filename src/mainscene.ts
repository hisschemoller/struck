import { ExtendedObject3D, Scene3D, THREE } from 'enable3d';

// @ts-ignore
export default class MainScene extends Scene3D {
  // orbitControls: OrbitControls | undefined;

  raycaster: THREE.Raycaster;

  orb: ExtendedObject3D | undefined;

  clickRequest = false;

  pointerCoords = new THREE.Vector2();

  constructor() {
    super({ key: 'MainScene' });
    this.raycaster = new THREE.Raycaster();
  }

  async create() {
    await this.warpSpeed('-ground');

    // this.physics.debug?.enable();

    const ground = this.physics.add.box(
      { mass: 0, collisionFlags: 4 },
      { phong: { opacity: 0.1, transparent: true } },
    );

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
  }

  async init() {
    this.renderer.setPixelRatio(1);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.autoClear = true;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFShadowMap; // PCFSoftShadowMap

    this.renderer.domElement.addEventListener('pointerdown', (e) => {
      if (!this.clickRequest) {
        this.pointerCoords.set(
          (e.clientX / window.innerWidth) * 2 - 1,
          -(e.clientY / window.innerHeight) * 2 + 1,
        );
        this.clickRequest = true;
      }
    });
  }

  processClick() {
    if (!this.clickRequest || !this.orb) {
      return;
    }
    this.raycaster.setFromCamera(this.pointerCoords, this.camera);
    const intersects = this.raycaster.intersectObjects([this.orb]);
    if (intersects.length) {
      const pos = intersects[0].point.clone();
      const ball = this.physics.add.sphere({
        x: pos.x, y: pos.y, z: pos.z, radius: 0.4, mass: 0.05, collisionFlags: 0,
      });
      ball.castShadow = true;
      ball.receiveShadow = true;
      ball.body.setFriction(0.5);
      const vel = this.orb.position.clone();
      vel.sub(intersects[0].point);
      vel.multiplyScalar(6);
      ball.body.setVelocity(vel.x, vel.y, vel.z);
    }
    this.clickRequest = false;
  }

  update() {
    this.processClick();
  }
}
