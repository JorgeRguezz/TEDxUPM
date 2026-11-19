// Sala de la Máquina (hall de la ETSII) en 3D. Se carga solo al abrir el visor (import dinámico), nunca en el prerender.
// Medidas aproximadas a partir de fotos públicas y la ficha de cesión de espacios (~500 m²): no es un plano, es una maqueta orientativa.
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

export type Stand = { tier: string; logo?: string; featured?: boolean };
export type View = 'entrance' | 'machine' | 'gallery';

const W = 20, L = 26, G = 3.2; // ancho, largo y fondo de las galerías (m)
const FLOOR1 = 5.5, TOP = 10.5; // altura de la galería y arranque de la cubierta
const RED = 0xeb0028;
// Stands metidos entre los pilares de la planta baja (un poco por detrás de su línea), cuatro por lado en los huecos entre pilares.
const STAND_X = (W - 2 * G) / 2 + .6, STAND_Z = [-7.35, -2.45, 2.45, 7.35];
// Pilares de la galería (los usan el dibujo y las colisiones).
const COLUMNS: [number, number][] = (() => {
  const iw = W - 2 * G, il = L - 2 * G, cols: [number, number][] = [];
  for (let i = 0; i <= 4; i++) { const z = -il / 2 + (il / 4) * i; cols.push([-iw / 2, z], [iw / 2, z]); }
  for (const x of [-iw / 6, iw / 6]) cols.push([x, -il / 2], [x, il / 2]);
  return cols;
})();

const VIEWS: Record<View, [THREE.Vector3, THREE.Vector3]> = {
  entrance: [new THREE.Vector3(0, 1.65, 11.5), new THREE.Vector3(0, 2.4, 0)],
  machine: [new THREE.Vector3(-3.4, 1.65, 6.6), new THREE.Vector3(0, 2.4, 0)],
  gallery: [new THREE.Vector3(0, FLOOR1 + 1.8, 10.1), new THREE.Vector3(0, 1.5, 0)],
};

function canvasTexture(w: number, h: number, draw: (c: CanvasRenderingContext2D) => void) {
  const canvas = document.createElement('canvas');
  canvas.width = w; canvas.height = h;
  draw(canvas.getContext('2d')!);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}

// Suelo de piedra pulida en losas.
function floorTexture() {
  const tex = canvasTexture(512, 512, c => {
    c.fillStyle = '#a9a7a2'; c.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 1400; i++) { c.fillStyle = `rgba(${Math.random() < .5 ? '255,255,255' : '90,90,90'},${Math.random() * .06})`; c.fillRect(Math.random() * 512, Math.random() * 512, 3, 3); }
    c.strokeStyle = 'rgba(80,80,80,.35)'; c.lineWidth = 2;
    for (let i = 0; i <= 512; i += 128) { c.beginPath(); c.moveTo(i, 0); c.lineTo(i, 512); c.moveTo(0, i); c.lineTo(512, i); c.stroke(); }
  });
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(W / 2.4, L / 2.4);
  return tex;
}

// Panel trasero del stand: logo del partner o hueco «Tu logo aquí».
function panelTexture(stand: Stand, slot: string, onReady: () => void) {
  const draw = (c: CanvasRenderingContext2D, img?: HTMLImageElement) => {
    c.fillStyle = '#0d0d0d'; c.fillRect(0, 0, 1024, 768);
    c.fillStyle = `#${RED.toString(16)}`; c.fillRect(0, 0, 1024, 64);
    c.fillStyle = '#fff'; c.font = '700 34px Inter, Arial, sans-serif'; c.textBaseline = 'middle';
    c.fillText(stand.tier.toUpperCase(), 40, 34);
    if (img) {
      const s = Math.min(760 / img.width, 360 / img.height);
      c.drawImage(img, (1024 - img.width * s) / 2, 416 - img.height * s / 2, img.width * s, img.height * s);
    } else {
      c.setLineDash([18, 14]); c.strokeStyle = '#8c8c8c'; c.lineWidth = 4; c.strokeRect(180, 250, 664, 330);
      c.fillStyle = '#8c8c8c'; c.font = '600 44px Inter, Arial, sans-serif'; c.textAlign = 'center'; c.fillText(slot.toUpperCase(), 512, 416);
    }
  };
  const tex = canvasTexture(1024, 768, c => draw(c));
  if (stand.logo) {
    const img = new Image();
    img.onload = () => { draw((tex.image as HTMLCanvasElement).getContext('2d')!, img); tex.needsUpdate = true; onReady(); };
    img.src = stand.logo;
  }
  return tex;
}

