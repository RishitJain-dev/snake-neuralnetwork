class Population {
    constructor(size = 4, inputSize = 64, mutationRate = 0.1, mutationAmount = 0.5) {
        this.size = size;
        this.inputSize = inputSize;
        this.mutationRate = mutationRate;
        this.mutationAmount = mutationAmount;
        this.generation = 1;
        this.brains = Array.from({ length: size }, () => new NeuralNetwork(inputSize, 64, 4));
    }

    evolve(fitnesses) {
        let bestIndex = 0;
        for (let i = 1; i < fitnesses.length; i++) {
            if (fitnesses[i] > fitnesses[bestIndex]) bestIndex = i;
        }

        const parent = this.brains[bestIndex];
        this.brains = [parent.copy()];

        while (this.brains.length < this.size) {
            const child = parent.copy();
            child.mutate(this.mutationRate, this.mutationAmount);
            this.brains.push(child);
        }

        this.generation++;
        return fitnesses[bestIndex];
    }
}