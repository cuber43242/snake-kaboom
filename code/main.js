import kaboom from "kaboom";

kaboom({background:[0,0,30]});

loadSprite("fence-top", "sprites/laser-h.png");
loadSprite("fence-bottom", "sprites/laser-h.png");
loadSprite("fence-left", "sprites/laser-v.png");
loadSprite("fence-right", "sprites/laser-v.png");

const BLOCK_SIZE = 20;
const SNAKE_SPEED = 0.2; // seconds per move
let score = 0;
let snake = [];
let direction = "right";
let gameOver = false;
let food = null;

// Create game level
const level = addLevel([
  "wwwwwwwwwwwwww",
  "w            w",
  "w            w",
  "w            w",
  "w            w",
  "w            w",
  "w            w",
  "w            w",
  "w            w",
  "w            w",
  "w            w",
  "w            w",
  "w            w",
  "wwwwwwwwwwwwww",
], {
  width: BLOCK_SIZE,
  height: BLOCK_SIZE,
  "w": () => [
    rect(BLOCK_SIZE, BLOCK_SIZE),
    color(0, 255, 255),
    area(),
    "wall"
  ]
});

// Initialize snake
function initSnake() {
  snake = [];
  direction = "right";
  gameOver = false;
  score = 0;

  // Create initial snake segments
  for (let i = 0; i < 3; i++) {
    snake.push(add([
      rect(BLOCK_SIZE - 2, BLOCK_SIZE - 2),
      pos(BLOCK_SIZE * (3 - i), BLOCK_SIZE * 3),
      color(255, 255, 0),
      area(),
      "snake"
    ]));
  }
}

// Spawn food at random position
function spawnFood() {
  if (food) {
    destroy(food);
  }

  const randomX = Math.floor(Math.random() * 12) + 1;
  const randomY = Math.floor(Math.random() * 12) + 1;

  food = add([
    rect(BLOCK_SIZE - 4, BLOCK_SIZE - 4),
    pos(BLOCK_SIZE * randomX, BLOCK_SIZE * randomY),
    color(255, 0, 0),
    area(),
    "food"
  ]);
}

// Handle key controls
onKeyPress("up", () => {
  if (direction !== "down") direction = "up";
});

onKeyPress("down", () => {
  if (direction !== "up") direction = "down";
});

onKeyPress("left", () => {
  if (direction !== "right") direction = "left";
});

onKeyPress("right", () => {
  if (direction !== "left") direction = "right";
});

// Add score display
const scoreLabel = add([
  text("Score: 0", { size: 20, font: "sinko", color: rgb(255, 232, 31) }),
  pos(24, 24),
  fixed()
]);

// Initialize game
initSnake();
spawnFood();

// Game loop
let moveTimer = 0;
onUpdate(() => {
  if (gameOver) return;

  moveTimer += dt();
  if (moveTimer < SNAKE_SPEED) return;
  moveTimer = 0;

  // Calculate new head position
  const head = snake[0];
  let newX = head.pos.x;
  let newY = head.pos.y;

  switch (direction) {
    case "up": newY -= BLOCK_SIZE; break;
    case "down": newY += BLOCK_SIZE; break;
    case "left": newX -= BLOCK_SIZE; break;
    case "right": newX += BLOCK_SIZE; break;
  }

  // Add new head
  const newHead = add([
    rect(BLOCK_SIZE - 2, BLOCK_SIZE - 2),
    pos(newX, newY),
    color(255, 255, 0),
    area(),
    "snake"
  ]);

  snake.unshift(newHead);

  // Remove tail unless food is eaten
  if (!isColliding(newHead, food)) {
    const tail = snake.pop();
    destroy(tail);
  } else {
    score += 10;
    scoreLabel.text = `Score: ${score}`;
    spawnFood();
  }

  // Check collisions
  if (isColliding(newHead, get("wall")[0]) || 
      snake.slice(1).some(segment => isColliding(newHead, segment))) {
    gameOver = true;
    shake(12);
    wait(1, () => {
      destroyAll("snake");
      destroyAll("food");
      initSnake();
      spawnFood();
    });
  }
});