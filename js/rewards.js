const REWARDS = {
    food: 1000,
    step: 0,
    closerToFood: 1,
    furtherFromFood: -1.5,
    hitWall: -50,
    hitSelf: -50,
    starved: -100,
    won: 100000
};

function calculateFitness(stats) {
    let fitness = 0;
    for (const name in REWARDS) {
        fitness += (stats[name] || 0) * REWARDS[name];
    }
    return fitness;
}