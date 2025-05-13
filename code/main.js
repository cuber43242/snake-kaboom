import kaboom from "kaboom";

const k = kaboom({
  background: [0, 0, 30],
  global: true,
});

loadSprite("fence-top", "sprites/laser-h.png");
loadSprite("fence-bottom", "sprites/laser-h.png");
loadSprite("fence-left", "sprites/laser-v.png");
loadSprite("fence-right", "sprites/laser-v.png");

scene("game", () => {
  const BLOCK_SIZE = 20;
  let SNAKE_SPEED = 0.2;
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
    SNAKE_SPEED = 0.2;

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

  // Spawn food
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

  // Add instructions
  add([
    text("Use arrow keys to move", { size: 12 }),
    pos(24, height() - 24),
    color(255, 255, 255),
  ]);

  // Add score display
  const scoreLabel = add([
    text("Score: 0", { size: 20 }),
    pos(24, 24),
    color(255, 255, 255),
  ]);

  // Handle key controls using Kaboom's input handling
  action(() => {
    if (keyIsDown("up") && direction !== "down") {
      direction = "up";
    }
    if (keyIsDown("down") && direction !== "up") {
      direction = "down";
    }
    if (keyIsDown("left") && direction !== "right") {
      direction = "left";
    }
    if (keyIsDown("right") && direction !== "left") {
      direction = "right";
    }
  });

  // Game loop
  let moveTimer = 0;
  action(() => {
    if (gameOver) return;

    moveTimer += dt();
    if (moveTimer < SNAKE_SPEED) return;
    moveTimer = 0;

    const head = snake[0];
    let newX = head.pos.x;
    let newY = head.pos.y;

    switch (direction) {
      case "up": newY -= BLOCK_SIZE; break;
      case "down": newY += BLOCK_SIZE; break;
      case "left": newX -= BLOCK_SIZE; break;
      case "right": newX += BLOCK_SIZE; break;
    }

    const newHead = add([
      rect(BLOCK_SIZE - 2, BLOCK_SIZE - 2),
      pos(newX, newY),
      color(255, 255, 0),
      area(),
      "snake"
    ]);

    snake.unshift(newHead);

    if (!newHead.isColliding(food)) {
      const tail = snake.pop();
      destroy(tail);
    } else {
      score += 10;
      scoreLabel.text = `Score: ${score}`;
      spawnFood();

      // Increase difficulty every 50 points
      if (score % 50 === 0) {
        SNAKE_SPEED = Math.max(0.05, SNAKE_SPEED - 0.02);
      }

      // Win condition
      if (score >= 100) {
        go("win");
      }
    }

    if (newHead.isColliding("wall") || 
        snake.slice(1).some(segment => newHead.isColliding(segment))) {
      gameOver = true;
      shake(12);
      wait(1, () => {
        go("lose", score);
      });
    }
  });

  initSnake();
  spawnFood();
});

scene("lose", (score) => {
  add([
    text("Game Over!", { size: 32 }),
    pos(width() / 2, height() / 2 - 64),
    origin("center"),
    color(255, 0, 0),
  ]);

  add([
    text(`Score: ${score}`, { size: 24 }),
    pos(width() / 2, height() / 2),
    origin("center"),
  ]);

  add([
    text("Press SPACE to retry", { size: 16 }),
    pos(width() / 2, height() / 2 + 64),
    origin("center"),
  ]);

  onKeyPress("space", () => {
    go("game");
  });
});

scene("win", () => {
  add([
    text("You Won!", { size: 32 }),
    pos(width() / 2, height() / 2 - 64),
    origin("center"),
    color(0, 255, 0),
  ]);

  add([
    text("Press SPACE to play again", { size: 16 }),
    pos(width() / 2, height() / 2 + 64),
    origin("center"),
  ]);

  onKeyPress("space", () => {
    go("game");
  });
});

go("game");