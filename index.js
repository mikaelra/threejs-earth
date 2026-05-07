import * as THREE from "three";
import { OrbitControls } from 'jsm/controls/OrbitControls.js';

import getStarfield from "./src/getStarfield.js";
import { getFresnelMat } from "./src/getFresnelMat.js";

const w = window.innerWidth;
const h = window.innerHeight;
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, w / h, 0.1, 1000);
camera.position.z = 5;
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(w, h);
document.body.appendChild(renderer.domElement);
// THREE.ColorManagement.enabled = true;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.outputColorSpace = THREE.LinearSRGBColorSpace;

const earthGroup = new THREE.Group();
earthGroup.rotation.z = -23.4 * Math.PI / 180;
scene.add(earthGroup);
new OrbitControls(camera, renderer.domElement);
const detail = 12;
const loader = new THREE.TextureLoader();
const geometry = new THREE.IcosahedronGeometry(1, detail);
const material = new THREE.MeshPhongMaterial({
  map: loader.load("./textures/00_earthmap1k.jpg"),
  specularMap: loader.load("./textures/02_earthspec1k.jpg"),
  bumpMap: loader.load("./textures/01_earthbump1k.jpg"),
  bumpScale: 0.04,
});
// material.map.colorSpace = THREE.SRGBColorSpace;
const earthMesh = new THREE.Mesh(geometry, material);
earthGroup.add(earthMesh);

const lightsMat = new THREE.MeshBasicMaterial({
  map: loader.load("./textures/03_earthlights1k.jpg"),
  blending: THREE.AdditiveBlending,
});
const lightsMesh = new THREE.Mesh(geometry, lightsMat);
earthGroup.add(lightsMesh);

const cloudsMat = new THREE.MeshStandardMaterial({
  map: loader.load("./textures/04_earthcloudmap.jpg"),
  transparent: true,
  opacity: 0.8,
  blending: THREE.AdditiveBlending,
  alphaMap: loader.load('./textures/05_earthcloudmaptrans.jpg'),
  // alphaTest: 0.3,
});
const cloudsMesh = new THREE.Mesh(geometry, cloudsMat);
cloudsMesh.scale.setScalar(1.003);
earthGroup.add(cloudsMesh);

const fresnelMat = getFresnelMat();
const glowMesh = new THREE.Mesh(geometry, fresnelMat);
glowMesh.scale.setScalar(1.01);
earthGroup.add(glowMesh);

