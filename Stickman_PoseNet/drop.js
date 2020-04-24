
function Drop() {
  this.p1_y = random(30, width);
  this.p1_x = random(-50, -25);
  this.xspeed = random(6, 9);
  this.p2_y = 0;
  this.p2_x = 0;

  this.fall = function() {
    this.p1_x  = this.p1_x  + this.xspeed;
	this.p2_y = this.p1_y;
    this.p2_x = this.p1_x + 20;
	
    if (this.p1_x  > width) {
      this.p1_x  = random(-50, -25);
	  this.p1_y = random(30, width);
    }
  };

  this.show = function() {
    strokeWeight(15);
    line(this.p1_x, this.p1_y, this.p1_x+20, this.p1_y);
  };
  
}
