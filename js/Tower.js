class Tower extends Phaser.GameObjects.Sprite {
  constructor(scene, t, x, y, im, base, radius) {
    super(scene, x, y, "tdtiles", tileFrameNames[im]);
    this.type = t;
    this.settings = Object.assign({}, TOWER_TYPES[t]);
    this.base = scene.add.sprite(x, y, "tdtiles", tileFrameNames[base]);
    this.scene.towerLayer.add(this.base);
    this.circle_image = scene.add.circle(x, y, radius, 0x6666ff);
    this.scene.towerLayer.add(this.circle_image);
    this.circle_image.alpha = 0;
    this.rate = 0;
    this.fireQueued = false;
    this.fireCounter=0;
    this.setOffsets();
    this.angle = Math.random() * 360;

    this.upgrades = [0, 0];
  }

  getType() {
    return this.type;
  }

  getPos() {
    return [this.x, this.y];
  }

  getImage() {
    return this.frame.name;
  }

  getBase() {
    return this.base;
  }

  getBaseImage() {
    return this.base.frame.name;
  }

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
      // let ac = ((a instanceof PathEnemy) ? {x: a.path[a.path.length-1][1], y: a.path[a.path.length-1][2]} : {x: a.target[0], y: a.target[1]})
      // let bc = ((b instanceof PathEnemy) ? {x: b.path[b.path.length-1][1], y: b.path[b.path.length-1][2]} : {x: b.target[0], y: b.target[1]})
      // return h(a, ac) - h(b, bc);
    })
  }

  update() {
    this.fireCounter++;
    this.inRange = this.getEnemiesInRadius();
    if(this.inRange.length > 0) {
      this.angleTowardsEnemy(this.inRange[0]);
      this.fire();
    } else {
      // this.image.angle+=2*this.idleRotatingDirection;
    }
  }

  angleTowardsEnemy(enemy) {
    let a = Math.atan2(enemy.y - this.y, enemy.x - this.x);
    this.angle = (radians_to_degrees(a)+90);
  }

  fire() {
    if(this.fireCounter >= this.settings["rate"]) {
      this.fireQueued = true;
      this.fireCounter=0;
    }
  }

  upgrade(upgrades) {
    for(let i = 0; i < upgrades.length; i++) {
      this.upgrades[i] += upgrades[i];
    }
  }

  setOffsets() {
    let base_offset_settings = this.settings["base_offset_settings"];
    let offset_settings = this.settings["img_offset_settings"];
    this.setOrigin(offset_settings[0], offset_settings[1]);
    this.base.setOrigin(base_offset_settings[0], base_offset_settings[1]);
  }
}