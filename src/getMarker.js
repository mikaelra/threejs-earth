import * as THREE from 'three';

// Standard Three.js sphere convention: phi = colatitude, theta = azimuth
export function latLngToVector3(lat, lng, radius = 1.02) {
  const phi   = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -Math.sin(phi) * Math.cos(theta) * radius,
     Math.cos(phi) * radius,
     Math.sin(phi) * Math.sin(theta) * radius
  );
}

function markerTexture(label) {
  const W = 256, H = 300;
  const canvas = document.createElement('canvas');
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext('2d');

  const cx = W / 2;
  const cy = 110;      // cross centre
  const arm = 38;      // half-length of each arm
  const thick = 10;    // arm thickness

  // White outline behind cross (makes it readable on any terrain colour)
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = thick + 5;
  ctx.lineCap = 'square';
  ctx.beginPath();
  ctx.moveTo(cx - arm, cy); ctx.lineTo(cx + arm, cy);
  ctx.moveTo(cx, cy - arm); ctx.lineTo(cx, cy + arm);
  ctx.stroke();

  // Red cross
  ctx.strokeStyle = '#e81010';
  ctx.lineWidth = thick;
  ctx.beginPath();
  ctx.moveTo(cx - arm, cy); ctx.lineTo(cx + arm, cy);
  ctx.moveTo(cx, cy - arm); ctx.lineTo(cx, cy + arm);
  ctx.stroke();

  // Label — black outline first, then white fill
  ctx.font = 'bold 28px Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.lineWidth = 6;
  ctx.lineJoin = 'round';
  ctx.strokeStyle = '#000000';
  ctx.strokeText(label, cx, cy + arm + 42);
  ctx.fillStyle = '#ffffff';
  ctx.fillText(label, cx, cy + arm + 42);

  return new THREE.CanvasTexture(canvas);
}

// Returns a Sprite; add it to earthMesh so it rotates with the globe.
export function createMarker(lat, lng, label) {
  const pos = latLngToVector3(lat, lng);
  const mat = new THREE.SpriteMaterial({
    map: markerTexture(label),
    transparent: true,
    depthWrite: false,
  });
  const sprite = new THREE.Sprite(mat);
  // Scale keeps the 256×300 canvas aspect; ~0.3 world-units wide at Earth radius 1
  sprite.scale.set(0.3, 0.3 * (300 / 256), 1);
  sprite.position.copy(pos);
  return sprite;
}
