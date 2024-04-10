class Population {
  constructor(size) {
    this.creatures = new Array(size).fill().map(x => new Creature());
    this.size = size;
  }

  think() {
    this.creatures.forEach(creature => creature.think());
  }

  show() {
    this.creatures.forEach(creature => creature.show());
  }

  nextGeneration() {
    //Calculate fitness
    this.creatures.forEach(creature => {
      let x = creature.joints.reduce((acc, j) => acc + j.position.x, 0) / creature.joints.length;
      let y = creature.joints.reduce((acc, j) => acc + j.position.y, 0) / creature.joints.length;
      creature.distH = x - creature.startPoint.x;
      creature.distV = y - creature.startPoint.y;
      creature.avgSpeed = (x - creature.startPoint.x) / frame;
    });
    let sum = {
      distH: 0,
      distV: 0,
      avgSpeed: 0
    };
    this.creatures.forEach(creature => {
      sum.distH += creature.distH;
      sum.distV += creature.distV;
      sum.avgSpeed += creature.avgSpeed;
    });
    this.creatures.forEach(creature => creature.fitness = [creature.distH / sum.distH, creature.distV / sum.distV, creature.avgSpeed / sum.avgSpeed].mean());

    // console.log(this.creatures);
    Matter.World.clear(world);
    Matter.Engine.clear(engine);
    Matter.World.add(world, ground);

    let pickOne = function(list) {
      let index = 0;
      let r = Math.random();

      while (r > 0) r -= list[index++].fitness;
      index--;

      let creature = list[index];
      let child = new Creature(creature.type, creature.brain);
      child.mutate();
      return child;
    }

    let temp = [];

    for (let i = 0; i < this.size; i++) temp[i] = pickOne(this.creatures);
    this.creatures = temp.valueOf();
  }
}