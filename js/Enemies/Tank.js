/**
 * Class representing Tank type enemy
 * @extends PathEnemy
 */
class Tank extends PathEnemy {
  /**
   * Creates a new Tank enemy
   * @param {Level} scene 
   * @param {number} x 
   * @param {number} y 
   * @param {number} t 
   * @param {Tile[]} path 
   */
  constructor(scene, x, y, t, path) {
    let tankTypes = {1: {img: 309, speed: 1, value: 500, health: 100}, 2: {img: 310, speed: 2, value: 1000, health: 200}, 3: {img: 311, speed: 4, value: 2000, health: 400}, 4: {img: 312, speed: 4, value: 3000, health: 600}}
    super(scene, x, y, t, tankTypes[t]["speed"], tankTypes[t]["img"], tankTypes[t]["value"], tankTypes[t]["health"], path);
  }
}