const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = 720;
canvas.height = 520;

// =========================
// SAVE DATA
// =========================

const defaultSave = {
  coins: 0,
  cargoMax: 5,

  engineLevel: 1,
  oxygenLevel: 1,
  armorLevel: 1,
  harpoonLevel: 1,

  bestDepth: 0
};

let save;

try {
  save = {
    ...defaultSave,
    ...JSON.parse(localStorage.getItem("deepCatchSave") || "{}")
  };
} catch {
  save = { ...defaultSave };
}

function saveGame() {
  localStorage.setItem(
    "deepCatchSave",
    JSON.stringify(save)
  );
}

// =========================
// GAME STATE
// =========================

let coins = save.coins;

let cargo = [];

let maxOxygen =
  100 + (save.oxygenLevel - 1) * 25;

let oxygen = maxOxygen;

let maxHull =
  100 + (save.armorLevel - 1) * 25;

let hull = maxHull;

let depth = 0;

let gameMessage = "Cari ikan dan kembali ke permukaan.";

const submarine = {
  x: 80,
  y: 70,

  width: 88,
  height: 40,

  speed:
    3.2 + (save.engineLevel - 1) * 0.6,

  direction: 1
};

// =========================
// INPUT
// =========================

const input = {
  left: false,
  right: false,
  up: false,
  down: false
};

// =========================
// OBJECTS
// =========================

let fish = [];
let harpoons = [];
let mines = [];
let treasures = [];
let bubbles = [];

// =========================
// HELPERS
// =========================

function random(min, max) {
  return Math.random() * (max - min) + min;
}

function distance(x1, y1, x2, y2) {
  return Math.hypot(
    x2 - x1,
    y2 - y1
  );
}

function clamp(value, min, max) {
  return Math.max(
    min,
    Math.min(max, value)
  );
}

// =========================
// FISH TYPES
// =========================

const fishTypes = [
  {
    name: "Sardine",
    rarity: "COMMON",
    value: 10,
    chance: 55,
    color: "#e8f7ff"
  },

  {
    name: "Blue Tang",
    rarity: "RARE",
    value: 25,
    chance: 27,
    color: "#43d5ff"
  },

  {
    name: "Puffer",
    rarity: "EPIC",
    value: 60,
    chance: 13,
    color: "#bd62ff"
  },

  {
    name: "Golden Tuna",
    rarity: "LEGENDARY",
    value: 150,
    chance: 4,
    color: "#ffd338"
  },

  {
    name: "Abyss Fish",
    rarity: "MYTHIC",
    value: 400,
    chance: 1,
    color: "#ff5bc8"
  }
];

function chooseFishType(y) {

  const depthBonus =
    y / canvas.height;

  let roll =
    Math.random() * 100;

  if (
    depthBonus > 0.75 &&
    Math.random() < 0.06
  ) {
    return fishTypes[4];
  }

  if (
    depthBonus > 0.55 &&
    Math.random() < 0.11
  ) {
    return fishTypes[3];
  }

  for (const type of fishTypes) {

    if (roll < type.chance)
      return type;

    roll -= type.chance;
  }

  return fishTypes[0];
}

// =========================
// SPAWN FISH
// =========================

function createFish() {

  const y =
    random(
      100,
      canvas.height - 45
    );

  const type =
    chooseFishType(y);

  fish.push({

    x:
      random(
        120,
        canvas.width - 50
      ),

    y,

    width: 42,

    height: 22,

    speed:
      random(
        0.5,
        1.3
      ),

    direction:
      Math.random() > 0.5
        ? 1
        : -1,

    type
  });
}

for (let i = 0; i < 15; i++) {
  createFish();
}

// =========================
// MINES
// =========================

function createMine() {

  mines.push({

    x:
      random(
        180,
        canvas.width - 40
      ),

    y:
      random(
        200,
        canvas.height - 35
      ),

    radius: 15,

    active: true
  });
}

for (let i = 0; i < 5; i++) {
  createMine();
}

// =========================
// TREASURE
// =========================

