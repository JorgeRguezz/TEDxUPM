// Sala de la Máquina (hall de la ETSII) en 3D. Se carga solo al abrir el visor (import dinámico), nunca en el prerender.
// Medidas aproximadas a partir de fotos públicas y la ficha de cesión de espacios (~500 m²): no es un plano, es una maqueta orientativa.
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

export type Game = 'darts' | 'vr' | 'arcade' | 'foosball' | 'kiosk' | 'racing' | 'robot' | 'claw';
export type Stand = { tier: string; game: Game; activity: string; logo?: string; featured?: boolean };
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
    c.textAlign = 'left'; c.setLineDash([]); // el hueco «Tu logo aquí» deja el texto centrado: se reinicia en cada dibujo
    c.fillStyle = '#0d0d0d'; c.fillRect(0, 0, 1024, 768);
    c.fillStyle = `#${RED.toString(16)}`; c.fillRect(0, 0, 1024, 64);
    c.fillStyle = '#fff'; c.font = '700 34px Inter, Arial, sans-serif'; c.textBaseline = 'middle';
    c.fillText(stand.tier.toUpperCase(), 40, 34);
    c.textAlign = 'right'; c.fillText(stand.activity.toUpperCase(), 984, 34); c.textAlign = 'left';
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

// Máquina de vapor de balancín tipo Watt (Napier & Son, 1832), según las fotos del hall:
// bancada de piedra en dos alturas, bastidor de seis columnas dóricas con entablamento y remates,
// balancín calado sobre el entablamento, cilindro con caja de válvulas, regulador de bolas,
// y volante medio enterrado en el foso, con corona dentada.
function lathe(points: [number, number][], mat: THREE.Material, segments = 24) {
  const m = new THREE.Mesh(new THREE.LatheGeometry(points.map(([r, y]) => new THREE.Vector2(r, y)), segments), mat);
  m.castShadow = m.receiveShadow = true;
  return m;
}

function ring(outer: number, inner: number, depth: number, mat: THREE.Material, teeth = 0) {
  const shape = new THREE.Shape();
  if (teeth) {
    const step = (Math.PI * 2) / teeth, tip = outer + .09;
    for (let i = 0; i < teeth; i++) {
      const a = i * step;
      const pts: [number, number][] = [[outer, a], [tip, a + step * .2], [tip, a + step * .45], [outer, a + step * .65]];
      pts.forEach(([r, b], j) => (i === 0 && j === 0 ? shape.moveTo : shape.lineTo).call(shape, Math.cos(b) * r, Math.sin(b) * r));
    }
    shape.closePath();
  } else shape.absarc(0, 0, outer, 0, Math.PI * 2, false);
  const hole = new THREE.Path(); hole.absarc(0, 0, inner, 0, Math.PI * 2, true); shape.holes.push(hole);
  const m = new THREE.Mesh(new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: false, curveSegments: 64 }), mat);
  m.geometry.translate(0, 0, -depth / 2); m.castShadow = true;
  return m;
}

// Coloca una barra cilíndrica entre dos puntos (bielas, vástagos). Sin crear objetos por frame: evita pausas del recolector.
const dir = new THREE.Vector3();
function link(rod: THREE.Mesh, a: THREE.Vector3, b: THREE.Vector3) {
  rod.position.addVectors(a, b).multiplyScalar(.5);
  rod.scale.y = a.distanceTo(b);
  rod.quaternion.setFromUnitVectors(THREE.Object3D.DEFAULT_UP, dir.subVectors(b, a).normalize());
}

