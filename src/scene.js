import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { DragControls } from "three/addons/controls/DragControls.js";

const scene = new THREE.Scene();
const canvas = document.getElementById("renderer");

//? Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true, canvas: canvas });
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.setClearColor(0x0000000);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

//? Camera
const camera = new THREE.PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(-97.50289274085992, 147.53651249900219, 456.95360079934767);
camera.rotation.set(
  -0.3116052508897749,
  0.019850784858688877,
  0.006393398664596768
);

camera.lookAt(0, 0, 0);

camera.aspect = window.innerWidth / window.innerHeight;

//? Grid helper

const size = 300;
const divisions = 30;

// const gridHelper = new THREE.GridHelper(size, divisions);
// scene.add(gridHelper);

//? Light
// Create an AmbientLight
const ambientLight = new THREE.AmbientLight(0xf1f1f1); // Soft white light

const spotLight = new THREE.SpotLight(0xffffff, 80000, 1000, 2, 1);
spotLight.position.set(-100, 150, 0);
spotLight.castShadow = true;
// spotLight.shadow.bias = -0.0001;
scene.add(spotLight, ambientLight);

//? helper

const lightHelper = new THREE.PointLightHelper(spotLight);

// scene.add(lightHelper);

// Add it to the scene
// scene.add(ambientLight);

//? Model
const gltfLoader = new GLTFLoader();

//? Control

const controls = new OrbitControls(camera, renderer.domElement);

// controls.enabled = false;

//* Importante para cambiar el centro de la animación
controls.target.set(
  -105.78837752605038,
  8.963502694206033,
  -21.383158308688806
);

controls.addEventListener("change", () => {
  // This function will be called whenever the camera or target changes
  // console.log("Camera position:", camera.position);
  // console.log("Camera rotation:", camera.rotation);
  // Perform actions based on the updated camera or target
});

//? Dragcontrols
let draggableObjects = [];

let bottles = [];

//* Límites de movimiento de las botellas

let minX = -1.6; // Minimum X-coordinate
let maxX = -0.6; // Maximum X-coordinate
let minY = 0; // Minimum Y-coordinate
let maxY = 0; // Maximum Y-coordinate
let minZ = -0.66; // Minimum Z-coordinate
let maxZ = 0.4; // Maximum Z-coordinate

// 3. Initialize DragControls after the object is loaded
const dragControls = new DragControls(
  draggableObjects,
  camera,
  renderer.domElement
);

//? Raycasting

// const raycaster = new THREE.Raycaster();
// const origin = new THREE.Vector3(0, 0, 0); // Position to check
// const direction = new THREE.Vector3(0, 0, -1); // Adjust direction if needed
// direction.normalize();

// raycaster.set(origin, direction);

// const intersectedObjects = raycaster.intersectObjects(scene.children);

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}

loadPlane();
loadTable();
distributeBottles();
setDragControls();
animate();

// 5. Handle window resizing (same as before)
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

function loadPlane() {
  const groundGeometry = new THREE.PlaneGeometry(500, 200, 32, 32);
  const groundMaterial = new THREE.MeshStandardMaterial({
    color: 0x555555,
    side: THREE.DoubleSide,
  });
  groundGeometry.rotateX(-Math.PI / 2);
  const groundMesh = new THREE.Mesh(groundGeometry, groundMaterial);

  groundMesh.castShadow = false;
  groundMesh.receiveShadow = true;

  groundMesh.position.set(-100, -100, 0);
  scene.add(groundMesh);
}

function loadBottle(bottle) {
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

          node.castShadow = true;
          node.receiveShadow = true;

          materials.forEach((material) => {
            // If the material has a color property (e.g., MeshStandardMaterial, MeshBasicMaterial)
            if (material.color) {
              material.color.set(bottle.color); // Change to red (you can use any valid color value)
            }
            // For materials with emissive properties
            if (material.emissive) {
              material.emissive.set(bottle.color); // Change emissive color to blue
            }
          });

          //* Oculto la tapa
          if (node.userData.name == "Bottle_Bottle2_0") {
            node.visible = false;
          } else {
            node.userData.name = `bottle_${bottle.name}`;
          }

          //* Seteo la posición inicial
          node.position.x = bottle.position.x;
          node.position.y = bottle.position.y;
          node.position.z = bottle.position.z;
        }
      });

      model.userData.name = `bottle_${bottle.name}`;

      model.scale.set(150, 150, 150);

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
      gltf.scene.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });

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
  // Optional: Add event listeners for drag start and end
  dragControls.addEventListener("dragstart", function (event) {
    // Disable camera controls if you have them
    if (controls) controls.enabled = false;
  });
  // Optional: Add event listeners for drag start and end
  dragControls.addEventListener("drag", function (event) {
    const object = event.object;

    limitPositions(object.position);

    object.position.x = Math.max(minX, Math.min(maxX, object.position.x));
    object.position.y = Math.max(minY, Math.min(maxY, object.position.y));
    object.position.z = Math.max(minZ, Math.min(maxZ, object.position.z));
  });

  dragControls.addEventListener("dragend", function (event) {
    // Enable camera controls if you have them
    if (controls) controls.enabled = true;
    calculatePositions(event.object);
  });
}

function distributeBottles() {
  bottles = [
    {
      position: { x: -1.6, y: 0, z: -0.66 },
      color: "#0011FF",
      name: "blue",
    },
    {
      position: { x: -1.45, y: 0, z: -0.66 },
      color: "#15FF00",
      name: "green",
    },
    {
      position: {
        x: -1.3,
        y: 0,
        z: -0.66,
      },
      color: "#FDFF00",
      name: "yellow",
    },
    {
      position: { x: -1.15, y: 0, z: -0.66 },
      color: "#FF9A00",
      name: "orange",
    },
    {
      position: { x: -1, y: 0, z: -0.66 },
      color: "#FF0000",
      name: "red",
    },
  ];

  bottles.forEach((bottle) => {
    loadBottle(bottle);
  });
}

//? Lógica del juego

function calculatePositions(object) {
  let movedBottleIndex = bottles.findIndex((bottle) =>
    object.userData.name.includes(bottle.name)
  );

  console.log(object.position);

  bottles[movedBottleIndex].position.x = object.position.x;
  bottles[movedBottleIndex].position.y = object.position.y;
  bottles[movedBottleIndex].position.z = object.position.z;

  bottles.sort((a, b) => a.position.x - b.position.x);

  checkCorrectOrder();
}

function limitPositions(position) {
  if (position.z < -0.01) {
    maxX = -0.87;
  } else {
    maxX = 0.6;
  }
}

function checkCorrectOrder() {
  let colorOrder = ["red", "yellow", "blue", "orange", "green"];
  let matchsNumber = 0;

  bottles.forEach((bottle, i) => {
    colorOrder.forEach((color, j) => {
      if (bottle.name == color && i == j && bottle.position.z >= -0.01) {
        matchsNumber += 1;
      }
    });
  });

  console.log(`${matchsNumber} aciertos!`);
}

//? Controles del juego

function openGuide() {
  let dialog = document.getElementById("guide_dialog");

  dialog.showModal();
}

openGuide();

export function closeGuide() {
  let dialog = document.getElementById("guide_dialog");
  let button = document.getElementById("close_button");

  button.addEventListener("click", (e) => {
    dialog.close();
  });
}
closeGuide();
