
var Engine = Matter.Engine,
        Render = Matter.Render,
        Runner = Matter.Runner,
        Composites = Matter.Composites,
        Common = Matter.Common,
        Constraint = Matter.Constraint,
        MouseConstraint = Matter.MouseConstraint,
        Mouse = Matter.Mouse,
        World = Matter.World,
        Bodies = Matter.Bodies;
        Body = Matter.Body;

var engine;

var render;
var runner;
var world;

var bodyA = [];
var bodyB = [];
var bodyC = [];

var constraint;

var my_list =[];
var brain = [];
var outputs;
var score;
var inputs = [];
var maxi;
var max;
var worm_number = 10;
var counter = 0;
var body_info = [];
var next_generation = 0;
var first_generation = 1;
var fitness = [];

var score_list = [];

function setup() {

  engine = Engine.create(),
  world = engine.world;

  render = Render.create({
        element: document.body,
        engine: engine,
        options: {
            width: 800,
            height: 600,
            showAngleIndicator: true
        }
    });
  
  Render.run(render);

  runner = Runner.create();
  Runner.run(runner, engine);
  
  for (let i = 0; i < worm_number; i++) {
    
      bodyA[i] = Bodies.rectangle(300, 500, 80, 20);
      bodyB[i] = Bodies.rectangle(400, 500, 80, 20);
      bodyA[i].collisionFilter.group=-1;
      bodyB[i].collisionFilter.group=-1;


      constraint = Constraint.create({
          bodyA: bodyA[i],
          pointA: { x: 30, y: 0 },
          bodyB: bodyB[i],
          pointB: { x: -30, y: 0 },
          stiffness:0.1,
          length:35    });

      World.add(world, [bodyA[i], bodyB[i], constraint]);

      bodyC[i] = Bodies.rectangle(500, 500, 80, 20);
      bodyC[i].collisionFilter.group=-1;

      constraint = Constraint.create({
            bodyA: bodyB[i],
            pointA: { x: 30, y: 0 },
            bodyB: bodyC[i],
            pointB: { x: -30, y: 0 },
            stiffness:0.1,
            length:35
        });
      World.add(world, [bodyC[i], constraint]);
    }
    World.add(world, [
          Bodies.rectangle(400, 0, 800, 50, { isStatic: true }),
          Bodies.rectangle(400, 600, 800, 50, { isStatic: true }),
          Bodies.rectangle(800, 300, 50, 600, { isStatic: true }),
          Bodies.rectangle(0, 300, 50, 600, { isStatic: true })
    ]);

    Render.lookAt(render, {
          min: { x: 0, y: 0 },
          max: { x: 800, y: 600 }
    });
  
    for (var i = 0; i < worm_number; i++) {
      score_list[i] = new Array(worm_number);
    }
}

const interval = setInterval(function() {
   next_generation = 1;
 }, 15000);


