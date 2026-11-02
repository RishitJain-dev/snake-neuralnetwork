const snakeGame = new SnakeGame(GRID);
const population = new Population(4, GRID * GRID);

const generationEl = document.getElementById("generation");
const bestScoreEl = document.getElementById("bestScore");
const currentScoreEl = document.getElementById("currentScore");
const speedEl = document.getElementById("speed");

let running = false;
let bestScore = 0;
let current = 0;
let fitnesses = [];

function updateStats() {
    generationEl.textContent = `${population.generation} (snake ${current + 1}/${population.size})`;
    currentScoreEl.textContent = snakeGame.score;
    bestScoreEl.textContent = bestScore;
}

function loop() {
    if (!running) return;

    const brain = population.brains[current];
    snakeGame.setDirection(brain.predict(snakeGame.getInputs()));
    snakeGame.step();

    if (snakeGame.score > bestScore) bestScore = snakeGame.score;

    if (!snakeGame.alive) {
        fitnesses.push(calculateFitness(snakeGame.stats));
        current++;

        if (current >= population.size) {
            const best = population.evolve(fitnesses);
            console.log(`Generation ${population.generation - 1} best fitness: ${best.toFixed(1)}`);
            fitnesses = [];
            current = 0;
        }

        snakeGame.reset();
    }

    render(snakeGame);
    updateStats();
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
updateStats();