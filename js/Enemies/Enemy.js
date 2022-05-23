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
    this.base_speed = s;
    this.value = v;
    this.health = h;
    this.max_health = h;
    this.setOrigin(0.5, 0.5);
    this.statusConditions = [];
    this.showLifeBar = false;
    this.createLifeBar();
    this.dead=false;
    this.moneyMod=1;

  }

  /**
   * Inflict damage on enemy
   * @param {number} damage how much damage to deal
   * @returns {boolean} true if damage is enough to kill, otherwise false
   */
  takeDamage(damage) {
    this.health-= damage;
    if(this.health <= 0) {
      if(this.getStatus('static')) {
        this.doStaticExplosion();
      }
      if(this instanceof Carrier) {
        this.spawnSoldiers();
      } else {
          this.kill();
      }
      return true;
    }
    return false;
  }


  /**
   * Runs static explosion animation and deals damage to surrounding enemies. 
   */
  doStaticExplosion() {
    for(let enemy of this.getEnemiesInRadius(100)) {
      if(enemy !== this && enemy.dead===false) {
        enemy.removeStatus('static');
        enemy.takeDamage(5);
      }
    }
    playSoundAtSettingsVolume(this.scene.sound.add("rumble"));
    let explosion = this.scene.add.sprite(this.x, this.y, "staticexplosion");
    this.scene.towerLayer.add(explosion);
    explosion.play("staticexplosion");
    explosion.on("animationcomplete", () => {explosion.destroy()})
  }

  /**
   * Kills the enemy
   */
  kill() {
    let amt = this.value * this.moneyMod;
    this.scene.player.addMoney(amt);
    this.scene.stats['kills']++;
    this.scene.stats['money']+=amt;
    if(typeof this.background_bar !== "undefined") {
      this.background_bar.destroy();
      this.health_bar.destroy();
    }
    this.destroy();
    this.dead=true;
  }

  /**
   * Manages enemy's current status conditions and inflicts their effects
   * @param {Level} scene the level the enemy is in
   */
  handleStatus() {
    let prev_types = [];
    for(let condition of this.statusConditions) {
      let conditionType = condition[0];
      let conditionSeverity = condition[1];
      prev_types.push(conditionType);

      switch(conditionType) {
        case "fire": 
          if(prev_types.includes('ice')) {
            this.setTint(0x930ee6); 
          } else {
            this.setTint(0xFF0000); 
          }
          if(!this.dead) {
            this.takeDamage(conditionSeverity); 
          }
          break;
        case "ice": 
          if(prev_types.includes('fire')) {
            this.setTint(0x930ee6); 
          } else {
            this.setTint(0x34e8eb); 
          }
          this.speed = this.base_speed/2;
          break;
        case "static":
          this.setTint(0xfae505);
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
    for(let i = 0; i < this.statusConditions.length; i++) {
      if(this.statusConditions[i][0] === type) {
        this.statusConditions.splice(i, 1);
      }
    }
  }

  /**
   * Gets a given status condition carried by the enemy.
   * @param {string} type 
   * @returns {string|boolean}
   */
  getStatus(type) {
    for(let i = 0 ; i < this.statusConditions.length; i++) {
      if(this.statusConditions[i][0] === type) {
        return this.statusConditions[i];
      }
    }
    return false;
  }

  /**
   * Gets all enemies within enemy's radius
   * @param {number} radius radius to check 
   * @returns {Enemy} a list of enemies within range
   */
  getEnemiesInRadius(radius) {
    let inRange = [];
    for(let enemy of this.scene.enemyLayer.getChildren()) {
      if( Math.pow(enemy.x - this.x,2) + Math.pow(enemy.y - this.y, 2) < Math.pow(radius, 2) )
      {
        inRange.push(enemy);
      }
    }
    return inRange.filter((a) => {return a !== this});
  }

  /**
   * Sets up invisible health bar above enemy. To be actived by Beacon level 4 upgrade.
   */
  createLifeBar() {
    this.background_bar = this.scene.add.rectangle(this.x-20, this.y-40, 40, 20, "0x000000");
    this.health_bar = this.scene.add.rectangle(this.x-20, this.y-40, 40, 20, "0xFF0000").setOrigin(0, 0.5);
    this.background_bar.alpha=0;
    this.health_bar.alpha=0;
    this.scene.uiLayer.add([this.background_bar, this.health_bar]);
  }

  /**
   * updates position of life bar
   */
  handleLifeBar() {
    this.background_bar.setPosition(this.x, this.y-40);
    this.health_bar.setPosition(this.x-20, this.y-40);
    this.health_bar.width = (this.health / this.max_health) * 40;

    if(this.showLifeBar) {
      this.background_bar.alpha =1;
      this.health_bar.alpha=1;
    } else {
      this.background_bar.alpha=0;
      this.health_bar.alpha=0;
    }
  }
}