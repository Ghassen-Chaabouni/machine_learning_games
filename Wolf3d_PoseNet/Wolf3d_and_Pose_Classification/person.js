
function Person() {
  
  this.rightShoulder_x = 0;
  this.rightShoulder_y = 0;
  
  this.leftShoulder_x = 0;
  this.leftShoulder_y = 0;
  
  this.rightWrist_x = 0;
  this.rightWrist_y = 0;
  
  this.leftWrist_x = 0;
  this.leftWrist_y = 0;
  
  this.rightHip_x = 0;
  this.rightHip_y = 0;
  
  this.leftHip_x = 0;
  this.leftHip_y = 0;
  
  this.rightKnee_x = 0;
  this.rightKnee_y = 0;
  
  this.leftKnee_x = 0;
  this.leftKnee_y = 0;
  
  this.leftElbow_x = 0;
  this.leftElbow_y = 0;
  
  this.rightElbow_x = 0;
  this.rightElbow_y = 0;
  

  this.show = function() {
	
    strokeWeight(15);
	
   stroke(0);
   line(this.leftShoulder_x, this.leftShoulder_y, this.rightShoulder_x, this.rightShoulder_y);
   line(this.rightElbow_x, this.rightElbow_y, this.rightShoulder_x, this.rightShoulder_y);
   line(this.leftElbow_x, this.leftElbow_y, this.leftShoulder_x, this.leftShoulder_y);
   line(this.leftWrist_x, this.leftWrist_y, this.leftElbow_x, this.leftElbow_y);
   line(this.rightWrist_x, this.rightWrist_y, this.rightElbow_x, this.rightElbow_y);
   line(this.leftHip_x, this.leftHip_y, this.leftShoulder_x, this.leftShoulder_y);
   line(this.rightHip_x, this.rightHip_y, this.rightShoulder_x, this.rightShoulder_y);
   line(this.leftHip_x, this.leftHip_y, this.rightHip_x, this.rightHip_y);
   line(this.leftKnee_x, this.leftKnee_y, this.leftHip_x, this.leftHip_y);
   line(this.rightKnee_x, this.rightKnee_y, this.rightHip_x, this.rightHip_y);
  
   
   stroke("red");
    line(this.leftShoulder_x, this.leftShoulder_y, this.leftShoulder_x, this.leftShoulder_y);
	line(this.rightShoulder_x, this.rightShoulder_y, this.rightShoulder_x, this.rightShoulder_y);
	line(this.leftWrist_x, this.leftWrist_y, this.leftWrist_x, this.leftWrist_y);
	line(this.rightWrist_x, this.rightWrist_y, this.rightWrist_x, this.rightWrist_y);
	line(this.leftHip_x, this.leftHip_y, this.leftHip_x, this.leftHip_y);
	line(this.rightHip_x, this.rightHip_y, this.rightHip_x, this.rightHip_y);
	line(this.leftKnee_x, this.leftKnee_y, this.leftKnee_x, this.leftKnee_y);
	line(this.rightKnee_x, this.rightKnee_y, this.rightKnee_x, this.rightKnee_y);
	line(this.rightElbow_x, this.rightElbow_y, this.rightElbow_x, this.rightElbow_y);
	line(this.leftElbow_x, this.leftElbow_y, this.leftElbow_x, this.leftElbow_y);
	
  
   
   
  };
}
