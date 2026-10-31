const snakeGame = new SnakeGame(GRID);
snakeGame.maxStepsWithoutFood = Infinity;

const bestScoreEl = document.getElementById("bestScore");
const currentScoreEl = document.getElementById("currentScore");
const speedEl = document.getElementById("speed");

let running = false;
let bestScore = 0;

document.addEventListener("keydown", e => {
    const keys = { ArrowUp: 0, ArrowDown: 1, ArrowLeft: 2, ArrowRight: 3 };
    if (e.key in keys) {
        e.preventDefault();
        snakeGame.setDirection(keys[e.key]);
    }
});

function loop() {
    if (!running) return;

    snakeGame.step();

    if (!snakeGame.alive) snakeGame.reset();

    render(snakeGame);

    currentScoreEl.textContent = snakeGame.score;
    if (snakeGame.score > bestScore) {
        bestScore = snakeGame.score;
        bestScoreEl.textContent = bestScore;
    }

    setTimeout(loop, 1000 / speedEl.value);
}

document.getElementById("startBtn").onclick = () => {
    if (!running) {
        running = true;
        loop();
    }
};

document.getElementById("pauseBtn").onclick = () => {
    running = false;
};

render(snakeGame);