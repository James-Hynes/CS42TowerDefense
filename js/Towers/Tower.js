/**
 * Class representing a tower 
 */
class Tower extends Phaser.GameObjects.Sprite {
  /**
   * Creates a new tower object
   * @param {Level} scene Level to display Tower on
   * @param {number} t Type of tower
   * @param {number} x X-value of tower
   * @param {number} y y-value of tower
   * @param {number} im image number in spritesheet of tower
   * @param {number} base image number in spritesheet of base of tower
   * @param {number} radius radius of tower
   */
  constructor(scene, t, x, y, im, base, radius) {
    super(scene, x, y, "tdtiles", tileFrameNames[im]);
    this.type = t;
    this.settings = Object.assign({}, TOWER_TYPES[t]);
    this.base_settings = Object.assign({}, TOWER_TYPES[t]);
    this.circle_image = scene.add.circle(x, y, radius, 0x6666ff);
    this.scene.towerLayer.add(this.circle_image);
    this.circle_image.alpha = 0;

    this.setupTower(x, y, scene, base, radius);

    this.upgrades = [0, 0];
    this.boosts={};
  }

  clearTower() {
    this.circle_image.destroy();
    this.base.destroy();
    this.destroy();
  }

  /**
   * Sets up standard tower settings
   * @param {number} x 
   * @param {number} y 
   * @param {Level} scene 
   * @param {number} base 
   * @param {number} radius 
   */
  setupTower(x, y, scene, base, radius) {
    this.base = scene.add.sprite(x, y, "tdtiles", tileFrameNames[base]);
    this.scene.towerLayer.add(this.base);
    this.rate = 0;
    this.fireQueued = false;
    this.fireCounter=0;
    this.setOffsets();
    if(this.type < 5) {
      this.angle = Math.random() * 360;
    }
  }

  /**
   * Gets the tower's type
   * @returns {number} Tower type
   */
  getType() {
    return this.type;
  }

  /**
   * Gets the tower's position
   * @returns {Array} Tower's x/y value [x, y]
   */
  getPos() {
    return [this.x, this.y];
  }

  /**
   * Gets the tower's image name
   * @returns {String} "????.png"
   */
  getImage() {
    return this.frame.name;
  }

  /**
   * Gets the tower's base
   * @returns {Phaser.GameObjects.Sprite} Base of tower
   */
  getBase() {
    return this.base;
  }

  /**
   * Gets the tower's base image name
   * @returns {String} "????.png"
   */
  getBaseImage() {
    return this.base.frame.name;
  }

  /**
   * Gets all enemies within tower's radius
   * @returns {Enemy[]} List of enemies within radius, sorted by distance to goal
   */
  getEnemiesInRadius() {
    let inRange = [];
    for(let enemy of this.scene.enemyLayer.getChildren()) {
      if( Math.pow(enemy.x - this.x,2) + Math.pow(enemy.y - this.y, 2) < Math.pow(this.settings["radius"], 2) )
      {
        inRange.push(enemy);
      }
    }
    return inRange.sort((a, b) => {
      if(b instanceof NonPathEnemy) {
        return 1;
      } else if(a instanceof NonPathEnemy) {
        return -1;
      } else {
        return a.path.length - b.path.length;
      }
    })
  }

  /**
   * Manages tower's angle, firing, etc.
   */
  update() {
    this.fireCounter++;
    this.inRange = this.getEnemiesInRadius();
    if(this.inRange.length > 0) {
      this.angleTowardsEnemy(this.inRange[0]);
      if(this.fireCounter >= (this.settings["rate"] / this.scene.speedModifier)) {
        this.fire();
      }
    }
    this.manageBoosts();
  }

  /**
   * Angles tower towards a given enemy
   * @param {Enemy} enemy Enemy to angle towards 
   */
  angleTowardsEnemy(enemy) {
    let a = Math.atan2(enemy.y - this.y, enemy.x - this.x);
    this.angle = (radians_to_degrees(a)+90);
  }

  /**
   * Sets fire to ready
   */
  fire() {
    this.fireCounter=0;
    this.settings['customFire'](this.scene, this);
  }

  /**
   * Sets upgrade values
   * @param {number[]} upgrades [n, n]
   */
  upgrade(upgrades) {
    for(let i = 0; i < upgrades.length; i++) {
      for(let j = 0; j < upgrades[i]; j++) {
        this.upgrades[i]++;
        let upgradesToString = this.upgrades[0].toString() + this.upgrades[1].toString();
        this.setTexture("tdtiles", tileFrameNames[TOWER_UPGRADE_IMAGE_PERMUTATIONS[this.type][upgradesToString]]);
        TOWER_UPGRADES[this.type][i][this.upgrades[i]-1]['eff'](this);
        this.circle_image.setRadius(this.settings["radius"]);
      }
    }
    this.base_settings = Object.assign({}, this.settings);
  }

  /**
   * Sets up offsets for tower and base
   */
  setOffsets() {
    let base_offset_settings = this.settings["base_offset_settings"];
    let offset_settings = this.settings["img_offset_settings"];
    this.setOrigin(offset_settings[0], offset_settings[1]);
    this.base.setOrigin(base_offset_settings[0], base_offset_settings[1]);
  }

  addBoost(target, amount) {
    this.boosts[target]=amount;
  }

  getBoosts() {
    return this.boosts;
  }
  
  getBoost(type) {
    if(this.boosts[type]) {
      return this.boosts[type];
    }
    return false;
  }

  manageBoosts() {
    this.settings = Object.assign({}, this.base_settings);
    for(let target of Object.keys(this.boosts)) {
      if(target !== "sell") {
        this.settings[target] *= this.boosts[target];
      }
    }
    this.circle_image.setRadius(this.settings["radius"]);
  }

  removeBoost(target) {
    if(this.boosts[target]) {
      delete this.boosts[target];
    }
  }

  clearBoosts() {
    this.boosts = {};
  }

  getTotalCost() {
    let total = this.settings['cost'];
    for(let i = 0; i < 2; i++) {
      for(let j = 0; j < this.upgrades[i]; j++) {
        total += TOWER_UPGRADES[this.type][i][j]["cost"];
      }
    }
    return total;
  }
}