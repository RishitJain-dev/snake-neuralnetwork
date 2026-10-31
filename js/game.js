const DIRECTIONS = [
    { x: 0, y: -1 },
    { x: 0, y: 1 },
    { x: -1, y: 0 },
    { x: 1, y: 0 }
];

class SnakeGame {
    constructor(size = 8) {
        this.size = size;
        this.maxStepsWithoutFood = 100;
        this.reset();
    }

    reset() {
        this.snake = [{ x: 3, y: 4 }, { x: 2, y: 4 }, { x: 1, y: 4 }];
        this.direction = DIRECTIONS[3];
        this.score = 0;
        this.steps = 0;
        this.stepsSinceFood = 0;
        this.alive = true;
        this.placeFood();
    }

    placeFood() {
        const empty = [];
        for (let y = 0; y < this.size; y++) {
            for (let x = 0; x < this.size; x++) {
                if (!this.snake.some(s => s.x === x && s.y === y)) empty.push({ x, y });
            }
        }
        if (empty.length === 0) {
            this.alive = false;
            return;
        }
        this.food = empty[Math.floor(Math.random() * empty.length)];
    }

    setDirection(d) {
        const next = DIRECTIONS[d];
        if (next.x === -this.direction.x && next.y === -this.direction.y) return;
        this.direction = next;
    }

    step() {
        if (!this.alive) return;

        const head = this.snake[0];
        const newHead = { x: head.x + this.direction.x, y: head.y + this.direction.y };

        if (newHead.x < 0 || newHead.x >= this.size || newHead.y < 0 || newHead.y >= this.size) {
            this.alive = false;
            return;
        }

        const body = this.snake.slice(0, -1);
        if (body.some(s => s.x === newHead.x && s.y === newHead.y)) {
            this.alive = false;
            return;
        }

        this.snake.unshift(newHead);

        if (newHead.x === this.food.x && newHead.y === this.food.y) {
            this.score++;
            this.stepsSinceFood = 0;
            this.placeFood();
        } else {
            this.snake.pop();
        }

        this.steps++;
        this.stepsSinceFood++;
        if (this.stepsSinceFood > this.maxStepsWithoutFood) this.alive = false;
    }

    getInputs() {
        const inputs = new Array(this.size * this.size).fill(0);
        this.snake.forEach((s, i) => {
            inputs[s.y * this.size + s.x] = i === 0 ? 0.5 : -1;
        });
        inputs[this.food.y * this.size + this.food.x] = 1;
        return inputs;
    }
}