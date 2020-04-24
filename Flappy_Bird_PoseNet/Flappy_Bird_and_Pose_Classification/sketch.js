
var bird;
var pipes;
var parallax = 0.8;
var score = 0;
var maxScore = 0;
var birdSprite;
var pipeBodySprite;
var pipePeakSprite;
var bgImg;
var bgX;
var gameoverFrame = 0;
var isOver = false;

var touched = false;
var prevTouched = touched;

let video;
let poseNet;
let pose;
let skeleton;

let brain;
let poseLabel = "N";


function preload() {
  pipeBodySprite = loadImage('graphics/pipe_marshmallow_fix.png');
  pipePeakSprite = loadImage('graphics/pipe_marshmallow_fix.png');
  birdSprite = loadImage('graphics/train.png');
  bgImg = loadImage('graphics/background.png');
  console.log("ok");
}

function setup() {
	 createCanvas(640, 480);
 
  video = createCapture(VIDEO);
  video.hide();
  poseNet = ml5.poseNet(video, modelLoaded);
  poseNet.on('pose', gotPoses);

  let options = {
    inputs: 34,
    outputs: 2,
    task: 'classification',
    debug: true
  }
  brain = ml5.neuralNetwork(options);
  const modelInfo = {
    model: 'model/model.json',
    metadata: 'model/model_meta.json',
    weights: 'model/model.weights.bin',
  };
  brain.load(modelInfo, brainLoaded);
  reset();
}

function draw() {
  background(0);
  
  // Draw our background image, then move it at the same speed as the pipes
  image(bgImg, bgX, 0, bgImg.width, height);
  bgX -= pipes[0].speed * parallax;

  // this handles the "infinite loop" by checking if the right
  // edge of the image would be on the screen, if it is draw a
  // second copy of the image right next to it
  // once the second image gets to the 0 point, we can reset bgX to
  // 0 and go back to drawing just one image.
  if (bgX <= -bgImg.width + width) {
    image(bgImg, (bgX + bgImg.width), 0, bgImg.width, height);
    if (bgX <= -bgImg.width) {
      bgX = 0;
    }
  }

  for (var i = pipes.length - 1; i >= 0; i--) {
    pipes[i].update();
    pipes[i].show();

    if (pipes[i].pass(bird)) {
      score++;
    }

    if (pipes[i].hits(bird)) {
      gameover();
    }

    if (pipes[i].offscreen()) {
      pipes.splice(i, 1);
    }
  }

  bird.update();
  bird.show();

  if ((frameCount - gameoverFrame) % 150 == 0) {
    pipes.push(new Pipe());
  }

  showScores();

  // touches is an list that contains the positions of all
  // current touch points positions and IDs
  // here we check if touches' length is bigger than one
  // and set it to the touched var
  touched = (touches.length > 0);

  // if user has touched then make bird jump
  // also checks if not touched before
  if (touched && !prevTouched) {
    bird.up();
  }

  // updates prevTouched
  prevTouched = touched;

 push();
  translate(video.width, 0);
  scale(-1/3, 1/3);
  image(video, 0, 0, video.width, video.height);

  if (pose) {
    for (let i = 0; i < skeleton.length; i++) {
      let a = skeleton[i][0];
      let b = skeleton[i][1];
      strokeWeight(2);
      stroke(0);

      line(a.position.x, a.position.y, b.position.x, b.position.y);
    }
    for (let i = 0; i < pose.keypoints.length; i++) {
      let x = pose.keypoints[i].position.x;
      let y = pose.keypoints[i].position.y;
      fill(0);
      stroke(255);
      ellipse(x, y, 16, 16);
    }
  }
  pop();

  
  jumping();
  
  
}

function jumping(){
  if (poseLabel === 'J') {
    bird.up();
  }
  console.log(poseLabel);
}

function showScores() {
  textSize(32);
  text('score: ' + score, 1, 32);
  text('record: ' + maxScore, 1, 64);
}

function gameover() {
  textSize(64);
  textAlign(CENTER, CENTER);
  text('GAMEOVER', width / 2, height / 2);
  textAlign(LEFT, BASELINE);
  maxScore = max(score, maxScore);
  isOver = true;
  noLoop();
}

function reset() {
  isOver = false;
  score = 0;
  bgX = 0;
  pipes = [];
  bird = new Bird();
  pipes.push(new Pipe());
  gameoverFrame = frameCount - 1;
  loop();
}

function keyPressed() {
  if (key === ' ') {
    if (isOver) reset(); //you can just call reset() in Machinelearning if you die, because you cant simulate keyPress with code.
  }
}

function touchStarted() {
  if (isOver) reset();
}


function brainLoaded() {
  console.log('pose classification ready!');
  classifyPose();
}

function classifyPose() {
  if (pose) {
    let inputs = [];
    for (let i = 0; i < pose.keypoints.length; i++) {
      let x = pose.keypoints[i].position.x;
      let y = pose.keypoints[i].position.y;
      inputs.push(x);
      inputs.push(y);
    }
    brain.classify(inputs, gotResult);
  } else {
    setTimeout(classifyPose, 300);
  }
}

function gotResult(error, results) {
  
  if (results[0].confidence > 0.75) {
    poseLabel = results[0].label.toUpperCase();
  }
  //console.log(results[0].confidence);
  classifyPose();
}


function gotPoses(poses) {
  if (poses.length > 0) {
    pose = poses[0].pose;
    skeleton = poses[0].skeleton;
  }
}


function modelLoaded() {
  console.log('poseNet ready');
}