function box(w: number, h: number, d: number, mat: THREE.Material, x: number, y: number, z: number) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  m.position.set(x, y, z); m.castShadow = m.receiveShadow = true;
  return m;
}

function hall(scene: THREE.Scene) {
  const plaster = new THREE.MeshStandardMaterial({ color: 0xd9d6cf, roughness: .9 });
  const stone = new THREE.MeshStandardMaterial({ color: 0x9b9a96, roughness: .7 });
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(W, L), new THREE.MeshStandardMaterial({ map: floorTexture(), roughness: .32, metalness: .05 }));
  floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);

  // Muros exteriores con puertas y vanos oscuros en la planta baja.
  const dark = new THREE.MeshStandardMaterial({ color: 0x2a2a2a, roughness: .8 });
  scene.add(box(W, TOP, .4, plaster, 0, TOP / 2, -L / 2), box(W, TOP, .4, plaster, 0, TOP / 2, L / 2), box(.4, TOP, L, plaster, -W / 2, TOP / 2, 0), box(.4, TOP, L, plaster, W / 2, TOP / 2, 0));
  for (const z of [-8, -2.5, 2.5, 8]) for (const x of [-W / 2 + .22, W / 2 - .22]) scene.add(box(.05, 3, 1.6, dark, x, 1.5, z));
  scene.add(box(3.2, 3.4, .05, dark, 0, 1.7, -L / 2 + .22), box(3.2, 3.4, .05, dark, 0, 1.7, L / 2 - .22));
  // Mural del fondo.
  scene.add(box(7, 1.6, .05, new THREE.MeshStandardMaterial({ color: 0x5b5148, roughness: .9 }), 0, 4.2, -L / 2 + .22));

  // Forjado de la galería perimetral, pretil y pilares (piedra abajo, blanco arriba).
  const iw = W - 2 * G, il = L - 2 * G;
  scene.add(box(G, .45, L, plaster, -W / 2 + G / 2, FLOOR1, 0), box(G, .45, L, plaster, W / 2 - G / 2, FLOOR1, 0), box(iw, .45, G, plaster, 0, FLOOR1, -L / 2 + G / 2), box(iw, .45, G, plaster, 0, FLOOR1, L / 2 - G / 2));
  const rail = FLOOR1 + .78;
  scene.add(box(.25, 1.1, il, plaster, -iw / 2, rail, 0), box(.25, 1.1, il, plaster, iw / 2, rail, 0), box(iw, 1.1, .25, plaster, 0, rail, -il / 2), box(iw, 1.1, .25, plaster, 0, rail, il / 2));
  for (const [x, z] of COLUMNS) scene.add(box(.7, FLOOR1, .7, stone, x, FLOOR1 / 2, z), box(.6, TOP - FLOOR1, .6, plaster, x, (FLOOR1 + TOP) / 2, z));
  // Cornisa sobre la que apoya la cubierta.
  scene.add(box(iw + 1, .5, .9, plaster, 0, TOP, -il / 2), box(iw + 1, .5, .9, plaster, 0, TOP, il / 2), box(.9, .5, il, plaster, -iw / 2, TOP, 0), box(.9, .5, il, plaster, iw / 2, TOP, 0));
  // Techo plano de las galerías (anillo alrededor de la bóveda).
  scene.add(box(G, .3, L, plaster, -W / 2 + G / 2, TOP + .4, 0), box(G, .3, L, plaster, W / 2 - G / 2, TOP + .4, 0), box(iw, .3, G, plaster, 0, TOP + .4, -L / 2 + G / 2), box(iw, .3, G, plaster, 0, TOP + .4, L / 2 - G / 2));

  // Cubierta: bóveda de vidrio rebajada sobre el patio central, con arcos de acero.
  const rise = 3.6;
  // CylinderGeometry tiene el eje en Y: girado 90° en X queda a lo largo de la sala; el grupo se aplasta en Y para rebajar el arco.
  const glass = new THREE.Mesh(new THREE.CylinderGeometry(iw / 2, iw / 2, il, 48, 1, true, Math.PI / 2, Math.PI), new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xf4f6f8, emissiveIntensity: .9, side: THREE.DoubleSide }));
  glass.rotation.x = Math.PI / 2;
  const vault = new THREE.Group(); vault.add(glass); vault.scale.y = rise / (iw / 2); vault.position.y = TOP + .6;
  scene.add(vault);
  const steel = new THREE.MeshStandardMaterial({ color: 0x3a3a3a, roughness: .5, metalness: .6 });
  for (let i = 0; i <= 8; i++) {
    const arch = new THREE.Mesh(new THREE.TorusGeometry(iw / 2, .1, 6, 48, Math.PI), steel);
    arch.position.set(0, 0, -il / 2 + (il / 8) * i);
    vault.add(arch);
  }
  for (let i = 1; i < 12; i++) {
    const a = (Math.PI / 12) * i, purlin = box(.08, .08, il, steel, Math.cos(a) * iw / 2, Math.sin(a) * iw / 2, 0);
    vault.add(purlin);
  }
}

