const POPULATION_SIZE = 200;
const VISIBLE_SNAKES = 4;
const HIDDEN_SIZE = 24;
const OUTPUT_SIZE = 3;
const GAMES_PER_BRAIN = 5;
const PLAY_SPEED = 8;
const INPUT_SIZE = new SnakeGame(GRID).getInputs().length;

const SAVE_KEY = "snakeTraining";
const BEST_SCORE_KEY = "snakeBestScore";
const YOU_BEST_KEY = "snakeYouBest";
const AI_BEST_KEY = "snakeAiPlayBest";

const population = new Population(POPULATION_SIZE, INPUT_SIZE, HIDDEN_SIZE, OUTPUT_SIZE);
let games = [];
let extraFitness = [];

const generationEl = document.getElementById("generation");
const bestScoreEl = document.getElementById("bestScore");
const currentScoreEl = document.getElementById("currentScore");
const speedEl = document.getElementById("speed");
const messageEl = document.getElementById("message");
const aiStatsEl = document.getElementById("aiStats");
const aiControlsEl = document.getElementById("aiControls");
const compareStatsEl = document.getElementById("compareStats");
const youLastEl = document.getElementById("youLast");
const youBestEl = document.getElementById("youBest");
const aiLastEl = document.getElementById("aiLast");
const aiBestEl = document.getElementById("aiBest");

let mode = "train";
let running = false;
let loopId = 0;
let bestScore = 0;

let playGame = null;
let playActive = false;
let pendingKey = null;
let watchGame = null;

let youLast = null;
let aiLast = null;
let youBest = Number(localStorage.getItem(YOU_BEST_KEY)) || 0;
let aiBest = Number(localStorage.getItem(AI_BEST_KEY)) || 0;

if (population.load(SAVE_KEY)) {
    bestScore = Number(localStorage.getItem(BEST_SCORE_KEY)) || 0;
    console.log(`Loaded training from generation ${population.generation}`);
}

function saveTraining() {
    population.save(SAVE_KEY);
    localStorage.setItem(BEST_SCORE_KEY, bestScore);
}

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

function updateCompare() {
    youLastEl.textContent = youLast === null ? "-" : youLast;
    youBestEl.textContent = youBest;
    aiLastEl.textContent = aiLast === null ? "-" : aiLast;
    aiBestEl.textContent = aiBest;
}

function trainLoop(id) {
    if (!running || id !== loopId || mode !== "train") return;

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
        saveTraining();
        startGeneration();
    }

    render(games);
    updateStats();
    setTimeout(() => trainLoop(id), 1000 / speedEl.value);
}

function playLoop(id) {
    if (id !== loopId || mode !== "play") return;

    if (pendingKey !== null) {
        playGame.setDirection(pendingKey);
        pendingKey = null;
    }
    playGame.step();
    render([playGame]);
    messageEl.textContent = `Score: ${playGame.score}`;

    if (!playGame.alive) {
        playActive = false;
        youLast = playGame.score;
        if (youLast > youBest) {
            youBest = youLast;
            localStorage.setItem(YOU_BEST_KEY, youBest);
        }
        messageEl.textContent = `Game over! You scored ${youLast}. Press an arrow key to play again.`;
        updateCompare();
        return;
    }

    setTimeout(() => playLoop(id), 1000 / PLAY_SPEED);
}

function watchLoop(id) {
    if (id !== loopId || mode !== "watch") return;

    playStep(watchGame, population.brains[0]);
    render([watchGame]);
    messageEl.textContent = `AI score: ${watchGame.score}`;

    if (!watchGame.alive) {
        aiLast = watchGame.score;
        if (aiLast > aiBest) {
            aiBest = aiLast;
            localStorage.setItem(AI_BEST_KEY, aiBest);
        }
        messageEl.textContent = `The AI scored ${aiLast}. Press "Watch AI play" to watch again.`;
        updateCompare();
        return;
    }

    setTimeout(() => watchLoop(id), 1000 / PLAY_SPEED);
}

function setMode(newMode) {
    if (mode === "train" && running) saveTraining();

    mode = newMode;
    running = false;
    playActive = false;
    pendingKey = null;
    loopId++;

    const training = mode === "train";
    aiStatsEl.style.display = training ? "" : "none";
    aiControlsEl.style.display = training ? "" : "none";
    compareStatsEl.style.display = training ? "none" : "";
    updateCompare();

    if (mode === "train") {
        messageEl.textContent = "";
        render(games);
        updateStats();
    }

    if (mode === "play") {
        playGame = new SnakeGame(GRID);
        playGame.maxStepsWithoutFood = Infinity;
        render([playGame]);
        messageEl.textContent = "Press an arrow key to start.";
    }

    if (mode === "watch") {
        watchGame = new SnakeGame(GRID);
        render([watchGame]);
        if (population.generation === 1) {
            messageEl.textContent = "The AI hasn't trained yet, so it will play randomly.";
        }
        watchLoop(loopId);
    }
}

document.addEventListener("keydown", e => {
    if (mode !== "play") return;

    const keys = { ArrowUp: 0, ArrowDown: 1, ArrowLeft: 2, ArrowRight: 3 };
    if (!(e.key in keys)) return;
    e.preventDefault();

    pendingKey = keys[e.key];

    if (!playActive) {
        if (!playGame.alive) {
            playGame = new SnakeGame(GRID);
            playGame.maxStepsWithoutFood = Infinity;
        }
        playActive = true;
        loopId++;
        playLoop(loopId);
    }
});

document.getElementById("trainModeBtn").onclick = () => setMode("train");
document.getElementById("playModeBtn").onclick = () => setMode("play");
document.getElementById("watchModeBtn").onclick = () => setMode("watch");

document.getElementById("startBtn").onclick = () => {
    if (running) return;
    running = true;
    loopId++;
    trainLoop(loopId);
};

document.getElementById("pauseBtn").onclick = () => {
    running = false;
    saveTraining();
};

document.getElementById("resetBtn").onclick = () => {
    if (!confirm("Delete all saved training and start again?")) return;
    localStorage.removeItem(SAVE_KEY);
    localStorage.removeItem(BEST_SCORE_KEY);
    localStorage.removeItem(AI_BEST_KEY);
    location.reload();
};

startGeneration();
setMode("train");