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
    this.rate = 15;
    this.path = path;
    this.counter = 0;
    this.setOrigin(0.5, 0.5);
    this.anims.create({key: "spawner", frames: this.anims.generateFrameNames('spawner', {prefix: "frame", start: 1, end: 12, suffix: ".png"}), repeat: -1, frameRate: 12 * this.scene.speedModifier, repeatDelay: 200});
    this.play('spawner');
    this.ready=false;
    this.on("animationrepeat", () => {
      if(this.anims.frameRate !== 12 * this.scene.speedModifier) {
        this.anims.remove('spawner');
        this.anims.create({key: "spawner", frames: this.anims.generateFrameNames('spawner', {prefix: "frame", start: 1, end: 12, suffix: ".png"}), repeat: -1, frameRate: 12 * this.scene.speedModifier, repeatDelay: 200});
        this.play('spawner');
      }
      this.ready=true;
    })
    this.setScale(1);
  }

  /**
   * Updates spawner's counter and rotates spawner
   */
  update() {
    this.counter++;
    if( (paused && this.anims.isPlaying) ) {
      this.anims.remove('spawner');
    } else if(!this.anims.isPlaying && !paused && !this.scene.nextWaveReady && this.ready===false) {
      this.anims.create({key: "spawner", frames: this.anims.generateFrameNames('spawner', {prefix: "frame", start: 1, end: 12, suffix: ".png"}), repeat: -1, frameRate: 12 * this.scene.speedModifier, repeatDelay: 200});
      this.play('spawner');
    }
  }
}