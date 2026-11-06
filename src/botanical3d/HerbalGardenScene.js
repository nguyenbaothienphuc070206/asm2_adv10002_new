import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

const _dummy = new THREE.Object3D();

/**
 * Detect software WebGL (SwiftShader, llvmpipe, softpipe, WARP) per threejs skill directive
 */
const IS_SOFTWARE_GL = (() => {
  if (typeof document === 'undefined') return true;
  const gl = document.createElement('canvas').getContext('webgl2');
  if (!gl) return true;
  const ext = gl.getExtension('WEBGL_debug_renderer_info');
  const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
  const gpu = String(gl.getParameter(param));
  gl.getExtension('WEBGL_lose_context')?.loseContext();
  return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
})();

/**
 * Botanical metadata for the 5 core Vietnamese ingredients in "The Herbal Garden of Vietnam"
 */
export const BOTANICAL_WORLDS = [
  {
    id: 'turmeric',
    nameEn: 'Turmeric · Nghệ Vàng',
    nameVi: 'Nghệ Vàng · Curcuma longa',
    latin: 'Curcuma longa · Thái Bình & Nghệ An',
    palette: {
      primary: '#e07a16',
      secondary: '#f5b82e',
      bgDark: '#2c1908',
      bgLight: '#fbe8c4',
      fogColor: 0x2c1908,
      lightColor: 0xffb830,
      accentColor: 0xe66812
    },
    storyEn:
      'Harvested from alluvial soil in Northern Vietnam, fresh Curcuma longa rhizomes are cold-macerated to preserve curcuminoids that calm blemish-prone skin and fade dark marks.',
    storyVi:
      'Thu hoạch từ vùng đất phù sa màu mỡ, củ nghệ tươi được chiết xuất ở nhiệt độ kiểm soát giúp giữ trọn hoạt chất Curcumin làm dịu da mụn và mờ vết thâm.',
    activesEn: 'Curcuminoids (4.2%) · Ar-turmerone · Essential Zingiberene Oils',
    activesVi: 'Tinh chất Curcuminoids (4.2%) · Ar-turmerone · Tinh dầu Nghệ tự nhiên',
    ritualEn: 'Evening spot & glow ritual — paired with mild amino-acid cleansing.',
    ritualVi: 'Nghi thức dưỡng sáng & mờ thâm buổi tối — kết hợp cùng sữa rửa mặt dịu nhẹ.',
    productIds: ['wash', 'cream', 'duo', 'routine']
  },
  {
    id: 'grapefruit',
    nameEn: 'Grapefruit · Hoa & Vỏ Bưởi',
    nameVi: 'Hoa & Vỏ Bưởi · Citrus maxima',
    latin: 'Citrus maxima · Bến Tre Mekong Delta',
    palette: {
      primary: '#2c7a4b',
      secondary: '#cde8b5',
      bgDark: '#0f2c1d',
      bgLight: '#e3f4d7',
      fogColor: 0x0f2c1d,
      lightColor: 0xb9f08a,
      accentColor: 0x43a868
    },
    storyEn:
      'Steam-distilled from Mekong Delta pomelo peel and white spring blossoms, rich in d-limonene and naringin to purify the scalp and awaken hair follicles.',
    storyVi:
      'Chưng cất hơi nước từ vỏ bưởi non và hoa bưởi trắng miền Tây, giàu hoạt chất d-limonene và naringin giúp làm sạch da đầu và nuôi dưỡng nang tóc chắc khỏe.',
    activesEn: 'D-Limonene · Naringin Bioflavonoids · Vitamin C Ester',
    activesVi: 'Tinh dầu D-Limonene · Hoạt chất Naringin · Vitamin C tự nhiên',
    ritualEn: 'Traditional Vietnamese hair & scalp vitality wash.',
    ritualVi: 'Nghi thức gội đầu thảo mộc truyền thống giúp tóc dày và bóng mượt.',
    productIds: ['pomelo']
  },
  {
    id: 'ginseng',
    nameEn: 'Ginseng · Nhân Sâm',
    nameVi: 'Nhân Sâm · Panax ginseng',
    latin: 'Panax ginseng · Central Highlands & Oriental Materia Medica',
    palette: {
      primary: '#9e2a2b',
      secondary: '#e6b86a',
      bgDark: '#2b1112',
      bgLight: '#f8e2dc',
      fogColor: 0x2b1112,
      lightColor: 0xffcf7c,
      accentColor: 0xc83e37
    },
    storyEn:
      'Six-year matured ginseng roots infused with pearl powder proteins deliver ginsenosides Rg1 and Rb1 to revive tired, dull complexions and support overnight resilience.',
    storyVi:
      'Rễ nhân sâm 6 năm tuổi kết hợp cùng tinh chất ngọc trai cung cấp hoạt chất Ginsenosides Rg1 & Rb1 giúp phục hồi làn da mệt mỏi, dưỡng sáng hồng tự nhiên.',
    activesEn: 'Ginsenosides Rg1/Rb1 · Hydrolyzed Pearl Conchiolin · Polysaccharides',
    activesVi: 'Hoạt chất Ginsenosides Rg1/Rb1 · Tinh chất Ngọc Trai · Đa đường tự nhiên',
    ritualEn: 'Day & night revitalizing silk cream ritual.',
    ritualVi: 'Nghi thức dưỡng ẩm phục hồi và làm sáng mịn da ngày & đêm.',
    productIds: ['ginseng']
  },
  {
    id: 'soapberry',
    nameEn: 'Soapberry · Bồ Kết Nướng',
    nameVi: 'Bồ Kết Nướng · Gleditsia australis',
    latin: 'Gleditsia australis · Northern Midlands of Vietnam',
    palette: {
      primary: '#5c3a21',
      secondary: '#c89d66',
      bgDark: '#1f140d',
      bgLight: '#f0dfca',
      fogColor: 0x1f140d,
      lightColor: 0xe6b97e,
      accentColor: 0x7a4b2a
    },
    storyEn:
      'Sun-dried and lightly fire-roasted Gleditsia pods release natural triterpenoid saponins and locust bean flavones that gently cleanse without synthetic sulfates.',
    storyVi:
      'Trái bồ kết già phơi khô và nướng thơm giải phóng hoạt chất Saponin tự nhiên giúp làm sạch gàu, suôn mượt mái tóc đen truyền thống của phụ nữ Việt.',
    activesEn: 'Triterpenoid Saponins · Australoside · Herbal Flavonoids',
    activesVi: 'Hoạt chất Saponin tự nhiên · Australoside · Flavonoid thảo mộc',
    ritualEn: 'Concentrated roasted soapberry herbal decoction (Cao Bồ Kết).',
    ritualVi: 'Nghi thức gội đầu từ Cao Bồ Kết cô đặc truyền thống.',
    productIds: ['boket']
  },
  {
    id: 'ginger',
    nameEn: 'Ginger · Gừng Gió & Gừng Sẻ',
    nameVi: 'Gừng Tươi · Zingiber officinale',
    latin: 'Zingiber officinale · Cao Bằng & Tây Nguyên',
    palette: {
      primary: '#b85d19',
      secondary: '#f2c17d',
      bgDark: '#29170a',
      bgLight: '#fae7cf',
      fogColor: 0x29170a,
      lightColor: 0xffca7a,
      accentColor: 0xd97224
    },
    storyEn:
      'Warm aromatic Vietnamese ginger rhizomes rich in 6-gingerol and shogaol create a soothing micro-circulation warmth for body massage and skin toning.',
    storyVi:
      'Củ gừng sẻ già giàu hoạt chất 6-Gingerol và Shogaol mang lại cảm giác ấm áp dịu nhẹ, hỗ trợ massage săn chắc cơ thể và thư giãn làn da.',
    activesEn: '6-Gingerol · 6-Shogaol · Warm Zingiberene Complex',
    activesVi: 'Hoạt chất 6-Gingerol · 6-Shogaol · Tinh dầu Gừng ấm tự nhiên',
    ritualEn: 'Warming botanical massage & skin-firming ritual.',
    ritualVi: 'Nghi thức massage thảo mộc ấm cơ thể và săn chắc làn da.',
    productIds: ['ginger']
  }
];