// Máquina de vapor de balancín tipo Watt (1832): bancada, seis columnas dóricas, balancín, cilindro, biela y volante.
function machine(scene: THREE.Scene) {
  const g = new THREE.Group();
  const plinth = new THREE.MeshStandardMaterial({ color: 0x3b3b3b, roughness: .8 });
  const iron = new THREE.MeshStandardMaterial({ color: RED, roughness: .45, metalness: .35 });
  const brass = new THREE.MeshStandardMaterial({ color: 0x9a7a3a, roughness: .35, metalness: .8 });
  g.add(box(9.6, .35, 5.6, plinth, 0, .175, 0), box(8.8, .35, 4.8, plinth, 0, .525, 0));
  const base = .7;
  g.add(box(6.2, .4, 2.6, iron, -1.6, base + .2, 0));
  for (const x of [-4.2, -1.6, 1]) for (const z of [-1, 1]) {
    const col = new THREE.Mesh(new THREE.CylinderGeometry(.16, .2, 4.2, 16), iron);
    col.position.set(x, base + .4 + 2.1, z); col.castShadow = true; g.add(col);
  }
  g.add(box(6.2, .35, 2.6, iron, -1.6, base + 4.8, 0));
  // Cilindro y regulador centrífugo.
  const cyl = new THREE.Mesh(new THREE.CylinderGeometry(.55, .55, 2.4, 24), iron);
  cyl.position.set(-3.6, base + 1.6, 0); cyl.castShadow = true; g.add(cyl);
  const gov = new THREE.Group();
  gov.add(box(.06, 1.4, .06, brass, 0, 0, 0));
  for (const s of [-1, 1]) { const ball = new THREE.Mesh(new THREE.SphereGeometry(.16, 16, 12), brass); ball.position.set(s * .35, -.2, 0); gov.add(ball); }
  gov.position.set(-1.6, base + 1.6, 0); g.add(gov);
  // Balancín sobre el pivote central.
  const beam = new THREE.Group();
  const shape = new THREE.Shape(); shape.moveTo(-3.2, 0); shape.quadraticCurveTo(0, .55, 3.2, 0); shape.quadraticCurveTo(0, -.55, -3.2, 0);
  const beamMesh = new THREE.Mesh(new THREE.ExtrudeGeometry(shape, { depth: .25, bevelEnabled: false }), iron);
  beamMesh.position.z = -.125; beamMesh.castShadow = true; beam.add(beamMesh);
  beam.position.set(-1.2, base + 5.4, 0); g.add(beam);
  g.add(box(.4, .6, .5, iron, -1.2, base + 5.1, 0));
  // Volante y cigüeñal.
  const wheel = new THREE.Group();
  wheel.add(new THREE.Mesh(new THREE.TorusGeometry(3, .16, 10, 72), iron));
  wheel.add(new THREE.Mesh(new THREE.CylinderGeometry(.3, .3, .5, 16).rotateX(Math.PI / 2), iron));
  for (let i = 0; i < 8; i++) { const spoke = box(.12, 2.9, .12, iron, 0, 0, 0); spoke.geometry.translate(0, 1.45, 0); spoke.rotation.z = (Math.PI / 4) * i; wheel.add(spoke); }
  wheel.traverse(o => { o.castShadow = true; });
  // Como en la ilustración y en el hall real, el volante gira medio enterrado: el eje queda a ras de la bancada y solo asoma la mitad superior.
  wheel.position.set(3.4, base, 0); g.add(wheel);
  g.add(box(.7, .45, .4, iron, 3.4, base + .22, -.5), box(.7, .45, .4, iron, 3.4, base + .22, .5));
  const rod = box(.14, 1, .14, iron, 0, 0, 0); g.add(rod);
  g.scale.setScalar(.75); // la máquina real es más contenida que la sala: deja aire hasta los stands
  scene.add(g);

  const crankR = .9, beamEnd = new THREE.Vector3(), crank = new THREE.Vector3(), mid = new THREE.Vector3();
  return (t: number) => {
    wheel.rotation.z = -t * .9;
    beam.rotation.z = Math.sin(t * .9) * .09;
    gov.rotation.y = t * 2;
    beamEnd.set(3.2, 0, 0); beam.localToWorld(beamEnd); g.worldToLocal(beamEnd);
    crank.set(wheel.position.x + Math.sin(t * .9) * crankR, wheel.position.y + Math.cos(t * .9) * crankR, .3);
    mid.addVectors(beamEnd, crank).multiplyScalar(.5);
    rod.position.copy(mid); rod.scale.y = beamEnd.distanceTo(crank);
    rod.rotation.z = Math.atan2(crank.y - beamEnd.y, crank.x - beamEnd.x) - Math.PI / 2;
  };
}

