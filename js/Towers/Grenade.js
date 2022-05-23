/**
 * Class representing grenade object
 */
class Grenade extends Phaser.GameObjects.Sprite {
  /**
   * Creates a new grenade object
   * @param {Level} scene 
   * @param {number} x 
   * @param {number} y 
   */
  constructor(scene, x, y) {
    super(scene, x, y, "grenade", "bombf1.png");
    this.anims.create({key: "grenade", frames: this.anims.generateFrameNames('grenade', {prefix: "bombf", start: 1, end: 3, suffix: ".png"}), frameRate: 1.75 * this.scene.speedModifier});
    this.play('grenade');
    this.on("animationcomplete", () => {
      for(let enemy of this.getEnemiesInRadius()) {
        enemy.takeDamage(20);
      }
      this.play('explosion');
    })
    this.on('animationrepeat', () => {
      this.destroy();
    })
  }

  update() {
  }

  /**
   * Gets enemies in range
   * @returns {Enemy} list of enemies in range
   */
  getEnemiesInRadius() {
    let inRange = [];
    for(let enemy of this.scene.enemyLayer.getChildren()) {
      if( Math.pow(enemy.x - this.x,2) + Math.pow(enemy.y - this.y, 2) < Math.pow(120, 2) )
      {
        inRange.push(enemy);
      }
    }
    return inRange;
  }
}