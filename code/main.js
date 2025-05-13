
import kaboom from "kaboom";

const k = kaboom({
  background: [0, 0, 30],
  global: true,
  width: 800,  // Make game bigger
  height: 600, // Make game bigger
});

loadSprite("fence-top", "sprites/laser-h.png");
loadSprite("fence-bottom", "sprites/laser-h.png");
loadSprite("fence-left", "sprites/laser-v.png");
loadSprite("fence-right", "sprites/laser-v.png");

let highScore = 0;

// Add instructions scene
scene("instructions", () => {
  add([
    text("SNAKE GAME", { size: 48 }),
    pos(width() / 2, height() / 4),
    origin("center"),
    color(255, 255, 0),
  ]);

  add([
    text("How to Play:", { size: 32 }),
    pos(width() / 2, height() / 2 - 50),
    origin("center"),
    color(255, 255, 255),
  ]);

  add([
    text("- Use arrow keys to control the snake\n- Collect red food to grow\n- Avoid walls and yourself\n- Score increases with each food eaten", 
      { size: 24 }),
    pos(width() / 2, height() / 2 + 50),
    origin("center"),
  ]);

  add([
    text("Press SPACE to Start", { size: 32 }),
    pos(width() / 2, height() - 100),
    origin("center"),
    color(0, 255, 0),
  ]);

  keyPress("space", () => {
    go("game");
  });
});

scene("game", () => {
  const BLOCK_SIZE = 25; // Bigger blocks
  let SNAKE_SPEED = 0.2;
  let score = 0;
  let snake = [];
  let direction = "right";
  let gameOver = false;
  let food = null;

  const level = addLevel([
    "wwwwwwwwwwwwwwwwwwwwwwwwwwwwwww",
    "w                              w",
    "w                              w",
    "w                              w",
    "w                              w",
    "w                              w",
    "w                              w",
    "w                              w",
    "w                              w",
    "w                              w",
    "w                              w",
    "w                              w",
    "w                              w",
    "w                              w",
    "w                              w",
    "w                              w",
    "w                              w",
    "w                              w",
    "w                              w",
    "w                              w",
    "wwwwwwwwwwwwwwwwwwwwwwwwwwwwwww",
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

  function spawnFood() {
    if (food) {
      destroy(food);
    }
    const randomX = Math.floor(Math.random() * 28) + 1;
    const randomY = Math.floor(Math.random() * 18) + 1;
    food = add([
      rect(BLOCK_SIZE - 4, BLOCK_SIZE - 4),
      pos(BLOCK_SIZE * randomX, BLOCK_SIZE * randomY),
      color(255, 0, 0),
      area(),
      "food"
    ]);
  }

  const scoreLabel = add([
    text("Score: 0  High Score: " + highScore, { size: 24 }),
    pos(24, 24),
    color(255, 255, 255),
  ]);

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
      scoreLabel.text = `Score: ${score}  High Score: ${highScore}`;
      spawnFood();

      if (score % 50 === 0) {
        SNAKE_SPEED = Math.max(0.05, SNAKE_SPEED - 0.02);
      }
    }

    if (newHead.isColliding("wall") || 
        snake.slice(1).some(segment => newHead.isColliding(segment))) {
      gameOver = true;
      shake(12);
      wait(1, () => {
        if (score > highScore) {
          highScore = score;
        }
        go("lose", score);
      });
    }
  });

  initSnake();
  spawnFood();
});

scene("lose", (score) => {
  const isNewHighScore = score > highScore;

  add([
    text(isNewHighScore ? "New High Score!" : "Game Over!", { size: 48 }),
    pos(width() / 2, height() / 2 - 100),
    origin("center"),
    color(isNewHighScore ? rgb(255, 215, 0) : rgb(255, 0, 0)),
  ]);

  add([
    text(`Score: ${score}\nHigh Score: ${highScore}`, { size: 32 }),
    pos(width() / 2, height() / 2),
    origin("center"),
  ]);

  add([
    text("Press SPACE to Play Again", { size: 24 }),
    pos(width() / 2, height() / 2 + 80),
    origin("center"),
  ]);

  add([
    text("Press ESC for Instructions", { size: 24 }),
    pos(width() / 2, height() / 2 + 120),
    origin("center"),
  ]);

  keyPress("space", () => {
    go("game");
  });

  keyPress("escape", () => {
    go("instructions");
  });
});

go("instructions");