function createTreasure() {

  treasures.push({

    x:
      random(
        150,
        canvas.width - 60
      ),

    y:
      random(
        270,
        canvas.height - 45
      ),

    value:
      Math.floor(
        random(
          35,
          100
        )
      ),

    active: true
  });
}

createTreasure();
createTreasure();

// =========================
// DRAW BACKGROUND
// =========================

function drawBackground() {

  const gradient =
    ctx.createLinearGradient(
      0,
      0,
      0,
      canvas.height
    );

  gradient.addColorStop(
    0,
    "#64d8eb"
  );

  gradient.addColorStop(
    0.3,
    "#2187ad"
  );

  gradient.addColorStop(
    0.65,
    "#10506f"
  );

  gradient.addColorStop(
    1,
    "#051d32"
  );

  ctx.fillStyle = gradient;

  ctx.fillRect(
    0,
    0,
    canvas.width,
    canvas.height
  );

  // surface

  ctx.strokeStyle =
    "rgba(255,255,255,0.7)";

  ctx.lineWidth = 3;

  ctx.beginPath();

  ctx.moveTo(
    0,
    65
  );

  ctx.lineTo(
    canvas.width,
    65
  );

  ctx.stroke();

  // depth zones

  ctx.font = "14px Arial";

  ctx.fillStyle =
    "rgba(255,255,255,0.65)";

  ctx.fillText(
    "SURFACE",
    15,
    55
  );

  ctx.fillText(
    "CORAL ZONE",
    15,
    160
  );

  ctx.fillText(
    "DEEP SEA",
    15,
    310
  );

  ctx.fillText(
    "ABYSS",
    15,
    455
  );
}

// =========================
// SUBMARINE
// =========================

function drawSubmarine() {

  ctx.save();

  if (submarine.direction === -1) {

    ctx.translate(
      submarine.x +
        submarine.width,
      submarine.y
    );

    ctx.scale(-1, 1);

  } else {

    ctx.translate(
      submarine.x,
      submarine.y
    );
  }

  // body

  ctx.fillStyle =
    "#f5b820";

  ctx.beginPath();

  ctx.roundRect(
    0,
    5,
    submarine.width,
    30,
    16
  );

  ctx.fill();

  // top

  ctx.fillStyle =
    "#d99210";

  ctx.fillRect(
    30,
    0,
    22,
    10
  );

  // window

  ctx.fillStyle =
    "#73e4ff";

  ctx.beginPath();

  ctx.arc(
    65,
    20,
    9,
    0,
    Math.PI * 2
  );

  ctx.fill();

  ctx.strokeStyle =
    "#11506a";

  ctx.lineWidth = 3;

  ctx.stroke();

  // propeller

  ctx.fillStyle =
    "#b7c9cf";

  ctx.fillRect(
    -10,
    16,
    12,
    5
  );

  // light

  ctx.fillStyle =
    "#fff8a0";

  ctx.beginPath();

  ctx.arc(
    84,
    20,
    4,
    0,
    Math.PI * 2
  );

  ctx.fill();

  ctx.restore();
}

// =========================
// FISH DRAWING
// =========================

function drawFish(f) {

  ctx.save();

  ctx.translate(
    f.x,
    f.y
  );

  ctx.scale(
    f.direction,
    1
  );

  ctx.fillStyle =
    f.type.color;

  // body

  ctx.beginPath();

  ctx.ellipse(
    0,
    0,
    20,
    11,
    0,
    0,
    Math.PI * 2
  );

  ctx.fill();

  // tail

  ctx.beginPath();

  ctx.moveTo(
    -17,
    0
  );

  ctx.lineTo(
    -30,
    -10
  );

  ctx.lineTo(
    -30,
    10
  );

  ctx.closePath();

  ctx.fill();

  // eye

  ctx.fillStyle =
    "#081927";

  ctx.beginPath();

  ctx.arc(
    11,
    -3,
    2.5,
    0,
    Math.PI * 2
  );

  ctx.fill();

  ctx.restore();

  if (
    f.type.rarity ===
      "LEGENDARY" ||
    f.type.rarity ===
      "MYTHIC"
  ) {

    ctx.font =
      "11px Arial";

    ctx.fillStyle =
      f.type.color;

    ctx.textAlign =
      "center";

    ctx.fillText(
      f.type.rarity,
      f.x,
      f.y - 18
    );
  }
}

