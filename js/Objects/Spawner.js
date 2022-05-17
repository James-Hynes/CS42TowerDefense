/**
 * Class representing spawner
 */
class Spawner extends Phaser.GameObjects.Sprite {
  /**
   * Creates a new spawner
   * @param {Level} scene Level to place the spawner on
   * @param {number} x The x-value of the spawner
   * @param {number} y The y-value of the spawner
   * @param {number} im Image number in spritesheet of spawner
   * @param {Tile[]} path Path for enemies spawned from this spawner to take 
   */
  constructor(scene, x, y, im, path) {
    super(scene, x, y, "tdtiles", tileFrameNames[im])
    this.rate = 75;
    this.path = path;
    this.counter = 0;
    this.setOrigin(0.5, 0.5);
    this.play('spawner');
    this.ready=false;
    this.on("animationrepeat", () => {
      this.ready=true;
    })
  }

  /**
   * Updates spawner's counter and rotates spawner
   */
  update() {
    this.counter++;
  }
}