function draw() {
  
  for (let i = 0; i < worm_number; i++) {
    
    if(next_generation){
      for (let h = 0; h < worm_number; h++) {
        
        var max2 = score_list[h][worm_number];
        
        for (let k = worm_number+1; k < score_list[h].length; k++) {
          if(score_list[h][k]>max2){
            max2=score_list[h][k];
          }
        }
        score = max2;
        my_list.push(score);
        body_info[h] = [score, fitness[h], brain[h]];
      }
      var max3 = my_list[0];
      var max3i = 0;
      for (let h = 0; h < my_list.length; h++) {
        if(my_list[h]>max3){
          max3 = my_list[h];
          max3i = h;
        }
      }
      counter++;
      console.log('Generation ' + counter);
      console.log('Best score: ' + max3);
      console.log('Best worm: ' + max3i);
      my_list = [];
      
      recreate_my_world();
   
      score_list = [];
      for (var k = 0; k < worm_number; k++) {
        score_list[k] = new Array(worm_number);
      }
      
      next_generation = 0;
      first_generation = 0;
      
      calculateFitness();
      
      
      for (var k = 0; k < worm_number; k++) {
        let index = 0;
        let r = random(1);
        while (r > 0) {
          r = r - body_info[index][1];
          index++;
        }
        index--;
        
        brain[k] = body_info[index][2].copy();
        brain[k].mutate(0.1);
      }
      for (var k = 0; k < worm_number; k++) {
        body_info[k][2].dispose();
      }
    }
    
    if (first_generation){
      brain[i] = new NeuralNetwork(9, 8, 6);
    }
    
    inputs[0] = bodyA[i].angle;
    inputs[1] = bodyB[i].angle;
    inputs[2] = bodyC[i].angle;

    inputs[3] = bodyA[i].position.y;
    inputs[4] = bodyB[i].position.y;
    inputs[5] = bodyC[i].position.y;

    inputs[6] = bodyA[i].position.x;
    inputs[7] = bodyB[i].position.x;
    inputs[8] = bodyC[i].position.x;

    outputs = brain[i].predict(inputs);

    maxi = 0;
    max = outputs[0];
    for (let j = 1; j < outputs.length; j++) {
      if(outputs[j]>max){
        maxi = j;
        max = outputs[j];
      }
    }
    
    score_list[i].push(Math.max(500.1 - bodyA[i].position.y, 500.1 - bodyB[i].position.y, 500.1 - bodyC[i].position.y));

    if (maxi==0) {
      Body.rotate( bodyA[i], Math.PI/35);
    }else if(maxi==1){
      Body.rotate( bodyA[i], -Math.PI/35);
    }else if(maxi==2){
      Body.rotate( bodyB[i], Math.PI/35);
    }else if(maxi==3){
      Body.rotate( bodyB[i], -Math.PI/35);
    }else if(maxi==4){
      Body.rotate( bodyC[i], Math.PI/35);
    }else if(maxi==5){
      Body.rotate( bodyC[i], -Math.PI/35);
    }
    
  }
}


function recreate_my_world() {
  World.clear(engine.world);
  Engine.clear(engine);
  
  for (let i = 0; i < worm_number; i++) {
    
      bodyA[i] = Bodies.rectangle(300, 500, 80, 20);
      bodyB[i] = Bodies.rectangle(400, 500, 80, 20);
      bodyA[i].collisionFilter.group=-1;
      bodyB[i].collisionFilter.group=-1;


      constraint = Constraint.create({
          bodyA: bodyA[i],
          pointA: { x: 30, y: 0 },
          bodyB: bodyB[i],
          pointB: { x: -30, y: 0 },
          stiffnes: 0.1,
          length:35    });

      World.add(world, [bodyA[i], bodyB[i], constraint]);

      bodyC[i] = Bodies.rectangle(500, 500, 80, 20);
      bodyC[i].collisionFilter.group = -1;

      constraint = Constraint.create({
            bodyA: bodyB[i],
            pointA: { x: 30, y: 0 },
            bodyB: bodyC[i],
            pointB: { x: -30, y: 0 },
            stiffnes: 0.1,
            length:35
        });
      World.add(world, [bodyC[i], constraint]);
    }
    World.add(world, [
          Bodies.rectangle(400, 0, 800, 50, { isStatic: true }),
          Bodies.rectangle(400, 600, 800, 50, { isStatic: true }),
          Bodies.rectangle(800, 300, 50, 600, { isStatic: true }),
          Bodies.rectangle(0, 300, 50, 600, { isStatic: true })
    ]);

    Render.lookAt(render, {
          min: { x: 0, y: 0 },
          max: { x: 800, y: 600 }
    });
  
}

function calculateFitness() {
  let sum = 0;
  //score sum
  for (let i = 0; i < worm_number; i++) {
    sum += body_info[i][0];
  }
  //calculate fitness
  for (let i = 0; i < worm_number; i++) {
    body_info[i][1] = body_info[i][0] / sum;
    fitness[i] = body_info[i][0] / sum;
  }
}