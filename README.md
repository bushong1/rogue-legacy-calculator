# Rogue Legacy Skill Purchase Calculator

This application will calculate the best way to spend your money in Rogue Legacy.

I had been wasting too much time between levels trying to figure out how to spend the most money, so spent about 10x as long making this.

## Usage

Once you have Node.js installed, simply install the dependences:

```js
npm install
```

Then start the server:

```js
node app.js
```

In your browser, connect to `http://localhost:3000/` and you're off to the races.

The plus and minus buttons add and remove levels.  The check and x enables and disables the skill from showing up in the upgrades list.  If your query is taking too long, disable some of the skills you're not interested in.

## Limitations

These may be added in the future, but aren't here yet:

* Options for runes or armor purchases.
* Right now there's a 10 second time limit on calculating upgrade list, at which point it will start backing out. Would like to work out a better algorithm so it's not an issue.
* Realistically, this could all have been done in javascript so the client does the work but I wanted to play around with node.
* A server cache of some sort would be handy, as the results of one url will always be the same.