// Star catalog — RA: [hours, minutes, seconds], Dec: [degrees, arcminutes, arcseconds]
// Negative Dec degrees = southern hemisphere
const starCatalog = [
  // Ursa Major
  { name: "Alioth", ra: [12, 54,  2], dec: [ 55, 57, 35] },
  { name: "Dubhe",  ra: [11,  3, 44], dec: [ 61, 45,  4] },
  { name: "Merak",  ra: [11,  1, 50], dec: [ 56, 22, 57] },
  { name: "Phecda", ra: [11, 53, 50], dec: [ 53, 41, 41] },
  { name: "Megrez", ra: [12, 15, 26], dec: [ 57,  1, 57] },
  { name: "Mizar",  ra: [13, 23, 56], dec: [ 54, 55, 31] },
  { name: "Alkaid", ra: [13, 47, 32], dec: [ 49, 18, 48] },

  // Ursa Minor
  { name: "Polaris", ra: [ 2, 31, 49], dec: [ 89, 15, 51] },
  { name: "Kochab",  ra: [14, 50, 42], dec: [ 74,  9, 20] },
  { name: "Pherkad", ra: [15, 20, 44], dec: [ 71, 50,  2] },
  { name: "Yildun",  ra: [17, 32, 13], dec: [ 86, 35, 11] },
  { name: "Epsilon UMi", ra: [16, 45, 58], dec: [ 82,  2, 14] },
  { name: "Zeta UMi",    ra: [15, 44,  4], dec: [ 77, 47, 40] },
  { name: "Eta UMi",     ra: [16, 17, 30], dec: [ 75, 45, 19] },

  // Cassiopeia
  { name: "Schedar",   ra: [ 0, 40, 30], dec: [ 56, 32, 15] },
  { name: "Caph",      ra: [ 0,  9, 11], dec: [ 59,  8, 59] },
  { name: "Gamma Cas", ra: [ 0, 56, 43], dec: [ 60, 43,  0] },
  { name: "Ruchbah",   ra: [ 1, 25, 49], dec: [ 60, 14,  7] },
  { name: "Segin",     ra: [ 1, 54, 24], dec: [ 63, 40, 12] },

  // Perseus
  { name: "Mirfak",     ra: [ 3, 24, 19], dec: [ 49, 51, 40] },
  { name: "Algol",      ra: [ 3,  8, 10], dec: [ 40, 57, 20] },
  { name: "Gamma Per",  ra: [ 3,  4, 48], dec: [ 53, 30, 23] },
  { name: "Delta Per",  ra: [ 3, 42, 55], dec: [ 47, 47, 15] },
  { name: "Epsilon Per",ra: [ 3, 57, 52], dec: [ 40,  0, 37] },
  { name: "Zeta Per",   ra: [ 3, 54,  8], dec: [ 31, 53,  1] },

  // Andromeda
  { name: "Alpheratz", ra: [ 0,  8, 23], dec: [ 29,  5, 26] },
  { name: "Mirach",    ra: [ 1,  9, 44], dec: [ 35, 37, 14] },
  { name: "Almach",    ra: [ 2,  3, 54], dec: [ 42, 19, 47] },
  { name: "Delta And", ra: [ 0, 39, 20], dec: [ 30, 51, 40] },

  // Orion
  { name: "Betelgeuse", ra: [ 5, 55, 10], dec: [  7, 24, 25] },
  { name: "Rigel",      ra: [ 5, 14, 32], dec: [ -8, 12,  6] },
  { name: "Bellatrix",  ra: [ 5, 25,  8], dec: [  6, 20, 59] },
  { name: "Mintaka",    ra: [ 5, 32,  0], dec: [ -0, 17, 57] },
  { name: "Alnilam",    ra: [ 5, 36, 13], dec: [ -1, 12,  7] },
  { name: "Alnitak",    ra: [ 5, 40, 46], dec: [ -1, 56, 34] },
  { name: "Saiph",      ra: [ 5, 47, 45], dec: [ -9, 40, 11] },

  // Taurus
  { name: "Aldebaran", ra: [ 4, 35, 55], dec: [ 16, 30, 33] },
  { name: "Elnath",    ra: [ 5, 26, 18], dec: [ 28, 36, 27] },
  { name: "Alcyone",   ra: [ 3, 47, 29], dec: [ 24,  6, 18] },
  { name: "Ain",       ra: [ 4, 28, 37], dec: [ 19, 10, 50] },
  { name: "Delta Tau", ra: [ 4, 22, 56], dec: [ 17, 32, 33] },
  { name: "Zeta Tau",  ra: [ 5, 37, 39], dec: [ 21,  8, 33] },

  // Gemini
  { name: "Castor",   ra: [ 7, 34, 36], dec: [ 31, 53, 18] },
  { name: "Pollux",   ra: [ 7, 45, 19], dec: [ 28,  1, 35] },
  { name: "Alhena",   ra: [ 6, 37, 43], dec: [ 16, 23, 57] },
  { name: "Wasat",    ra: [ 7, 20,  8], dec: [ 21, 58, 56] },
  { name: "Mebsuda",  ra: [ 6, 43, 56], dec: [ 25,  7, 52] },
  { name: "Mekbuda",  ra: [ 7,  4,  7], dec: [ 20, 34, 13] },
  { name: "Propus",   ra: [ 6, 14, 53], dec: [ 22, 30, 24] },
  { name: "Mu Gem",   ra: [ 6, 22, 58], dec: [ 22, 30, 49] },

  // Cancer
  { name: "Altarf",            ra: [ 8, 16, 31], dec: [  9, 11,  8] },
  { name: "Acubens",           ra: [ 8, 58, 29], dec: [ 11, 51, 28] },
  { name: "Asellus Borealis",  ra: [ 8, 43, 17], dec: [ 21, 28,  7] },
  { name: "Asellus Australis", ra: [ 8, 44, 41], dec: [ 18,  9, 16] },

  // Leo
  { name: "Regulus",   ra: [10,  8, 22], dec: [ 11, 58,  2] },
  { name: "Denebola",  ra: [11, 49,  4], dec: [ 14, 34, 19] },
  { name: "Algieba",   ra: [10, 19, 58], dec: [ 19, 50, 30] },
  { name: "Zosma",     ra: [11, 14,  7], dec: [ 20, 31, 25] },
  { name: "Epsilon Leo", ra: [ 9, 45, 51], dec: [ 23, 46, 27] },
  { name: "Adhafera",  ra: [10, 16, 41], dec: [ 23, 25,  2] },
  { name: "Eta Leo",   ra: [10,  7, 20], dec: [ 16, 45, 45] },

  // Virgo
  { name: "Spica",        ra: [13, 25, 12], dec: [-11,  9, 41] },
  { name: "Porrima",      ra: [12, 41, 40], dec: [ -1, 26, 58] },
  { name: "Vindemiatrix", ra: [13,  2, 11], dec: [ 10, 57, 33] },
  { name: "Delta Vir",    ra: [12, 55, 37], dec: [  3, 23, 51] },
  { name: "Zeta Vir",     ra: [13, 34, 42], dec: [ -0, 35, 45] },
  { name: "Zavijava",     ra: [11, 50, 42], dec: [  1, 45, 53] },

  // Libra
  { name: "Zubeneschamali", ra: [15, 17,  0], dec: [ -9, 22, 59] },
  { name: "Zubenelgenubi",  ra: [14, 50, 53], dec: [-16,  2, 30] },
  { name: "Sigma Lib",      ra: [15,  4,  4], dec: [-25, 16, 55] },
  { name: "Gamma Lib",      ra: [15, 35, 32], dec: [-14, 47, 22] },

  // Scorpius
  { name: "Antares",  ra: [16, 29, 24], dec: [-26, 25, 55] },
  { name: "Shaula",   ra: [17, 33, 37], dec: [-37,  6, 14] },
  { name: "Sargas",   ra: [17, 37, 19], dec: [-42, 59, 52] },
  { name: "Dschubba", ra: [16,  0, 20], dec: [-22, 37, 18] },
  { name: "Epsilon Sco", ra: [16, 50, 10], dec: [-34, 17, 36] },
  { name: "Graffias", ra: [16,  5, 26], dec: [-19, 48, 20] },
  { name: "Tau Sco",  ra: [16, 35, 53], dec: [-28, 12, 58] },
  { name: "Eta Sco",  ra: [17, 12,  9], dec: [-43, 14, 21] },
  { name: "Iota Sco", ra: [17, 47, 35], dec: [-40,  7, 37] },
  { name: "Kappa Sco",ra: [17, 42, 29], dec: [-39,  1, 48] },
  { name: "Upsilon Sco",ra:[17, 30, 46], dec: [-37, 17, 45] },

  // Sagittarius
  { name: "Kaus Australis", ra: [18, 24, 10], dec: [-34, 23,  5] },
  { name: "Nunki",          ra: [18, 55, 16], dec: [-26, 17, 48] },
  { name: "Ascella",        ra: [19,  2, 37], dec: [-29, 52, 48] },
  { name: "Kaus Borealis",  ra: [18, 27, 58], dec: [-25, 25, 18] },
  { name: "Delta Sgr",      ra: [18, 21,  0], dec: [-29, 49, 41] },
  { name: "Gamma Sgr",      ra: [18,  5, 48], dec: [-30, 25, 27] },
  { name: "Eta Sgr",        ra: [18, 17, 38], dec: [-36, 45, 42] },
  { name: "Tau Sgr",        ra: [19,  6, 57], dec: [-27, 40, 13] },

  // Capricornus
  { name: "Deneb Algedi", ra: [21, 47,  3], dec: [-16,  7, 38] },
  { name: "Dabih",        ra: [20, 21,  1], dec: [-14, 46, 53] },
  { name: "Algedi",       ra: [20, 18,  4], dec: [-12, 32, 41] },
  { name: "Nashira",      ra: [21, 40,  5], dec: [-16, 39, 44] },

  // Aquarius
  { name: "Sadalsuud",  ra: [21, 31, 34], dec: [ -5, 34, 16] },
  { name: "Sadalmelik", ra: [22,  5, 47], dec: [ -0, 19, 11] },
  { name: "Skat",       ra: [22, 54, 39], dec: [-15, 49, 15] },
  { name: "Zeta Aqr",  ra: [22, 28, 50], dec: [ -0,  1, 12] },

  // Pisces
  { name: "Eta Psc",   ra: [ 1, 31, 29], dec: [ 15, 20, 45] },
  { name: "Gamma Psc", ra: [23, 17, 10], dec: [  3, 16, 56] },
  { name: "Omega Psc", ra: [23, 59, 21], dec: [  6, 51, 48] },
  { name: "Iota Psc",  ra: [23, 39, 57], dec: [  5, 37, 35] },

  // Aries
  { name: "Hamal",     ra: [ 2,  7, 10], dec: [ 23, 27, 45] },
  { name: "Sheratan",  ra: [ 1, 54, 38], dec: [ 20, 48, 29] },
  { name: "Mesarthim", ra: [ 1, 53, 32], dec: [ 19, 17, 45] },

  // Boötes
  { name: "Arcturus", ra: [14, 15, 40], dec: [ 19, 10, 57] },
  { name: "Izar",     ra: [14, 44, 59], dec: [ 27,  4, 27] },
  { name: "Muphrid",  ra: [13, 54, 41], dec: [ 18, 23, 52] },
  { name: "Seginus",  ra: [14, 32,  5], dec: [ 38, 18, 30] },
  { name: "Delta Boo",ra: [15, 15, 30], dec: [ 33, 18, 54] },
  { name: "Beta Boo", ra: [15,  1, 57], dec: [ 40, 23, 26] },

  // Hercules
  { name: "Rasalgethi",  ra: [17, 14, 39], dec: [ 14, 23, 25] },
  { name: "Kornephoros", ra: [16, 30, 13], dec: [ 21, 29, 23] },
  { name: "Zeta Her",   ra: [16, 41, 18], dec: [ 31, 36, 10] },
  { name: "Delta Her",  ra: [17, 15,  2], dec: [ 24, 50, 21] },
  { name: "Pi Her",     ra: [17, 15,  3], dec: [ 36, 48, 33] },
  { name: "Eta Her",    ra: [16, 42, 54], dec: [ 38, 55, 20] },

  // Lyra
  { name: "Vega",    ra: [18, 36, 56], dec: [ 38, 47,  1] },
  { name: "Sheliak", ra: [18, 50,  5], dec: [ 33, 21, 46] },
  { name: "Sulafat", ra: [18, 58, 57], dec: [ 32, 41, 22] },
  { name: "Delta Lyr", ra: [18, 54, 30], dec: [ 36, 53, 55] },

  // Cygnus
  { name: "Deneb",    ra: [20, 41, 26], dec: [ 45, 16, 49] },
  { name: "Albireo",  ra: [19, 30, 43], dec: [ 27, 57, 35] },
  { name: "Sadr",     ra: [20, 22, 14], dec: [ 40, 15, 24] },
  { name: "Gienah",   ra: [20, 46, 13], dec: [ 33, 58, 13] },
  { name: "Delta Cyg",ra: [19, 44, 59], dec: [ 45,  7, 51] },

  // Aquila
  { name: "Altair",   ra: [19, 50, 47], dec: [  8, 52,  6] },
  { name: "Tarazed",  ra: [19, 46, 16], dec: [ 10, 36, 48] },
  { name: "Alshain",  ra: [19, 55, 19], dec: [  6, 24, 24] },
  { name: "Delta Aql",ra: [19, 25, 30], dec: [  3,  6, 53] },
  { name: "Zeta Aql", ra: [19,  5, 25], dec: [ 13, 51, 49] },

  // Canis Major
  { name: "Sirius",  ra: [ 6, 45,  9], dec: [-16, 42, 58] },
  { name: "Adhara",  ra: [ 6, 58, 38], dec: [-28, 58, 19] },
  { name: "Wezen",   ra: [ 7,  8, 24], dec: [-26, 23, 36] },
  { name: "Mirzam",  ra: [ 6, 22, 42], dec: [-17, 57, 21] },
  { name: "Aludra",  ra: [ 7, 24,  6], dec: [-29, 18, 11] },

  // Canis Minor
  { name: "Procyon", ra: [ 7, 39, 18], dec: [  5, 13, 30] },
  { name: "Gomeisa", ra: [ 7, 27,  9], dec: [  8, 17, 22] },
];
const stars = getStarfield({ stars: starCatalog });
scene.add(stars);

const sunLight = new THREE.DirectionalLight(0xffffff, 2.0);
sunLight.position.set(-2, 0.5, 1.5);
scene.add(sunLight);

function animate() {
  requestAnimationFrame(animate);

  earthMesh.rotation.y += 0.002;
  lightsMesh.rotation.y += 0.002;
  cloudsMesh.rotation.y += 0.0023;
  glowMesh.rotation.y += 0.002;
  stars.rotation.y -= 0.0002;
  renderer.render(scene, camera);
}

animate();

function handleWindowResize () {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}
window.addEventListener('resize', handleWindowResize, false);