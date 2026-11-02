const canvas = document.getElementById("game");
const context = canvas.getContext("2d");

const GRID = 8;
const CELL = canvas.width / GRID;

const SNAKE_COLOURS = ["#f7341f", "#2599e7", "#1ce93e", "#b223eb"];

function drawCell(x, y, colour, alpha = 1) {
    context.globalAlpha = alpha;
    context.fillStyle = colour;
    context.fillRect(x * CELL + 1, y * CELL + 1, CELL - 2, CELL - 2);
    context.globalAlpha = 1;
}

function drawFood(x, y, colour) {
    context.fillStyle = colour;
    context.beginPath();
    context.arc(x * CELL + CELL / 2, y * CELL + CELL / 2, CELL * 0.3, 0, Math.PI * 2);
    context.fill();
}

function drawBoard() {
    context.fillStyle = "rgb(241, 228, 220)";
    context.fillRect(0, 0, canvas.width, canvas.height);

    for (let y = 0; y < GRID; y++) {
        for (let x = 0; x < GRID; x++) {
            drawCell(x, y, "#fdfdfd");
        }
    }
}

function render(games) {
    drawBoard();

    games.forEach((game, i) => {
        if (!game.alive) return;

        const colour = SNAKE_COLOURS[i % SNAKE_COLOURS.length];

        drawFood(game.food.x, game.food.y, colour);

        for (let j = 1; j < game.snake.length; j++) {
            drawCell(game.snake[j].x, game.snake[j].y, colour, 0.5);
        }

        const head = game.snake[0];
        drawCell(head.x, head.y, colour, 1);
    });
}

const brainCanvas = document.getElementById("brain");
const brainCtx = brainCanvas.getContext("2d");

const FEATURE_NAMES = [
    "danger ahead", "danger left", "danger right",
    "food ahead", "food behind", "food left", "food right",
    "space ahead", "space left", "space right",
    "body ahead", "body behind", "body left", "body right",
    "Length"
];
const OUTPUT_NAMES = [" ^ straight", "<-- left", "--> right"];

function weightColour(w, strength) {
    const a = Math.min(1, Math.abs(w)) * strength; /*never been good at math lol*/
    return w > 0 ? `rgba(39, 174, 96, ${a})` : `rgba(231, 76, 60, ${a})`;
}

function drawNode(x, y, value, highlight = false) {
    brainCtx.beginPath();
    brainCtx.arc(x, y, 6, 0, Math.PI * 2);
    brainCtx.fillStyle = "#fff";
    brainCtx.fill();
    brainCtx.fillStyle = weightColour(value, 1);
    brainCtx.fill();
    brainCtx.lineWidth = highlight ? 3 : 1;
    brainCtx.strokeStyle = highlight ? "#000" : "#777";
    brainCtx.stroke();
}

function line(x1, y1, x2, y2, colour, width) {
    brainCtx.strokeStyle = colour;
    brainCtx.lineWidth = width;
    brainCtx.beginPath();
    brainCtx.moveTo(x1, y1);
    brainCtx.lineTo(x2, y2);
    brainCtx.stroke();
}

function drawBrain(brain, game) {
    const t = brain.think(game.getInputs());
    const W = brainCanvas.width;
    const H = brainCanvas.height;
    const gridCount = Math.max(0, t.inputs.length - FEATURE_NAMES.length);
    const features = t.inputs.slice(gridCount);

    const inX = 130;
    const hidX = 290;
    const outX = 410;
    const featY = i => 20 + i * (H - 40) / Math.max(1, features.length - 1);
    const hidY = i => 20 + i * (H - 40) / Math.max(1, t.hidden.length - 1);
    const outY = i => H / 2 - 70 + i * 70;

    brainCtx.fillStyle = "#fdfdfd";
    brainCtx.fillRect(0, 0, W, H);

    for (let h = 0; h < t.hidden.length; h++) {
        for (let i = 0; i < features.length; i++) {
            const w = brain.weightsIH[h][gridCount + i];
            line(inX, featY(i), hidX, hidY(h), weightColour(w, 0.05 + 0.5 * Math.abs(features[i])), 1);
        }
    }

    for (let o = 0; o < t.outputs.length; o++) {
        for (let h = 0; h < t.hidden.length; h++) {
            const w = brain.weightsHO[o][h];
            line(hidX, hidY(h), outX, outY(o), weightColour(w, 0.05 + 0.7 * Math.abs(t.hidden[h])), o === t.choice ? 2 : 1);
        }
    }

    brainCtx.font = "12px sans-serif";
    brainCtx.textBaseline = "middle";

    features.forEach((v, i) => {
        drawNode(inX, featY(i), v);
        brainCtx.fillStyle = "#333";
        brainCtx.textAlign = "right";
        brainCtx.fillText(FEATURE_NAMES[i] || `Input ${i}`, inX - 12, featY(i));
    });

    t.hidden.forEach((v, h) => drawNode(hidX, hidY(h), v));

    t.outputs.forEach((v, o) => {
        const chosen = o === t.choice;
        const y = outY(o);
        const barX = outX + 15;
        const barW = 90;

        drawNode(outX, y, v, chosen);

        brainCtx.fillStyle = "#e5e5e5";
        brainCtx.fillRect(barX, y - 6, barW, 12);
        brainCtx.fillStyle = chosen ? "#188646" : "#aaa";
        brainCtx.fillRect(barX, y - 6, ((v + 1) / 2) * barW, 12);

        brainCtx.fillStyle = "#333";
        brainCtx.textAlign = "left";
        brainCtx.font = chosen ? "bold 13px sans-serif" : "12px sans-serif";
        brainCtx.fillText(OUTPUT_NAMES[o] || `Output ${o}`, barX, y - 16);
        brainCtx.font = "12px sans-serif";
    });

    if (gridCount > 0) {
        const side = Math.round(Math.sqrt(gridCount));
        const cell = 10;
        const gx = W - side * cell - 10;
        const gy = H - side * cell - 10;

        brainCtx.fillStyle = "#333";
        brainCtx.textAlign = "left";
        brainCtx.fillText("What it sees", gx, gy - 10);

        for (let i = 0; i < gridCount; i++) {
            const v = t.inputs[i];
            brainCtx.fillStyle = v === 1 ? "#e74c3c" : v === 0.5 ? "#188646" : v === -1 ? "#27ae60" : "#eee";
            brainCtx.fillRect(gx + (i % side) * cell, gy + Math.floor(i / side) * cell, cell - 1, cell - 1);
        }
    }
}