// Stands a ambos lados de la sala, bajo la galería, mirando a la máquina.
function stands(scene: THREE.Scene, list: Stand[], slot: string, invalidate: () => void) {
  const white = new THREE.MeshStandardMaterial({ color: 0xf2f2f2, roughness: .6 });
  const carpet = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 1 });
  list.slice(0, STAND_Z.length * 2).forEach((stand, i) => {
    const side = i % 2 === 0 ? -1 : 1, z = STAND_Z[Math.floor(i / 2)];
    const w = stand.featured ? 3.9 : 3, x = side * STAND_X;
    const g = new THREE.Group();
    g.add(box(1.8, .06, w, carpet, side * -.9, .03, 0));
    const panel = new THREE.Mesh(new THREE.PlaneGeometry(w, w * .75), new THREE.MeshStandardMaterial({ map: panelTexture(stand, slot, invalidate), roughness: .7 }));
    panel.rotation.y = -side * Math.PI / 2; panel.position.set(.06 * -side, 1.1 + w * .375, 0);
    g.add(box(.1, 1.1 + w * .75 + .1, w + .1, white, 0, (1.1 + w * .75 + .1) / 2, 0), panel);
    g.add(box(.6, 1.05, w * .55, white, side * -1.3, .525, 0));
    g.add(box(.62, .05, w * .55 + .04, new THREE.MeshStandardMaterial({ color: RED, roughness: .5 }), side * -1.3, 1.07, 0));
    g.position.set(x, 0, z);
    scene.add(g);
  });
}

