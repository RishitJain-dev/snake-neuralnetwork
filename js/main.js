const VISIBLE_SNAKES = 4;
const OUTPUT_SIZE = 3;
const POPULATION_SIZE = 200;
const HIDDEN_SIZE = 24;
const GAMES_PER_BRAIN = 5;
const INPUT_SIZE = new SnakeGame(GRID).getInputs().length;

const population = new Population(POPULATION_SIZE, INPUT_SIZE, HIDDEN_SIZE, OUTPUT_SIZE);
let games = [];
let extraFitness = [];

const generationEl = document.getElementById("generation");
const bestScoreEl = document.getElementById("bestScore");
const currentScoreEl = document.getElementById("currentScore");
const speedEl = document.getElementById("speed");

let running = false;
let bestScore = 0;

function playStep(game, brain) {
    game.turn(brain.predict(game.getInputs()));
    game.step();
    if (game.score > bestScore) bestScore = game.score;
}

function playHeadless(brain, count) {
    let total = 0;
    for (let k = 0; k < count; k++) {
        const game = new SnakeGame(GRID);
        while (game.alive) playStep(game, brain);
        total += calculateFitness(game.stats);
    }
    return total;
}

function startGeneration() {
    games = Array.from({ length: VISIBLE_SNAKES }, () => new SnakeGame(GRID));
    extraFitness = population.brains.map((brain, i) =>
        playHeadless(brain, i < VISIBLE_SNAKES ? GAMES_PER_BRAIN - 1 : GAMES_PER_BRAIN)
    );
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
        if (game.alive) playStep(game, population.brains[i]);
    });

    if (games.every(g => !g.alive)) {
        const fitnesses = population.brains.map((_, i) => {
            const visible = i < VISIBLE_SNAKES ? calculateFitness(games[i].stats) : 0;
            return (extraFitness[i] + visible) / GAMES_PER_BRAIN;
        });
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