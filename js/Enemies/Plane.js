/**
 * Class representing a Plane enemy
 * @extends NonPathEnemy
 */
class Plane extends NonPathEnemy {
  /**
   * Create a new plane
   * @param {Level} scene the level to put the plane on
   * @param {number} x the x-value
   * @param {number} y the y-value
   * @param {number} t the type of plane
   * @param {number} s the speed of the plane
   * @param {number} im the image number in tilesheet of the plane
   * @param {number} v the value of the plane
   * @param {number} h the health of the plane
   * @param {Tile} target the target tile to aim for
   */
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

  /**
  * Update plane's position, angle
  */
  update() {
    this.handleStatus();
    let a = Math.atan2(this.target[1] - this.y, this.target[0] - this.x);
    this.angle = radians_to_degrees(a);
    this.x += (this.speed * Math.cos(a));
    this.y += (this.speed * Math.sin(a));
  
    if(this.checkFinished()) {
      this.scene.player.lives--;
      this.kill();
    }
  }

  /**
   * Check if plane reached target
   * @returns {boolean} true if succesful otherwise false
   */
  checkFinished() {
    if( (this.x + this.width > (this.target[0]-16)) && ((this.x) < this.target[0]+16) &&
      (this.y + this.height > this.target[1]) && (this.y < this.target[1])) {
        return true;
    }
    return false;
  }
}