/**
 * Three.js Interactive 3D Botanical Sanctuary Scene
 * Renders 5 multi-part Vietnamese herbal sculptures with studio IBL lighting,
 * instanced pollen particles, pointer drag orbit, and adaptive software-GL pacing.
 */
export class HerbalGardenScene {
  constructor(container) {
    this.container = container;
    this.activeBotanicalId = 'turmeric';
    this.isSoftwareGl = IS_SOFTWARE_GL;
    this.autoRotate = !this.isSoftwareGl;
    this.disposed = false;
    this.isDragging = false;
    this.prevPointer = { x: 0, y: 0 };
    this.targetRotation = { x: 0.18, y: 0.45 };
    this.currentRotation = { x: 0.18, y: 0.45 };
    this.targetZoom = 5.2;
    this.currentZoom = 5.2;
    this.botanicalGroups = {};
    this.frameId = 0;
    this.renderBusy = false;
    this.renderDirty = false;
    this.remainingSteps = 0;

    this.init();
  }

  init() {
    if (!this.container) return;

    const width = Math.max(300, this.container.clientWidth || 640);
    const height = Math.max(300, this.container.clientHeight || 420);

    try {
      this.renderer = new THREE.WebGLRenderer({
        antialias: !this.isSoftwareGl,
        alpha: false,
        powerPreference: 'high-performance'
      });
    } catch {
      this.renderFallbackSvg();
      return;
    }

    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.1;
    this.renderer.setPixelRatio(this.isSoftwareGl ? 1 : Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.setSize(width, height, false);
    this.renderer.shadowMap.enabled = !this.isSoftwareGl;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.container.innerHTML = '';
    const canvas = this.renderer.domElement;
    canvas.setAttribute('aria-label', 'Interactive 3D Vietnamese Botanical Sculpture');
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.display = 'block';
    this.container.appendChild(canvas);

    // WebGL context loss & restoration handlers
    canvas.addEventListener('webglcontextlost', (e) => {
      e.preventDefault();
      if (this.frameId) {
        cancelAnimationFrame(this.frameId);
        clearTimeout(this.frameId);
      }
    });
    canvas.addEventListener('webglcontextrestored', () => {
      this.requestRender(12);
    });

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x2c1908);
    this.scene.fog = new THREE.FogExp2(0x2c1908, 0.065);

    this.camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 60);
    this.camera.position.set(0, 0.6, this.currentZoom);

