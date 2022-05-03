/**
 * Base class for enemies
 * @extends Phaser.GameObjects.Sprite
 */
class Enemy extends Phaser.GameObjects.Sprite {
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
   */
  constructor(scene, x, y, t, s, im, v, h) {
    super(scene, x, y, "tdtiles", tileFrameNames[im]);
    this.type = t;
    this.speed = s;
    this.value = v;
    this.health = h;
    this.setOrigin(0.5, 0.5);

    this.statusConditions = [];
  }

  /**
   * Inflict damage on enemy
   * @param {number} damage how much damage to deal
   * @returns {boolean} true if damage is enough to kill, otherwise false
   */
  takeDamage(damage) {
    this.health-= damage;
    if(this.health <= 0) {
      this.kill();
      return true;
    }
    return false;
  }

  /**
   * Kills the enemy
   */
  kill() {
    this.destroy();
  }

  /**
   * Manages enemy's current status conditions and inflicts their effects
   * @param {Level} scene the level the enemy is in
   */
  handleStatus(scene) {
    for(let condition of this.statusConditions) {
      let conditionType = condition[0];
      let conditionSeverity = condition[1];

      switch(conditionType) {
        case "fire": 
        this.setTint(0xFF0000); 
        if(this instanceof Carrier) {
          this.takeDamage(conditionSeverity, scene);
        } else {
          this.takeDamage(conditionSeverity); 
        }
        break;
        case "ice": 
          this.setTint(0x34e8eb);
          this.speed /= conditionSeverity;
          break;
      }
    }
  }

  /**
   * Inflict a status condition on to enemy
   * @param {string} type name of condition ['fire', 'ice']
   * @param {number} severity severity of status condition (affects duration for ice, damage for fire)
   */
  applyStatus(type, severity) {
    this.statusConditions.push([type, severity]);
  }

  /**
   * Removes a status condition from enemy
   * @param {string} type which type of status condition to remove ['fire', 'ice']
   */
  removeStatus(type) {
    for(let i = 0; i < this.statusConditions; i++) {
      if(this.statusConditions[i][0] === type) {
        this.statusConditions.splice(i, 1);
      }
    }
  }
}