function machine(scene: THREE.Scene) {
  const g = new THREE.Group();
  const stoneM = new THREE.MeshStandardMaterial({ color: 0xbdb8ae, roughness: .85 });
  const pit = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 1 });
  const iron = new THREE.MeshStandardMaterial({ color: RED, roughness: .42, metalness: .35 });
  const dark = new THREE.MeshStandardMaterial({ color: 0x2b2b2b, roughness: .5, metalness: .6 });
  const brass = new THREE.MeshStandardMaterial({ color: 0xb08d3c, roughness: .3, metalness: .85 });

  // Bancada: losa grande, segundo escalón y foso del volante.
  g.add(box(12.6, .45, 5.6, stoneM, 1, .225, 0), box(11.4, .35, 4.6, stoneM, 1, .625, 0));
  g.add(box(6.4, .02, .9, pit, 3.3, .81, 0));
  const base = .8;
  g.add(box(6.6, .22, 3, iron, -1.4, base + .11, 0)); // placa de asiento del bastidor

  // Seis columnas dóricas con basa, fuste con éntasis, collarino, equino y ábaco.
  const COL_H = 4.2, colTop = base + .22 + COL_H;
  const profile: [number, number][] = [[0, 0], [.27, 0], [.27, .08], [.23, .12], [.25, .18], [.2, .24], [.19, 1.6], [.165, COL_H - .5], [.19, COL_H - .46], [.17, COL_H - .4], [.18, COL_H - .32], [.27, COL_H - .14], [0, COL_H - .14]];
  for (const x of [-4.2, -1.4, 1.4]) for (const z of [-1.15, 1.15]) {
    const col = lathe(profile, iron); col.position.set(x, base + .22, z); g.add(col);
    g.add(box(.62, .14, .62, iron, x, colTop - .07, z)); // ábaco
  }
  // Entablamento: arquitrabes, travesaños, cornisa y remates en las esquinas.
  const ent = colTop + .2;
  for (const z of [-1.15, 1.15]) g.add(box(6.5, .4, .34, iron, -1.4, ent, z), box(6.8, .1, .5, iron, -1.4, ent + .25, z));
  for (const x of [-4.2, -1.4, -.6, 1.4]) g.add(box(.3, .3, 2.3, iron, x, ent, 0));
  for (const x of [-4.2, 1.4]) for (const z of [-1.15, 1.15]) {
    const finial = lathe([[0, 0], [.12, 0], [.12, .05], [.06, .1], [.15, .22], [.16, .32], [.1, .44], [.03, .54], [0, .6]], brass, 16);
    finial.position.set(x, ent + .3, z); g.add(finial);
  }

  // Balancín calado (dos placas gemelas) sobre su soporte en A.
  const pivot = new THREE.Vector3(-.6, ent + 1.25, 0);
  for (const z of [-.3, .3]) {
    const a = new THREE.Shape(); a.moveTo(-.55, 0); a.lineTo(-.08, .95); a.lineTo(.08, .95); a.lineTo(.55, 0); a.lineTo(.38, 0); a.lineTo(0, .7); a.lineTo(-.38, 0); a.closePath();
    const stand = new THREE.Mesh(new THREE.ExtrudeGeometry(a, { depth: .08, bevelEnabled: false }), iron);
    stand.position.set(pivot.x, ent + .3, z - .04); stand.castShadow = true; g.add(stand);
  }
  const beam = new THREE.Group();
  const BEAM = 3.6;
  const lens = new THREE.Shape(); lens.moveTo(-BEAM, -.08); lens.quadraticCurveTo(0, -.75, BEAM, -.08); lens.lineTo(BEAM, .08); lens.quadraticCurveTo(0, .75, -BEAM, .08); lens.closePath();
  for (const [cx, rx] of [[-2.1, .75], [-.9, .3], [.9, .3], [2.1, .75]] as [number, number][]) { const h = new THREE.Path(); h.absellipse(cx, 0, rx, .22, 0, Math.PI * 2, true, 0); lens.holes.push(h); }
  for (const z of [-.16, .16]) {
    const plate = new THREE.Mesh(new THREE.ExtrudeGeometry(lens, { depth: .07, bevelEnabled: false, curveSegments: 24 }), iron);
    plate.position.z = z - .035; plate.castShadow = true; beam.add(plate);
  }
  const gudgeon = new THREE.Mesh(new THREE.CylinderGeometry(.13, .13, .7, 16).rotateX(Math.PI / 2), dark); beam.add(gudgeon);
  for (const x of [-BEAM, -3, BEAM]) { const pin = new THREE.Mesh(new THREE.CylinderGeometry(.07, .07, .5, 12).rotateX(Math.PI / 2), dark); pin.position.x = x; beam.add(pin); }
  beam.position.copy(pivot); g.add(beam);

  // Cilindro con bridas y tapa, caja de válvulas y vástago.
  const cyl = lathe([[0, 0], [.72, 0], [.72, .14], [.6, .14], [.6, 2.3], [.72, 2.3], [.72, 2.45], [.5, 2.6], [.16, 2.72], [0, 2.72]], iron, 32);
  cyl.position.set(-3.6, base + .22, 0); g.add(cyl);
  g.add(box(.42, 1.9, .7, iron, -3.6, base + 1.35, .75), box(.5, .12, .8, iron, -3.6, base + 2.36, .75));
  const valve = new THREE.Mesh(new THREE.CylinderGeometry(.03, .03, 1, 8), dark); g.add(valve);
  const pistonRod = new THREE.Mesh(new THREE.CylinderGeometry(.06, .06, 1, 12), dark); g.add(pistonRod);
  const pumpRod = new THREE.Mesh(new THREE.CylinderGeometry(.05, .05, 1, 10), dark); g.add(pumpRod);
  const pump = lathe([[0, 0], [.36, 0], [.36, 1.1], [.42, 1.1], [.42, 1.2], [0, 1.2]], iron); pump.position.set(-2.6, base + .22, -.4); g.add(pump);

  // Regulador centrífugo: columna, husillo, brazos y bolas de latón.
  const govBase = lathe([[0, 0], [.2, 0], [.2, .08], [.08, .14], [.06, 1.1], [.1, 1.16], [0, 1.16]], iron, 16);
  govBase.position.set(.1, base + .22, 0); g.add(govBase);
  const gov = new THREE.Group();
  gov.add(new THREE.Mesh(new THREE.CylinderGeometry(.025, .025, 1.2, 8), brass));
  const arms: THREE.Group[] = [];
  for (const s of [-1, 1]) {
    const arm = new THREE.Group();
    const bar = new THREE.Mesh(new THREE.CylinderGeometry(.018, .018, .7, 6), brass); bar.position.y = -.35; arm.add(bar);
    const ball = new THREE.Mesh(new THREE.SphereGeometry(.13, 16, 12), brass); ball.position.y = -.72; ball.castShadow = true; arm.add(ball);
    arm.position.y = .55; arm.rotation.z = s * .55; gov.add(arm); arms.push(arm);
  }
  gov.position.set(.1, base + .22 + 1.16 + .6, 0); g.add(gov);

  // Volante en el foso: llanta, ocho radios, cubo, corona dentada y chumaceras.
  const WR = 3, wheel = new THREE.Group();
  wheel.add(ring(WR, WR - .26, .32, iron));
  for (let i = 0; i < 8; i++) {
    const spoke = new THREE.Mesh(new THREE.CylinderGeometry(.07, .12, WR - .3, 10), iron);
    spoke.geometry.translate(0, (WR - .3) / 2 + .15, 0); spoke.rotation.z = (Math.PI / 4) * i; spoke.castShadow = true; wheel.add(spoke);
  }
  wheel.add(new THREE.Mesh(new THREE.CylinderGeometry(.38, .38, .6, 20).rotateX(Math.PI / 2), iron));
  const gear = ring(1.9, 1.62, .22, iron, 72); gear.position.z = .3; wheel.add(gear);
  for (let i = 0; i < 6; i++) { const arm = box(.08, 1.4, .08, iron, 0, 0, .3); arm.geometry.translate(0, .9, 0); arm.rotation.z = (Math.PI / 3) * i + .26; wheel.add(arm); }
  const WX = 3.3; wheel.position.set(WX, base, 0); g.add(wheel);
  const crank = box(.18, .9, .14, dark, 0, 0, 0); crank.geometry.translate(0, .45, 0); crank.position.set(WX, base, .45); g.add(crank);
  for (const z of [-.6, .6]) g.add(box(.8, .5, .36, iron, WX, base + .25, z), box(.9, .08, .44, dark, WX, base + .52, z));
  const conRod = new THREE.Mesh(new THREE.CylinderGeometry(.1, .14, 1, 12), iron); g.add(conRod);

  g.scale.setScalar(.7); // la máquina real es más contenida que la sala: deja aire hasta los stands
  g.position.x = -.7; // centrada sobre su bancada
  g.traverse(o => { if (o instanceof THREE.Mesh) o.castShadow = o.receiveShadow = true; });
  scene.add(g);

  const crankR = .9, end = new THREE.Vector3(), pin = new THREE.Vector3(), p1 = new THREE.Vector3(), p2 = new THREE.Vector3();
  const beamPoint = (x: number, out: THREE.Vector3) => out.set(x, 0, 0).applyEuler(beam.rotation).add(beam.position);
  return (t: number) => {
    const ang = t * .9;
    wheel.rotation.z = -ang; crank.rotation.z = -ang;
    beam.rotation.z = Math.cos(ang) * .1;
    gov.rotation.y = t * 2.4;
    arms.forEach((arm, i) => { arm.rotation.z = (i ? 1 : -1) * (.55 + Math.sin(t * .7) * .05); });
    // Biela: del extremo del balancín a la muñequilla del volante.
    pin.set(WX + Math.sin(ang) * crankR, base + Math.cos(ang) * crankR, .45);
    link(conRod, beamPoint(BEAM, end), pin);
    // Vástagos del émbolo, de la bomba y de la válvula: verticales, colgados del balancín.
    const top = beamPoint(-3, end).y; link(pistonRod, p1.set(-3.6, base + 2.9, 0), p2.set(-3.6, top, 0));
    const mid = beamPoint(-2, end).y; link(pumpRod, p1.set(-2.6, base + 1.4, -.4), p2.set(-2.6, mid, -.4));
    link(valve, p1.set(-3.25, base + 2.4, .75), p2.set(-3.25, mid - .2, .75));
  };
}

