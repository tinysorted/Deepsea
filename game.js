const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = 700;
canvas.height = 430;

let coins = 0;
let cargo = 0;
let cargoMax = 5;
let oxygen = 100;
let hull = 100;

const submarine = {
  x: 80,
  y: 80,
  width: 80,
  height: 35,
  speed: 14,
  direction: 1
};

let fish = [];
let harpoons = [];
let mines = [];

function random(min, max) {
  return Math.random() * (max - min) + min;
}

function createFish() {
  let value = 10;

  const chance = Math.random();

  if (chance > 0.97) value = 100;
  else if (chance > 0.88) value = 50;
  else if (chance > 0.65) value = 25;

  fish.push({
    x: random(100, canvas.width - 40),
    y: random(70, canvas.height - 30),
    width: 35,
    height: 20,
    speed: random(0.5, 1.5),
    direction: Math.random() > 0.5 ? 1 : -1,
    value: value
  });
}

function createMine() {
  mines.push({
    x: random(120, canvas.width - 30),
    y: random(160, canvas.height - 30),
    radius: 13
  });
}

for (let i = 0; i < 12; i++) {
  createFish();
}

for (let i = 0; i < 4; i++) {
  createMine();
}

function drawSubmarine() {
  ctx.fillStyle = "#ffd33d";

  ctx.beginPath();
  ctx.roundRect(
    submarine.x,
    submarine.y,
    submarine.width,
    submarine.height,
    18
  );

  ctx.fill();

  ctx.fillStyle = "#1c5a72";

  ctx.beginPath();
  ctx.arc(
    submarine.x + 55,
    submarine.y + 17,
    8,
    0,
    Math.PI * 2
  );

  ctx.fill();
}

function drawFish(f) {

  if (f.value === 100)
    ctx.fillStyle = "#ffd700";

  else if (f.value === 50)
    ctx.fillStyle = "#c05cff";

  else if (f.value === 25)
    ctx.fillStyle = "#4fdcff";

  else
    ctx.fillStyle = "#ffffff";

  ctx.beginPath();

  ctx.ellipse(
    f.x,
    f.y,
    17,
    10,
    0,
    0,
    Math.PI * 2
  );

  ctx.fill();
}

function drawMine(m) {

  ctx.fillStyle = "#222";

  ctx.beginPath();

  ctx.arc(
    m.x,
    m.y,
    m.radius,
    0,
    Math.PI * 2
  );

  ctx.fill();

}

function updateFish() {

  fish.forEach(f => {

    f.x += f.speed * f.direction;

    if (f.x > canvas.width + 30)
      f.x = -30;

    if (f.x < -30)
      f.x = canvas.width + 30;

  });

}

function fireHarpoon() {

  if (cargo >= cargoMax)
    return;

  harpoons.push({
    x: submarine.x + 75,
    y: submarine.y + 17,
    speed: 8,
    direction: submarine.direction
  });

}

function updateHarpoons() {

  for (let h = harpoons.length - 1; h >= 0; h--) {

    let harpoon = harpoons[h];

    harpoon.x += harpoon.speed * harpoon.direction;

    for (let i = fish.length - 1; i >= 0; i--) {

      let f = fish[i];

      let dx = harpoon.x - f.x;
      let dy = harpoon.y - f.y;

      if (Math.sqrt(dx * dx + dy * dy) < 20) {

        cargo++;
        coins += f.value;

        fish.splice(i, 1);
        harpoons.splice(h, 1);

        createFish();

        updateHUD();

        return;
      }

    }

    if (
      harpoon.x < 0 ||
      harpoon.x > canvas.width
    ) {
      harpoons.splice(h, 1);
    }

  }

}

function drawHarpoons() {

  ctx.strokeStyle = "white";
  ctx.lineWidth = 3;

  harpoons.forEach(h => {

    ctx.beginPath();

    ctx.moveTo(h.x, h.y);

    ctx.lineTo(
      h.x + 20 * h.direction,
      h.y
    );

    ctx.stroke();

  });

}

function checkMineCollision() {

  mines.forEach(m => {

    const dx =
      submarine.x +
      submarine.width / 2 -
      m.x;

    const dy =
      submarine.y +
      submarine.height / 2 -
      m.y;

    const distance =
      Math.sqrt(dx * dx + dy * dy);

    if (distance < 35) {

      hull -= 10;

      submarine.y -= 20;

      updateHUD();

      if (hull <= 0) {

        hull = 100;
        cargo = 0;

        submarine.x = 80;
        submarine.y = 50;

      }

    }

  });

}

function updateOxygen() {

  if (submarine.y > 60) {

    oxygen -= 0.025;

  } else {

    oxygen += 0.1;

  }

  oxygen = Math.min(100, oxygen);

  if (oxygen <= 0) {

    oxygen = 20;
    submarine.y = 45;

  }

}

function updateHUD() {

  document.getElementById("coins").textContent =
    Math.floor(coins);

  document.getElementById("cargo").textContent =
    cargo;

  document.getElementById("oxygen").textContent =
    Math.floor(oxygen);

  document.getElementById("hull").textContent =
    hull;

}

function gameLoop() {

  ctx.clearRect(
    0,
    0,
    canvas.width,
    canvas.height
  );

  updateFish();
  updateHarpoons();
  updateOxygen();
  checkMineCollision();

  fish.forEach(drawFish);

  mines.forEach(drawMine);

  drawHarpoons();
  drawSubmarine();

  updateHUD();

  requestAnimationFrame(gameLoop);

}

document
  .getElementById("left")
  .onclick = () => {

    submarine.x -= submarine.speed;
    submarine.direction = -1;

  };

document
  .getElementById("right")
  .onclick = () => {

    submarine.x += submarine.speed;
    submarine.direction = 1;

  };

document
  .getElementById("up")
  .onclick = () => {

    submarine.y -= submarine.speed;

  };

document
  .getElementById("down")
  .onclick = () => {

    submarine.y += submarine.speed;

  };

document
  .getElementById("fire")
  .onclick = fireHarpoon;

document
  .getElementById("sell")
  .onclick = () => {

    if (submarine.y < 70) {

      cargo = 0;

      oxygen = 100;

      updateHUD();

    }

  };

gameLoop();
