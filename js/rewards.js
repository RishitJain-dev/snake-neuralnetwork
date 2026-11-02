const REWARDS = {
    food: 100,
    step: 1,
    closerToFood: 1,
    furtherFromFood: -1.5,
    hitWall: -50,
    hitSelf: -50,
    starved: -50,
    won: 1000
};

function calculateFitness(stats) {
    let fitness = 0;
    for (const name in REWARDS) {
        fitness += (stats[name] || 0) * REWARDS[name];
    }
    return fitness;
}