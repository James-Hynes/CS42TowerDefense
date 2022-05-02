class Enemy extends Phaser.GameObjects.Sprite {
  constructor(scene, x, y, t, s, im, v, h) {
    super(scene, x, y, "tdtiles", tileFrameNames[im]);
    this.type = t;
    this.speed = s;
    this.value = v;
    this.health = h;
    this.setOrigin(0.5, 0.5);

    this.statusConditions = [];
  }

  takeDamage(damage) {
    this.health-= damage;
    if(this.health <= 0) {
      this.kill();
      return true;
    }
    return false;
  }

  kill() {
    this.destroy();
  }

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

  applyStatus(type, severity) {
    this.statusConditions.push([type, severity]);
  }

  removeStatus(type) {
    for(let i = 0; i < this.statusConditions; i++) {
      if(this.statusConditions[i][0] === type) {
        this.statusConditions.splice(i, 1);
        return;
      }
    }
  }
}