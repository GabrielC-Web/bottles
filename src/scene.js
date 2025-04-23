import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";
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

camera.position.set(0, 80, 150);
// camera.position.z = 5;

//? Grid helper

const size = 300;
const divisions = 30;

const gridHelper = new THREE.GridHelper(size, divisions);
scene.add(gridHelper);

//? Light

const color = 0xffffff;
const intensity = 1;
// Create an AmbientLight
const ambientLight = new THREE.AmbientLight(0xf1f1f1); // Soft white light

// Add it to the scene
scene.add(ambientLight);

//? Control

const controls = new OrbitControls(camera, renderer.domElement);

//? Model
const objLoader = new OBJLoader();
const gltfLoader = new GLTFLoader();

let draggableObjects = [];
let orbitControls;

// const nonDraggableObject = new THREE.Mesh(
//   new THREE.BoxGeometry(200, 200, 200),
//   new THREE.MeshBasicMaterial({ color: 0x00ff00 })
// );
// nonDraggableObject.position.set(-10, 0, 0);
// scene.add(nonDraggableObject);

//* Load bottle
objLoader.load(
  "public/bottle_obj/beer bottle.obj",
  function (obj) {
    scene.add(obj);

    // 3. Initialize DragControls after the object is loaded
    const dragControls = new DragControls([obj], camera, renderer.domElement);

    // Optional: Add event listeners for drag start and end
    dragControls.addEventListener("dragstart", function (event) {
      console.log(event.object.name);

      // Disable camera controls if you have them
      // if (controls) controls.enabled = false;
      console.log("Dragging started:", event.object.name || "Object");
    });

    dragControls.addEventListener("dragend", function (event) {
      // Enable camera controls if you have them
      // if (controls) controls.enabled = true;
      console.log("Dragging ended:", event.object.name || "Object");
    });
  },
  undefined,
  function (error) {
    console.error(error);
  }
);

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
  renderer.setClearColor(0xffffff);
  // cube.rotation.x += 0.01;
  // cube.rotation.y += 0.01;
}

animate();

//? Dragcontrols

//* Load table
gltfLoader.load(
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

// gltfLoader.load(
//   "public/plastic_bottle/scene.gltf",
//   function (gltf) {
//     // draggableObjects.push(gltf.scene);
//     console.log(gltf.scene);

//     scene.add(gltf.scene);
//   },
//   undefined,
//   function (error) {
//     console.error(error);
//   }
// );

// 3. Initialize DragControls after the object is loaded
const dragControls = new DragControls(
  draggableObjects,
  camera,
  renderer.domElement
);

// Optional: Add event listeners for drag start and end
dragControls.addEventListener("dragstart", function (event) {
  console.log(event.object.name);

  // Disable camera controls if you have them
  // if (controls) controls.enabled = false;
  console.log("Dragging started:", event.object.name || "Object");
});

dragControls.addEventListener("dragend", function (event) {
  // Enable camera controls if you have them
  // if (controls) controls.enabled = true;
  console.log("Dragging ended:", event.object.name || "Object");
});

// 5. Handle window resizing (same as before)
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
