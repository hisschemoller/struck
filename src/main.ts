import { PhysicsLoader, Project } from 'enable3d';
import MainScene from './mainscene';
import './style.css';

PhysicsLoader('./lib', () => {
  const project = new Project({
    // @ts-ignore
    scenes: [MainScene],
    anisotropy: 4,
    antialias: true,
    softBodies: false,
  });
  document.getElementById('canvas-container')?.appendChild(project.renderer.domElement);
});
