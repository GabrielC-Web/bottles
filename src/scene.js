import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { DragControls } from "three/addons/controls/DragControls.js";

//? loader

let loaderWrapper = document.getElementById("loader_wrapper");

let loaderShowing = false;

function showLoader() {
  loaderWrapper.style.display = "flex";
  loaderShowing = true;
}

showLoader();

function hideLoader() {
  loaderWrapper.style.display = "none";
  loaderShowing = false;
}

const manager = new THREE.LoadingManager();
let object1Loaded = false;
let object2Loaded = false;
let object3Loaded = false;

manager.onLoad = function () {
  if (object1Loaded && object2Loaded && object3Loaded) {
    hideLoader();
    randomizeColorOrder();
  }
};

//? canvas

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
camera.position.set(-98.35374251518651, 143.65587899841853, 512.9849389396451);
camera.rotation.set(
  -0.2313118437861124,
  0.0027790761414263395,
  0.0006545480628923982
);

camera.lookAt(0, 0, 0);

camera.aspect = window.innerWidth / window.innerHeight;

//? Grid helper

const size = 300;
const divisions = 30;

// const gridHelper = new THREE.GridHelper(size, divisions);
// scene.add(gridHelper);

//? Custom functions

/**
 * Retorna el objeto que se busca por la propiedad
 * @param {*} name
 * @param {*} value
 * @returns
 */
THREE.Object3D.prototype.getObjectByUserDataProperty = function (name, value) {
  if (this.userData[name] === value) return this;

  for (var i = 0, l = this.children.length; i < l; i++) {
    var child = this.children[i];
    var object = child.getObjectByUserDataProperty(name, value);

    if (object !== undefined) {
      return object;
    }
  }

  return undefined;
};

//? Light
// Create an AmbientLight
const ambientLight = new THREE.AmbientLight(0xf1f1f1); // Soft white light

const spotLight = new THREE.SpotLight(0xffffff, 80000, 1000, 2, 1);
spotLight.position.set(-100, 150, 0);
spotLight.castShadow = true;
// spotLight.shadow.bias = -0.0001;
scene.add(spotLight, ambientLight);

//? light helper

const lightHelper = new THREE.PointLightHelper(spotLight);

// scene.add(lightHelper);

// Add it to the scene
// scene.add(ambientLight);

//? Model
const gltfLoader = new GLTFLoader();

/**
 * Genera el plano
 */
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
  object1Loaded = true;
  manager.onLoad();
}

/**
 * Genera las botellas
 * @param {} bottle
 */
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

/**
 * Genera la mesa
 */
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
      object2Loaded = true;
      manager.onLoad();
    },
    undefined,
    function (error) {
      console.error(error);
    }
  );
}

/**
 * Distribuye las botellas inicialmente
 */
function loadDistributedBottles() {
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

  object3Loaded = true;
  manager.onLoad();
}

//? Orbit control

const controls = new OrbitControls(camera, renderer.domElement);

controls.enabled = false;

//* Importante para cambiar el centro de la animación
controls.target.set(-99.88510426648482, 17.32941556795639, -23.37041586849576);

controls.addEventListener("change", () => {
  // This function will be called whenever the camera or target changes
  // console.log("Camera position:", camera.position);
  // console.log("Camera rotation:", camera.rotation);
  // console.log("Camera target:", controls.target);
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

/**
 * Limita el uso del drag and drop
 */
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
    // if (controls) controls.enabled = true;
    calculatePositions(event.object);
  });
}

//? load animation
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}

loadPlane();
loadTable();
loadDistributedBottles();
setDragControls();
animate();

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

//? Lógica del juego

let gameLost = false;

/**
 * Analiza la posición de cada botella
 * @param {*} object
 */
function calculatePositions(object) {
  let movedBottleIndex = bottles.findIndex((bottle) =>
    object.userData.name.includes(bottle.name)
  );

  bottles[movedBottleIndex].position.x = object.position.x;
  bottles[movedBottleIndex].position.y = object.position.y;
  bottles[movedBottleIndex].position.z = object.position.z;

  bottles.sort((a, b) => a.position.x - b.position.x);

  checkCorrectOrder();
}

/**
 * Limita las coordenadas de drag and drop a las que puedo llegar
 * @param {*} position
 */
function limitPositions(position) {
  if (position.z < -0.01) {
    maxX = -0.87;
  } else {
    maxX = 0.6;
  }
}

let attemps = 0;

let colorOrder = ["red", "yellow", "blue", "orange", "green"];

/**
 * Cambia la secuencia de colores que debo adivinar
 */
function randomizeColorOrder() {
  const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = array[i];
      array[i] = array[j];
      array[j] = temp;
    }

    return array;
  };

  colorOrder = shuffleArray(colorOrder);
}

/**
 * Verifica que las botellas estén en el orden correcto
 */
