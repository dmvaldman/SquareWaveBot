Code for generating solutions to the wave equation on a square domain starting with an initial Gaussian.

![SquareWaveBot](assets/sample.png)

Used for the Twitter bot [@SquareWaveBot](https://twitter.com/squarewavebot) which is hosted on AWS Lambda and tweets a random solution once a day.

To use locally, first

```
npm install
```

Then run

```
node index.js
```

which will save a randomly generated image to `out.png`.