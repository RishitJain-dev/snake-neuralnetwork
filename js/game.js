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
        this.stats = Object.fromEntries(Object.keys(REWARDS).map(name => [name, 0]));
        this.placeFood();
    }

    reward(name) {
        if (name in this.stats) this.stats[name]++;
    }

    die(reason) {
        this.alive = false;
        this.reward(reason);
    }

    placeFood() {
        const empty = [];
        for (let y = 0; y < this.size; y++) {
            for (let x = 0; x < this.size; x++) {
                if (!this.snake.some(s => s.x === x && s.y === y)) empty.push({ x, y });
            }
        }
        if (empty.length === 0) {
            this.die("won");
            return;
        }
        this.food = empty[Math.floor(Math.random() * empty.length)];
    }

    distanceToFood(point) {
        return Math.abs(point.x - this.food.x) + Math.abs(point.y - this.food.y);
    }

    isDanger(point) {
        if (point.x < 0 || point.x >= this.size || point.y < 0 || point.y >= this.size) return true;
        return this.snake.slice(0, -1).some(s => s.x === point.x && s.y === point.y);
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
            this.die("hitWall");
            return;
        }

        const body = this.snake.slice(0, -1);
        if (body.some(s => s.x === newHead.x && s.y === newHead.y)) {
            this.die("hitSelf");
            return;
        }

        this.steps++;
        this.stepsSinceFood++;
        this.reward("step");

        const oldDistance = this.distanceToFood(head);
        this.snake.unshift(newHead);

        if (newHead.x === this.food.x && newHead.y === this.food.y) {
            this.score++;
            this.stepsSinceFood = 0;
            this.reward("food");
            this.placeFood();
        } else {
            this.snake.pop();
            if (this.distanceToFood(newHead) < oldDistance) {
                this.reward("closerToFood");
            } else {
                this.reward("furtherFromFood");
            }
        }

        if (this.alive && this.stepsSinceFood > this.maxStepsWithoutFood) {
            this.die("starved");
        }
    }

    getInputs() {
        const inputs = new Array(this.size * this.size).fill(0);
        this.snake.forEach((s, i) => {
            inputs[s.y * this.size + s.x] = i === 0 ? 0.5 : -1;
        });
        inputs[this.food.y * this.size + this.food.x] = 1;

        const head = this.snake[0];
        const d = this.direction;
        const ahead = { x: head.x + d.x, y: head.y + d.y };
        const left = { x: head.x + d.y, y: head.y - d.x };
        const right = { x: head.x - d.y, y: head.y + d.x };

        inputs.push(
            this.food.y < head.y ? 1 : 0,
            this.food.y > head.y ? 1 : 0,
            this.food.x < head.x ? 1 : 0,
            this.food.x > head.x ? 1 : 0,
            this.isDanger(ahead) ? 1 : 0,
            this.isDanger(left) ? 1 : 0,
            this.isDanger(right) ? 1 : 0
        );

        return inputs;
    }
}