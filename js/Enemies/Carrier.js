/** Class representing a Carrier type enemy 
 * @extends PathEnemy
*/
class Carrier extends PathEnemy {
  /**
   * Create a carrier
   * @param {Level} scene the level the carrier should be used in
   * @param {number} x  the x-value
   * @param {number} y the y-value
   * @param {number} t the type of the carrier
   * @param {Tile[]} path the carrier's path
   */
  constructor(scene, x, y, t, path) {
    let carrierTypes = {1: {img: 267, speed: 1, value: 100, health: 20, soldiers: 20}, 2: {img: 268, speed: 2, value: 300, health: 40, soldiers: 40}}
    super(scene, x, y, t, carrierTypes[t]["speed"], carrierTypes[t]["img"], carrierTypes[t]["value"], carrierTypes[t]["health"], path);
    this.soldiers = carrierTypes[t]["soldiers"];
  }

  /**
   * Spawns soldiers at carrier's location
   * @param {Level} scene the level to spawn soldiers in 
   */
  spawnSoldiers() {
    for(let i = 0; i < this.soldiers; i++) {
      let en = new Soldier(this.scene, closestMultiple(this.x, 4) + ((4 * (Math.floor(Math.random() * 4))) * ((Math.random() < 0.5) ? 1 : -1)), closestMultiple(this.y, 4) + ((4 * (Math.floor(Math.random() * 4))) * ((Math.random() < 0.5) ? 1 : -1)), 2, this.path);
      en.parent = this;
      this.scene.enemyLayer.add(en);
    }
    this.kill();
  }
}  