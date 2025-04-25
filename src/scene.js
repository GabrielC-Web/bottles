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

camera.position.set(0, 80, 150);

//? Grid helper

const size = 300;
const divisions = 30;

// const gridHelper = new THREE.GridHelper(size, divisions);
// scene.add(gridHelper);

//? Light
// Create an AmbientLight
const ambientLight = new THREE.AmbientLight(0xf1f1f1); // Soft white light

// Add it to the scene
scene.add(ambientLight);

//? Model
const gltfLoader = new GLTFLoader();

//? Control

const controls = new OrbitControls(camera, renderer.domElement);

//? Dragcontrols
let draggableObjects = [];

// 3. Initialize DragControls after the object is loaded
const dragControls = new DragControls(
  draggableObjects,
  camera,
  renderer.domElement
);

//? Raycasting

const raycaster = new THREE.Raycaster();
const origin = new THREE.Vector3(0, 0, 0); // Position to check
const direction = new THREE.Vector3(0, 0, -1); // Adjust direction if needed
direction.normalize();

raycaster.set(origin, direction);

const intersectedObjects = raycaster.intersectObjects(scene.children);

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
  renderer.setClearColor(0xffffff);
}

loadBottle();
loadTable();
setDragControls();
animate();

// 5. Handle window resizing (same as before)
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

function loadBottle() {
  gltfLoader.load(
    "public/plastic_bottle/scene.gltf",
    function (gltf) {
      const model = gltf.scene;

      // Traverse all materials in the model
      model.traverse((node) => {
        if (node.isMesh && node.material) {
          // Check if the material is an array (for multi-materials)
          const materials = Array.isArray(node.material)
            ? node.material
            : [node.material];

          materials.forEach((material) => {
            // If the material has a color property (e.g., MeshStandardMaterial, MeshBasicMaterial)
            if (material.color) {
              material.color.set(0xff0000); // Change to red (you can use any valid color value)
            }
            // For materials with emissive properties
            if (material.emissive) {
              material.emissive.set(0x0000ff); // Change emissive color to blue
            }
          });
          node.position.x = -0.5;
        }
      });

      model.scale.set(100, 100, 100);

      draggableObjects.push(model);

      // model.position.x = 0;
      scene.add(model);
    },
    undefined,
    function (error) {
      console.error(error);
    }
  );
}

function loadTable() {
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
}

function setDragControls() {
  const minX = -1.1; // Minimum X-coordinate
  const maxX = 1.1; // Maximum X-coordinate
  const minY = 0; // Minimum Y-coordinate
  const maxY = 0; // Maximum Y-coordinate
  const minZ = -0.02; // Minimum Z-coordinate
  const maxZ = 0.4; // Maximum Z-coordinate

  // Optional: Add event listeners for drag start and end
  dragControls.addEventListener("dragstart", function (event) {
    console.log(event.object.name);

    // Disable camera controls if you have them
    if (controls) controls.enabled = false;
    console.log("Dragging started:", event.object.name || "Object");
  });
  // Optional: Add event listeners for drag start and end
  dragControls.addEventListener("drag", function (event) {
    const object = event.object;
    console.log(object.position);

    object.position.x = Math.max(minX, Math.min(maxX, object.position.x));
    object.position.y = Math.max(minY, Math.min(maxY, object.position.y));
    object.position.z = Math.max(minZ, Math.min(maxZ, object.position.z));
  });

  dragControls.addEventListener("dragend", function (event) {
    // Enable camera controls if you have them
    if (controls) controls.enabled = true;
    console.log("Dragging ended:", event.object.name || "Object");
  });
}
