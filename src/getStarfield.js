import * as THREE from "three";

// ra: [hours, minutes]  dec: decimal degrees  mag: visual magnitude
function raDecToVector3(ra, dec, radius = 50) {
  const raRad = (ra[0] + ra[1] / 60) * (Math.PI / 12);
  const decRad = dec * (Math.PI / 180);
  return new THREE.Vector3(
    radius * Math.cos(decRad) * Math.cos(raRad),
    radius * Math.sin(decRad),
    -radius * Math.cos(decRad) * Math.sin(raRad)
  );
}

export default function getStarfield({ stars = [] } = {}) {
  // Size bands keyed by maximum visual magnitude
  const BANDS = [
    { maxMag: 0.0,      size: 0.55 },
    { maxMag: 1.5,      size: 0.42 },
    { maxMag: 2.5,      size: 0.30 },
    { maxMag: 3.0,      size: 0.20 },
    { maxMag: Infinity, size: 0.13 },
  ];

  const groups = BANDS.map(() => ({ verts: [], colors: [] }));
  const MIN_MAG = -1.46, MAX_MAG = 3.54;

  for (const star of stars) {
    const pos = raDecToVector3(star.ra, star.dec);
    const bandIdx = BANDS.findIndex(b => star.mag <= b.maxMag);
    // Map magnitude linearly to brightness: brightest star → 1.0, faintest → 0.4
    const intensity = 0.4 + 0.6 * (MAX_MAG - star.mag) / (MAX_MAG - MIN_MAG);
    groups[bandIdx].verts.push(pos.x, pos.y, pos.z);
    groups[bandIdx].colors.push(intensity, intensity, intensity);
  }

  const group = new THREE.Group();
  const tex = new THREE.TextureLoader().load('./textures/stars/circle.png');

  BANDS.forEach((band, i) => {
    const { verts, colors } = groups[i];
    if (verts.length === 0) return;
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3));
    geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    const mat = new THREE.PointsMaterial({
      size: band.size,
      vertexColors: true,
      map: tex,
      transparent: true,
      depthWrite: false,
    });
    group.add(new THREE.Points(geo, mat));
  });

  return group;
}