// =========================
// UPDATE FISH
// =========================

function updateFish() {

  fish.forEach(f => {

    f.x +=
      f.speed *
      f.direction;

    if (
      f.x >
      canvas.width + 40
    ) {

      f.x = -40;

    }

    if (
      f.x < -40
    ) {

      f.x =
        canvas.width + 40;
    }
  });
}

// =========================
// HARPOON
// =========================

function fireHarpoon() {

  if (
    cargo.length >=
    save.cargoMax
  ) {

    gameMessage =
      "Cargo penuh! Kembali ke permukaan.";

    return;
  }

  harpoons.push({

    x:
      submarine.x +
      submarine.width / 2,

    y:
      submarine.y +
      submarine.height / 2,

    direction:
      submarine.direction,

    speed:
      9 +
      save.harpoonLevel *
        0.8
  });
}

function drawHarpoons() {

  ctx.strokeStyle =
    "#ffffff";

  ctx.lineWidth = 3;

  harpoons.forEach(h => {

    ctx.beginPath();

    ctx.moveTo(
      h.x,
      h.y
    );

    ctx.lineTo(
      h.x +
        22 *
          h.direction,
      h.y
    );

    ctx.stroke();
  });
}

function updateHarpoons() {

  for (
    let h =
      harpoons.length - 1;
    h >= 0;
    h--
  ) {

    const harpoon =
      harpoons[h];

    harpoon.x +=
      harpoon.speed *
      harpoon.direction;

    let hit = false;

    for (
      let i =
        fish.length - 1;
      i >= 0;
      i--
    ) {

      const f = fish[i];

      if (
        distance(
          harpoon.x,
          harpoon.y,
          f.x,
          f.y
        ) < 25
      ) {

        cargo.push({
          name:
            f.type.name,

          rarity:
            f.type.rarity,

          value:
            f.type.value
        });

        gameMessage =
          f.type.rarity +
          " " +
          f.type.name +
          " tertangkap!";

        fish.splice(
          i,
          1
        );

        harpoons.splice(
          h,
          1
        );

        createFish();

        hit = true;

        break;
      }
    }

    if (hit)
      continue;

    if (
      harpoon.x >
        canvas.width + 30 ||
      harpoon.x < -30
    ) {

      harpoons.splice(
        h,
        1
      );
    }
  }
}

// =========================
// MINES
// =========================

function drawMine(m) {

  if (!m.active)
    return;

  ctx.fillStyle =
    "#202b31";

  ctx.beginPath();

  ctx.arc(
    m.x,
    m.y,
    m.radius,
    0,
    Math.PI * 2
  );

  ctx.fill();

  ctx.strokeStyle =
    "#87969b";

  ctx.lineWidth = 3;

  for (
    let i = 0;
    i < 8;
    i++
  ) {

    const angle =
      (Math.PI * 2 * i) /
      8;

    ctx.beginPath();

    ctx.moveTo(
      m.x +
        Math.cos(angle) *
          13,

      m.y +
        Math.sin(angle) *
          13
    );

    ctx.lineTo(
      m.x +
        Math.cos(angle) *
          23,

      m.y +
        Math.sin(angle) *
          23
    );

    ctx.stroke();
  }
}

function checkMineCollision() {

  mines.forEach(m => {

    if (!m.active)
      return;

    const sx =
      submarine.x +
      submarine.width / 2;

    const sy =
      submarine.y +
      submarine.height / 2;

    if (
      distance(
        sx,
        sy,
        m.x,
        m.y
      ) < 35
    ) {

      m.active = false;

      hull -= 25;

      gameMessage =
        "BOOM! Hull -25";

      setTimeout(() => {

        m.x =
          random(
            180,
            canvas.width - 40
          );

        m.y =
          random(
            200,
            canvas.height - 40
          );

        m.active = true;

      }, 5000);

      if (
        hull <= 0
      ) {

        submarineDestroyed();
      }
    }
  });
}

