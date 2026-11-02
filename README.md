# Snake Neural Network
An AI that plays the game on snake on a 8x8, 64 pixel grid. It uses reinforcement learning to improve over the course of hundreds of generations, saving its progress into local storage every generation. In every generation, 200 snakes are played (only 4 rendered), and the best from each moves on to the next generation, mutating slightly before being copied 199 times! Its coded completely in JS, just the website in HTML, where people can run the site.

One issue I faced was randomness, because of food spawning randomly, some snakes, who are worse at the game, accidentally walk into many foods and get higher fitness scores, even if there was a better snake available. I think that over many, thousands of generations, this will fix itself, but there might be a solution that I havent discovered yet. Keep this in mind when using the AI.

## Usage
Simply click the website link and press start! It will then begin training the AI from scratch. View a video of this training over a course of 20 minutes (sped up to 90 seconds) here: [youtube link!](https://youtu.be/99CIYz7F9IU)
If you wish to reset the training, you can do so by pressing the button.

## Credits
Thanks to MostLime for organising this event, [Player Two](https://playertwo.hackclub.com), on behalf of Hack Club! 

Thanks to this [guide](https://thecodingtrain.com/challenges/100-neuroevolution-flappy-bird) for helping me make this project! 

## AI (LLMs) transparency
I used very little AI in the making of this project, rather than AI, I mostly followed guides, look on the [Player Two](https://playertwo.hackclub.com) website for them! (Note: I adapted and utilised those guides, none of this is plagerism)