class Carrier extends PathEnemy {
  constructor(scene, x, y, t, path) {
    let carrierTypes = {1: {img: 267, speed: 1, value: 100, health: 20, soldiers: 20}, 2: {img: 268, speed: 2, value: 300, health: 40, soldiers: 40}}
    super(scene, x, y, t, carrierTypes[t]["speed"], carrierTypes[t]["img"], carrierTypes[t]["value"], carrierTypes[t]["health"], path);
    this.soldiers = carrierTypes[t]["soldiers"];
  }

  takeDamage(damage, scene) {
    this.health-= damage;
    if(this.health <= 0) {
      this.kill();
      this.spawnSoldiers(scene);
      return true;
    }
    return false;
  }

  spawnSoldiers(scene) {
    for(let i = 0; i < this.soldiers; i++) {
      let en = new Soldier(scene, closestMultiple(this.x, 4) + ((4 * (Math.floor(Math.random() * 4))) * ((Math.random() < 0.5) ? 1 : -1)), closestMultiple(this.y, 4) + ((4 * (Math.floor(Math.random() * 4))) * ((Math.random() < 0.5) ? 1 : -1)), 2, this.path);
      scene.enemyLayer.add(en);
    }
  }
}  