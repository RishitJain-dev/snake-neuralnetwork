const POPULATION_SIZE = 100;
const VISIBLE_SNAKES = 4;
const HIDDEN_SIZE = 16;
const INPUT_SIZE = new SnakeGame(GRID).getInputs().length;

const population = new Population(POPULATION_SIZE, INPUT_SIZE, HIDDEN_SIZE);
let games = [];

const generationEl = document.getElementById("generation");
const bestScoreEl = document.getElementById("bestScore");
const currentScoreEl = document.getElementById("currentScore");
const speedEl = document.getElementById("speed");

let running = false;
let bestScore = 0;

function playStep(game, brain) {
    game.setDirection(brain.predict(game.getInputs()));
    game.step();
    if (game.score > bestScore) bestScore = game.score;
}

function visibleGames() {
    return games.slice(0, VISIBLE_SNAKES);
}

function startGeneration() {
    games = population.brains.map(() => new SnakeGame(GRID));
    for (let i = VISIBLE_SNAKES; i < games.length; i++) {
        while (games[i].alive) playStep(games[i], population.brains[i]);
    }
}

function updateStats() {
    const visible = visibleGames();
    const alive = visible.filter(g => g.alive).length;
    generationEl.textContent = `${population.generation} (${alive} alive)`;
    currentScoreEl.textContent = visible.map(g => g.score).join(" / ");
    bestScoreEl.textContent = bestScore;
}

function loop() {
    if (!running) return;

    visibleGames().forEach((game, i) => {
        if (game.alive) playStep(game, population.brains[i]);
    });

    if (visibleGames().every(g => !g.alive)) {
        const fitnesses = games.map(g => calculateFitness(g.stats));
        const best = population.evolve(fitnesses);
        console.log(`Generation ${population.generation - 1} best fitness: ${best.toFixed(1)}`);
        startGeneration();
    }

    render(visibleGames());
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
render(visibleGames());
updateStats();