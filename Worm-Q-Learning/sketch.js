
var Engine = Matter.Engine,
        Render = Matter.Render,
        Runner = Matter.Runner,
        Composites = Matter.Composites,
        Common = Matter.Common,
        Constraint = Matter.Constraint,
        World = Matter.World,
        Bodies = Matter.Bodies;
        Body = Matter.Body;

var engine;

var render;
var runner;
var world;
var bodyA;
var bodyB;
var bodyC;
var constraint;
var inputs=[];
var new_inputs=[];

var LEARNING_RATE = 0.1;
var DISCOUNT = 0.95;                    
var EPISODES = 1000;
var epsilon = 0.5;                         
var START_EPSILONE_DECAYING = 1;
var DESCRETE_OS_SIZE = [];
var END_EPSILONE_DECAYING;
var epsilon_decay_value;

var observation_space_high = [600, 600, 800, 800];
var observation_space_low = [0, 0, 0, 0];
var action_space_n = 6;
var descrete_os_win_size=[];
var q_table;
var q_table_copy;
var discrete_state = [];
var episode_reward=0;
var action;
var reward;
var new_discrete_state;
var max_future_q;
var current_q;
var new_q;
var done = false;
var episode = 0;
var q_table_size = 150;

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
    
  bodyA = Bodies.rectangle(300, 500, 80, 20);
  bodyB = Bodies.rectangle(400, 500, 80, 20);
  bodyA.collisionFilter.group=-1;
  bodyB.collisionFilter.group=-1;


  constraint = Constraint.create({
      bodyA: bodyA,
      pointA: { x: 30, y: 0 },
      bodyB: bodyB,
      pointB: { x: -30, y: 0 },
      stiffness:0.1,
      length:35    });

  World.add(world, [bodyA, bodyB, constraint]);

  bodyC = Bodies.rectangle(500, 500, 80, 20);
  bodyC.collisionFilter.group=-1;

  constraint = Constraint.create({
        bodyA: bodyB,
        pointA: { x: 30, y: 0 },
        bodyB: bodyC,
        pointB: { x: -30, y: 0 },
        stiffness:0.1,
        length:35
     });
  World.add(world, [bodyC, constraint]);
    
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
  
  END_EPSILONE_DECAYING = Math.ceil(EPISODES/2);
  epsilon_decay_value = epsilon/(END_EPSILONE_DECAYING - START_EPSILONE_DECAYING);
  
  inputs[0] = bodyA.position.y;
  inputs[1] = bodyC.position.y;

  inputs[2] = bodyA.position.x;
  inputs[3] = bodyC.position.x;
  
  for (let i = 0; i < inputs.length; i++) {
     DESCRETE_OS_SIZE.push(q_table_size);
  }
  
  for (let i = 0; i < inputs.length; i++) {
     descrete_os_win_size.push((observation_space_high[i] - observation_space_low[i])/DESCRETE_OS_SIZE[i]);
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
          for (var e = 0; e < q_table[a][b][c][d].length; e++) {
             q_table[a][b][c][d][e] = Math.random() * 600 + 0;
          }
        }
      }
    }
  }
  discrete_state = get_discrete_state(inputs, descrete_os_win_size, observation_space_low);
}

const interval = setInterval(function() {
  done = true;
  episode = episode + 1;
 }, 30000/4);


function draw() {
	for (var speed = 0; speed < 4; speed++) {
		if(done){
		  if ((END_EPSILONE_DECAYING >= episode) && (episode >= START_EPSILONE_DECAYING)){
			 epsilon = epsilon - epsilon_decay_value;
		  }
		
		  q_table_copy = q_table;
		  console.log("episode: " + episode);
		  console.log("episode reward: " + episode_reward);
		  recreate_my_world();
		  done = false;
		  episode_reward = 0;
		  discrete_state = get_discrete_state(inputs, descrete_os_win_size, observation_space_low);
	  
		}else{
		  
		  if (Math.random() > epsilon){      
				action = max_index(q_table[discrete_state[0]][discrete_state[1]][discrete_state[2]][discrete_state[3]]);
		  }else{
				action = Math.floor(Math.random() * action_space_n) + 0;  
		  }
	  
		 if (action==0) {
			Body.rotate( bodyA, Math.PI/35);
		  }
		  if(action==1){
			Body.rotate( bodyA, -Math.PI/35);
		  }
		  if(action==2){
			Body.rotate( bodyB, Math.PI/35);
		  }
		  if(action==3){
			Body.rotate( bodyB, -Math.PI/35);
		  }
		  if(action==4){
			Body.rotate( bodyC, Math.PI/35);
		  }
		  if(action==5){
			Body.rotate( bodyC, -Math.PI/35);
		  }
		
		  new_inputs[0] = bodyA.position.y;
		  new_inputs[1] = bodyC.position.y;

		  new_inputs[2] = bodyA.position.x;
		  new_inputs[3] = bodyC.position.x;
		  
		  reward = Math.max(600 - bodyA.position.y, 600 - bodyB.position.y, 600 - bodyC.position.y);
		  episode_reward = episode_reward + reward; 
		  new_discrete_state = get_discrete_state(new_inputs, descrete_os_win_size, observation_space_low);
		
		  max_future_q = max_value(q_table[new_discrete_state[0]][new_discrete_state[1]][new_discrete_state[2]][new_discrete_state[3]]); 
		  current_q = q_table[discrete_state[0]][discrete_state[1]][discrete_state[2]][discrete_state[3]][action];
		  new_q = (1-LEARNING_RATE) * current_q + LEARNING_RATE * (reward + DISCOUNT * max_future_q);     
		  q_table[discrete_state[0]][discrete_state[1]][discrete_state[2]][discrete_state[3]][action] = new_q;       
		  
		  discrete_state = new_discrete_state;
		  
		}
	}
}


function recreate_my_world() {
  World.clear(engine.world);
  Engine.clear(engine);
  
  bodyA = Bodies.rectangle(300, 500, 80, 20);
  bodyB = Bodies.rectangle(400, 500, 80, 20);
  bodyA.collisionFilter.group=-1;
  bodyB.collisionFilter.group=-1;


  constraint = Constraint.create({
      bodyA: bodyA,
      pointA: { x: 30, y: 0 },
      bodyB: bodyB,
      pointB: { x: -30, y: 0 },
      stiffness:0.1,
      length:35    });

  World.add(world, [bodyA, bodyB, constraint]);

  bodyC = Bodies.rectangle(500, 500, 80, 20);
  bodyC.collisionFilter.group=-1;

  constraint = Constraint.create({
        bodyA: bodyB,
        pointA: { x: 30, y: 0 },
        bodyB: bodyC,
        pointB: { x: -30, y: 0 },
        stiffness:0.1,
        length:35
     });
  World.add(world, [bodyC, constraint]);
    
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

function get_discrete_state(state, descrete_os_win_size, observation_space_low){
  var discrete_state = []; 
  for (var i = 0; i < state.length; i++) {
      discrete_state.push(Math.floor((state[i] - observation_space_low[i]) / descrete_os_win_size[i]));
  
  }
  
    return discrete_state;
}

function max_index(table)  {
 
  var max_i = 0;
  var max_value = table[0];
  for (var i = 1; i < table.length; i++) {
      if (table[i]>max_value){
        max_i = i;
        max_value = table[i];
      }
  }
  
  return max_i;
}

function max_value(table)  {
  var max_v = table[0];
  for (var i = 1; i < table.length; i++) {
      if (table[i]>max_v){
        max_v = table[i];
      }
  }
  
  return max_v;
}