export function mountHall(container: HTMLElement, list: Stand[], slot: string) {
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5)); // a pantalla completa en retina, 2× son ~4,5 M píxeles por frame
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFShadowMap;
  // Sombras estáticas: se calculan una vez (la sala no cambia); recalcularlas cada frame era lo que producía tirones al caminar.
  renderer.shadowMap.autoUpdate = false; renderer.shadowMap.needsUpdate = true;
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = .8;
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xdfe4ea);
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), .04).texture; scene.environmentIntensity = .45;
  scene.add(new THREE.HemisphereLight(0xfdfbf7, 0x6a6862, .55));
  const sun = new THREE.DirectionalLight(0xfff6ea, 2.6);
  sun.position.set(4, 22, 6); sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  Object.assign(sun.shadow.camera, { left: -14, right: 14, top: 14, bottom: -14, far: 50 });
  scene.add(sun);

  const camera = new THREE.PerspectiveCamera(70, 1, .1, 200);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enablePan = false; controls.enableZoom = false; controls.enableDamping = true; controls.rotateSpeed = -.35;

  // «Spawn» en un punto: el control orbita alrededor de un objetivo a 1 cm delante de la cámara, así que girar = mirar alrededor (360°).
  const go = (view: View) => {
    const [pos, look] = VIEWS[view];
    camera.position.copy(pos);
    controls.target.copy(pos).addScaledVector(look.clone().sub(pos).normalize(), .01);
    controls.update();
  };

  let dirty = true;
  const invalidate = () => { dirty = true; };
  hall(scene);
  const animate = machine(scene);
  stands(scene, list, slot, invalidate);
  go('entrance');

  const resize = () => {
    const { clientWidth: w, clientHeight: h } = container;
    renderer.setSize(w, h); camera.aspect = w / h; camera.fov = w < h ? 85 : 70; camera.updateProjectionMatrix(); dirty = true;
  };
  const ro = new ResizeObserver(resize); ro.observe(container); resize();
  controls.addEventListener('change', invalidate);
  // Con el teclado: ↑/↓ (o W/S) caminar, ←/→ (o A/D) girar, mientras la tecla esté pulsada.
  const MOVE: Record<string, [number, number]> = { ArrowUp: [1, 0], w: [1, 0], ArrowDown: [-1, 0], s: [-1, 0], ArrowLeft: [0, 1], a: [0, 1], ArrowRight: [0, -1], d: [0, -1] };
  const held = new Set<string>();
  const keydown = (e: KeyboardEvent) => {
    const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    if (!MOVE[k]) return;
    e.preventDefault(); held.add(k);
    if (!e.repeat) walk(.12); // un toque corto también da un paso (~40 cm o ~8°)
  };
  const keyup = (e: KeyboardEvent) => { held.delete(e.key.length === 1 ? e.key.toLowerCase() : e.key); };
  const blur = () => held.clear();
  const hidden = () => { if (document.hidden) held.clear(); };

  // Zonas transitables: dentro de los muros y fuera de la bancada de la máquina; en la galería, solo el anillo (no el hueco central).
  const iw = W - 2 * G, il = L - 2 * G;
  const walkable = (x: number, z: number, upstairs: boolean) => {
    if (Math.abs(x) > W / 2 - 1 || Math.abs(z) > L / 2 - 1) return false;
    if (COLUMNS.some(([cx, cz]) => Math.abs(x - cx) < .9 && Math.abs(z - cz) < .9)) return false;
    if (upstairs) return Math.abs(x) > iw / 2 + .2 || Math.abs(z) > il / 2 + .2;
    if (Math.abs(x) < 4.1 && Math.abs(z) < 2.6) return false; // bancada de la máquina
    return !(Math.abs(x) > STAND_X - 2.3 && Math.abs(x) < STAND_X + .4 && STAND_Z.some(sz => Math.abs(z - sz) < 2.4)); // stands
  };
  const forward = new THREE.Vector3(), look = new THREE.Vector3();
  const walk = (dt: number) => {
    let move = 0, turn = 0;
    held.forEach(k => { move += MOVE[k][0]; turn += MOVE[k][1]; });
    if (!move && !turn) return;
    look.subVectors(controls.target, camera.position);
    if (turn) look.applyAxisAngle(THREE.Object3D.DEFAULT_UP, turn * 1.2 * dt);
    if (move) {
      forward.set(look.x, 0, look.z).normalize();
      // Cada eje por separado: al chocar se desliza a lo largo del obstáculo en vez de quedarse clavado.
      const p = camera.position, up = p.y > FLOOR1, dx = forward.x * move * 3.2 * dt, dz = forward.z * move * 3.2 * dt;
      if (walkable(p.x + dx, p.z, up)) p.x += dx;
      if (walkable(p.x, p.z + dz, up)) p.z += dz;
    }
    controls.target.copy(camera.position).add(look);
    dirty = true;
  };
  // En la ventana mientras el visor está abierto (es modal): funciona aunque el foco esté en un botón de vista.
  addEventListener('keydown', keydown); addEventListener('keyup', keyup); addEventListener('blur', blur); document.addEventListener('visibilitychange', hidden);

  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const clock = new THREE.Clock();
  let last = 0;
  renderer.setAnimationLoop(() => {
    const now = clock.getElapsedTime(), dt = Math.min(now - last, .1); last = now;
    walk(dt);
    controls.update();
    if (!still) { animate(now); dirty = true; }
    if (dirty) { renderer.render(scene, camera); dirty = false; }
  });

  return {
    go: (view: View) => { go(view); dirty = true; },
    dispose: () => {
      renderer.setAnimationLoop(null); ro.disconnect(); controls.dispose(); removeEventListener('keydown', keydown); removeEventListener('keyup', keyup); removeEventListener('blur', blur); document.removeEventListener('visibilitychange', hidden);
      scene.traverse(o => { if (o instanceof THREE.Mesh) { o.geometry.dispose(); (Array.isArray(o.material) ? o.material : [o.material]).forEach(m => { m.map?.dispose(); m.dispose(); }); } });
      pmrem.dispose(); renderer.dispose(); renderer.domElement.remove();
    },
  };
}
