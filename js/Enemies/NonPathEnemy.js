/**
 * Class representing an enemy that does not require a path
 * @extends Enemy
 */
class NonPathEnemy extends Enemy {
  /**
   * Create a new enemy
   * @param {Level} scene the level to put the enemy on
   * @param {number} x the x-value
   * @param {number} y the y-value
   * @param {number} t the type of enemy
   * @param {number} s the speed of the enemy
   * @param {number} im the image number in tilesheet of the enemy
   * @param {number} v the value of the enemy
   * @param {number} h the health of the enemy
   * @param {Tile} target the target tile to aim for
   */
  constructor(scene, x, y, t, s, im, v, h, target) {
    super(scene, x, y, t, s, im, v, h);
    this.target = [target.x, target.y];
  }

  /**
   * Update enemy's position, angle
   */
  update() {
    this.handleLifeBar();
    this.handleStatus();
    let a = Math.atan2(this.target[1] - this.y, this.target[0] - this.x);
    this.angle = radians_to_degrees(a);
    this.x += (this.speed * Math.cos(a));
    this.y += (this.speed * Math.sin(a));
  
    if(this.checkFinished()) {
      if(!this.scene.player.takeLives(1)) {
        this.scene.die();
      }
      this.kill();
    }
    this.moneyMod=1;
  }

  /**
   * Check if enemy reached target tile
   * @returns {boolean} true if successful otherwise false 
   */
  checkFinished() {
    if( (this.x + this.width > (this.target[0]-16)) && ((this.x) < this.target[0]+16) &&
      (this.y + this.height > this.target[1]) && (this.y < this.target[1])) {
        return true;
    }
    return false;
  }
}