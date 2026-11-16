// Hardware in 3D (#hardware): drehbares Modell eines Rechners, Klick auf ein Bauteil zeigt die Erklärung.
// three.js wird erst beim Öffnen des Reiters von cdnjs geladen. Ohne 3D bleibt die Bauteil-Liste voll nutzbar.
(function () {
  const $ = AP2.$, esc = AP2.esc, HW = AP2.HW || [], byId = {};
  HW.forEach(p => { byId[p.id] = p; });
  const THREE_URL = "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js";
  const store = () => { const s = AP2.state(); s.hw = s.hw || {}; s.hw.seen = s.hw.seen || {}; s.hw.found = s.hw.found || {}; return s.hw; };

  // =====================================================================
  // 3D-Szene. Einheiten: Zentimeter. Platine: x −15,25…15,25 · z −12,2…12,2 · Oberseite y = 0.
  // Hinten (Anschlussfeld-Seite oben links) = −z, Kamera startet vorn rechts.
  // =====================================================================
  function buildScene(THREE, canvas, stage, hooks) {
    const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
    renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    const maxAniso = renderer.capabilities.getMaxAnisotropy();
    const scene = new THREE.Scene(), camera = new THREE.PerspectiveCamera(35, 1, 1, 600);

    // Licht: weiches Raumlicht + Hauptlicht mit Schatten + blaues Kantenlicht von hinten
    scene.add(new THREE.HemisphereLight(0xdde8ff, 0x18202c, 0.3));
    const key = new THREE.DirectionalLight(0xffffff, 1.25); key.position.set(30, 58, 36); key.target.position.set(10, 0, 3);
    key.castShadow = true; key.shadow.mapSize.set(2048, 2048); key.shadow.bias = -0.0006; key.shadow.normalBias = 0.06;
    Object.assign(key.shadow.camera, { left: -48, right: 48, top: 48, bottom: -48, near: 5, far: 170 });
    const rim = new THREE.DirectionalLight(0x6aa5ff, 0.75); rim.position.set(-36, 26, -40);
    scene.add(key, key.target, rim);
    // Umgebung für Metall-Spiegelungen (kleiner „Studio-Raum“ mit hellen Flächen)
    try {
      const env = new THREE.Scene();
      env.add(new THREE.Mesh(new THREE.BoxGeometry(100, 100, 100), new THREE.MeshBasicMaterial({ color: 0x35425a, side: THREE.BackSide })));
      [[0, 49, 0, 64, 1, 64, 0xffffff], [-49, 12, 0, 1, 44, 64, 0x9fc0ff], [49, 12, 18, 1, 32, 44, 0xfff1dd], [0, 12, -49, 64, 32, 1, 0xcfd8e6], [0, -49, 0, 100, 1, 100, 0x0d1320]]
        .forEach(a => { const m = new THREE.Mesh(new THREE.BoxGeometry(a[3], a[4], a[5]), new THREE.MeshBasicMaterial({ color: a[6] })); m.position.set(a[0], a[1], a[2]); env.add(m); });
      const pm = new THREE.PMREMGenerator(renderer); scene.environment = pm.fromScene(env, 0.03).texture; pm.dispose();
    } catch (e) {}

    // Boden: nimmt nur Schatten auf, dazu ein feines Raster
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(400, 400), new THREE.ShadowMaterial({ opacity: 0.42 }));
    floor.rotation.x = -Math.PI / 2; floor.position.y = -0.45; floor.receiveShadow = true; scene.add(floor);
    const grid = new THREE.GridHelper(240, 48, 0x5b7cb0, 0x3a5078); grid.position.y = -0.44; grid.material.transparent = true; grid.material.opacity = 0.22; scene.add(grid);

    // ---------- Bausteine ----------
    const root = new THREE.Group(); scene.add(root);
    const groups = {}, rotors = [];
    const M = (color, rough, metal, extra) => new THREE.MeshStandardMaterial(Object.assign({ color, roughness: rough == null ? 0.6 : rough, metalness: metal || 0, envMapIntensity: 0.42 }, extra));
    function grp(id, lift) { const g = new THREE.Group(); g.userData.id = id; g.userData.lift = Array.isArray(lift) ? lift : [0, lift || 0, 0]; root.add(g); (groups[id] = groups[id] || []).push(g); return g; }
    function add(g, geo, m, x, y, z) { const o = new THREE.Mesh(geo, m); o.position.set(x, y, z); g.add(o); return o; }
    const box = (g, w, h, d, x, y0, z, m) => add(g, new THREE.BoxGeometry(w, h, d), m, x, y0 + h / 2, z);
    const cyl = (g, r, h, x, y0, z, m, seg) => add(g, new THREE.CylinderGeometry(r, r, h, seg || 28), m, x, y0 + h / 2, z);
    function canvasTex(w, h, draw) { const c = document.createElement("canvas"); c.width = w; c.height = h; draw(c.getContext("2d"), w, h); const t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; t.anisotropy = maxAniso; return t; }
    function labelTex(lines, bg, fg, w, h) {
      return canvasTex(w || 512, h || 320, (c, W, H) => { c.fillStyle = bg; c.fillRect(0, 0, W, H); c.fillStyle = fg; c.textBaseline = "top";
        lines.forEach((l, i) => { c.font = (i === 0 ? "700 " + Math.round(H * 0.2) : "500 " + Math.round(H * 0.105)) + "px 'Space Grotesk',Arial,sans-serif"; c.fillText(l, W * 0.07, i === 0 ? H * 0.1 : H * 0.4 + (i - 1) * H * 0.15); }); });
    }
    // Quader mit bedruckter Fläche: face 2 = oben, 4 = vorn (+z)
    const faced = (base, tex, face) => { const a = [0, 1, 2, 3, 4, 5].map(() => base.clone()); a[face] = M(0xffffff, 0.6, 0.05, { map: tex }); return a; };
    const sticker = (g, w, d, x, y, z, lines, bg, fg) => box(g, w, 0.04, d, x, y, z, faced(M(bg, 0.7), labelTex(lines, bg, fg, 512, Math.round(512 * d / w)), 2));
    function pinTex(cols, rows, body, hole) { return canvasTex(cols * 32, rows * 32, (c, W, H) => { c.fillStyle = body; c.fillRect(0, 0, W, H); c.fillStyle = hole; for (let i = 0; i < cols; i++) for (let k = 0; k < rows; k++) c.fillRect(i * 32 + 7, k * 32 + 7, 18, 18); }); }
    function tube(g, pts, r, m) { const o = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts.map(p => new THREE.Vector3(p[0], p[1], p[2]))), 40, r, 10, false), m); g.add(o); return o; }
    // Lüfter: gebaut um die lokale z-Achse, dann auf die gewünschte Achse gedreht
    function fan(g, x, y, z, R, thick, axis, frame) {
      const f = new THREE.Group(); f.position.set(x, y, z);
      if (axis === "x") f.rotation.y = Math.PI / 2; else if (axis === "y") f.rotation.x = -Math.PI / 2;
      const rotor = new THREE.Group(); f.add(rotor);
      const hub = new THREE.Mesh(new THREE.CylinderGeometry(R * 0.3, R * 0.3, thick * 0.8, 28), M(0x14171c, 0.45, 0.3)); hub.rotation.x = Math.PI / 2; rotor.add(hub);
      const cap = new THREE.Mesh(new THREE.CylinderGeometry(R * 0.17, R * 0.17, thick * 0.84, 24), M(0x3f7fe0, 0.4, 0.3)); cap.rotation.x = Math.PI / 2; rotor.add(cap);
      for (let k = 0; k < 9; k++) { const p = new THREE.Group(); p.rotation.z = k / 9 * Math.PI * 2; const b = new THREE.Mesh(new THREE.BoxGeometry(R * 0.5, R * 0.66, 0.1), M(0x2a3039, 0.5, 0.15)); b.position.y = R * 0.62; b.rotation.y = 0.5; p.add(b); rotor.add(p); }
      f.add(new THREE.Mesh(new THREE.TorusGeometry(R + 0.12, 0.17, 10, 48), M(0x1a1d23, 0.5, 0.3)));
      if (frame) { const s = 2 * R + 0.7, fm = M(0x1a1d23, 0.6, 0.1);
        [[0, R + 0.1, s, 0.5], [0, -R - 0.1, s, 0.5], [R + 0.1, 0, 0.5, s], [-R - 0.1, 0, 0.5, s]].forEach(a => { const m = new THREE.Mesh(new THREE.BoxGeometry(a[2], a[3], thick), fm); m.position.set(a[0], a[1], 0); f.add(m); }); }
      g.add(f); rotors.push(rotor);
    }
    function slot(g, x0, x1, z, col) { const len = x1 - x0, cx = (x0 + x1) / 2; box(g, len, 1.05, 0.75, cx, 0, z, M(col, 0.5)); box(g, len - 0.5, 0.06, 0.2, cx, 1.05, z, M(0x08090b, 0.9)); box(g, 0.45, 1.5, 0.75, x1 + 0.22, 0, z, M(0x8b93a0, 0.5)); }
    function pins(g, x, z, cols, rows, col) { box(g, cols * 0.26 + 0.2, 0.25, rows * 0.26 + 0.2, x, 0, z, M(col || 0x15171b, 0.6)); const gm = M(0xd9ae4a, 0.35, 0.8);
      for (let i = 0; i < cols; i++) for (let k = 0; k < rows; k++) box(g, 0.07, 0.6, 0.07, x + (i - (cols - 1) / 2) * 0.26, 0.25, z + (k - (rows - 1) / 2) * 0.26, gm); }

    const gold = () => M(0xd9ae4a, 0.35, 0.85), steel = () => M(0xc7ccd4, 0.3, 0.9), alu = () => M(0x98a1ab, 0.4, 0.75), dark = () => M(0x1b1e24, 0.55, 0.1), pcbG = () => M(0x1c6a47, 0.55, 0.1);

    // ---------- Mainboard ----------
    const pcbTex = canvasTex(2048, 1638, (c, W, H) => {
      const px = x => (x + 15.25) / 30.5 * W, pz = z => (z + 12.2) / 24.4 * H;
      let seed = 7; const rnd = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
      c.fillStyle = "#0d3a35"; c.fillRect(0, 0, W, H);
      c.lineCap = "round"; c.lineJoin = "round";
      for (let i = 0; i < 230; i++) { // Leiterbahnen: waagrecht, senkrecht, 45°
        let x = rnd() * W, y = rnd() * H; c.beginPath(); c.moveTo(x, y); c.lineWidth = 2 + rnd() * 2.5; c.strokeStyle = "rgba(120,225,190," + (0.1 + rnd() * 0.12).toFixed(2) + ")";
        for (let k = 0; k < 4; k++) { const d = Math.floor(rnd() * 8), L = 30 + rnd() * 170, dx = [1, 1, 0, -1, -1, -1, 0, 1][d], dy = [0, 1, 1, 1, 0, -1, -1, -1][d]; x += dx * L; y += dy * L; c.lineTo(x, y); }
        c.stroke(); c.fillStyle = "rgba(222,196,120,.55)"; c.beginPath(); c.arc(x, y, 4.5, 0, 7); c.fill();
      }
      c.fillStyle = "rgba(236,246,241,.82)"; c.font = "700 22px 'IBM Plex Mono',Consolas,monospace"; c.textBaseline = "middle";
      [["PCIEX16_1", -3, 3.2], ["PCIEX16_2", -3, 7.3], ["PCIEX1_1", -9.3, 9.6], ["M.2_1 (SOCKET 3)", -3, 2.35], ["DIMM_A1  A2  B1  B2", 5.3, 2.75], ["SATA6G_1-6", 9.6, 3.3], ["EATXPWR", 11.1, -1.9],
       ["F_PANEL", 10.6, 10.6], ["USB_E12", 6.3, 10.6], ["USB_E34", 2.9, 10.6], ["SYS_FAN1", -2, 10.6], ["AAFP", -13.6, 10.6], ["BAT", 0.9, 8.1], ["BIOS", 4, 9.5], ["CPU_FAN", 3.3, -11.6]]
        .forEach(a => c.fillText(a[0], px(a[1]), pz(a[2])));
      c.font = "700 30px 'Space Grotesk',Arial,sans-serif"; c.fillStyle = "rgba(236,246,241,.9)"; c.fillText("AP2-ATX  ·  REV 1.0", px(-9.3), pz(11.4));
      [[14.4, -11.4], [14.4, 11.4], [-14.4, 11.4], [14.4, 3], [-3.4, -11.6]].forEach(a => { c.beginPath(); c.arc(px(a[0]), pz(a[1]), 15, 0, 7); c.fillStyle = "rgba(222,196,120,.8)"; c.fill(); c.beginPath(); c.arc(px(a[0]), pz(a[1]), 8, 0, 7); c.fillStyle = "#061a18"; c.fill(); });
    });
    const gBoard = grp("board"); box(gBoard, 30.5, 0.2, 24.4, 0, -0.2, 0, faced(M(0x0a2a27, 0.7), pcbTex, 2));

    // ---------- CPU + Sockel ----------
    const CX = -2, CZ = -5;
    const gCpu = grp("cpu", 3);
    box(gCpu, 4.5, 0.14, 4.5, CX, 0.36, CZ, pcbG());
    box(gCpu, 3.7, 0.3, 3.7, CX, 0.5, CZ, steel());
    const gSock = grp("cpu");
    box(gSock, 5.6, 0.36, 5.6, CX, 0, CZ, M(0x2a2e35, 0.6));
    box(gSock, 3.9, 0.02, 3.9, CX, 0.35, CZ, gold());
    [[-3.0, 0], [3.0, 0]].forEach(a => box(gSock, 0.35, 0.5, 5.9, CX + a[0], 0, CZ, steel()));

    // ---------- CPU-Kühler ----------
    const gCool = grp("cooler", 12);
    box(gCool, 4, 0.5, 4, CX, 0.85, CZ, M(0xb9794a, 0.35, 0.85));
    [-1.5, -0.5, 0.5, 1.5].forEach(d => cyl(gCool, 0.28, 11.2, CX + d * 0.9 - 0.6, 1.3, CZ - 2.2 + (d + 1.5) * 1.45, M(0xb9794a, 0.3, 0.9), 14));
    for (let i = 0; i < 24; i++) box(gCool, 5, 0.07, 10, CX, 3 + i * 0.39, CZ, alu());
    box(gCool, 5.1, 0.22, 10.1, CX, 12.4, CZ, M(0x16191e, 0.5, 0.4));
    fan(gCool, CX + 3.8, 7.7, CZ, 4.65, 2.4, "x", true);

    // ---------- RAM ----------
    const gRam = grp("ram", 5.5), gDimm = grp("ram"), RZ = -4.7;
    [5.5, 6.7, 7.9, 9.1].forEach((x, i) => {
      box(gDimm, 0.7, 0.9, 13.6, x, 0, RZ, M(i % 2 ? 0x1b1e24 : 0x6f7783, 0.5)); box(gDimm, 0.2, 0.05, 13.2, x, 0.9, RZ, M(0x08090b, 0.9));
      [-7.0, 7.0].forEach(dz => box(gDimm, 0.7, 1.7, 0.45, x, 0, RZ + dz, M(0xd6dae0, 0.5)));
      if (i % 2) {
        box(gRam, 0.14, 3.1, 13.3, x, 0.5, RZ, pcbG());
        box(gRam, 0.17, 0.36, 7.1, x, 0.5, RZ - 3.1, gold()); box(gRam, 0.17, 0.36, 5.7, x, 0.5, RZ + 3.8, gold());
        for (let k = 0; k < 8; k++) box(gRam, 0.14, 1.15, 1.2, x + 0.11, 1.5, RZ + (k - 3.5) * 1.55, M(0x0f1114, 0.4, 0.1));
        box(gRam, 0.03, 0.8, 3.2, x + 0.19, 2.75, RZ + 2, M(0xe9edf2, 0.7));
      }
    });

    // ---------- PCIe-Slots, Grafikkarte, Netzwerkkarte ----------
    const gPcie = grp("pcie"); slot(gPcie, -12.5, -3.6, 3.2, 0x1b1e24); slot(gPcie, -12.5, -3.6, 7.3, 0x1b1e24); slot(gPcie, -12.5, -10, 9.6, 0x1b1e24);
    const gGpu = grp("gpu", 10), GZ = 3.2;
    box(gGpu, 23, 10, 0.15, -1.5, 1, GZ, M(0x14161a, 0.6));                       // Platine
    box(gGpu, 8.5, 0.7, 0.17, -8.05, 0.3, GZ, gold());                            // Kontaktleiste
    box(gGpu, 23, 10, 0.1, -1.5, 1, GZ - 0.2, M(0x23262d, 0.35, 0.7));            // Backplate
    for (let i = 0; i < 26; i++) box(gGpu, 0.1, 8.6, 2.0, -12 + i * 0.86, 1.7, GZ + 1.15, alu()); // Kühlrippen
    const sh = () => M(0x1c1f25, 0.45, 0.25);
    box(gGpu, 22.6, 0.7, 1.3, -1.3, 10.3, GZ + 2.8, sh()); box(gGpu, 22.6, 0.7, 1.3, -1.3, 1.2, GZ + 2.8, sh());
    [-12, -1.3, 9.4].forEach(x => box(gGpu, 1.2, 8.4, 1.3, x, 1.9, GZ + 2.8, sh()));
    fan(gGpu, -6.65, 6.1, GZ + 2.8, 4.15, 1.1, "z"); fan(gGpu, 4.05, 6.1, GZ + 2.8, 4.15, 1.1, "z");
    const stripe = M(0x3f8cff, 0.4, 0, { emissive: 0x2f7bff, emissiveIntensity: 0.9 }); stripe.userData.keep = true; box(gGpu, 14, 0.1, 0.5, -1, 11, GZ + 1.2, stripe);
    box(gGpu, 2.3, 0.7, 1, 6.5, 11, GZ + 0.9, M(0x0d0e11, 0.6));                  // Zusatzstrom
    box(gGpu, 0.12, 12.2, 3.9, -13.1, 0, GZ + 1.7, steel());                      // Slotblech
    [[2.2, 1.3], [5.2, 1.6], [8.2, 1.6]].forEach(a => box(gGpu, 0.1, a[1] * 0.4, a[1], -13.2, a[0], GZ + 1.1, M(0x0a0b0d, 0.8)));

    const gNic = grp("nic", 7), NZ = 7.3;
    box(gNic, 10.5, 5.6, 0.15, -7.75, 1, NZ, pcbG());
    box(gNic, 4.2, 0.7, 0.17, -10.2, 0.3, NZ, gold());
    box(gNic, 2.6, 2.6, 0.9, -7, 2.6, NZ + 0.5, alu()); for (let i = 0; i < 6; i++) box(gNic, 2.6, 0.12, 0.5, -7, 2.7 + i * 0.47, NZ + 1.15, alu());
    [1.6, 3.5].forEach(y => { box(gNic, 2.1, 1.5, 1.7, -11.9, y, NZ + 0.95, steel()); box(gNic, 0.1, 1.05, 1.25, -13.2, y + 0.22, NZ + 0.95, M(0x0a0b0d, 0.8)); });
    box(gNic, 0.12, 8, 2.2, -13.1, 0, NZ + 0.75, steel());

    // ---------- M.2-SSD ----------
    const gM2 = grp("m2", 3), MZ = 0.9;
    box(gM2, 8, 0.12, 2.2, 0.8, 0.4, MZ, M(0x15171b, 0.6));
    box(gM2, 0.5, 0.13, 2.0, -3.0, 0.4, MZ, gold());
    box(gM2, 1.3, 0.14, 1.3, -1.6, 0.52, MZ, M(0x0c0d10, 0.4, 0.2));
    [0.6, 2.7].forEach(x => box(gM2, 1.7, 0.12, 1.6, x, 0.52, MZ, M(0x0c0d10, 0.4, 0.2)));
    sticker(gM2, 3.6, 1.7, 1.6, 0.66, MZ, ["NVMe 1 TB", "M.2 2280 · PCIe 4.0 x4"], "#e9edf2", "#10151c");
    const gM2s = grp("m2"); box(gM2s, 0.7, 0.7, 2.6, -3.5, 0, MZ, dark()); cyl(gM2s, 0.3, 0.42, 4.75, 0, MZ, steel(), 12);

    // ---------- Chipsatz ----------
    const gChip = grp("chipset");
    box(gChip, 4.8, 0.45, 4.8, 8.6, 0, 7, M(0x2c313a, 0.4, 0.6));
    for (let i = 0; i < 7; i++) box(gChip, 4.8, 0.55, 0.32, 8.6, 0.45, 7 - 2.1 + i * 0.7, M(0x3a404b, 0.4, 0.6));
    sticker(gChip, 2.2, 1.1, 8.6, 1.0, 7, ["PCH"], "#1d5fc4", "#ffffff");

    // ---------- Spannungswandler ----------
    const gVrm = grp("vrm"), hs = () => M(0x343a45, 0.4, 0.65);
    box(gVrm, 2.2, 1.2, 8, -8.7, 0, -5.5, hs()); for (let i = 0; i < 9; i++) box(gVrm, 2.2, 1.0, 0.35, -8.7, 1.2, -9.2 + i * 0.93, hs());
    box(gVrm, 9, 1.2, 1.6, -2, 0, -10.4, hs()); for (let i = 0; i < 10; i++) box(gVrm, 0.35, 0.9, 1.6, -6.2 + i * 0.93, 1.2, -10.4, hs());
    for (let i = 0; i < 6; i++) { box(gVrm, 0.9, 0.8, 0.9, -6.4, 0, -8 + i * 1.15, M(0x5a616c, 0.5, 0.4)); box(gVrm, 0.9, 0.8, 0.9, -4.9 + i * 1.15, 0, -8.85, M(0x5a616c, 0.5, 0.4)); }
    [[-10.6, -9.6], [-10.6, -8.5], [-10.6, -7.4], [3.4, -10.4], [3.4, -9.4]].forEach(a => { cyl(gVrm, 0.32, 0.85, a[0], 0, a[1], M(0x15171b, 0.5), 16); cyl(gVrm, 0.3, 0.03, a[0], 0.85, a[1], steel(), 16); });

    // ---------- Stromanschlüsse ----------
    const gAtx = grp("atx24");
    box(gAtx, 1.15, 1.4, 5.4, 13.9, 0, -5.3, faced(M(0x101216, 0.6), pinTex(2, 12, "#101216", "#3a3f48"), 2));
    box(gAtx, 0.25, 0.9, 1.1, 14.6, 0.3, -5.3, M(0x101216, 0.6));
    const gAtxPlug = grp("atx24", 4); box(gAtxPlug, 1.25, 1.5, 5.5, 13.9, 1.45, -5.3, M(0x16181d, 0.55));
    const gEps = grp("eps"); box(gEps, 2.3, 1.3, 1.15, -8.4, 0, -11.4, faced(M(0x101216, 0.6), pinTex(4, 2, "#101216", "#3a3f48"), 2)); box(gEps, 0.9, 0.9, 0.22, -8.4, 0.3, -12.05, M(0x101216, 0.6));

    // ---------- SATA ----------
    const gSata = grp("sata");
    [4.6, 6.6, 8.6].forEach(z => { [0, 0.62].forEach(y => { box(gSata, 1.9, 0.56, 1.6, 14.2, y, z, M(0x16181d, 0.55)); box(gSata, 0.08, 0.2, 1.1, 15.17, y + 0.18, z, M(0x4a8cff, 0.5)); }); });
    tube(gSata, [[15.2, 0.9, 4.6], [16.6, 1.3, 3.4], [19.2, 1.3, 2.9], [20.4, 1.0, 4.0]], 0.17, M(0xc2382f, 0.5));

    // ---------- UEFI-Chip + Batterie ----------
    const gBat = grp("uefi", 2.2); cyl(gBat, 1.0, 0.32, 1.5, 0.22, 9.6, steel(), 36);
    const gUefi = grp("uefi"); cyl(gUefi, 1.18, 0.24, 1.5, 0, 9.6, M(0x121418, 0.6), 36); box(gUefi, 0.5, 0.5, 0.5, 2.55, 0, 9.6, steel());
    box(gUefi, 0.85, 0.22, 0.62, 4.6, 0, 10.3, M(0x0c0d10, 0.4)); for (let i = 0; i < 4; i++) [-0.36, 0.36].forEach(dz => box(gUefi, 0.1, 0.1, 0.1, 4.3 + i * 0.2, 0.02, 10.3 + dz, steel()));

    // ---------- Anschlussfeld hinten ----------
    const gIo = grp("io"), ioX = -13.95, face = -15.33, port = c => M(c, 0.6);
    const blk = (z, w, h, m) => box(gIo, 2.7, h, w, ioX, 0, z, m || M(0xbfc5ce, 0.35, 0.85));
    blk(-10.3, 1.9, 1.9); box(gIo, 0.08, 0.5, 1.5, face, 0.3, -10.3, port(0x0a0b0d)); box(gIo, 0.08, 0.5, 1.6, face, 1.15, -10.3, port(0x0a0b0d));
    blk(-8.1, 1.6, 1.7); [0.3, 1.0].forEach(y => box(gIo, 0.08, 0.42, 1.2, face, y, -8.1, port(0x101114)));
    blk(-6.1, 1.6, 1.7); [0.3, 1.0].forEach(y => box(gIo, 0.08, 0.42, 1.2, face, y, -6.1, port(0x1d5fd6)));
    blk(-3.9, 1.8, 3.0); [0.3, 1.0].forEach(y => box(gIo, 0.08, 0.42, 1.2, face, y, -3.9, port(0x1d5fd6))); box(gIo, 0.08, 1.15, 1.4, face, 1.65, -3.9, port(0x0a0b0d));
    blk(-1.9, 1.4, 2.7, M(0x1b1e24, 0.6)); [[0.45, 0x6fcf6f], [1.3, 0xf08fb0], [2.15, 0x6aa5ff]].forEach(a => { const c = cyl(gIo, 0.34, 0.14, face + 0.02, a[0] - 0.07, -1.9, port(a[1]), 20); c.rotation.z = Math.PI / 2; });

    // ---------- Stiftleisten ----------
    const gHead = grp("header");
    pins(gHead, 11.4, 11.5, 10, 2); pins(gHead, 6.9, 11.5, 5, 2); pins(gHead, 3.5, 11.5, 5, 2); pins(gHead, -1.2, 11.5, 4, 1, 0xdfe3e8); pins(gHead, -13, 11.5, 5, 2); pins(gHead, 4.3, -11.6, 4, 1, 0xdfe3e8);
    box(gHead, 2.3, 0.9, 1.0, -5.5, 0, 11.4, M(0x1d5fd6, 0.5));

    // ---------- Netzteil ----------
    const gPsu = grp("psu"), PX = 25.5, PZ = -5;
    const psuTex = canvasTex(1024, 587, (c, W, H) => { c.fillStyle = "#1b1e24"; c.fillRect(0, 0, W, H); c.fillStyle = "#e9edf2"; c.fillRect(70, 70, W - 140, H - 140); c.fillStyle = "#10151c"; c.textBaseline = "top";
      c.font = "700 92px 'Space Grotesk',Arial,sans-serif"; c.fillText("650 W", 110, 100); c.font = "600 44px 'Space Grotesk',Arial,sans-serif"; c.fillText("80 PLUS GOLD", 520, 126);
      c.font = "500 34px 'IBM Plex Mono',Consolas,monospace"; ["AC  230 V ~ 50 Hz", "DC  +12 V   +5 V   +3,3 V", "    54 A    20 A   20 A    +5 Vsb 3 A"].forEach((l, i) => c.fillText(l, 110, 250 + i * 58)); });
    box(gPsu, 15, 8.6, 14, PX, 0, PZ, faced(M(0x1b1e24, 0.5, 0.35), psuTex, 4));
    fan(gPsu, PX, 8.75, PZ, 5.6, 0.5, "y");
    [1.9, 3.8, 5.7].forEach(r => { const t = new THREE.Mesh(new THREE.TorusGeometry(r, 0.09, 8, 56), steel()); t.rotation.x = Math.PI / 2; t.position.set(PX, 9.2, PZ); gPsu.add(t); });
    [0, Math.PI / 2].forEach(a => { const b = box(gPsu, 11.6, 0.14, 0.2, PX, 9.14, PZ, steel()); b.rotation.y = a; });
    box(gPsu, 3, 2.4, 0.12, PX + 4, 1.2, PZ - 7.03, M(0x0a0b0d, 0.7)); box(gPsu, 1.4, 2, 0.14, PX, 1.4, PZ - 7.03, M(0xc2382f, 0.5));
    tube(gPsu, [[18, 4.2, -5.2], [16.6, 5.4, -5.3], [14.8, 5.0, -5.3], [13.9, 2.9, -5.3]], 0.5, M(0x111317, 0.75));

    // ---------- Festplatte (Deckel hebt sich in der Explosionsansicht) ----------
    const HX = 23.1, HZ = 11.35;
    const gLid = grp("hdd", 5);
    box(gLid, 10.2, 0.3, 14.7, HX, 2.3, HZ, M(0xbcc2ca, 0.35, 0.85));
    sticker(gLid, 7.4, 5.2, HX, 2.6, HZ + 2.2, ["HDD 8 TB", "3,5 Zoll · SATA 6 Gbit/s", "7.200 U/min · CMR"], "#e9edf2", "#10151c");
    const gHdd = grp("hdd");
    box(gHdd, 10.2, 1.8, 14.7, HX, 0, HZ, M(0x2a2e35, 0.5, 0.5));
    [[HX - 4.93, HZ, 0.35, 14.7], [HX + 4.93, HZ, 0.35, 14.7], [HX, HZ - 7.18, 10.2, 0.35], [HX, HZ + 7.18, 10.2, 0.35]].forEach(a => box(gHdd, a[2], 0.5, a[3], a[0], 1.8, a[1], M(0x2a2e35, 0.5, 0.5)));
    cyl(gHdd, 4.5, 0.1, HX, 1.9, 9.6, M(0xdfe5ec, 0.08, 1), 64); cyl(gHdd, 1.25, 0.34, HX, 1.9, 9.6, steel(), 32);
    cyl(gHdd, 0.75, 0.5, 26.4, 1.8, 16.6, steel(), 24);
    const arm = box(gHdd, 5.7, 0.12, 0.7, 25.0, 2.06, 14.2, alu()); arm.rotation.y = -Math.atan2(-4.8, -2.8);
    box(gHdd, 3.2, 0.45, 1.9, 24.9, 1.8, 17.4, M(0x15171b, 0.4, 0.6));
    box(gHdd, 4.2, 0.5, 0.2, 21, 0.4, 3.92, M(0x0a0b0d, 0.7));

    // ---------- SATA-SSD ----------
    const gSsd = grp("ssd"); box(gSsd, 7, 0.7, 10, 33, 0, 9, M(0x16181d, 0.45, 0.5));
    sticker(gSsd, 5.6, 4, 33, 0.7, 10.5, ["SSD 500 GB", "2,5 Zoll · SATA III", "TBW 300 TB"], "#1d5fc4", "#ffffff");
    box(gSsd, 3.6, 0.3, 0.16, 32, 0.15, 3.96, gold());

    root.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });

    // ---------- Mittelpunkt, Größe und Beschriftungspunkt je Bauteil ----------
    const info = {};
    Object.keys(groups).forEach(id => { const b = new THREE.Box3(); groups[id].forEach(g => b.expandByObject(g)); const c = b.getCenter(new THREE.Vector3());
      info[id] = { center: c, anchor: new THREE.Vector3(c.x, b.max.y + 0.6, c.z), size: b.getSize(new THREE.Vector3()).length(), main: groups[id][0] }; });
    const fix = (id, a, c, size) => { const o = info[id]; if (!o) return; o.anchor.set(a[0], a[1], a[2]); if (c) o.center.set(c[0], c[1], c[2]); if (size) o.size = size; };
    fix("board", [-13.5, 0.4, 8.6]); fix("pcie", [-11.2, 1.7, 9.6], [-9, 0.6, 8.5], 11); fix("sata", [14.2, 1.7, 6.6], [14.2, 0.6, 6.6], 8); fix("psu", [PX, 10, PZ], [PX, 4.3, PZ], 22); fix("vrm", [-8.7, 2.8, -5.5]);

    // ---------- Kamera ----------
    const HOME = { az: 0.5, pol: 0.98, r: 71, t: [10, 3, 2.5] };
    const cam = { az: HOME.az, pol: HOME.pol, r: HOME.r, t: new THREE.Vector3().fromArray(HOME.t) };
    const goal = { r: HOME.r, t: cam.t.clone(), az: null, pol: null };
    const fit = () => Math.max(1, 1.26 / camera.aspect);
    let explode = false, sel = null, hover = null, auto = !reduce, running = false, last = 0, W = 0, H = 0;
    function place() { const r = cam.r * fit(), sp = Math.sin(cam.pol); camera.position.set(cam.t.x + r * sp * Math.sin(cam.az), cam.t.y + r * Math.cos(cam.pol), cam.t.z + r * sp * Math.cos(cam.az)); camera.lookAt(cam.t); }
    function resize() { const w = stage.clientWidth, h = stage.clientHeight; if (!w || !h || (w === W && h === H)) return; W = w; H = h; renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); }
    const mats = o => Array.isArray(o.material) ? o.material : [o.material];
    function glow(id, v) { (groups[id] || []).forEach(g => g.traverse(o => { if (o.isMesh) mats(o).forEach(m => { if (m.userData.keep || !m.emissive) return; m.emissive.setHex(v ? 0x2f7bff : 0); m.emissiveIntensity = v; }); })); }

    // ---------- Maus / Finger ----------
    const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
    function hit(e) { const r = canvas.getBoundingClientRect(); ndc.set((e.clientX - r.left) / r.width * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1); ray.setFromCamera(ndc, camera);
      const h = ray.intersectObjects(root.children, true)[0]; if (!h) return null; let o = h.object; while (o && !(o.userData && o.userData.id)) o = o.parent; return o ? o.userData.id : null; }
    let drag = null, pend = null;
    canvas.addEventListener("pointerdown", e => { drag = { x: e.clientX, y: e.clientY, moved: 0 }; auto = false; try { canvas.setPointerCapture(e.pointerId); } catch (x) {} });
    canvas.addEventListener("pointermove", e => {
      if (drag) { const dx = e.clientX - drag.x, dy = e.clientY - drag.y; drag.x = e.clientX; drag.y = e.clientY; drag.moved += Math.abs(dx) + Math.abs(dy);
        if (drag.moved > 5) { canvas.classList.add("drag"); goal.az = goal.pol = null; cam.az -= dx * 0.0065; cam.pol = Math.min(1.5, Math.max(0.12, cam.pol - dy * 0.005)); } }
      else pend = e;
    });
    const end = e => { if (!drag) return; const d = drag; drag = null; canvas.classList.remove("drag"); if (e.type === "pointerup" && d.moved <= 5) hooks.pick(hit(e)); };
    canvas.addEventListener("pointerup", end); canvas.addEventListener("pointercancel", end);
    canvas.addEventListener("pointerleave", () => { pend = null; setHover(null); });
    canvas.addEventListener("wheel", e => { const n = Math.min(125, Math.max(16, goal.r * Math.exp(e.deltaY * 0.0012))); if (n === goal.r) return; e.preventDefault(); auto = false; goal.r = n; }, { passive: false });
    function setHover(id) { if (id === hover) return; if (hover && hover !== sel) glow(hover, 0); hover = id; if (id && id !== sel) glow(id, 0.22); canvas.classList.toggle("hit", !!id); hooks.hover(id); }

    // ---------- Bild für Bild ----------
    const v3 = new THREE.Vector3(), tgt = new THREE.Vector3();
    function frame(now) {
      if (!running) return;
      if (stage.offsetParent === null) { running = false; return; }
      const dt = Math.min(0.05, (now - last) / 1000 || 0.016); last = now; resize();
      const k = reduce ? 1 : 1 - Math.exp(-dt * 5.5);
      if (auto) cam.az += dt * 0.09;
      if (goal.az != null) { let d = goal.az - cam.az; d = Math.atan2(Math.sin(d), Math.cos(d)); cam.az += d * k; cam.pol += (goal.pol - cam.pol) * k; if (Math.abs(d) < 0.002) goal.az = goal.pol = null; }
      cam.r += (goal.r - cam.r) * k; cam.t.lerp(goal.t, k);
      Object.keys(groups).forEach(id => groups[id].forEach(g => { const L = g.userData.lift; tgt.set(explode ? L[0] : 0, explode ? L[1] : 0, explode ? L[2] : 0); g.position.lerp(tgt, k); }));
      if (!reduce) rotors.forEach((r, i) => { r.rotation.z -= dt * (5 + (i % 3)); });
      if (sel) glow(sel, reduce ? 0.5 : 0.42 + 0.2 * Math.sin(now / 260));
      place();
      if (pend) { setHover(hit(pend)); pend = null; }
      renderer.render(scene, camera); hooks.frame();
      requestAnimationFrame(frame);
    }
    const focusOf = id => v3.copy(info[id].center).add(explode ? new THREE.Vector3().fromArray(info[id].main.userData.lift) : new THREE.Vector3());
    const api = {
      ids: Object.keys(groups),
      start() { if (running) return; running = true; last = performance.now(); requestAnimationFrame(frame); },
      select(id, view) { if (sel) glow(sel, 0); sel = info[id] ? id : null; auto = false; if (!sel) return;
        goal.t.copy(focusOf(id)); goal.r = Math.min(HOME.r, Math.max(22, info[id].size * 2.1 + 14)); if (view) { goal.az = view[0]; goal.pol = view[1]; } },
      setExplode(on) { explode = !!on; auto = false; if (sel) goal.t.copy(focusOf(sel)); else { goal.t.fromArray(HOME.t); goal.t.y += on ? 3 : 0; } },
      zoom(f) { auto = false; goal.r = Math.min(125, Math.max(16, goal.r * f)); },
      home() { if (sel) glow(sel, 0); sel = null; goal.t.fromArray(HOME.t); if (explode) goal.t.y += 3; goal.r = HOME.r; goal.az = HOME.az; goal.pol = HOME.pol; },
      // Bildschirmposition des Beschriftungspunkts (folgt dem Bauteil in der Explosionsansicht)
      screen(id, out) { const o = info[id]; if (!o) return false; v3.copy(o.anchor).add(o.main.position).project(camera); out.x = (v3.x * 0.5 + 0.5) * W; out.y = (-v3.y * 0.5 + 0.5) * H; return v3.z < 1; }
    };
    resize(); place();
    return api;
  }
  AP2._hwScene = buildScene;

  // Blickwinkel [Drehung, Neigung], aus dem ein Bauteil gut zu sehen ist (sonst bleibt die Kamera, wie sie ist)
  const VIEWS = { io: [-1.25, 1.15], eps: [-0.5, 0.75], vrm: [-0.75, 0.8], psu: [0.75, 1.0], header: [0.2, 0.7], sata: [0.95, 0.85], hdd: [0.6, 0.75], ssd: [0.6, 0.75], cpu: [0.35, 0.6], m2: [0.35, 0.6], uefi: [0.3, 0.6], pcie: [-0.2, 0.75] };

  // =====================================================================
  // Ansicht
  // =====================================================================
  let el = null, api = null, sel = null, mode = "explore", explode = false, names = false, quiz = null, pending = null, loading = false;
  const pos = { x: 0, y: 0 };

  function loadThree() {
    return new Promise((res, rej) => { if (window.THREE) return res(window.THREE);
      const s = document.createElement("script"); s.src = THREE_URL; s.onload = () => window.THREE ? res(window.THREE) : rej(new Error("THREE fehlt")); s.onerror = () => rej(new Error("Laden fehlgeschlagen")); document.head.appendChild(s); });
  }

  function infoHtml() {
    if (!sel) {
      const seen = HW.filter(p => store().seen[p.id]).length;
      return `<p class="eyebrow">So geht's</p><h3>Klick auf ein Bauteil</h3>
        <ol class="hw-steps"><li><b>Drehen:</b> mit gedrückter Maustaste ziehen. Am Handy mit dem Finger wischen.</li><li><b>Zoomen:</b> Mausrad oder die Knöpfe + und −.</li><li><b>Erklären:</b> Bauteil oder Punkt anklicken. Hier erscheint dann alles Wichtige.</li><li><b>Explosionsansicht:</b> hebt Kühler, Karten und RAM an. So siehst du, was darunter steckt.</li></ol>
        <div class="row"><button type="button" class="btn primary" data-hw-go="${HW[0].id}">Tour starten →</button><span class="small muted">${seen} von ${HW.length} Bauteilen angeschaut</span></div>`;
    }
    const p = byId[sel], i = HW.indexOf(p), prev = HW[(i - 1 + HW.length) % HW.length], next = HW[(i + 1) % HW.length];
    return `<div class="row"><p class="eyebrow">Bauteil ${i + 1} von ${HW.length}</p><span class="spacer"></span><span class="chip">${esc(p.cat)}</span></div>
      <h3>${esc(p.name)}</h3>
      <p class="hw-short">${esc(p.short)}</p>
      <div class="hw-facts">${p.facts.map(f => `<div><span>${esc(f[0])}</span><b>${esc(f[1])}</b></div>`).join("")}</div>
      <div class="hw-sec"><p class="eyebrow">So funktioniert es</p><p>${esc(p.how)}</p></div>
      <div class="hw-sec"><p class="eyebrow">Darauf musst du achten</p><ul class="facts">${p.watch.map(w => `<li>${esc(w)}</li>`).join("")}</ul></div>
      <div class="note"><b>Prüfungs-Tipp:</b> ${esc(p.exam)}</div>
      ${p.server ? `<div class="hw-server"><b>Im Server:</b> ${esc(p.server)}</div>` : ""}
      <div class="row hw-nav"><button type="button" class="btn sm" data-hw-go="${prev.id}" aria-label="Vorheriges Bauteil: ${esc(prev.name)}">← Zurück</button>${p.lesson ? `<a class="btn sm" href="#t-${p.lesson}">Zur Lektion</a>` : ""}<span class="spacer"></span><button type="button" class="btn sm primary" data-hw-go="${next.id}" aria-label="Nächstes Bauteil: ${esc(next.name)}">Weiter →</button></div>`;
  }
  function drawInfo() { const box = $("#hw-info", el); box.innerHTML = infoHtml(); box.querySelectorAll("[data-hw-go]").forEach(b => b.addEventListener("click", () => select(b.dataset.hwGo))); }
  function drawList() {
    const seen = store().seen;
    $("#hw-count", el).textContent = HW.filter(p => seen[p.id]).length + " von " + HW.length + " angeschaut";
    $("#hw-list", el).innerHTML = HW.map(p => `<button type="button" data-hw-go="${p.id}" aria-pressed="${p.id === sel}" class="${seen[p.id] ? "seen" : ""}">${seen[p.id] ? "✓ " : ""}${esc(p.name)}</button>`).join("");
    $("#hw-list", el).querySelectorAll("[data-hw-go]").forEach(b => b.addEventListener("click", () => { if (mode === "quiz") setMode("explore"); select(b.dataset.hwGo); $("#hw-stage", el).scrollIntoView({ block: "nearest", behavior: "smooth" }); }));
  }
  function markDots() { el.querySelectorAll(".hw-dot").forEach(d => { d.classList.toggle("sel", d.dataset.id === sel); d.classList.toggle("seen", !!store().seen[d.dataset.id]); }); }
  function select(id) {
    if (!byId[id]) return; sel = id;
    const s = store(); if (!s.seen[id]) { s.seen[id] = 1; AP2.track(); AP2.save(); }
    if (api) api.select(id, VIEWS[id]);
    drawInfo(); drawList(); markDots();
  }
  function setExplode(on) { explode = on; if (api) api.setExplode(on); const b = $("#hw-explode", el); b.setAttribute("aria-pressed", on); b.textContent = on ? "Zusammenbauen" : "Explosionsansicht"; }

  // ---------- Spiel: Bauteil finden ----------
  function quizDraw(kind, text, btn) {
    const q = $("#hw-quiz", el); q.hidden = false; q.className = "hw-quiz" + (kind ? " " + kind : "");
    q.innerHTML = `<div class="hw-quiz-t">${text}</div><span class="hw-quiz-n">${quiz.i + (quiz.state === "ask" ? 1 : 1)} / ${quiz.order.length}</span>${btn.map(b => `<button type="button" class="hw-btn${b[2] ? " on" : ""}" data-q="${b[0]}">${b[1]}</button>`).join("")}`;
    q.querySelectorAll("[data-q]").forEach(b => b.addEventListener("click", () => quizAct(b.dataset.q)));
  }
  function quizAsk() { quiz.state = "ask"; quiz.miss = false; const p = byId[quiz.order[quiz.i]]; quizDraw("", `Klick auf: <b>${esc(p.find)}</b>`, [["show", "Auflösen"]]); }
  function quizStart() { quiz = { order: HW.map(p => p.id).sort(() => Math.random() - 0.5), i: 0, first: 0, state: "ask", miss: false }; sel = null; if (api) api.home(); drawInfo(); drawList(); markDots(); quizAsk(); }
  function quizAct(a) {
    if (a === "show") { quiz.miss = true; quizRight(false); }
    else if (a === "next") { quiz.i++; if (quiz.i >= quiz.order.length) { quiz.i = quiz.order.length - 1; quiz.state = "done"; quizDraw("ok", `Geschafft: <b>${quiz.first} von ${quiz.order.length}</b> Bauteilen beim ersten Versuch gefunden.`, [["again", "Nochmal spielen", 1], ["stop", "Zurück zum Erkunden"]]); } else quizAsk(); }
    else if (a === "again") quizStart();
    else if (a === "stop") setMode("explore");
  }
  function quizRight(found) {
    const id = quiz.order[quiz.i], p = byId[id]; quiz.state = "right";
    if (found) { if (!quiz.miss) quiz.first++; store().found[id] = 1; AP2.track(); AP2.save(); }
    select(id);
    quizDraw(found ? "ok" : "", (found ? "Richtig! " : "Gesucht war: ") + `<b>${esc(p.name)}</b>. Die Erklärung steht daneben.`, [["next", quiz.i === quiz.order.length - 1 ? "Auswertung" : "Nächstes Bauteil →", 1]]);
  }
  function quizGuess(id) {
    if (!id || quiz.state !== "ask") { if (id && quiz.state !== "ask") select(id); return; }
    if (id === quiz.order[quiz.i]) return quizRight(true);
    quiz.miss = true; quizDraw("no", `Das ist: <b>${esc(byId[id].name)}</b>. Such weiter: ${esc(byId[quiz.order[quiz.i]].find)}.`, [["show", "Auflösen"]]);
  }
  function setMode(m) {
    mode = m; el.querySelectorAll("[data-hw-mode]").forEach(b => b.setAttribute("aria-pressed", b.dataset.hwMode === m));
    $("#hw-stage", el).classList.toggle("quizmode", m === "quiz");
    if (m === "quiz") { setExplode(true); quizStart(); } else { quiz = null; $("#hw-quiz", el).hidden = true; }
  }
  const onPick = id => { if (mode === "quiz") quizGuess(id); else if (id) select(id); };

  function build() {
    el.innerHTML = `
      <div class="grid" style="gap:6px"><p class="eyebrow">Hardware in 3D</p><h2>Ein Rechner von innen</h2>
        <p class="lead">Dreh das Mainboard, zoom heran und klick auf ein Bauteil. Daneben steht kurz und klar: was es ist, wie es arbeitet und worauf du achten musst.</p></div>
      <div class="hw-layout">
        <div class="hw-stage" id="hw-stage">
          <canvas id="hw-canvas" role="img" aria-label="3D-Modell eines Rechners: Mainboard mit CPU, Kühler, RAM, Steckkarten, daneben Netzteil und Laufwerke"></canvas>
          <div class="hw-dots" id="hw-dots">${HW.map(p => `<button type="button" class="hw-dot" data-id="${p.id}" aria-label="${esc(p.name)} erklären" hidden><i></i><b>${esc(p.name)}</b></button>`).join("")}</div>
          <div class="hw-bar hw-top"><div class="hw-seg" role="group" aria-label="Modus"><button type="button" class="hw-btn" data-hw-mode="explore" aria-pressed="true">Erkunden</button><button type="button" class="hw-btn" data-hw-mode="quiz" aria-pressed="false">Bauteil finden</button></div><span class="spacer"></span><span class="hw-hint">Ziehen: drehen · Mausrad: zoomen · Klick: erklären</span></div>
          <div class="hw-quiz" id="hw-quiz" hidden></div>
          <div class="hw-bar hw-bot">
            <button type="button" class="hw-btn" id="hw-explode" aria-pressed="false">Explosionsansicht</button><button type="button" class="hw-btn" id="hw-names" aria-pressed="false">Namen</button>
            <button type="button" class="hw-btn sq" id="hw-in" aria-label="Näher heran">+</button><button type="button" class="hw-btn sq" id="hw-out" aria-label="Weiter weg">−</button><button type="button" class="hw-btn" id="hw-home">Zurücksetzen</button></div>
          <div class="hw-load" id="hw-load">3D-Modell wird geladen …</div>
        </div>
        <aside class="panel hw-info" id="hw-info" aria-live="polite"></aside>
      </div>
      <div class="panel"><div class="row"><h3>Alle Bauteile</h3><span class="spacer"></span><span class="chip" id="hw-count"></span></div><div class="trainer-list hw-list" id="hw-list"></div></div>`;
    el.querySelectorAll("[data-hw-mode]").forEach(b => b.addEventListener("click", () => setMode(b.dataset.hwMode)));
    el.querySelectorAll(".hw-dot").forEach(d => d.addEventListener("click", () => onPick(d.dataset.id)));
    $("#hw-explode", el).addEventListener("click", () => setExplode(!explode));
    $("#hw-names", el).addEventListener("click", e => { names = !names; e.currentTarget.setAttribute("aria-pressed", names); $("#hw-stage", el).classList.toggle("names", names); });
    $("#hw-in", el).addEventListener("click", () => api && api.zoom(0.78));
    $("#hw-out", el).addEventListener("click", () => api && api.zoom(1.28));
    $("#hw-home", el).addEventListener("click", () => { if (mode !== "quiz") { sel = null; drawInfo(); drawList(); markDots(); } if (api) api.home(); });
  }
  function start3d() {
    if (api || loading) return; loading = true;
    const msg = $("#hw-load", el), stage = $("#hw-stage", el);
    loadThree().then(THREE => {
      const dots = {}; el.querySelectorAll(".hw-dot").forEach(d => { dots[d.dataset.id] = d; });
      api = buildScene(THREE, $("#hw-canvas", el), stage, {
        pick: onPick,
        hover: id => { el.querySelectorAll(".hw-dot.hov").forEach(d => d.classList.remove("hov")); if (id && dots[id] && mode !== "quiz") dots[id].classList.add("hov"); },
        frame: () => { for (const id in dots) { const ok = api.screen(id, pos); dots[id].hidden = !ok; if (ok) dots[id].style.transform = "translate(" + pos.x.toFixed(1) + "px," + pos.y.toFixed(1) + "px)"; } }
      });
      HW.forEach(p => { if (!api.ids.includes(p.id)) console.warn("Hardware 3D: kein Modell für", p.id); });
      msg.hidden = true; if (explode) api.setExplode(true); if (sel) api.select(sel, VIEWS[sel]); api.start();
    }).catch(() => { loading = false; stage.classList.add("failed"); msg.innerHTML = "Die 3D-Ansicht konnte nicht geladen werden (Internet oder Grafik fehlt).<br>Alle Erklärungen findest du unten in der Liste „Alle Bauteile“."; });
  }

  AP2.views.hardware = function (view) {
    if (el !== view || !view.firstChild) { el = view; build(); drawInfo(); drawList(); }
    else { drawInfo(); drawList(); markDots(); }
    if (api) api.start(); else start3d();
    if (pending) { const id = pending; pending = null; if (mode === "quiz") setMode("explore"); select(id); }
  };
  AP2.openHardware = function (id) { pending = id; if (location.hash === "#hardware") AP2.views.hardware(document.querySelector('[data-view="hardware"]')); else location.hash = "#hardware"; };
})();
