//Create engine - All the game stuff
var Engine = Matter.Engine,
  Render = Matter.Render,
  Runner = Matter.Runner,
  Composites = Matter.Composites,
  Common = Matter.Common,
  World = Matter.World,
  Bodies = Matter.Bodies,
  Body = Matter.Body;

// create an engine
var engine;
var render;
var runner;
var car;
var block;
var block2;
var block3;
var block4;
var block5;
var block6;
var block7;
var block8;

var rightPressed = false;
var leftPressed = false;
var upPressed = false;
var downPressed = false;
var carX = 0;
var carY = 0;

var speed = 2;
var pushRot;

var carRot;
var velY;
var velX;

var reward = 0;
var pass1 = 0;
var pass2 = 0;
var pass3 = 0;
var pass4 = 0;

var inputs = [];
var new_inputs = [];
var x = 0;
var LEARNING_RATE = 0.1;
var DISCOUNT = 0.95;
var EPISODES = 2000;
var epsilon = 0.5;
var START_EPSILONE_DECAYING = 1;
var DESCRETE_OS_SIZE = [];
var END_EPSILONE_DECAYING;
var epsilon_decay_value;

var observation_space_high = [600, 1000, 20, 20];
var observation_space_low = [0, 0, -20, -20];
var action_space_n = 4;
var descrete_os_win_size = [];
var q_table;
var q_table_copy;
var discrete_state = [];
var episode_reward = 0;
var action;
var reward;
var new_discrete_state;
var max_future_q;
var current_q;
var new_q;
var done = false;
var episode = 0;

var collision1;
var collision2;
var collision3;
var collision4;
var collision5;
var collision6;
var collision7;
var collision8;
var collision9;
var collision10;
var collision11;
var collision12;

var wall1;
var wall2;
var wall3;
var wall4;

