import { ExtendedObject3D, Scene3D, THREE } from 'enable3d';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

// @ts-ignore
export default class MainScene extends Scene3D {
  audioContext: AudioContext | undefined;

  cameraTarget: THREE.Vector3;

  orb: ExtendedObject3D | undefined;

  orbitControls: OrbitControls | undefined;

  pointerCoords: THREE.Vector2;

  pointerdownRequest: boolean;

  raycaster: THREE.Raycaster;

  resizeRequest: boolean;

  constructor() {
    super({ key: 'MainScene' });
    this.cameraTarget = new THREE.Vector3();
    this.pointerCoords = new THREE.Vector2();
    this.pointerdownRequest = false;
    this.raycaster = new THREE.Raycaster();
    this.resizeRequest = false;
  }

  async create() {
    // const { orbitControls: oc } = await this.warpSpeed('-ground', '-light');

    // this.physics.debug?.enable();

    this.cameraTarget = new THREE.Vector3(0, 0, 0);

    // CAMERA
    this.camera = new THREE.PerspectiveCamera();
    this.camera.position.set(0, 6, 10);
    this.camera.lookAt(this.cameraTarget);
    this.camera.updateProjectionMatrix();

    // AMBIENT LIGHT
    const ambientLight = new THREE.AmbientLight(0x0000ff, 0.35);
    this.scene.add(ambientLight);

    // DIRECTIONAL LIGHT
    const SHADOW_MAP_SIZE = 2048;
    const SHADOW_FAR = 13500;
    const SHADOW_SIZE = 6;
    const directionalLight = new THREE.DirectionalLight(0x330000, 0.5);
    directionalLight.position.set(8, 10, 4);
    directionalLight.color.setHSL(0.8, 1, 0.55);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = SHADOW_MAP_SIZE;
    directionalLight.shadow.mapSize.height = SHADOW_MAP_SIZE;
    directionalLight.shadow.camera.left = -SHADOW_SIZE;
    directionalLight.shadow.camera.right = SHADOW_SIZE;
    directionalLight.shadow.camera.top = SHADOW_SIZE;
    directionalLight.shadow.camera.bottom = -SHADOW_SIZE;
    directionalLight.shadow.camera.far = SHADOW_FAR;
    this.scene.add(directionalLight);

    this.orbitControls = new OrbitControls(this.camera, this.renderer.domElement);

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
    if (!this.orb || !this.camera) {
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
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    if (this.camera) {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();

      // move camera further back when viewport height increases so objects stay the same size
      // const scale = 0.01;
      // const fieldOfView = this.camera.fov * (Math.PI / 180); // convert fov to radians
      // const targetZ = window.innerHeight / (2 * Math.tan(fieldOfView / 2));

      // this.camera.position.z = targetZ * scale;
      // this.camera.lookAt(this.cameraTarget);
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