function checkCorrectOrder() {
  /**
   * Cantidad de matches
   */
  let matchsNumber = 0;

  /**
   * La cantidad de botellas sobre la mesa
   */
  let bottlesInPosition = 0;

  clearTimeout(timeout);

  bottles.forEach((bottle, i) => {
    //* Veo cuántas están en posición
    if (
      bottle.position.x >= -0.87 &&
      bottle.position.z >= -0.01 &&
      bottlesInPosition < 5
    ) {
      bottlesInPosition += 1;
    }

    //* Veo cuántos matchs de posición hay
    colorOrder.forEach((color, j) => {
      if (
        bottle.name == color &&
        i == j &&
        bottle.position.x >= -0.87 &&
        bottle.position.z >= -0.01
      ) {
        matchsNumber += 1;
      }
    });
  });

  /**
   * Cuento los intentos una vez que todas las botellas están en la mesa
   */
  if (bottlesInPosition == 5) {
    attemps += 1;
  }

  /**
   * Si supero gasto todos los intentos y no completé todos los matchs, entonces pierdo
   */
  if (attemps >= 200 && matchsNumber < 5) {
    attemps = 0;
    matchsNumber = 0;
    gameLost = true;
    bottlesInPosition = 0;
    dragControls.enabled = false;
    showDefeat();
  } else if (bottlesInPosition == 5 && matchsNumber < 5) {
    showHits(matchsNumber);
  } else if (matchsNumber == 5) {
    showVictory();
    attemps = 0;
    matchsNumber = 0;
    bottlesInPosition = 0;
  }
}

/**
 * Resetea el juego
 */
function resetGame() {
  dragControls.enabled = true;
  gameLost = false;
  repositionBottles();
  randomizeColorOrder();
}

/**
 * Coloca las botellas en su posición base
 */
function repositionBottles() {
  let startX = -1.6;

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

  bottles.forEach((bottle, i) => {
    let obj = scene.getObjectByUserDataProperty(
      "name",
      `${"bottle_" + bottle.name}`
    );

    obj.traverse((node) => {
      if (node.isMesh) {
        node.position.set(startX + 0.15 * i, 0, -0.66);
      }
    });
  });
}

//? Diálogos

/**
 * Diálogo de guía
 */
let dialog = document.getElementById("guide_dialog");

/**
 * Timeout para cierre del mensaje de aciertos
 */
let timeout;

/**
 * Índice de la guía del diálogo
 */
let guideIndex = 0;

/**
 * Partes de la guía del diálogo
 */
const guideParts = [
  `<div>
    <p>Bienvenida(o), este juego es bien sencillo. Debes adivinar el orden de los colores y acomodar las botellas según
      corresponda el orden.
    </p>
  </div>`,
  `<div>
    <p>El puntaje final depende de la cantidad de intentos que te haya tomado conseguirlo!
    </p>
  </div>`,
];

/**
 * Setea el HTML de la guía
 */
document.querySelector("#help_content").innerHTML = `
  ${guideParts[guideIndex]}
`;

/**
 * Abre la guía
 * @returns
 */
function openGuide() {
  if (loaderShowing) {
    return;
  }
  dialog.style.display = "flex";
  dialog.showModal();
}

/**
 * Cierra la guía
 */
function closeGuide() {
  dialog.style.display = "none";
  dialog.close();
}

//* Por defecto empieza abierta
openGuide();

/**
 * Actualiza el contenido del diálogo de ayuda
 */
function setHelpContent() {
  let element = document.getElementById("help_content");

  element.innerHTML = guideParts[guideIndex];
}

function removeDialog() {
  let notesElement = document.getElementById("notifications");
  notesElement.classList.remove("notifications");
}

function showDialog() {
  let notesElement = document.getElementById("notifications");
  notesElement.classList.add("notifications");
}

/**
 * Diálogo de aciertos
 * @param {*} hitsAmount
 */
function showHits(hitsAmount) {
  clearTimeout(timeout);
  removeDialog();
  showDialog();
  let notesElement = document.getElementById("notifications");

  notesElement.innerHTML = `<span class="score_notification">Tienes ${hitsAmount} aciert${
    hitsAmount > 1 ? "os" : "o"
  }!</span>`;

  timeout = setTimeout(() => {
    removeDialog();
    clearTimeout(timeout);
  }, 3000);
}

/**
 * Diálogo de derrota
 */
function showDefeat() {
  removeDialog();
  showDialog();

  let notesElement = document.getElementById("notifications");

  notesElement.innerHTML = `<span class="victory_notification">Sorry, bro, intenta de nuevo</span> 
  <button id="reload_button">
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-rotate-cw-icon lucide-rotate-cw"><path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/></svg>
  </button>`;

  document.getElementById("reload_button")?.addEventListener("click", (e) => {
    resetGame();
    removeDialog();
  });
}

/**
 * Diálogo de victoria
 */
function showVictory() {
  removeDialog();
  showDialog();
  let notesElement = document.getElementById("notifications");

  notesElement.innerHTML = `<span class="victory_notification">Conseguiste la combinación! <br> Y solo te tomó ${attemps} intent${
    attemps > 1 ? "os" : "o"
  }.</span> 
  <button id="reload_button">
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-rotate-cw-icon lucide-rotate-cw"><path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/></svg>
  </button>`;

  document.getElementById("reload_button")?.addEventListener("click", (e) => {
    resetGame();
    removeDialog();
  });
}
//? Listeners de botones
document.getElementById("open_button").addEventListener("click", (e) => {
  openGuide();
});

document.getElementById("close_button")?.addEventListener("click", (e) => {
  closeGuide();
});

document.getElementById("prev_button")?.addEventListener("click", (e) => {
  if (guideIndex > 0) {
    guideIndex--;
  } else {
    guideIndex = 0;
  }
  setHelpContent();
});

document.getElementById("next_button")?.addEventListener("click", (e) => {
  if (guideIndex < guideParts.length - 1) {
    guideIndex++;
    setHelpContent();
  } else {
    closeGuide();
  }
});
