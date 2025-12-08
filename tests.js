// Register tests immediately when this script loads

    // --- levelsys.js tests ---
  test("Level initializes properly", () => {
    const lvl = new Level(100, 3, 5);  // difficulty=100, bossKey=3, lives=5
    assert(typeof lvl.scoreThreshold === 'number');
    assert(lvl.scoreThreshold === 25);
    assert(lvl.difficulty === 100);
    assert(lvl.player.lives === 5);
    assert(Array.isArray(lvl.colorZones));
    assert(Array.isArray(lvl.vents));
  });

  test("Player default properties", () => {
    const p = new Player(3, 5);
    assert(p.alive === true);
    assert(p.lives === 3);
    assert(p.maxLives === 5);
    assert(p.coins === 0);
    assert(p.baseScore === 1);
  });

  test("Zone properties set correctly", () => {
    const z = new Zone(10, 20, 30, 40, 2);
    assert(z.x === 10);
    assert(z.y === 20);
    assert(z.width === 30);
    assert(z.height === 40);
    assert(z.color === 2);
    assert(z.borderWidth === 4);
  });

  test("Level.createRandomZones creates four zones", () => {
    if (typeof canvasWidth === 'undefined') { var canvasWidth = 800; }
    if (typeof canvasHeight === 'undefined') { var canvasHeight = 600; }
    const lvl = new Level(0, 3, 3);
    lvl.createRandomZones();
    assert(Array.isArray(lvl.colorZones));
    assert(lvl.colorZones.length === 4);
  });

  test("Level.addScore increases score and combo", () => {
    if (typeof round === 'undefined') { function round(n) { return Math.round(n); } }
    const lvl = new Level(100, 3, 5);
    const actor = { color: 1 };
    lvl.currentColor = null;
    lvl.currentCombo = 0;
    lvl.player.baseScore = 2;
    lvl.player.comboMult = 1;
    lvl.score = 0;
    lvl.addScore(actor);
    assert(lvl.score === 2);
    lvl.addScore(actor);
    assert(lvl.currentCombo === 2);
    assert(lvl.score > 2);
  });

  // --- Actor.js tests ---
  if (typeof globalThis.millis === 'undefined') globalThis.millis = () => 1000;
  if (typeof globalThis.random === 'undefined') globalThis.random = function(a,b){ if (b===undefined) return Math.random() * (a || 1); return a + Math.random() * (b - a); };
  if (typeof globalThis.TWO_PI === 'undefined') globalThis.TWO_PI = Math.PI * 2;
  if (typeof globalThis.PI === 'undefined') globalThis.PI = Math.PI;
  if (typeof globalThis.cos === 'undefined') globalThis.cos = Math.cos;
  if (typeof globalThis.sin === 'undefined') globalThis.sin = Math.sin;
  if (typeof globalThis.floor === 'undefined') globalThis.floor = Math.floor;
  if (typeof globalThis.constrain === 'undefined') globalThis.constrain = (v,a,b) => Math.max(a, Math.min(b, v));
  if (typeof globalThis.lerp === 'undefined') globalThis.lerp = (a,b,t) => a + (b - a) * t;

  test("reflectAngle reflects vector across normal", () => {
    const ang = 0; // pointing right
    const nx = 1, ny = 0; // normal pointing right
    const r = reflectAngle(ang, nx, ny);
    // reflecting (1,0) across (1,0) -> (-1,0) -> angle PI
    assert(Math.abs(r - Math.PI) < 1e-6);
  });

  test("Actor getters cx/cy/r work", () => {
    const a = new Actor(10, 20, 30, 40, null);
    assert(a.cx === 10 + 30 * 0.5);
    assert(a.cy === 20 + 40 * 0.5);
    assert(a.r === 0.5 * Math.max(30, 40));
  });

  test("Bucket.freezeActor toggles freeze and resets timer", () => {
    const b = new Bucket(0, 0, 12, 14, 1, null);
    b.freeze = false;
    b.freezeElapsedMs = 12345;
    b.freezeActor();
    assert(b.freeze === true);
    assert(b.freezeElapsedMs === 0);
  });

  test("Bucket.fixDeathAnim doubles dimensions and adjusts position", () => {
    const b = new Bucket(50, 60, 10, 20, 1, null);
    b.alive = true; b.sorted = false;
    const oldW = b.width, oldH = b.height, oldX = b.x, oldY = b.y;
    b.fixDeathAnim();
    assert(b.width === oldW * 2);
    assert(b.height === oldH * 2);
    assert(b.x === oldX - b.width / 4);
    assert(b.y === oldY - b.height / 4);
  });

  test("Bucket.splode generates particles", () => {
    const b = new Bucket(0, 0, 10, 10, 1, null);
    b.particles = [];
    b.splode();
    assert(b.particles.length === 6);
  });