// =========================
// TREASURE
// =========================

function drawTreasure(t) {

  if (!t.active)
    return;

  ctx.fillStyle =
    "#d98b17";

  ctx.fillRect(
    t.x - 15,
    t.y - 10,
    30,
    20
  );

  ctx.fillStyle =
    "#ffd653";

  ctx.fillRect(
    t.x - 3,
    t.y - 10,
    6,
    20
  );
}

function checkTreasure() {

  treasures.forEach(t => {

    if (!t.active)
      return;

    const sx =
      submarine.x +
      submarine.width / 2;

    const sy =
      submarine.y +
      submarine.height / 2;

    if (
      distance(
        sx,
        sy,
        t.x,
        t.y
      ) < 30
    ) {

      t.active = false;

      coins +=
        t.value;

      gameMessage =
        "Treasure +" +
        t.value +
        " coin!";

      save.coins =
        coins;

      saveGame();

      setTimeout(() => {

        t.x =
          random(
            180,
            canvas.width - 60
          );

        t.y =
          random(
            270,
            canvas.height - 40
          );

        t.value =
          Math.floor(
            random(
              35,
              110
            )
          );

        t.active = true;

      }, 12000);
    }
  });
}

// =========================
// BUBBLES
// =========================

function createBubble() {

  if (
    Math.random() >
    0.12
  )
    return;

  bubbles.push({

    x:
      submarine.x -
      5,

    y:
      submarine.y +
      18,

    radius:
      random(
        2,
        5
      ),

    opacity: 1
  });
}

function updateBubbles() {

  bubbles.forEach(b => {

    b.y -= 1.2;

    b.opacity -=
      0.015;
  });

  bubbles =
    bubbles.filter(
      b =>
        b.opacity > 0
    );
}

function drawBubbles() {

  bubbles.forEach(b => {

    ctx.strokeStyle =
      `rgba(255,255,255,${b.opacity})`;

    ctx.beginPath();

    ctx.arc(
      b.x,
      b.y,
      b.radius,
      0,
      Math.PI * 2
    );

    ctx.stroke();
  });
}

// =========================
// SUBMARINE MOVEMENT
// =========================

function updateMovement() {

  if (input.left) {

    submarine.x -=
      submarine.speed;

    submarine.direction =
      -1;
  }

  if (input.right) {

    submarine.x +=
      submarine.speed;

    submarine.direction =
      1;
  }

  if (input.up) {

    submarine.y -=
      submarine.speed;
  }

  if (input.down) {

    submarine.y +=
      submarine.speed;
  }

  submarine.x =
    clamp(
      submarine.x,
      0,
      canvas.width -
        submarine.width
    );

  submarine.y =
    clamp(
      submarine.y,
      30,
      canvas.height -
        submarine.height
    );

  depth =
    Math.max(
      0,
      Math.floor(
        (submarine.y - 55) *
          3
      )
    );

  save.bestDepth =
    Math.max(
      save.bestDepth,
      depth
    );
}

// =========================
// OXYGEN
// =========================

function updateOxygen() {

  if (
    submarine.y > 80
  ) {

    oxygen -= 0.035;

  } else {

    oxygen += 0.18;
  }

  oxygen =
    clamp(
      oxygen,
      0,
      maxOxygen
    );

  if (
    oxygen <= 0
  ) {

    gameMessage =
      "Oxygen habis! Emergency ascent!";

    submarine.y = 55;

    oxygen =
      maxOxygen * 0.25;
  }
}

// =========================
// DESTROYED
// =========================

function submarineDestroyed() {

  gameMessage =
    "Kapal rusak! Cargo hilang.";

  cargo = [];

  hull =
    maxHull;

  oxygen =
    maxOxygen;

  submarine.x = 80;

  submarine.y = 60;
}

// =========================
// SELL CARGO
// =========================

