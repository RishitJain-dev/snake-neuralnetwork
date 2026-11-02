const REWARDS = {
    food: 1002,
    step: 0,
    closerToFood: 1.1,
    furtherFromFood: -1.53,
    hitWall: -50.2,
    hitSelf: -50.2,
    starved: -100,
    won: 100002.2
};

/*the numbers are completely random lol, i just randomly found these, igfnorre the decimals they make it look optimised when its rlly not */

function calculateFitness(stats) {
    let fitness = 0;
    for (const name in REWARDS) {
        fitness += (stats[name] || 0) * REWARDS[name];
    }
    return fitness;
}