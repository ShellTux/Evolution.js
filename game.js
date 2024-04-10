let cv, ctx;

let world;
let engine;
let creature;
let ground;
let population;
let frame = 0;
let xref = 0;

const setup = function() {
  cv = document.querySelector('canvas');
  ctx = cv.getContext('2d');
  engine = Matter.Engine.create();
  world = engine.world;

  population = new Population(5);

  ground = Matter.Bodies.rectangle(0, cv.height - 50, cv.width * 10, 30, {
    isStatic: true
  }); // TODO: Make ground's height large and then draw a ground tiny like a line
  Matter.World.add(world, ground);
  window.addEventListener('click', function() {
    xref -= 10;
  });
  draw();
}

window.onload = setup;

const draw = function() {
  background(cv, rgb(31, 159, 187));
  for (let n = 0; n < 10; n++) {
    Matter.Engine.update(engine);

    population.think();

    if (frame > 1000) {
      population.nextGeneration();
      frame = 0;
    }

    frame++;
  }
  // creature.muscles[4].length = parseFloat(document.getElementById('muscle').value);
  ctx.save();
  ctx.translate(xref, 0);
  showEnvironment();
  population.show();
  ctx.restore();
  setTimeout(draw, 20);
};

const showEnvironment = function() {
  //Show Ground
  ctx.fillStyle = 'white';
  ctx.beginPath();
  ctx.moveTo(ground.vertices[0].x, ground.vertices[0].y);
  for (let i = 1; i < ground.vertices.length; i++) ctx.lineTo(ground.vertices[i].x, ground.vertices[i].y);
  ctx.fill();
  ctx.closePath();
}
