import * as THREE from 'three';
import * as Astronomy from 'astronomy-engine';

const RADIUS = 49.5;

function raDecToVector3(raHours, decDeg) {
  const raRad = raHours * (Math.PI / 12);
  const decRad = decDeg * (Math.PI / 180);
  return new THREE.Vector3(
    RADIUS * Math.cos(decRad) * Math.cos(raRad),
    RADIUS * Math.sin(decRad),
    -RADIUS * Math.cos(decRad) * Math.sin(raRad)
  );
}

function glowTexture(color, size = 128) {
  const canvas = document.createElement('canvas');
  canvas.width = size; canvas.height = size;
  const ctx = canvas.getContext('2d');
  const c = size / 2;
  const grad = ctx.createRadialGradient(c, c, 0, c, c, c);
  grad.addColorStop(0.0, '#ffffff');
  grad.addColorStop(0.15, color);
  grad.addColorStop(0.45, color);
  grad.addColorStop(1.0, 'rgba(0,0,0,0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);
  return new THREE.CanvasTexture(canvas);
}

function dimStarTexture(color, size = 64) {
  const canvas = document.createElement('canvas');
  canvas.width = size; canvas.height = size;
  const ctx = canvas.getContext('2d');
  const c = size / 2;
  const grad = ctx.createRadialGradient(c, c, 0, c, c, c);
  grad.addColorStop(0.0, '#ffffff');
  grad.addColorStop(0.25, color);
  grad.addColorStop(1.0, 'rgba(0,0,0,0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);
  return new THREE.CanvasTexture(canvas);
}

function sunTexture(size = 256) {
  const canvas = document.createElement('canvas');
  canvas.width = size; canvas.height = size;
  const ctx = canvas.getContext('2d');
  const c = size / 2;
  const grad = ctx.createRadialGradient(c, c, 0, c, c, c);
  grad.addColorStop(0.0,  '#ffffff');
  grad.addColorStop(0.2,  '#fffde0');
  grad.addColorStop(0.45, '#fff176');
  grad.addColorStop(0.7,  '#ffd740');
  grad.addColorStop(1.0,  'rgba(0,0,0,0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);
  return new THREE.CanvasTexture(canvas);
}

// moonPhase: 0=new, 0.25=first quarter, 0.5=full, 0.75=last quarter
function moonTexture(moonPhase, size = 128) {
  const canvas = document.createElement('canvas');
  canvas.width = size; canvas.height = size;
  const ctx = canvas.getContext('2d');
  const r = size * 0.42, cx = size / 2, cy = size / 2;

  // Dark disc
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fillStyle = '#1a1a2e';
  ctx.fill();

  // Lit portion via bezier terminator
  const k = Math.cos(moonPhase * 2 * Math.PI);
  const cp = (4 / 3) * r;

  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.clip();

  ctx.beginPath();
  if (moonPhase < 0.5) {
    // Waxing: right side lit
    ctx.moveTo(cx, cy - r);
    ctx.arc(cx, cy, r, -Math.PI / 2, Math.PI / 2, false);
    ctx.bezierCurveTo(cx + k * cp, cy + r, cx + k * cp, cy - r, cx, cy - r);
  } else {
    // Waning: left side lit
    ctx.moveTo(cx, cy - r);
    ctx.arc(cx, cy, r, -Math.PI / 2, Math.PI / 2, true);
    ctx.bezierCurveTo(cx - k * cp, cy + r, cx - k * cp, cy - r, cx, cy - r);
  }
  ctx.fillStyle = '#d4d0b8';
  ctx.fill();
  ctx.restore();

  // Soft outer glow ring
  const glow = ctx.createRadialGradient(cx, cy, r * 0.9, cx, cy, r * 1.3);
  glow.addColorStop(0, 'rgba(200,200,180,0.15)');
  glow.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, size, size);

  return new THREE.CanvasTexture(canvas);
}

function makeSprite(tex, scale) {
  const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false });
  const sprite = new THREE.Sprite(mat);
  sprite.scale.setScalar(scale);
  return sprite;
}

export default function getPlanets() {
  const date = new Date();
  const observer = new Astronomy.Observer(0, 0, 0);
  const group = new THREE.Group();

  const getPos = (bodyName) => {
    const eq = Astronomy.Equator(bodyName, date, observer, false, true);
    return raDecToVector3(eq.ra, eq.dec);
  };

  // Sun — large yellow disc (children[0], used by index.js to track light direction)
  const sunSprite = makeSprite(sunTexture(), 5.0);
  sunSprite.position.copy(getPos('Sun'));
  group.add(sunSprite);

  // Moon — phase-correct disc
  const moonPhase = Astronomy.MoonPhase(date) / 360;
  const moonSprite = makeSprite(moonTexture(moonPhase), 1.6);
  moonSprite.position.copy(getPos('Moon'));
  group.add(moonSprite);

  // Mercury — faint, slightly orange
  const mercurySprite = makeSprite(dimStarTexture('#ffbb88'), 0.28);
  mercurySprite.material.opacity = 0.55;
  mercurySprite.position.copy(getPos('Mercury'));
  group.add(mercurySprite);

  // Venus — bright, hint of pale green
  const venusSprite = makeSprite(glowTexture('#aaffaa'), 0.65);
  venusSprite.position.copy(getPos('Venus'));
  group.add(venusSprite);

  // Mars — medium, reddish
  const marsSprite = makeSprite(dimStarTexture('#ff6644'), 0.38);
  marsSprite.position.copy(getPos('Mars'));
  group.add(marsSprite);

  // Jupiter — brightest planet, bluish
  const jupiterSprite = makeSprite(glowTexture('#88bbff'), 0.75);
  jupiterSprite.position.copy(getPos('Jupiter'));
  group.add(jupiterSprite);

  // Saturn — moderate, brownish
  const saturnSprite = makeSprite(dimStarTexture('#cc9966'), 0.32);
  saturnSprite.material.opacity = 0.75;
  saturnSprite.position.copy(getPos('Saturn'));
  group.add(saturnSprite);

  return group;
}
