/**
 * Class representing lightning tower
 */
class LightningTower extends Tower {
  constructor(scene, t, x, y, im, base, radius) {
    super(scene, t, x, y, im, base, radius);
    this.bolts = [];
    this.counter=0;
    this.settings['chains'] = 3;
    this.settings['bolt_color'] = "0xFFFFFF";
    this.settings['unstable'] = false;
    this.base_settings = Object.assign({}, this.settings);
  }

  update() {
    this.manageBoosts();
    if(this.counter >= (this.settings['rate'] / this.scene.speedModifier)) {
      if(this.bolts.length < 1){ 
        if(this.fire()) {
          this.counter=0;
        }
      } else {
        for(let bolt of this.bolts) {
          bolt.destroy();
        }
        this.bolts=[];
        if(this.fire()) {
          this.counter=0;
        }
      }
    }
    for(let bolt of this.bolts) {
      bolt.update();
    }
    this.counter++;
  }

  /**
   * Shoots lightning
   */
  fire() {
    let enemies = this.getEnemiesInRadius();
    if(enemies.length < 1) { return false; };
    let enemy = enemies.splice(Math.floor(Math.random() * enemies.length), 1)[0];
    for(let i = 0; i < Math.min(enemies.length+1, this.settings["chains"]); i++) {
      let bolt;
      if(this.bolts.length < 1) {
        bolt = this.scene.add.sprite(this.x, this.y, "lightning");
        bolt.origin = {x: bolt.x, y: bolt.y};
      } else {
        enemy = enemies.splice(Math.floor(Math.random() * enemies.length), 1)[0];
        let prev_target = this.bolts[this.bolts.length-1].target;
        bolt = this.scene.add.sprite(prev_target.x, prev_target.y, "lightning");
        bolt.origin = {obj: prev_target.obj, x: prev_target.x, y: this.bolts[this.bolts.length-1].target.y};
      }
      bolt.setOrigin(0.5, 1);
      bolt.play('lightning');
      bolt.setTint(this.settings['bolt_color']);
      bolt.target = {obj: enemy, x: enemy.x, y: enemy.y};
      
      bolt.update = () => {
        bolt.angle = radians_to_degrees(Math.atan2(bolt.target.obj.y - bolt.y, bolt.target.obj.x - bolt.x))+90;
        bolt.scaleY = (dist_formula({x: bolt.x, y: bolt.y}, {x: bolt.target.obj.x, y: bolt.target.obj.y}) / bolt.height);
        if(bolt.origin.obj) {
          bolt.x = bolt.origin.obj.x;
          bolt.y = bolt.origin.obj.y;
        }
      }
      bolt.angle = radians_to_degrees(Math.atan2(enemy.y - bolt.y, enemy.x - bolt.x))+90;
      bolt.scaleY = (dist_formula({x: bolt.x, y: bolt.y}, {x: enemy.x, y: enemy.y}) / bolt.height);
      this.scene.towerLayer.add(bolt);
      this.bolts.push(bolt);
      if(this.settings['unstable'] && Math.random() < 0.3) {
        let status = ["fire", "ice"][Math.floor(Math.random() * 2)];
        enemy.applyStatus(status, 2);
        switch(status) {
          case "fire": bolt.setTint(0xff000b); break;
          case "ice": bolt.setTint(0x00d4fa); break;
        }
      }
      if(enemy.takeDamage(this.settings["bullet_damage"])) {
        for(let bolt of this.bolts) {
          bolt.destroy();
        }
        this.bolts = [];
        return true;
      }
    }
    return true;
  }

  clearTower() {
    for(let bolt of this.bolts) {
      bolt.destroy();
    }
    this.circle_image.destroy();
    this.base.destroy();
    this.destroy();
  }
}