    // Studio IBL Environment via RoomEnvironment
    const pmrem = new THREE.PMREMGenerator(this.renderer);
    this.envTexture = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    this.scene.environment = this.envTexture;
    pmrem.dispose();

    // 3-Point Studio Rig (Warm Key + Cool Hemisphere Fill + Botanical Rim)
    this.ambientLight = new THREE.HemisphereLight(0xfff4d6, 0x1a2436, 0.92);
    this.scene.add(this.ambientLight);

    this.keyLight = new THREE.DirectionalLight(0xffcf70, 2.2);
    this.keyLight.position.set(4, 6, 5);
    if (!this.isSoftwareGl) {
      this.keyLight.castShadow = true;
      this.keyLight.shadow.mapSize.set(1024, 1024);
      this.keyLight.shadow.bias = -0.0005;
      this.keyLight.shadow.normalBias = 0.02;
    }
    this.scene.add(this.keyLight);

    this.rimLight = new THREE.PointLight(0xe07a16, 2.6, 14);
    this.rimLight.position.set(-3.5, 2.2, -2.5);
    this.scene.add(this.rimLight);

    // Pedestal Altar + Contact Shadow Grounding
    this.stageGroup = new THREE.Group();
    this.scene.add(this.stageGroup);
    this.buildSanctuaryPedestal();
    this.buildAllBotanicalModels();
    this.buildPollenParticles();

