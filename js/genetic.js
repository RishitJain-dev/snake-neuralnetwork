class Population {
    constructor(size = 100, inputSize = 71, hiddenSize = 16, outputSize = 3) {
        this.size = size;
        this.inputSize = inputSize;
        this.hiddenSize = hiddenSize;
        this.outputSize = outputSize;
        this.generation = 1;
        this.mutationRate = 0.1;
        this.mutationAmount = 0.5;
        this.eliteCount = 4;
        this.parentCount = 10;
        this.parents = [];
        this.brains = Array.from({ length: size }, () => new NeuralNetwork(inputSize, hiddenSize, outputSize));
    }

    breed(parents, elites) {
        const next = elites.map(b => b.copy());
        while (next.length < this.size) {
            const parent = parents[Math.floor(Math.random() * parents.length)];
            const child = parent.copy();
            child.mutate(this.mutationRate, this.mutationAmount);
            next.push(child);
        }
        return next;
    }

    evolve(fitnesses) {
        const order = fitnesses.map((_, i) => i).sort((a, b) => fitnesses[b] - fitnesses[a]);
        this.parents = order.slice(0, this.parentCount).map(i => this.brains[i]);
        const elites = order.slice(0, this.eliteCount).map(i => this.brains[i]);

        this.brains = this.breed(this.parents, elites);
        this.generation++;
        return fitnesses[order[0]];
    }

    save(key) {
        try {
            localStorage.setItem(key, JSON.stringify({
                generation: this.generation,
                brains: this.parents
            }));
        } catch (e) {
            console.warn("couldnt save", e);
        }
    }

    load(key) {
        try {
            const data = JSON.parse(localStorage.getItem(key));
            if (!data || !data.brains || data.brains.length === 0) return false;

            const first = data.brains[0];
            if (first.inputSize !== this.inputSize ||
                first.hiddenSize !== this.hiddenSize ||
                first.outputSize !== this.outputSize) {
                console.warn("gotta restart");
                return false;
            }

            this.parents = data.brains.map(b => NeuralNetwork.fromJSON(b));
            this.brains = this.breed(this.parents, this.parents.slice(0, this.eliteCount));
            this.generation = data.generation;
            return true;
        } catch (e) {
            console.warn("couldnt laod", e);
            return false;
        }
    }
}