// Pantalla encendida (MeshBasic: no depende de la luz). `draw` pinta el contenido sobre un lienzo de 512×320.
function screen(w: number, h: number, draw: (c: CanvasRenderingContext2D) => void) {
  return new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: canvasTexture(512, 320, draw), toneMapped: false }));
}
const gameScreen = (title: string, accent: string) => (c: CanvasRenderingContext2D) => {
  const grad = c.createLinearGradient(0, 0, 512, 320); grad.addColorStop(0, '#120006'); grad.addColorStop(1, '#3a0010');
  c.fillStyle = grad; c.fillRect(0, 0, 512, 320);
  c.fillStyle = accent; for (let i = 0; i < 9; i++) c.fillRect(40 + i * 48, 210 - ((i * 37) % 110), 30, 60 + ((i * 37) % 110));
  c.fillStyle = '#fff'; c.font = '800 44px Inter, Arial, sans-serif'; c.fillText(title, 36, 70);
};

// Mesa genérica con tablero y cuatro patas.
function table(w: number, d: number, h: number, top: THREE.Material, legs: THREE.Material) {
  const g = new THREE.Group();
  g.add(box(w, .06, d, top, 0, h, 0));
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) g.add(box(.05, h, .05, legs, sx * (w / 2 - .06), h / 2, sz * (d / 2 - .06)));
  return g;
}

