class Plane extends NonPathEnemy {
  constructor(scene, x, y, t, target) {
    let planeTypes = {1: {img: 269, speed: 6, health: 4, value: 100}, 2: {img: 270, speed: 12, health:8, value:300}}
    super(scene, x, y, t, planeTypes[t]["speed"], planeTypes[t]["img"], planeTypes[t]["value"], planeTypes[t]["health"], target);
    this.x = x;
    this.y = y;
    this.type = [269, 270][t];
    this.value = 100;
    this.speed = 6;
    this.setOrigin(0.5, 0.5);

    this.health = 4;
    this.target = [target.x, target.y];
  }

  update() {
    let a = Math.atan2(this.target[1] - this.y, this.target[0] - this.x);
    this.angle = radians_to_degrees(a);
    this.x += (this.speed * Math.cos(a));
    this.y += (this.speed * Math.sin(a));
  
    if(this.checkFinished()) {
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