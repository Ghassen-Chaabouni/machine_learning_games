
var drops = [];

var isOver = false;

let video;
let poseNet;
let pose;
var person;

function setup() {
  createCanvas(800, 600);
  for (var i = 0; i < 1; i++) {
    drops[i] = new Drop();
  }
  person = new Person();
  video = createCapture(VIDEO);
  video.hide();
  poseNet = ml5.poseNet(video, modelLoaded);
  poseNet.on('pose', gotPoses);

}

function draw() {
  background(230, 230, 250);
  for (var i = 0; i < drops.length; i++) {
    drops[i].fall();
    drops[i].show();
  }
person.show();
  
  if (pose) {
    for (let i = 0; i < pose.keypoints.length; i++) {
	  if(pose.keypoints[i].part === 'leftShoulder'){
		  person.leftShoulder_x = pose.keypoints[i].position.x;
		  person.leftShoulder_y = pose.keypoints[i].position.y;
	  }else if(pose.keypoints[i].part === 'rightShoulder'){
		  person.rightShoulder_x = pose.keypoints[i].position.x;
		  person.rightShoulder_y = pose.keypoints[i].position.y;
	  }else if(pose.keypoints[i].part === 'rightWrist'){
		  person.rightWrist_x = pose.keypoints[i].position.x;
		  person.rightWrist_y = pose.keypoints[i].position.y;
	  }else if(pose.keypoints[i].part === 'leftWrist'){
		  person.leftWrist_x = pose.keypoints[i].position.x;
		  person.leftWrist_y = pose.keypoints[i].position.y;
	  }else if(pose.keypoints[i].part === 'rightHip'){
		  person.rightHip_x = pose.keypoints[i].position.x;
		  person.rightHip_y = pose.keypoints[i].position.y;
	  }else if(pose.keypoints[i].part === 'leftHip'){
		  person.leftHip_x = pose.keypoints[i].position.x;
		  person.leftHip_y = pose.keypoints[i].position.y;
	  }else if(pose.keypoints[i].part === 'rightKnee'){
		  person.rightKnee_x = pose.keypoints[i].position.x;
		  person.rightKnee_y = pose.keypoints[i].position.y;
	  }else if(pose.keypoints[i].part === 'leftKnee'){
		  person.leftKnee_x = pose.keypoints[i].position.x;
		  person.leftKnee_y = pose.keypoints[i].position.y;
	  }else if(pose.keypoints[i].part === 'leftElbow'){
		  person.leftElbow_x = pose.keypoints[i].position.x;
		  person.leftElbow_y = pose.keypoints[i].position.y;
	  }else if(pose.keypoints[i].part === 'rightElbow'){
		  person.rightElbow_x = pose.keypoints[i].position.x;
		  person.rightElbow_y = pose.keypoints[i].position.y;
	  }
	  
	  for (var k = 0; k < drops.length; k++) {
		if(drops[k].p1_x>0 && drops[k].p2_x>0){
			if(intersect(drops[k].p1_x, drops[k].p1_y, drops[k].p2_x, drops[k].p2_y, person.leftShoulder_x,person.leftShoulder_y, person.leftElbow_x, person.leftElbow_y)||intersect(drops[k].p1_x, drops[k].p1_y, drops[k].p2_x, drops[k].p2_y, person.leftShoulder_x,person.leftShoulder_y, person.rightShoulder_x, person.rightShoulder_y)||intersect(drops[k].p1_x, drops[k].p1_y, drops[k].p2_x, drops[k].p2_y, person.leftShoulder_x,person.leftShoulder_y, person.leftHip_x, person.leftHip_y)||intersect(drops[k].p1_x, drops[k].p1_y, drops[k].p2_x, drops[k].p2_y, person.leftElbow_x,person.leftElbow_y, person.leftWrist_x, person.leftWrist_y)||intersect(drops[k].p1_x, drops[k].p1_y, drops[k].p2_x, drops[k].p2_y, person.rightShoulder_x,person.rightShoulder_y, person.rightElbow_x, person.rightElbow_y)||intersect(drops[k].p1_x, drops[k].p1_y, drops[k].p2_x, drops[k].p2_y, person.rightShoulder_x,person.rightShoulder_y, person.rightHip_x, person.rightHip_y)||intersect(drops[k].p1_x, drops[k].p1_y, drops[k].p2_x, drops[k].p2_y, person.rightElbow_x,person.rightElbow_y, person.rightWrist_x, person.rightWrist_y)||intersect(drops[k].p1_x, drops[k].p1_y, drops[k].p2_x, drops[k].p2_y, person.leftHip_x,person.leftHip_y, person.leftKnee_x, person.leftKnee_y)||intersect(drops[k].p1_x, drops[k].p1_y, drops[k].p2_x, drops[k].p2_y, person.rightHip_x,person.rightHip_y, person.rightKnee_x, person.rightKnee_y)||intersect(drops[k].p1_x, drops[k].p1_y, drops[k].p2_x, drops[k].p2_y, person.leftHip_x,person.leftHip_y, person.rightHip_x, person.rightHip_y)){
				gameover();
			}
		}
	  }
	  
    }
  }
  
}
function intersect(x1,y1, x2,y2, x3,y3, x4,y4){
    var bx = x2 - x1;
    var by = y2 - y1;
    var dx = x4 - x3;
    var dy = y4 - y3;
   
    var b_dot_d_perp = bx * dy - by * dx;
   
    if(b_dot_d_perp == 0) return false;
   
    var cx = x3 - x1;
    var cy = y3 - y1;
   
    var t = (cx * dy - cy * dx) / b_dot_d_perp;
    if(t < 0 || t > 1) return false;
   
    var u = (cx * by - cy * bx) / b_dot_d_perp;
    if(u < 0 || u > 1) return false;
   
    return true;
}

function gameover() {
  stroke(0);
  textSize(60);
  strokeWeight(2);
  textAlign(CENTER, CENTER);
  text('GAMEOVER', width / 2, height / 2);
  textAlign(LEFT, BASELINE);
  isOver = true;
  noLoop();
}

function reset() {
 
  isOver = false;
  person = new Person();
  
  for (var i = 0; i < 1; i++) {
    drops[i] = new Drop();
  }
  for (var i = 0; i < drops.length; i++) {
    drops[i].fall();
    drops[i].show();
  }
  loop();
}

function keyPressed() {
   if (isOver) reset();
}


function gotPoses(poses) {
  if (poses.length > 0) {
    pose = poses[0].pose;
  }
}


function modelLoaded() {
  console.log('poseNet ready');
}