function setup() {
  (engine = Engine.create()), (world = engine.world);

  // create a renderer
  render = Render.create({
    element: document.body,
    engine: engine,
    options: {
      width: 1000,
      height: 600,
      wireframes: false,
      background: "#6DDA4A"
    }
  });
  engine.world.gravity.y = 0;
  Render.run(render);
  // create runner
  runner = Runner.create();
  Runner.run(runner, engine);

  car = Bodies.circle(200, 100, 20, {
    friction: 0.1,
    frictionAir: 0.08,

    rot: 0,
    render: {
      fillStyle: "#f6bc0c"
      /*sprite: {
          //You can use this to apply a background image to the car
          texture: "Path/To/Image.png",
          xScale: number,
          yScale: number
        }/**/
    }
  });

  block = Bodies.rectangle(350, 200, 900, 60, {
    isStatic: true,

    inertia: Infinity,

    rot: 0,
    render: {
      fillStyle: "#0000FF"
    }
  });

  block2 = Bodies.rectangle(800, 311, 60, 279, {
    isStatic: true,

    inertia: Infinity,

    rot: 0,
    render: {
      fillStyle: "#0000FF"
    }
  });

  block3 = Bodies.rectangle(400, 420, 800, 60, {
    isStatic: true,
    friction: 1,
    inertia: Infinity,
    frictionAir: 0.1,
    restitution: 0,
    rot: 0,
    render: {
      fillStyle: "#0000FF"
    }
  });

  block4 = Bodies.rectangle(450, 100, 10, 150, {
    isStatic: true,
    friction: 1,
    inertia: Infinity,
    frictionAir: 0.1,
    restitution: 0,
    rot: 0,
    render: {
      fillStyle: "#FF0000"
    }
  });
  block5 = Bodies.rectangle(900, 310, 150, 10, {
    isStatic: true,
    friction: 1,
    inertia: Infinity,
    frictionAir: 0.1,
    restitution: 0,
    rot: 0,
    render: {
      fillStyle: "#FF0000"
    }
  });
  block6 = Bodies.rectangle(450, 500, 10, 150, {
    isStatic: true,
    friction: 1,
    inertia: Infinity,
    frictionAir: 0.1,
    restitution: 0,
    rot: 0,
    render: {
      fillStyle: "#FF0000"
    }
  });
  block7 = Bodies.rectangle(70, 500, 100, 150, {
    isStatic: true,
    friction: 1,
    inertia: Infinity,
    frictionAir: 0.1,
    restitution: 0,
    rot: 0,
    render: {
      fillStyle: "#FF0000"
    }
  });
  car.collisionFilter.group = -1;
  block4.collisionFilter.group = -1;
  block5.collisionFilter.group = -1;
  block6.collisionFilter.group = -1;
  block7.collisionFilter.group = -1;

  World.add(world, [
    block4,
    block5,
    block6,
    block7,
    car,
    block,
    block2,
    block3
  ]);

  wall1 = Bodies.rectangle(500, 0, 1000, 50, { isStatic: true });
  wall2 = Bodies.rectangle(500, 600, 1000, 50, { isStatic: true });
  wall3 = Bodies.rectangle(1000, 300, 50, 600, { isStatic: true });
  wall4 = Bodies.rectangle(0, 300, 50, 600, { isStatic: true });

  World.add(world, [wall1, wall2, wall3, wall4]);

  END_EPSILONE_DECAYING = Math.ceil(EPISODES / 2);
  epsilon_decay_value =
    epsilon / (END_EPSILONE_DECAYING - START_EPSILONE_DECAYING);

  inputs[0] = car.position.y;
  inputs[1] = car.position.x;
  inputs[2] = carY;
  inputs[3] = carX;

  for (let i = 0; i < inputs.length; i++) {
    DESCRETE_OS_SIZE.push(40);
  }

  for (let i = 0; i < inputs.length; i++) {
    descrete_os_win_size.push(
      (observation_space_high[i] - observation_space_low[i]) /
        DESCRETE_OS_SIZE[i]
    );
  }

  q_table = new Array(DESCRETE_OS_SIZE[0]);

  for (var a = 0; a < q_table.length; a++) {
    q_table[a] = new Array(DESCRETE_OS_SIZE[1]);
    for (var b = 0; b < q_table[a].length; b++) {
      q_table[a][b] = new Array(DESCRETE_OS_SIZE[2]);
      for (var c = 0; c < q_table[a][b].length; c++) {
        q_table[a][b][c] = new Array(DESCRETE_OS_SIZE[3]);
        for (var d = 0; d < q_table[a][b][c].length; d++) {
          q_table[a][b][c][d] = new Array(action_space_n);
        }
      }
    }
  }

  for (var a = 0; a < q_table.length; a++) {
    for (var b = 0; b < q_table[a].length; b++) {
      for (var c = 0; c < q_table[a][b].length; c++) {
        for (var d = 0; d < q_table[a][b][c].length; d++) {
          for (var e = 0; c < q_table[a][b][c][d].length; c++) {
            q_table[a][b][c][d][e] = Math.random() * 501 - 300;
          }
        }
      }
    }
  }

  discrete_state = get_discrete_state(
    inputs,
    descrete_os_win_size,
    observation_space_low
  );
}
const interval = setInterval(function() {
  done = true;
}, 40000);
function draw() {
  for (var speed = 0; speed < 4; speed++) {
    if (done) {
      pass1 = 0;
      pass2 = 0;
      pass3 = 0;
      pass4 = 0;
      recreate_my_world(false);
      if (
        END_EPSILONE_DECAYING >= episode &&
        episode >= START_EPSILONE_DECAYING
      ) {
        epsilon = epsilon - epsilon_decay_value;
      }

      q_table_copy = q_table;
      episode += 1;
      console.log("Generation: " + episode);
      console.log("Generation reward: " + episode_reward);
      done = false;
      episode_reward = 0;
      carX = 0;
      carY = 0;
      discrete_state = get_discrete_state(
        inputs,
        descrete_os_win_size,
        observation_space_low
      );
    } else {
      collision1 = Matter.SAT.collides(car, block);
      collision2 = Matter.SAT.collides(car, block2);
      collision3 = Matter.SAT.collides(car, block3);

      collision9 = Matter.SAT.collides(car, wall1);
      collision10 = Matter.SAT.collides(car, wall2);
      collision11 = Matter.SAT.collides(car, wall3);
      collision12 = Matter.SAT.collides(car, wall4);

      if (
        car.position.x > 1000 ||
        car.position.y > 600 ||
        car.position.x < 0 ||
        car.position.y < 0
      ) {
        recreate_my_world(true);
      }
      if (Math.random() > epsilon) {
        if (discrete_state[0] >= 40) {
          discrete_state[0] = 39;
        }
        if (discrete_state[1] >= 40) {
          discrete_state[1] = 39;
        }
        if (discrete_state[2] >= 40) {
          discrete_state[2] = 39;
        }
        if (discrete_state[3] >= 40) {
          discrete_state[3] = 39;
        }
        if (discrete_state[0] < 0) {
          discrete_state[0] = 0;
        }
        if (discrete_state[1] < 0) {
          discrete_state[1] = 0;
        }
        if (discrete_state[2] < 0) {
          discrete_state[2] = 0;
        }
        if (discrete_state[3] < 0) {
          discrete_state[3] = 0;
        }
        action = max_index(
          q_table[discrete_state[0]][discrete_state[1]][discrete_state[2]][
            discrete_state[3]
          ]
        );
      } else {
        action = Math.floor(Math.random() * action_space_n) + 0;
      }

      //Declare variables for velocity
      pushRot = 0;
      carRot = (car.rot * 180) / Math.PI;
      velY = speed * Math.cos((carRot * Math.PI) / 180);
      velX = speed * Math.sin((carRot * Math.PI) / 180) * -1;

      //Update variables

      if (action == 0) {
        pushRot = 0.03;
      }
      if (action == 1) {
        pushRot = -0.03;
      }

      if (action != 3 && action != 2) {
        velY = 0;
        velX = 0;
      }
      if (action == 2) {
        velY *= -0.3;
        velX *= -0.3;
      }

      if (action == 3) {
        velY *= 0.3;
        velX *= 0.3;
      }

      car.rot += pushRot;

      //Set position of car

      carX += velX;
      carY += velY;
      Body.applyForce(
        car,
        { x: carX, y: carY },
        { x: velX / 200, y: velY / 200 }
      );
      Body.setAngle(car, car.rot);

      if (car.position.y > 0 && car.position.x > 0) {
        new_inputs[0] = car.position.y;
        new_inputs[1] = car.position.x;
        new_inputs[2] = carY;
        new_inputs[3] = carX;
      } else {
        new_inputs[0] = 70;
        new_inputs[1] = 70;
        new_inputs[2] = carY;
        new_inputs[3] = carX;
      }

      
      
      if(car.position.x<block4.position.x && !pass1){
        reward = (car.position.x - block4.position.x) / 1000;
      //  console.log("part1");
      }
      if(car.position.y<block5.position.y && !pass2 && pass1){
        reward = (car.position.y - block5.position.y) / 1000;
       // console.log("part2");
      }
      if(car.position.x>block6.position.x && !pass3 && pass1 && pass2){
        reward = (block6.position.x-car.position.x) / 1000;
       // console.log("part3");
      }
      if(car.position.x>block7.position.x && !pass4 && pass1 && pass2 && pass3){
        reward = (block7.position.x-car.position.x) / 1000;
       // console.log("part4");
      }
     
      //console.log(car.position.x - block4.position.x);

      if (
        collision1.collided ||
        collision2.collided ||
        collision3.collided ||
        collision9.collided ||
        collision10.collided ||
        collision11.collided ||
        collision12.collided
      ) {
        recreate_my_world(true);
        reward = reward - 10;
        //console.log("ok");
      }
      
      if (
        car.position.x > block4.position.x &&
        car.position.y < block.position.y &&
        !pass1
      ) {
        reward = reward + 100;
        pass1 = 1;
        console.log("pass1");
      }
      if (
        car.position.y > block5.position.y &&
        car.position.y < block3.position.y &&
        !pass2
      ) {
        reward = reward + 100;
        pass2 = 1;
        console.log("pass2");
      }
      if (
        car.position.x < block6.position.x &&
        car.position.y > block3.position.y &&
        !pass3
      ) {
        reward = reward + 100;
        pass3 = 1;
        console.log("pass3");
      }
      
      if (
        car.position.x < block7.position.x + 50 &&
        car.position.y > block3.position.y &&
        !pass3 &&
        !pass4
      ) {
        reward = reward + 200;
        done = true;
        pass4 = 1;
        console.log("win");
      }
       //console.log(reward);
      episode_reward = episode_reward + reward;
      new_discrete_state = get_discrete_state(
        new_inputs,
        descrete_os_win_size,
        observation_space_low
      );

      if (new_discrete_state[0] >= 40) {
        new_discrete_state[0] = 39;
      }
      if (new_discrete_state[1] >= 40) {
        new_discrete_state[1] = 39;
      }
      if (new_discrete_state[2] >= 40) {
        new_discrete_state[2] = 39;
      }
      if (new_discrete_state[3] >= 40) {
        new_discrete_state[3] = 39;
      }
      if (new_discrete_state[0] < 0) {
        new_discrete_state[0] = 0;
      }
      if (new_discrete_state[1] < 0) {
        new_discrete_state[1] = 0;
      }
      if (new_discrete_state[2] < 0) {
        new_discrete_state[2] = 0;
      }
      if (new_discrete_state[3] < 0) {
        new_discrete_state[3] = 0;
      }

      // console.log(new_discrete_state);
      max_future_q = max_value(
        q_table[new_discrete_state[0]][new_discrete_state[1]][
          new_discrete_state[2]
        ][new_discrete_state[3]]
      );
      current_q =
        q_table[discrete_state[0]][discrete_state[1]][discrete_state[2]][
          discrete_state[3]
        ][action];
      new_q =
        (1 - LEARNING_RATE) * current_q +
        LEARNING_RATE * (reward + DISCOUNT * max_future_q);
      q_table[discrete_state[0]][discrete_state[1]][discrete_state[2]][
        discrete_state[3]
      ][action] = new_q;

      discrete_state = new_discrete_state;

      // console.log("------- start -------")
      // console.log(car.position.x);
      // console.log(block.position.x-100/2);
      // console.log("------- end -------")
    }
  }
}

