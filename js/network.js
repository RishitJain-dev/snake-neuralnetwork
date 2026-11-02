class NeuralNetwork {
    constructor(inputSize = 64, hiddenSize = 64, outputSize = 4) {
        this.inputSize = inputSize;
        this.hiddenSize = hiddenSize;
        this.outputSize = outputSize;

        this.weightsIH = NeuralNetwork.randomMatrix(hiddenSize, inputSize);
        this.biasH = NeuralNetwork.randomArray(hiddenSize);
        this.weightsHO = NeuralNetwork.randomMatrix(outputSize, hiddenSize);
        this.biasO = NeuralNetwork.randomArray(outputSize);
    }

    static randomArray(length) {
        return Array.from({ length }, () => Math.random() * 2 - 1);
    }

    static randomMatrix(rows, cols) {
        return Array.from({ length: rows }, () => NeuralNetwork.randomArray(cols));
    }

    static layer(inputs, weights, biases) {
        return weights.map((row, i) => {
            let sum = biases[i];
            for (let j = 0; j < row.length; j++) {
                sum += row[j] * inputs[j];
            }
            return Math.tanh(sum);
        });
    }

    predict(inputs) {
        const hidden = NeuralNetwork.layer(inputs, this.weightsIH, this.biasH);
        const outputs = NeuralNetwork.layer(hidden, this.weightsHO, this.biasO);

        let best = 0;
        for (let i = 1; i < outputs.length; i++) {
            if (outputs[i] > outputs[best]) best = i;
        }
        return best;
    }

    copy() {
        const net = new NeuralNetwork(this.inputSize, this.hiddenSize, this.outputSize);
        net.weightsIH = this.weightsIH.map(row => [...row]);
        net.biasH = [...this.biasH];
        net.weightsHO = this.weightsHO.map(row => [...row]);
        net.biasO = [...this.biasO];
        return net;
    }

    mutate(rate = 0.05, amount = 0.5) {
        const change = value =>
            Math.random() < rate ? value + (Math.random() * 2 - 1) * amount : value;

        this.weightsIH = this.weightsIH.map(row => row.map(change));
        this.biasH = this.biasH.map(change);
        this.weightsHO = this.weightsHO.map(row => row.map(change));
        this.biasO = this.biasO.map(change);
    }

    toJSON() {
        return {
            inputSize: this.inputSize,
            hiddenSize: this.hiddenSize,
            outputSize: this.outputSize,
            weightsIH: this.weightsIH,
            biasH: this.biasH,
            weightsHO: this.weightsHO,
            biasO: this.biasO
        };
    }

    static fromJSON(data) {
        const net = new NeuralNetwork(data.inputSize, data.hiddenSize, data.outputSize);
        net.weightsIH = data.weightsIH;
        net.biasH = data.biasH;
        net.weightsHO = data.weightsHO;
        net.biasO = data.biasO;
        return net;
    }
}