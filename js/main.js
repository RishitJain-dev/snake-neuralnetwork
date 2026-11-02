const snakeGame = new SnakeGame(GRID);
let brain = new NeuralNetwork(GRID * GRID, 64, 4);

const generationEl = document.getElementById("generation");
const bestScoreEl = document.getElementById("bestScore");
const currentScoreEl = document.getElementById("currentScore");
const speedEl = document.getElementById("speed");

let running = false;
let bestScore = 0;
let networkCount = 1;

function loop() {
    if (!running) return;

    const move = brain.predict(snakeGame.getInputs());
    snakeGame.setDirection(move);
    snakeGame.step();

    if (!snakeGame.alive) {
        snakeGame.reset();
        brain = new NeuralNetwork(GRID * GRID, 64, 4);
        networkCount++;
        generationEl.textContent = networkCount;
    }

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