function recreate_my_world(test) {
  World.clear(engine.world);
  Engine.clear(engine);

  pass1 = 0;
  pass2 = 0;
  pass3 = 0;
  pass4 = 0;

  if (!test) {
    reward = 0;
  }

  car = Bodies.circle(200, 100, 20, {
    friction: 0.1,
    frictionAir: 0.08,

    rot: 0,
    render: {
      fillStyle: "#f6bc0c"
      /*sprite: {
          //You can use this to apply a background image to the car
          texture: "Path/To/Image.png",
          xScale: number,
          yScale: number
        }/**/
    }
  });

  block = Bodies.rectangle(350, 200, 900, 60, {
    isStatic: true,

    inertia: Infinity,

    rot: 0,
    render: {
      fillStyle: "#0000FF"
    }
  });

  block2 = Bodies.rectangle(800, 311, 60, 279, {
    isStatic: true,

    inertia: Infinity,

    rot: 0,
    render: {
      fillStyle: "#0000FF"
    }
  });

  block3 = Bodies.rectangle(400, 420, 800, 60, {
    isStatic: true,
    friction: 1,
    inertia: Infinity,
    frictionAir: 0.1,
    restitution: 0,
    rot: 0,
    render: {
      fillStyle: "#0000FF"
    }
  });

  block4 = Bodies.rectangle(450, 100, 10, 150, {
    isStatic: true,
    friction: 1,
    inertia: Infinity,
    frictionAir: 0.1,
    restitution: 0,
    rot: 0,
    render: {
      fillStyle: "#FF0000"
    }
  });
  block5 = Bodies.rectangle(900, 310, 150, 10, {
    isStatic: true,
    friction: 1,
    inertia: Infinity,
    frictionAir: 0.1,
    restitution: 0,
    rot: 0,
    render: {
      fillStyle: "#FF0000"
    }
  });
  block6 = Bodies.rectangle(450, 500, 10, 150, {
    isStatic: true,
    friction: 1,
    inertia: Infinity,
    frictionAir: 0.1,
    restitution: 0,
    rot: 0,
    render: {
      fillStyle: "#FF0000"
    }
  });
  block7 = Bodies.rectangle(70, 500, 100, 150, {
    isStatic: true,
    friction: 1,
    inertia: Infinity,
    frictionAir: 0.1,
    restitution: 0,
    rot: 0,
    render: {
      fillStyle: "#FF0000"
    }
  });
  car.collisionFilter.group = -1;
  block4.collisionFilter.group = -1;
  block5.collisionFilter.group = -1;
  block6.collisionFilter.group = -1;
  block7.collisionFilter.group = -1;

  World.add(world, [
    block4,
    block5,
    block6,
    block7,
    car,
    block,
    block2,
    block3
  ]);

  wall1 = Bodies.rectangle(500, 0, 1000, 50, { isStatic: true });
  wall2 = Bodies.rectangle(500, 600, 1000, 50, { isStatic: true });
  wall3 = Bodies.rectangle(1000, 300, 50, 600, { isStatic: true });
  wall4 = Bodies.rectangle(0, 300, 50, 600, { isStatic: true });

  World.add(world, [wall1, wall2, wall3, wall4]);
}

function get_discrete_state(
  state,
  descrete_os_win_size,
  observation_space_low
) {
  var discrete_state = [];
  for (var i = 0; i < state.length; i++) {
    discrete_state.push(
      Math.floor(
        (state[i] - observation_space_low[i]) / descrete_os_win_size[i]
      )
    );
  }

  return discrete_state;
}

function max_index(table) {
  var max_i = 0;
  var max_value = table[0];
  for (var i = 1; i < table.length; i++) {
    if (table[i] > max_value) {
      max_i = i;
      max_value = table[i];
    }
  }

  return max_i;
}

function max_value(table) {
  var max_v = table[0];
  for (var i = 1; i < table.length; i++) {
    if (table[i] > max_v) {
      max_v = table[i];
    }
  }

  return max_v;
}
