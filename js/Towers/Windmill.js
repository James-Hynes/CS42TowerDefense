class Windmill extends Tower {
  constructor(scene, t, x, y, im, base, radius) {
    super(scene, t, x, y, im ,base, radius);
    this.settings['income'] = 100;
    this.settings['restoration'] = 2;
  }

  update() {
    this.manageBoosts();
  }

  onNextWave() {
    this.scene.player.addMoney(this.settings['income']);
    this.scene.stats['money'] += this.settings['restoration'];
    this.scene.player.lives = Math.min(150, this.scene.player.lives+this.settings['restoration']);
    this.scene.stats['lives'] = this.scene.player.lives;
  }
}