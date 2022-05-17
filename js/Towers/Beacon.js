/**
 * Class representing a beacon
 */
class Beacon extends Tower {
  /**
   * Creates a new beacon tower
   * @param {*} scene 
   * @param {*} t 
   * @param {*} x 
   * @param {*} y 
   * @param {*} im 
   * @param {*} base 
   * @param {*} radius 
   */
  constructor(scene, t, x, y, im, base, radius) {
    super(scene, t, x, y, im, base, radius);
    this.circles = [];
    this.circles.push(scene.add.circle(x, y, radius/8));
    this.circles[0].alpha=0.5;
    this.circles[0].setStrokeStyle(1, 0x1a65ac);
    this.circle_tweens = [];
    this.beacon_sound = scene.sound.add("radar");
    this.circle_duration = 1500;
    playSoundAtSettingsVolume(this.beacon_sound);
    this.circle_tweens.push(scene.add.tween({
      targets: this.circles,
      scaleX: 8,
      scaleY: 8,
      duration: this.circle_duration,
      repeat: -1,
      onRepeat: () => {
        playSoundAtSettingsVolume(this.beacon_sound);
      }
    }));
    scene.towerLayer.add(this.circles[0]);
    this.rate = 0;
    this.fireQueued = false;
    this.fireCounter=0;
    this.setOffsets();

    this.boostsToGive = {radius: 1.1, rate: 0.95, sell: 0};
    this.showLifeBars = false;
  }

  update() {
    for(let tower of this.getTowersInRadius()) {
      for(let b of Object.keys(this.boostsToGive)) {
        tower.addBoost(b, this.boostsToGive[b]);
      }
    }

    if(this.showLifeBars) {
      for(let enemy of this.getEnemiesInRadius()) {
        enemy.showLifeBar = true;
      }
    }
  }

  getTowersInRadius() {
    let inRange = [];
    for(let tower of this.scene.towerLayer.getChildren()) {
      if(tower instanceof Tower && tower !== this) {
        if( Math.pow(tower.x - this.x,2) + Math.pow(tower.y - this.y, 2) < Math.pow(this.settings["radius"], 2) )
        {
          inRange.push(tower);
        }
      }
    }
    return inRange;
  }

  clearTower() {
    for(let tw of this.circle_tweens) {
      tw.stop();
    }
    this.circle_tweens=[];
    this.circle_image.destroy();
    for(let circle of this.circles) {
      circle.destroy();
    }
    this.circles = [];
    this.beacon_sound.destroy();
    this.base.destroy();
    for(let tower of this.getTowersInRadius()) {
      tower.clearBoosts();
    }
    if(this.showLifeBars) {
      for(let enemy of this.getEnemiesInRadius()) {
        enemy.showLifeBar=false;
      }
    }
    
    this.destroy();

    
  }

  clearCircles() {
    for(let tw of this.circle_tweens) {
      tw.stop();
    }
    this.circle_tweens=[];
    for(let circle of this.circles) {
      circle.destroy();
    }
    this.circles = [];
  }

  createCircle(color) {
    let circle = this.scene.add.circle(this.x, this.y, this.settings['radius']/8)
    this.circles.push(circle);
    this.scene.towerLayer.add(circle);
    circle.alpha=0.5;
    circle.setStrokeStyle(1, color);
    this.circle_tweens.push(this.scene.add.tween({
      targets: circle,
      scaleX: 8,
      scaleY: 8,
      duration: this.circle_duration,
      repeat: -1,
      onRepeat: () => {
        playSoundAtSettingsVolume(this.beacon_sound);
      }
    }))
  }
}