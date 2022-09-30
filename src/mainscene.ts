import { ExtendedObject3D, Scene3D, THREE } from 'enable3d';

// @ts-ignore
export default class MainScene extends Scene3D {
  audioContext: AudioContext | undefined;

  orb: ExtendedObject3D | undefined;

  pCamera: THREE.PerspectiveCamera | undefined;

  pointerCoords: THREE.Vector2;

  pointerdownRequest: boolean;

  raycaster: THREE.Raycaster;

  resizeRequest: boolean;

  constructor() {
    super({ key: 'MainScene' });
    this.pointerCoords = new THREE.Vector2();
    this.raycaster = new THREE.Raycaster();
    this.pointerdownRequest = false;
    this.resizeRequest = false;
  }

  async create() {
    await this.warpSpeed('-ground');

    // this.physics.debug?.enable();

    this.pCamera = this.camera as THREE.PerspectiveCamera;
    this.resizeRequest = true;

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
    box.body.on.collision((otherObject) => {
      if (otherObject.name === 'ball' && otherObject.userData.hasHit === false) {
        // eslint-disable-next-line no-param-reassign
        otherObject.userData.hasHit = true;

        if (this.audioContext) {
          const osc = this.audioContext.createOscillator();
          osc.connect(this.audioContext.destination);
          osc.start();
          osc.stop(this.audioContext.currentTime + 0.05);
        }
      }
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
      if (!this.pointerdownRequest) {
        this.pointerCoords.set(
          (e.clientX / window.innerWidth) * 2 - 1,
          -(e.clientY / window.innerHeight) * 2 + 1,
        );
        this.pointerdownRequest = true;
      }
    });

    document.addEventListener('pointerdown', () => {
      if (!this.audioContext) {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.audioContext.resume();
      }
    });

    window.addEventListener('resize', () => {
      this.resizeRequest = true;
    });
  }

  processClick() {
    this.pointerdownRequest = false;
    if (!this.orb) {
      return;
    }
    this.raycaster.setFromCamera(this.pointerCoords, this.camera);
    const intersects = this.raycaster.intersectObjects([this.orb]);
    if (intersects.length) {
      const { x, y, z } = intersects[0].point.clone();
      const ball = this.physics.add.sphere({
        x, y, z, radius: 0.4, mass: 0.05, collisionFlags: 0, name: 'ball',
      });
      ball.userData.hasHit = false;
      ball.castShadow = true;
      ball.receiveShadow = true;
      ball.body.setFriction(0.5);
      const vel = this.orb.position.clone();
      vel.sub(intersects[0].point);
      vel.multiplyScalar(6);
      ball.body.setVelocity(vel.x, vel.y, vel.z);
    }
  }

  resize() {
    this.resizeRequest = false;
    if (this.pCamera) {
      this.pCamera.aspect = window.innerWidth / window.innerHeight;
      this.pCamera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
  }

  update() {
    if (this.resizeRequest) {
      this.resize();
    }
    if (this.pointerdownRequest) {
      this.processClick();
    }
  }
}
