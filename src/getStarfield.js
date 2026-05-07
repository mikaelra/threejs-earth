import * as THREE from "three";

function raDecToVector3(ra, dec, radius = 50) {
  // ra: [hours, minutes, seconds]
  // dec: [degrees, arcminutes, arcseconds] (negative degree = southern hemisphere)
  const raHours = ra[0] + ra[1] / 60 + ra[2] / 3600;
  const raRad = raHours * (Math.PI / 12); // 2π / 24

  const decSign = dec[0] < 0 ? -1 : 1;
  const decDeg = Math.abs(dec[0]) + dec[1] / 60 + dec[2] / 3600;
  const decRad = decSign * decDeg * (Math.PI / 180);

  // Equatorial → Three.js (Y-up, right-handed)
  const x = radius * Math.cos(decRad) * Math.cos(raRad);
  const y = radius * Math.sin(decRad);
  const z = -radius * Math.cos(decRad) * Math.sin(raRad);

  return new THREE.Vector3(x, y, z);
}

export default function getStarfield({ stars = [] } = {}) {
  const verts = [];
  const colors = [];
  const white = new THREE.Color(0xffffff);

  for (const star of stars) {
    const pos = raDecToVector3(star.ra, star.dec);
    verts.push(pos.x, pos.y, pos.z);
    colors.push(white.r, white.g, white.b);
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(verts, 3));
  geo.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));

  const mat = new THREE.PointsMaterial({
    size: 0.3,
    vertexColors: true,
    map: new THREE.TextureLoader().load("./textures/stars/circle.png"),
  });

  return new THREE.Points(geo, mat);
}
