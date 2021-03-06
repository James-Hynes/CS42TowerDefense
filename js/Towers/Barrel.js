/**
 * Class representing a mine or barrel.
 */
class Barrel extends Phaser.GameObjects.Sprite {
  /**
   * Create a new barrel object
   * @param {Level} scene 
   * @param {number} x 
   * @param {number} y 
   */
  constructor(scene, x, y) {
    super(scene, x, y, "tdtiles", tileFrameNames[516]);
    this.exploding=false;
    this.on('animationrepeat', () => {
      this.destroy();
    })
    this.iceEnabled = 0;
    this.damage = 3;
    this.boostRad=0;
  }

  /**
   * Handles barrel's collision detection
   */
  update() {
    if(!this.exploding && typeof this.scene !== "undefined") {
      this.checkEnemyColliding();
    }
  }

  /**
   * Checks if enemy is within range for explosion
   */
  checkEnemyColliding() {
    for(let enemy of this.scene.enemyLayer.getChildren()) {
      if(enemy instanceof Enemy) {
        if(enemy.x > this.x-(this.width) && enemy.x < this.x+(this.width)
          && enemy.y > this.y-(this.height) && enemy.y < this.y+(this.height)) {
            this.explode();
          }
      }
    }
  }

  /**
   * Plays explosion animation and applies status if enabled.
   */
  explode() {
    this.exploding=true;
    this.play('explosion');
    if(this.move_tween) {
      this.move_tween.stop();
    }
    for(let enemy of this.getEnemiesInRadius()) {
      switch(this.iceEnabled) {
        case 0: break;
        case 1: enemy.applyStatus("ice", 2); break;
        case 2: enemy.applyStatus('ice', 4); break;
      }
      enemy.takeDamage(this.damage);
    }
  }

  /**
   * Gets enemies with tower's radius
   * @returns {Enemy} list of enemies in range
   */
  getEnemiesInRadius() {
    let inRange = [];
    for(let enemy of this.scene.enemyLayer.getChildren()) {
      if( Math.pow(enemy.x - this.x,2) + Math.pow(enemy.y - this.y, 2) < Math.pow(addPercentToNumber(120, this.boostRad), 2) )
      {
        inRange.push(enemy);
      }
    }
    return inRange;
  }
}