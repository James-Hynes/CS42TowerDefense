class NonPathEnemy extends Enemy {
  constructor(scene, x, y, t, s, im, v, h, target) {
    super(scene, x, y, t, s, im, v, h);
    this.target = [target.x, target.y];
  }

  update() {
    this.handleStatus();
    let a = Math.atan2(this.target[1] - this.y, this.target[0] - this.x);
    this.angle = radians_to_degrees(a);
    this.x += (this.speed * Math.cos(a));
    this.y += (this.speed * Math.sin(a));
  
    if(this.checkFinished()) {
      scene.player.lives--;
      this.kill();
    }
  }

  checkFinished() {
    if( (this.x + this.width > (this.target[0]-16)) && ((this.x) < this.target[0]+16) &&
      (this.y + this.height > this.target[1]) && (this.y < this.target[1])) {
        return true;
    }
    return false;
  }
}