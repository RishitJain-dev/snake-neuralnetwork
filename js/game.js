const DIRECTIONS = [
    { x: 0, y: -1 },
    { x: 0, y: 1 },
    { x: -1, y: 0 },
    { x: 1, y: 0 }
];

class SnakeGame {
    constructor(size = 8) {
        this.size = size;
        this.maxStepsWithoutFood = size * size;
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

    inBounds(point) {
        return point.x >= 0 && point.x < this.size && point.y >= 0 && point.y < this.size;
    }

    isDanger(point) {
        if (!this.inBounds(point)) return true;
        return this.snake.slice(0, -1).some(s => s.x === point.x && s.y === point.y);
    }

    reachableSpace(start) {
        if (this.isDanger(start)) return 0;

        const blocked = new Set(this.snake.slice(0, -1).map(s => s.y * this.size + s.x));
        const seen = new Set([start.y * this.size + start.x]);
        const queue = [start];

        while (queue.length > 0) {
            const p = queue.shift();
            for (const d of DIRECTIONS) {
                const n = { x: p.x + d.x, y: p.y + d.y };
                const key = n.y * this.size + n.x;
                if (this.inBounds(n) && !blocked.has(key) && !seen.has(key)) {
                    seen.add(key);
                    queue.push(n);
                }
            }
        }

        const freeCells = this.size * this.size - this.snake.length + 1;
        return Math.min(seen.size / freeCells, 1);
    }

    setDirection(d) {
        const next = DIRECTIONS[d];
        if (next.x === -this.direction.x && next.y === -this.direction.y) return;
        this.direction = next;
    }

    turn(action) {
        const d = this.direction;
        if (action === 1) this.direction = { x: d.y, y: -d.x };
        if (action === 2) this.direction = { x: -d.y, y: d.x };
    }

    step() {
        if (!this.alive) return;

        const head = this.snake[0];
        const newHead = { x: head.x + this.direction.x, y: head.y + this.direction.y };

        if (!this.inBounds(newHead)) {
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

        if (this.alive && this.stepsSinceFood > this.maxStepsWithoutFood + this.snake.length * 2) {
            this.die("starved");
        }
    }

    relativeSides(target) {
        const head = this.snake[0];
        const d = this.direction;
        const dx = target.x - head.x;
        const dy = target.y - head.y;
        const ahead = dx * d.x + dy * d.y;
        const left = dx * d.y - dy * d.x;
        return [ahead > 0 ? 1 : 0, ahead < 0 ? 1 : 0, left > 0 ? 1 : 0, left < 0 ? 1 : 0];
    }

    getInputs() {
        const inputs = [];


        const head = this.snake[0];
        const d = this.direction;
        const ahead = { x: head.x + d.x, y: head.y + d.y };
        const left = { x: head.x + d.y, y: head.y - d.x };
        const right = { x: head.x - d.y, y: head.y + d.x };
        const tail = this.snake[this.snake.length - 1];

        inputs.push(
            this.isDanger(ahead) ? 1 : 0,
            this.isDanger(left) ? 1 : 0,
            this.isDanger(right) ? 1 : 0,
            ...this.relativeSides(this.food),
            this.reachableSpace(ahead),
            this.reachableSpace(left),
            this.reachableSpace(right),
            ...this.relativeSides(tail),
            this.snake.length / (this.size * this.size)
        );

        return inputs;
    }
}