function sellCargo() {

  if (
    submarine.y > 90
  ) {

    gameMessage =
      "Kembali ke SURFACE untuk menjual.";

    return;
  }

  if (
    cargo.length === 0
  ) {

    gameMessage =
      "Cargo masih kosong.";

    return;
  }

  let total = 0;

  cargo.forEach(item => {

    total +=
      item.value;
  });

  coins += total;

  save.coins =
    coins;

  cargo = [];

  oxygen =
    maxOxygen;

  hull =
    maxHull;

  gameMessage =
    "Cargo terjual +" +
    total +
    " coin!";

  saveGame();
}

// =========================
// HUD
// =========================

const coinsElement =
  document.getElementById(
    "coins"
  );

const cargoElement =
  document.getElementById(
    "cargo"
  );

const oxygenElement =
  document.getElementById(
    "oxygen"
  );

const hullElement =
  document.getElementById(
    "hull"
  );

const hud =
  document.getElementById(
    "hud"
  );

const depthBox =
  document.createElement(
    "div"
  );

depthBox.innerHTML =
  `Depth: <span id="depth">0</span>m`;

hud.appendChild(
  depthBox
);

const messageBox =
  document.createElement(
    "div"
  );

messageBox.id =
  "messageBox";

messageBox.style.position =
  "absolute";

messageBox.style.left =
  "50%";

messageBox.style.top =
  "90px";

messageBox.style.transform =
  "translateX(-50%)";

messageBox.style.background =
  "rgba(0,0,0,0.45)";

messageBox.style.color =
  "white";

messageBox.style.padding =
  "6px 12px";

messageBox.style.borderRadius =
  "8px";

messageBox.style.fontSize =
  "13px";

messageBox.style.pointerEvents =
  "none";

messageBox.style.zIndex =
  "10";

document
  .getElementById("game")
  .style.position =
  "relative";

document
  .getElementById("game")
  .appendChild(
    messageBox
  );

function updateHUD() {

  coinsElement.textContent =
    coins;

  cargoElement.textContent =
    cargo.length;

  oxygenElement.textContent =
    Math.floor(
      oxygen /
        maxOxygen *
        100
    );

  hullElement.textContent =
    Math.floor(
      hull /
        maxHull *
        100
    );

  document
    .getElementById(
      "depth"
    )
    .textContent =
    depth;

  messageBox.textContent =
    gameMessage;
}

// =========================
// MOBILE HOLD CONTROLS
// =========================

function bindHoldButton(
  id,
  key
) {

  const button =
    document.getElementById(
      id
    );

  const start =
    event => {

      event.preventDefault();

      input[key] =
        true;
    };

  const stop =
    event => {

      event.preventDefault();

      input[key] =
        false;
    };

  button.addEventListener(
    "pointerdown",
    start
  );

  button.addEventListener(
    "pointerup",
    stop
  );

  button.addEventListener(
    "pointercancel",
    stop
  );

  button.addEventListener(
    "pointerleave",
    stop
  );
}

bindHoldButton(
  "left",
  "left"
);

bindHoldButton(
  "right",
  "right"
);

bindHoldButton(
  "up",
  "up"
);

bindHoldButton(
  "down",
  "down"
);

// =========================
// FIRE
// =========================

document
  .getElementById(
    "fire"
  )
  .addEventListener(
    "pointerdown",
    event => {

      event.preventDefault();

      fireHarpoon();
    }
  );

// =========================
// SELL
// =========================

document
  .getElementById(
    "sell"
  )
  .addEventListener(
    "click",
    sellCargo
  );

// =========================
// GAME LOOP
// =========================

function gameLoop() {

  drawBackground();

  updateMovement();

  updateFish();

  updateHarpoons();

  updateOxygen();

  checkMineCollision();

  checkTreasure();

  createBubble();

  updateBubbles();

  fish.forEach(
    drawFish
  );

  treasures.forEach(
    drawTreasure
  );

  mines.forEach(
    drawMine
  );

  drawHarpoons();

  drawBubbles();

  drawSubmarine();

  updateHUD();

  requestAnimationFrame(
    gameLoop
  );
}

gameLoop();

// save setiap 10 detik

setInterval(() => {

  save.coins =
    coins;

  saveGame();

}, 10000);
