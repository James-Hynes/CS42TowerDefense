/**
 * Class representing a bullet
 */
class Bullet extends Phaser.GameObjects.Sprite {
  /**
   * Creates a new bullet
   * @param {Level} scene Level to place bullet on
   * @param {number} x the x-value 
   * @param {number} y the y-value
   * @param {number} speed the speed of the bullet
   * @param {number} im the image number in spritesheet
   * @param {number} damage the damage of the bullet
   * @param {Array} status the status conditions carried by the bullet
   */
  constructor(scene, x, y, speed, im, damage, status) {
    super(scene, x, y, "tdtiles", tileFrameNames[im]);
    this.speed = speed;
    this.damage=damage || 4;
    this.total_time = 0;
    this.status = status || [];
    this.setOrigin(0.5, 0.5);
  }

  /**
   * Updates bullet's location and checks if off screen
   */
  update() {
    this.total_time++;
    let radian_angle = degrees_to_radians(this.angle);
    this.x = this.x + (this.speed * Math.sin(radian_angle));
    this.y = this.y + (this.speed * -Math.cos(radian_angle));
    if(this.x > 1600 || this.x < 0 || this.y > 800 || this.y < 0 || this.total_time > 500) {
      this.kill();
    }

  }

  /**
   * Check if bullet if contacting an enemy
   * @returns {Enemy|boolean} Enemy if bullet is touching otherwise false
   */
  checkHitEnemy() {
    for(let enemy of this.scene.enemyLayer.getChildren()) {
      if( (this.x + this.width > (enemy.x-32)) && ((this.x+32) < enemy.x + enemy.width) &&
          (this.y + this.height > enemy.y) && (this.y < enemy.y + enemy.height)) {
          return enemy;
      }
    }
    return false;
  }

  /**
   * Destroys bullet
   */
  kill() {
    this.destroy();
  }
}