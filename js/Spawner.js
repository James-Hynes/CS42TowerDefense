class Spawner extends Phaser.GameObjects.Sprite {
  constructor(scene, x, y, im, path) {
    super(scene, x, y, "tdtiles", tileFrameNames[im])
    this.rate = 75;
    this.path = path;
    this.counter = 0;
    this.setOrigin(0.5, 0.5);
  }

  update() {
    this.counter++;
    this.angle -= 2;
  }
}