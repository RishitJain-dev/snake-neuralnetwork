const canvas = document.getElementById("game");
const context = canvas.getContext("2d");

const GRID = 8;
const CELL = canvas.width / GRID;

function drawCell(x, y, color) {
    context.fillStyle = color;
    context.fillRect(x * CELL + 1, y * CELL + 1, CELL - 2, CELL - 2);
}

function render(game) {
    context.fillStyle = "rgb(241, 228, 220)";
    context.fillRect(0, 0, canvas.width, canvas.height);

    for (let y = 0; y < GRID; y++) {
        for (let x = 0; x < GRID; x++) {
            drawCell(x, y, "#fdfdfd");
        }
    }

    drawCell(game.food.x, game.food.y, "#e74c3c");

    for (let i = 1; i < game.snake.length; i++) {
        drawCell(game.snake[i].x, game.snake[i].y, "#27ae60");
    }

    const head = game.snake[0];
    drawCell(head.x, head.y, "#188646");
}