import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { DragControls } from "three/addons/controls/DragControls.js";

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const cube = new THREE.Mesh(geometry, material);
// scene.add(cube);

camera.position.set(20, 20, 30);
// camera.position.z = 5;

//? Grid helper

const size = 300;
const divisions = 30;

const gridHelper = new THREE.GridHelper(size, divisions);
scene.add(gridHelper);

//? Light

const color = 0xffffff;
const intensity = 1;
const light = new THREE.AmbientLight(color, intensity);
scene.add(light);

const pointingLight = new THREE.PointLight(0xffffff);

pointingLight.position.set(20, 0, 0);

scene.add(pointingLight);

//? Control

const controls = new OrbitControls(camera, renderer.domElement);

//? Model
const loader = new GLTFLoader();

let draggableObjects = [];
let dragControls;
let orbitControls;

// const nonDraggableObject = new THREE.Mesh(
//   new THREE.BoxGeometry(200, 200, 200),
//   new THREE.MeshBasicMaterial({ color: 0x00ff00 })
// );
// nonDraggableObject.position.set(-10, 0, 0);
// scene.add(nonDraggableObject);

//* Load bottle
loader.load(
  "public/beer_bottle/scene.gltf",
  function (gltf) {
    gltf.scene.traverse(function (child) {
      if (child.isMesh) {
        // Access the material and change its color
        if (Array.isArray(child.material)) {
          child.material.forEach((material) => {
            material.color = new THREE.Color(0xff0000); // Example: Red
          });
        } else {
          child.material.color = new THREE.Color(0x00ff00); // Example: Green
        }
      }
      draggableObjects.push(gltf.scene);
    });

    // Initialize OrbitControls
    // orbitControls = new OrbitControls(camera, renderer.domElement);
    // orbitControls.enableDamping = true; // Optional for smoother orbiting

    scene.add(gltf.scene);
  },
  undefined,
  function (error) {
    console.error(error);
  }
);

function animate() {
  renderer.render(scene, camera);
  // cube.rotation.x += 0.01;
  // cube.rotation.y += 0.01;
}
renderer.setAnimationLoop(animate);

//? Dragcontrols

// Initialize DragControls (initially disabled)
dragControls = new DragControls(
  [...draggableObjects],
  camera,
  renderer.domElement
);

// Event listener to enable/disable DragControls on a key press (e.g., 'Shift')
window.addEventListener("keydown", function (event) {
  if (event.key === "Shift") {
    // dragControls.enabled = true;
    // orbitControls.enabled = false;
    renderer.domElement.style.cursor = "grab"; // Indicate dragging is active
  }
});

window.addEventListener("keyup", function (event) {
  if (event.key === "Shift") {
    dragControls.enabled = false;
    // orbitControls.enabled = true;
    renderer.domElement.style.cursor = "default"; // Reset cursor
  }
});

// Optional: Drag event listeners (as in your previous example)
dragControls.addEventListener("dragstart", function (event) {
  event.object.material.emissiveIntensity = 0.5;
  orbitControls.enabled = false; // Disable OrbitControls while dragging
});

dragControls.addEventListener("dragend", function (event) {
  event.object.material.emissiveIntensity = 0;
  orbitControls.enabled = true; // Re-enable OrbitControls after dragging
});

//* Load table
loader.load(
  "public/table/scene.gltf",
  function (gltf) {
    gltf.scene.position.set(0, -100, 0);
    scene.add(gltf.scene);
  },
  undefined,
  function (error) {
    console.error(error);
  }
);
