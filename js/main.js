const population = new Population(4, GRID * GRID);
let games = [];

const generationEl = document.getElementById("generation");
const bestScoreEl = document.getElementById("bestScore");
const currentScoreEl = document.getElementById("currentScore");
const speedEl = document.getElementById("speed");

let running = false;
let bestScore = 0;

function startGeneration() {
    games = population.brains.map(() => new SnakeGame(GRID));
}

function updateStats() {
    const alive = games.filter(g => g.alive).length;
    generationEl.textContent = `${population.generation} (${alive} alive)`;
    currentScoreEl.textContent = games.map(g => g.score).join(" / ");
    bestScoreEl.textContent = bestScore;
}

function loop() {
    if (!running) return;

    games.forEach((game, i) => {
        if (!game.alive) return;
        game.setDirection(population.brains[i].predict(game.getInputs()));
        game.step();
        if (game.score > bestScore) bestScore = game.score;
    });

    if (games.every(g => !g.alive)) { /*not alive??!?!*/
        const fitnesses = games.map(g => calculateFitness(g.stats));
        const best = population.evolve(fitnesses);
        console.log(`Generation ${population.generation - 1} best fitness: ${best.toFixed(1)}`);
        startGeneration();
    }

    render(games);
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

startGeneration();
render(games);
updateStats();