    this.setBotanical(this.activeBotanicalId);
    this.bindInteractionEvents();
  }

  /**
   * Build the carved Vietnamese stone & brushed brass botanical pedestal with contact shadow
   */
  buildSanctuaryPedestal() {
    const stoneMat = new THREE.MeshStandardMaterial({
      color: 0x3b2c20,
      roughness: 0.72,
      metalness: 0.12
    });
    const brassMat = new THREE.MeshPhysicalMaterial({
      color: 0xd9a84e,
      roughness: 0.18,
      metalness: 0.92,
      anisotropy: 0.75
    });

    const baseDisc = new THREE.Mesh(new THREE.CylinderGeometry(1.85, 2.05, 0.28, 36), stoneMat);
    baseDisc.position.y = -1.45;
    baseDisc.receiveShadow = true;
    this.stageGroup.add(baseDisc);

    // Contact shadow plane on top of the stone pedestal (offset +0.02 + polygonOffset)
    const contactMat = new THREE.MeshBasicMaterial({
      color: 0x0f0804,
      transparent: true,
      opacity: 0.44,
      depthWrite: false,
      polygonOffset: true,
      polygonOffsetFactor: -1,
      polygonOffsetUnits: -1
    });
    const contactDisc = new THREE.Mesh(new THREE.CircleGeometry(1.25, 32), contactMat);
    contactDisc.rotation.x = -Math.PI / 2;
    contactDisc.position.y = -1.29;
    this.stageGroup.add(contactDisc);

    const brassRing = new THREE.Mesh(new THREE.TorusGeometry(1.88, 0.045, 16, 48), brassMat);
    brassRing.rotation.x = Math.PI / 2;
    brassRing.position.y = -1.31;
    this.stageGroup.add(brassRing);

    const innerRing = new THREE.Mesh(new THREE.TorusGeometry(1.32, 0.025, 12, 48), brassMat);
    innerRing.rotation.x = Math.PI / 2;
    innerRing.position.y = -1.28;
    this.stageGroup.add(innerRing);
  }

  /**
   * Build multi-part 3–12 part 3D botanical sculptures for all 5 Vietnamese herbs
   */
  buildAllBotanicalModels() {
    this.pivotGroup = new THREE.Group();
    this.pivotGroup.position.y = -0.15;
    this.stageGroup.add(this.pivotGroup);

    this.botanicalGroups.turmeric = this.createTurmericSculpture();
    this.botanicalGroups.grapefruit = this.createGrapefruitSculpture();
    this.botanicalGroups.ginseng = this.createGinsengSculpture();
    this.botanicalGroups.soapberry = this.createSoapberrySculpture();
    this.botanicalGroups.ginger = this.createGingerSculpture();

    Object.values(this.botanicalGroups).forEach((grp) => {
      grp.visible = false;
      this.pivotGroup.add(grp);
    });
  }

  createTurmericSculpture() {
    const group = new THREE.Group();
    const skinMat = new THREE.MeshStandardMaterial({
      color: 0xc86414,
      roughness: 0.62,
      metalness: 0.08
    });
    const sliceMat = new THREE.MeshPhysicalMaterial({
      color: 0xff8c1a,
      emissive: 0x5c2400,
      emissiveIntensity: 0.35,
      roughness: 0.24,
      clearcoat: 0.65
    });
    const leafMat = new THREE.MeshStandardMaterial({
      color: 0x2a6f37,
      roughness: 0.42
    });

    const nodes = [
      [0, 0, 0, 0.52, 1.35, 0.25],
      [-0.55, -0.15, 0.25, 0.36, 0.95, -0.45],
      [0.58, -0.1, -0.2, 0.38, 1.0, 0.55],
      [0.15, 0.45, 0.35, 0.32, 0.8, -0.3]
    ];
    nodes.forEach(([x, y, z, r, len, rotZ]) => {
      const m = new THREE.Mesh(new THREE.CapsuleGeometry(r, len, 12, 24), skinMat);
      m.position.set(x, y, z);
      m.rotation.z = rotZ;
      m.rotation.x = 0.2;
      group.add(m);
    });

    const slices = [
      [0.45, -0.35, 0.65, 0.44, 0.3],
      [-0.35, -0.5, 0.72, 0.36, -0.25],
      [0.05, -0.62, 0.85, 0.32, 0.1]
    ];
    slices.forEach(([x, y, z, rad, rx]) => {
      const disc = new THREE.Mesh(new THREE.CylinderGeometry(rad, rad, 0.14, 28), sliceMat);
      disc.position.set(x, y, z);
      disc.rotation.set(Math.PI / 2.6 + rx, 0.2, 0);
      group.add(disc);
    });

    const leaf = new THREE.Mesh(new THREE.ConeGeometry(0.45, 1.8, 16), leafMat);
    leaf.scale.set(1.2, 1, 0.18);
    leaf.position.set(-0.25, 0.85, -0.35);
    leaf.rotation.z = 0.28;
    group.add(leaf);

    return group;
  }

  createGrapefruitSculpture() {
    const group = new THREE.Group();
    const peelMat = new THREE.MeshPhysicalMaterial({
      color: 0x4ca64c,
      roughness: 0.48,
      clearcoat: 0.45,
      clearcoatRoughness: 0.25
    });
    const petalMat = new THREE.MeshPhysicalMaterial({
      color: 0xfdfbf7,
      roughness: 0.18,
      transmission: this.isSoftwareGl ? 0 : 0.25,
      clearcoat: 0.4
    });
    const stamenMat = new THREE.MeshStandardMaterial({
      color: 0xf4b42a,
      emissive: 0x6b4400,
      emissiveIntensity: 0.4,
      roughness: 0.3
    });

    const pomelo = new THREE.Mesh(new THREE.SphereGeometry(0.88, 32, 32), peelMat);
    pomelo.scale.set(1, 1.08, 1);
    pomelo.position.set(-0.25, -0.1, -0.1);
    group.add(pomelo);

    const blossomGroup = new THREE.Group();
    blossomGroup.position.set(0.62, 0.32, 0.55);
    blossomGroup.rotation.set(0.35, -0.4, 0.15);
    for (let i = 0; i < 5; i++) {
      const angle = (i / 5) * Math.PI * 2;
      const petal = new THREE.Mesh(new THREE.SphereGeometry(0.32, 18, 18), petalMat);
      petal.scale.set(0.55, 1.25, 0.22);
      petal.position.set(Math.cos(angle) * 0.42, Math.sin(angle) * 0.42, 0);
      petal.rotation.z = angle - Math.PI / 2;
      blossomGroup.add(petal);
    }
    const center = new THREE.Mesh(new THREE.SphereGeometry(0.18, 16, 16), stamenMat);
    blossomGroup.add(center);
    group.add(blossomGroup);

    const dropMat = new THREE.MeshPhysicalMaterial({
      color: 0xdaf7a6,
      roughness: 0.08,
      metalness: 0.1,
      clearcoat: 1
    });
    [
      [0.85, -0.35, 0.4, 0.18],
      [-0.85, 0.55, 0.35, 0.14],
      [0.2, 0.95, 0.2, 0.12]
    ].forEach(([x, y, z, r]) => {
      const drop = new THREE.Mesh(new THREE.SphereGeometry(r, 16, 16), dropMat);
      drop.position.set(x, y, z);
      group.add(drop);
    });

    return group;
  }

  createGinsengSculpture() {
    const group = new THREE.Group();
    const rootMat = new THREE.MeshStandardMaterial({
      color: 0xc98a4b,
      roughness: 0.54,
      metalness: 0.12
    });
    const pearlMat = new THREE.MeshPhysicalMaterial({
      color: 0xfff8eb,
      roughness: 0.12,
      metalness: 0.15,
      clearcoat: 1,
      iridescence: 0.7
    });

    const taproot = new THREE.Mesh(new THREE.ConeGeometry(0.48, 1.9, 24), rootMat);
    taproot.position.set(0, 0.05, 0);
    taproot.rotation.z = 0.12;
    group.add(taproot);

    const crown = new THREE.Mesh(new THREE.SphereGeometry(0.46, 24, 24), rootMat);
    crown.position.set(-0.08, 0.82, 0);
    group.add(crown);

    const branches = [
      [-0.45, -0.25, 0.25, 0.2, 1.0, 0.48],
      [0.45, -0.3, -0.18, 0.22, 1.05, -0.45],
      [0.2, -0.55, 0.38, 0.16, 0.85, -0.25],
      [-0.25, -0.6, -0.35, 0.15, 0.8, 0.35]
    ];
    branches.forEach(([x, y, z, r, h, rz]) => {
      const br = new THREE.Mesh(new THREE.ConeGeometry(r, h, 16), rootMat);
      br.position.set(x, y, z);
      br.rotation.z = rz;
      group.add(br);
    });

    [
      [0.65, 0.35, 0.45, 0.26],
      [-0.62, 0.2, 0.5, 0.2],
      [0.35, -0.45, 0.65, 0.17]
    ].forEach(([x, y, z, r]) => {
      const pearl = new THREE.Mesh(new THREE.SphereGeometry(r, 24, 24), pearlMat);
      pearl.position.set(x, y, z);
      group.add(pearl);
    });

    return group;
  }

  createSoapberrySculpture() {
    const group = new THREE.Group();
    const podMat = new THREE.MeshPhysicalMaterial({
      color: 0x3d2212,
      roughness: 0.24,
      metalness: 0.15,
      clearcoat: 0.75
    });
    const seedMat = new THREE.MeshStandardMaterial({
      color: 0xd49b4b,
      roughness: 0.52,
      metalness: 0.3
    });

    for (let i = 0; i < 3; i++) {
      const pod = new THREE.Mesh(new THREE.CapsuleGeometry(0.24, 1.55, 12, 24), podMat);
      pod.scale.set(1.15, 1, 0.38);
      pod.position.set((i - 1) * 0.42, (i % 2) * 0.15 - 0.05, (i - 1) * 0.22);
      pod.rotation.set(0.25 * i, 0.3 * i, -0.35 + i * 0.32);
      group.add(pod);
    }

    [
      [0.55, 0.45, 0.55, 0.22],
      [-0.55, -0.35, 0.6, 0.18],
      [0.1, 0.75, 0.35, 0.15]
    ].forEach(([x, y, z, r]) => {
      const orb = new THREE.Mesh(new THREE.SphereGeometry(r, 20, 20), seedMat);
      orb.position.set(x, y, z);
      group.add(orb);
    });

    return group;
  }

  createGingerSculpture() {
    const group = new THREE.Group();
    const gingerMat = new THREE.MeshStandardMaterial({
      color: 0xd49649,
      roughness: 0.58,
      metalness: 0.08
    });
    const warmCoreMat = new THREE.MeshPhysicalMaterial({
      color: 0xf7b948,
      emissive: 0x8a3800,
      emissiveIntensity: 0.45,
      roughness: 0.22,
      clearcoat: 0.55
    });

    const lobes = [
      [0, -0.1, 0, 0.52],
      [-0.55, 0.18, 0.15, 0.42],
      [0.56, 0.12, -0.1, 0.44],
      [-0.25, 0.58, -0.12, 0.35],
      [0.32, 0.55, 0.22, 0.36],
      [0, -0.52, 0.38, 0.34]
    ];
    lobes.forEach(([x, y, z, r]) => {
      const lobe = new THREE.Mesh(new THREE.SphereGeometry(r, 24, 24), gingerMat);
      lobe.scale.set(1.15, 0.92, 0.88);
      lobe.position.set(x, y, z);
      group.add(lobe);
    });

    [
      [0.42, -0.25, 0.62, 0.36],
      [-0.38, -0.35, 0.66, 0.3]
    ].forEach(([x, y, z, r]) => {
      const cut = new THREE.Mesh(new THREE.CylinderGeometry(r, r, 0.12, 24), warmCoreMat);
      cut.position.set(x, y, z);
      cut.rotation.x = Math.PI / 2.3;
      group.add(cut);
    });

    return group;
  }

  /**
   * Build InstancedMesh floating golden botanical pollen particles
   */
  buildPollenParticles() {
    const count = 48;
    this.pollenCount = count;
    const geo = new THREE.SphereGeometry(0.032, 8, 8);
    this.pollenMat = new THREE.MeshBasicMaterial({
      color: 0xffd275,
      transparent: true,
      opacity: 0.78
    });
    this.pollenMesh = new THREE.InstancedMesh(geo, this.pollenMat, count);
    this.pollenMesh.frustumCulled = false;
    this.pollenData = [];

    for (let i = 0; i < count; i++) {
      const radius = 1.3 + (i % 7) * 0.28;
      const angle = (i / count) * Math.PI * 2;
      const y = -0.9 + ((i * 17) % 24) * 0.1;
      const scale = 0.85 + (i % 4) * 0.1;
      this.pollenData.push({ radius, angle, y, scale, speed: 0.005 + (i % 5) * 0.0015 });
      _dummy.position.set(Math.cos(angle) * radius, y, Math.sin(angle) * radius);
      _dummy.scale.setScalar(scale);
      _dummy.updateMatrix();
      this.pollenMesh.setMatrixAt(i, _dummy.matrix);
    }
    this.pollenMesh.instanceMatrix.needsUpdate = true;
    this.pollenMesh.computeBoundingSphere();
    this.stageGroup.add(this.pollenMesh);
  }

  /**
   * Switch active 3D botanical world and transition scene palette/lighting
   * @param {string} botanicalId
   */
  setBotanical(botanicalId) {
    const world = BOTANICAL_WORLDS.find((b) => b.id === botanicalId) || BOTANICAL_WORLDS[0];
    this.activeBotanicalId = world.id;

    Object.entries(this.botanicalGroups).forEach(([id, grp]) => {
      grp.visible = id === world.id;
    });

    if (this.scene) {
      this.scene.background = new THREE.Color(world.palette.fogColor);
      if (this.scene.fog) {
        this.scene.fog.color.setHex(world.palette.fogColor);
      }
      if (this.keyLight) {
        this.keyLight.color.setHex(world.palette.lightColor);
      }
      if (this.rimLight) {
        this.rimLight.color.setHex(world.palette.accentColor);
      }
      if (this.pollenMat) {
        this.pollenMat.color.setHex(world.palette.lightColor);
      }
    }

    this.targetRotation.y += 0.35;
    this.requestRender(this.isSoftwareGl ? 4 : 36);
  }

  resetCamera() {
    this.targetRotation = { x: 0.18, y: 0.45 };
    this.targetZoom = 5.2;
    this.requestRender(this.isSoftwareGl ? 4 : 30);
  }

  toggleAutoRotate() {
    this.autoRotate = !this.autoRotate;
    if (this.autoRotate) {
      this.requestRender(this.isSoftwareGl ? 8 : 60);
    }
    return this.autoRotate;
  }

  bindInteractionEvents() {
    const dom = this.renderer ? this.renderer.domElement : null;
    if (!dom) return;

    dom.addEventListener('pointerdown', (e) => {
      this.isDragging = true;
      this.prevPointer = { x: e.clientX, y: e.clientY };
      dom.setPointerCapture(e.pointerId);
      this.requestRender(this.isSoftwareGl ? 4 : 25);
    });

    dom.addEventListener('pointermove', (e) => {
      if (!this.isDragging) return;
      const dx = e.clientX - this.prevPointer.x;
      const dy = e.clientY - this.prevPointer.y;
      this.prevPointer = { x: e.clientX, y: e.clientY };
      this.targetRotation.y += dx * 0.011;
      this.targetRotation.x = Math.max(-0.45, Math.min(0.65, this.targetRotation.x + dy * 0.008));
      this.requestRender(this.isSoftwareGl ? 3 : 20);
    });

    const endDrag = () => {
      this.isDragging = false;
    };
    dom.addEventListener('pointerup', endDrag);
    dom.addEventListener('pointercancel', endDrag);

    this.resizeHandler = () => {
      if (!this.container || !this.renderer || !this.camera) return;
      const w = Math.max(280, this.container.clientWidth || 640);
      const h = Math.max(280, this.container.clientHeight || 420);
      this.camera.aspect = w / h;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(w, h, false);
      this.requestRender(2);
    };
    window.addEventListener('resize', this.resizeHandler);
  }

  /**
   * Wait for GPU/SwiftShader draw commands to complete before scheduling next frame
   * @param {Function} cb
   */
  afterDraw(cb) {
    if (!this.renderer || this.disposed) return;
    const gl = this.renderer.getContext();
    if (!gl || typeof gl.fenceSync !== 'function') {
      this.frameId = window.setTimeout(cb, 80);
      return;
    }
    const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
    gl.flush();
    const poll = () => {
      if (this.disposed) return;
      const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
      if (state === gl.UNSIGNALED) {
        this.frameId = window.setTimeout(poll, 5);
      } else {
        if (sync) gl.deleteSync(sync);
        this.frameId = window.setTimeout(cb, 80);
      }
    };
    this.frameId = window.setTimeout(poll, 5);
  }

  /**
   * Coalesced on-demand render request with software-WebGL afterDraw pacing
   * @param {number} steps
   */
  requestRender(steps = 1) {
    if (this.disposed || !this.renderer) return;
    this.remainingSteps = Math.max(this.remainingSteps, steps);
    if (this.renderBusy) {
      this.renderDirty = true;
      return;
    }
    this.renderBusy = true;
    this.frameId = requestAnimationFrame(() => {
      if (this.disposed || !this.renderer) return;
      this.renderDirty = false;
      this.stepScene();
      this.renderer.render(this.scene, this.camera);
      this.remainingSteps = Math.max(0, this.remainingSteps - 1);

      const done = () => {
        this.renderBusy = false;
        if (this.renderDirty || this.remainingSteps > 0) {
          this.requestRender(this.remainingSteps);
        }
      };

      if (this.isSoftwareGl) {
        this.afterDraw(done);
      } else {
        done();
      }
    });
  }

  stepScene() {
    if (this.autoRotate && !this.isDragging) {
      this.targetRotation.y += 0.012;
    }

    const factor = this.isSoftwareGl ? 0.45 : 0.16;
    this.currentRotation.x = THREE.MathUtils.lerp(
      this.currentRotation.x,
      this.targetRotation.x,
      factor
    );
    this.currentRotation.y = THREE.MathUtils.lerp(
      this.currentRotation.y,
      this.targetRotation.y,
      factor
    );
    this.currentZoom = THREE.MathUtils.lerp(this.currentZoom, this.targetZoom, factor);

    if (this.pivotGroup) {
      this.pivotGroup.rotation.x = this.currentRotation.x;
      this.pivotGroup.rotation.y = this.currentRotation.y;
    }

    if (this.camera) {
      this.camera.position.z = this.currentZoom;
    }

    if (this.pollenMesh && this.pollenData) {
      for (let i = 0; i < this.pollenCount; i++) {
        const p = this.pollenData[i];
        p.angle += p.speed;
        _dummy.position.set(
          Math.cos(p.angle) * p.radius,
          p.y + Math.sin(p.angle * 2) * 0.08,
          Math.sin(p.angle) * p.radius
        );
        _dummy.scale.setScalar(p.scale);
        _dummy.updateMatrix();
        this.pollenMesh.setMatrixAt(i, _dummy.matrix);
      }
      this.pollenMesh.instanceMatrix.needsUpdate = true;
    }
  }

  renderFallbackSvg() {
    if (!this.container) return;
    this.container.innerHTML = `
      <div class="garden-svg-fallback">
        <svg viewBox="0 0 400 260" aria-label="Vietnamese Botanical Sanctuary">
          <circle cx="200" cy="130" r="88" fill="#e07a16" opacity="0.25"/>
          <circle cx="200" cy="130" r="56" fill="#f5b82e" opacity="0.65"/>
        </svg>
      </div>
    `;
  }

  dispose() {
    this.disposed = true;
    if (this.frameId) {
      cancelAnimationFrame(this.frameId);
      clearTimeout(this.frameId);
    }
    if (this.resizeHandler) window.removeEventListener('resize', this.resizeHandler);
    if (this.renderer) {
      this.renderer.dispose();
    }
  }
}