// Atrezo de cada stand, en coordenadas del stand con el eje X local apuntando hacia el pasillo central.
function prop(game: Game) {
  const g = new THREE.Group();
  const dark = new THREE.MeshStandardMaterial({ color: 0x1b1b1b, roughness: .6, metalness: .2 });
  const red = new THREE.MeshStandardMaterial({ color: RED, roughness: .5 });
  const white = new THREE.MeshStandardMaterial({ color: 0xf0f0f0, roughness: .6 });
  const metal = new THREE.MeshStandardMaterial({ color: 0x9a9a9a, roughness: .35, metalness: .8 });
  const cyl = (r: number, h: number, mat: THREE.Material, x: number, y: number, z: number) => { const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, 24), mat); m.position.set(x, y, z); m.castShadow = true; return m; };
  const face = (m: THREE.Object3D, x: number, y: number, z: number) => { m.rotation.y = Math.PI / 2; m.position.set(x, y, z); return m; }; // mirando al pasillo

  if (game === 'darts') {
    const board = canvasTexture(256, 256, c => {
      const rings = ['#111', '#eb0028', '#f2e8d0', '#111', '#1d8a3a', '#f2e8d0', '#eb0028'];
      rings.forEach((col, i) => { c.fillStyle = col; c.beginPath(); c.arc(128, 128, 128 - i * 17, 0, Math.PI * 2); c.fill(); });
      c.strokeStyle = 'rgba(200,200,200,.5)'; c.lineWidth = 1.5;
      for (let i = 0; i < 20; i++) { const a = (i / 20) * Math.PI * 2; c.beginPath(); c.moveTo(128, 128); c.lineTo(128 + Math.cos(a) * 128, 128 + Math.sin(a) * 128); c.stroke(); }
    });
    const disc = new THREE.Mesh(new THREE.CylinderGeometry(.26, .26, .05, 48), [dark, new THREE.MeshStandardMaterial({ map: board, roughness: .8 }), dark]);
    disc.rotation.z = -Math.PI / 2; disc.position.set(.05, 1.73, 0);
    g.add(box(.6, .03, .6, dark, -.1, .015, 0), cyl(.03, 1.75, metal, -.1, .9, 0), box(.06, .7, .7, dark, 0, 1.73, 0), disc);
    g.add(box(.05, .01, 1.2, red, 2.2, .07, 0)); // línea de lanzamiento
    for (const z of [-.05, .04, .1]) { const dart = cyl(.008, .14, red, .12, 1.7 + z, z); dart.rotation.z = Math.PI / 2; g.add(dart); }
  } else if (game === 'vr') {
    g.add(cyl(.18, 1, white, 0, .5, -.5), box(.24, .11, .14, dark, 0, 1.07, -.5), box(.02, .05, .1, metal, .13, 1.07, -.5));
    const mat = new THREE.Mesh(new THREE.RingGeometry(.65, .75, 48), red); mat.rotation.x = -Math.PI / 2; mat.position.set(.9, .07, .3); g.add(mat);
    g.add(cyl(.03, 1.6, metal, -.2, .8, .7), face(screen(1, .62, gameScreen('VR', '#ff4d6d')), -.16, 1.8, .7));
  } else if (game === 'arcade') {
    g.add(box(.7, 1.75, .75, dark, 0, .875, 0), box(.3, .08, .74, red, .45, 1.02, 0));
    g.add(face(screen(.6, .48, gameScreen('ARCADE', '#ffd23f')), .36, 1.45, 0));
    g.add(cyl(.015, .1, metal, .5, 1.1, -.15), cyl(.035, .03, red, .5, 1.16, -.15));
    for (const z of [.05, .15, .25]) g.add(cyl(.03, .02, white, .5, 1.07, z));
    g.add(box(.72, .2, .77, red, 0, 1.85, 0));
  } else if (game === 'foosball') {
    const t = table(.8, 1.3, .85, new THREE.MeshStandardMaterial({ color: 0x1f7a3a, roughness: .7 }), dark); t.position.x = .7; g.add(t);
    g.add(box(.82, .14, .06, dark, .7, .94, .67), box(.82, .14, .06, dark, .7, .94, -.67), box(.06, .14, 1.36, dark, .3, .94, 0), box(.06, .14, 1.36, dark, 1.1, .94, 0));
    for (let i = 0; i < 4; i++) {
      const z = -.45 + i * .3, rod = cyl(.012, 1.2, metal, .7, .98, z); rod.rotation.z = Math.PI / 2; g.add(rod);
      for (const x of [.5, .7, .9]) g.add(box(.05, .14, .04, i % 2 ? red : white, x, .95, z));
    }
  } else if (game === 'kiosk') {
    // Mesa táctil baja: no tapa el logo del panel.
    const t = table(.9, 1.5, .78, dark, metal); t.position.x = .8; g.add(t);
    const top = screen(.8, 1.4, c => { gameScreen('RETO', '#4dd0ff')(c); c.fillStyle = '#4dd0ff'; c.fillRect(36, 250, 440, 30); });
    top.rotation.set(-Math.PI / 2, 0, Math.PI / 2); top.position.set(.8, .815, 0); g.add(top);
    for (const z of [-.95, .95]) g.add(cyl(.17, .5, red, .8, .25, z));
  } else if (game === 'racing') {
    g.add(box(1.2, .12, .6, dark, .5, .06, .1), box(.5, .12, .5, red, .4, .4, .1), box(.12, .7, .5, red, .1, .75, .1));
    const wheel = new THREE.Mesh(new THREE.TorusGeometry(.16, .025, 8, 24), dark); wheel.rotation.y = Math.PI / 2; wheel.position.set(.95, .85, .1); g.add(wheel, box(.06, .6, .06, dark, 1.0, .5, .1));
    g.add(box(.06, .02, .2, metal, 1.0, .82, .1));
    const s = screen(1.1, .62, gameScreen('RACE', '#ff8c42')); s.rotation.y = -Math.PI / 2; s.position.set(1.45, 1.2, .1); g.add(s, box(.04, 1, .04, metal, 1.5, .5, .1));
  } else if (game === 'robot') {
    const t = table(.9, .9, .8, white, dark); t.position.set(.5, 0, 0); g.add(t);
    g.add(cyl(.12, .1, dark, .5, .88, 0));
    const arm = new THREE.Group(); arm.position.set(.5, .93, 0); arm.rotation.y = .6;
    const a1 = box(.09, .55, .09, red, 0, .27, 0); a1.rotation.z = -.35; arm.add(a1);
    const a2 = box(.07, .45, .07, red, .38, .58, 0); a2.rotation.z = -1.4; arm.add(a2);
    arm.add(box(.04, .12, .12, metal, .6, .5, 0));
    g.add(arm);
    for (const [x, z, col] of [[.3, .25, 0x2f80ed], [.4, -.25, 0xffd23f], [.7, .3, 0x1d8a3a]] as [number, number, number][]) g.add(box(.08, .08, .08, new THREE.MeshStandardMaterial({ color: col }), x, .87, z));
  } else {
    // Máquina de gancho: mueble, urna de cristal con premios y la pinza.
    g.add(box(.8, .9, .8, dark, .4, .45, 0), box(.82, .16, .82, red, .4, 2.02, 0));
    const glass = new THREE.Mesh(new THREE.BoxGeometry(.78, 1, .78), new THREE.MeshStandardMaterial({ color: 0xddeeff, transparent: true, opacity: .18, roughness: .05 }));
    glass.position.set(.4, 1.42, 0); g.add(glass);
    const cols = [0xeb0028, 0xffd23f, 0x2f80ed, 0xffffff, 0x1d8a3a];
    for (let i = 0; i < 14; i++) { const ball = new THREE.Mesh(new THREE.SphereGeometry(.07, 12, 10), new THREE.MeshStandardMaterial({ color: cols[i % 5], roughness: .8 })); ball.position.set(.12 + (i % 4) * .18, .97 + Math.floor(i / 4) * .06, -.27 + ((i * 7) % 5) * .13); g.add(ball); }
    g.add(cyl(.008, .5, metal, .45, 1.65, .05), box(.1, .06, .1, metal, .45, 1.38, .05));
  }
  g.traverse(o => { if (o instanceof THREE.Mesh) { o.castShadow = o.receiveShadow = true; } });
  return g;
}

