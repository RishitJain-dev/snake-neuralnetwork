class Population {
    constructor(size = 100, inputSize = 71, hiddenSize = 16, outputSize = 3) {
        this.size = size;
        this.generation = 1;
        this.mutationRate = 0.1;
        this.mutationAmount = 0.5;
        this.eliteCount = 4;
        this.parentCount = 10;
        this.brains = Array.from({ length: size }, () => new NeuralNetwork(inputSize, hiddenSize, outputSize));
    }

    evolve(fitnesses) {
        const order = fitnesses.map((_, i) => i).sort((a, b) => fitnesses[b] - fitnesses[a]);
        const parents = order.slice(0, this.parentCount).map(i => this.brains[i]);
        const next = order.slice(0, this.eliteCount).map(i => this.brains[i].copy());

        while (next.length < this.size) {
            const parent = parents[Math.floor(Math.random() * parents.length)];
            const child = parent.copy();
            child.mutate(this.mutationRate, this.mutationAmount);
            next.push(child);
        }

        this.brains = next;
        this.generation++;
        return fitnesses[order[0]];
    }
}