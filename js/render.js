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