// Stands a ambos lados de la sala, bajo la galería, mirando a la máquina, cada uno con su juego.
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
    // Mostrador a un lado; el juego ocupa el resto del stand.
    const cz = -w * .3;
    g.add(box(.6, 1.05, w * .32, white, side * -1.3, .525, cz));
    g.add(box(.62, .05, w * .32 + .04, new THREE.MeshStandardMaterial({ color: RED, roughness: .5 }), side * -1.3, 1.07, cz));
    // El atrezo se modela con +X hacia el pasillo: en el lado izquierdo (side = -1) ya mira bien; en el derecho se gira 180°.
    const p = prop(stand.game); p.position.set(side * -.25, 0, w * .18); if (side > 0) p.rotation.y = Math.PI;
    g.add(p);
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
    if (Math.abs(x) < 5 && Math.abs(z) < 2.9) return false; // bancada de la máquina
    return !(Math.abs(x) > STAND_X - 2 && Math.abs(x) < STAND_X + .4 && STAND_Z.some(sz => Math.abs(z - sz) < 2.4)); // stands
  };
  const forward = new THREE.Vector3(), look = new THREE.Vector3();
  // Velocidad suavizada: arranca y frena en ~0,2 s en lugar de saltar de 0 a máximo (eso daba tirones).
  let speed = 0, spin = 0;
  const walk = (dt: number) => {
    let move = 0, turn = 0;
    held.forEach(k => { move += MOVE[k][0]; turn += MOVE[k][1]; });
    const ease = 1 - Math.exp(-dt * 12);
    speed += (Math.sign(move) * 3.2 - speed) * ease; spin += (Math.sign(turn) * 1.3 - spin) * ease;
    if (Math.abs(speed) < .01 && Math.abs(spin) < .005) { speed = spin = 0; return; }
    look.subVectors(controls.target, camera.position);
    if (spin) look.applyAxisAngle(THREE.Object3D.DEFAULT_UP, spin * dt);
    if (speed) {
      forward.set(look.x, 0, look.z).normalize();
      // Cada eje por separado: al chocar se desliza a lo largo del obstáculo en vez de quedarse clavado.
      const p = camera.position, up = p.y > FLOOR1, dx = forward.x * speed * dt, dz = forward.z * speed * dt;
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
