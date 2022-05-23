/**
 * Class representing laser tower
 */
class LaserTower extends Tower {
  /**
   * Creates a new laser tower class
   * @param {Level} scene 
   * @param {number} t 
   * @param {number} x 
   * @param {number} y 
   * @param {number} im 
   * @param {number} base 
   * @param {number} radius 
   */
  constructor(scene, t, x, y, im, base, radius) {
    super(scene, t, x, y, im, base, radius);
    this.lasers = [];
    this.lasers.push(this.scene.add.sprite(this.x, this.y, "laser_default").setOrigin(0.5, 1));
    this.lasers.push(this.scene.add.sprite(this.x, this.y, "laser_default").setOrigin(0.5, 1));
    this.lasers.push(this.scene.add.sprite(this.x, this.y, "laser_default").setOrigin(0.5, 1));
    this.scene.towerLayer.add([this.lasers[0], this.lasers[1], this.lasers[2]]);
    this.counter=0;
    for(let i = 0; i < 3; i++) {
      this.lasers[i].alpha=0;
    }
    this.settings['activelasers']=1;
    this.settings['targetpriority'] = 0;
    this.settings['iceseverity']=2;
    this.base_settings = Object.assign({}, this.settings);
  }

  /**
   * Manages lasers and firing
   */
  update() {
    this.manageBoosts();
    for(let i = 0; i < this.settings['activelasers']; i++) {
      let laser = this.lasers[i];
      let e = this.getEnemiesInRadius();
      if(this.settings['targetpriority'] > 0) {
        e = e.sort((a, b) => {
          return (a.getStatus("ice") ? 1 : 0) - (b.getStatus("ice") ? 1 : 0);
        })
      }
      e = e[0];
      if(e) {
        let pos;
        switch(i) {
          case 0: pos = [this.x, this.y]; break;
          case 1: pos = [this.x + Math.cos(degrees_to_radians(this.angle)) * 12, this.y + Math.sin(degrees_to_radians(this.angle)) * 12]; break;
          case 2: pos = [this.x + Math.cos(degrees_to_radians(this.angle)) * - 12, this.y + Math.sin(degrees_to_radians(this.angle)) * - 12]; break;
        }
        laser.setPosition(pos[0], pos[1]);
        laser.alpha=1;
        this.angleTowardsEnemy(e);
        laser.angle = radians_to_degrees(Math.atan2(e.y-laser.y, e.x-laser.x))+90;
        laser.scaleY = (dist_formula({x: laser.x, y: laser.y}, {x: e.x, y: e.y}) / laser.height);
        if(this.counter >= (this.settings['rate'] / this.scene.speedModifier)) {
          this.counter=0;
          e.takeDamage(this.settings['bullet_damage']);
          if(this.upgrades[0] > 0) {
            e.removeStatus("ice");
            e.applyStatus("ice", this.settings['iceseverity']);
          }
          if(this.upgrades[1] > 2) {
            e.removeStatus("fire");
            e.applyStatus("fire", 1);
          }
        }
      } else {
        laser.alpha=0;
      }
    }
    this.counter++;
  }

  /**
   * Clears tower
   */
  clearTower() {
    this.circle_image.destroy();
    for(let laser of this.lasers) {
      laser.destroy();
    }
    this.base.destroy();
    this.destroy();
  }
}