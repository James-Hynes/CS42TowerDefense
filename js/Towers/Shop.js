class Shop extends Tower {
  constructor(scene, t, x, y, im, base, radius) {
    super(scene, t, x, y, im, base, radius);
    this.settings['income'] = 200;
  }

  update() {
    this.manageBoosts();
  }

  onNextWave() {
    this.scene.player.addMoney(this.settings['income']);
    this.scene.stats['money'] += this.settings['income'];
  }
}