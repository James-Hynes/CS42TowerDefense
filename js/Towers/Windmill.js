class Windmill extends Tower {
  constructor(scene, t, x, y, im, base, radius) {
    super(scene, t, x, y, im ,base, radius);
    this.settings['income'] = 100;
    this.settings['restoration'] = 2;
    this.settings['windmillspeed'] = 8;
    this.base_settings = Object.assign({}, this.settings);

    this.setTexture("tdtiles", tileFrameNames[514]);
    this.windmill;
    
  }

  update() {
    this.manageBoosts();
  }

  createWindmill() {
    this.windmill = this.scene.add.sprite(this.x, this.y, "windmill", 'windmill1.png');
    this.scene.towerLayer.add(this.windmill);
    this.createWindmillAnimation();
  }

  createWindmillAnimation() {
    this.windmill.anims.remove('windmill');
    this.windmill.anims.create({key: "windmill", frames: "windmill", frameRate: this.settings['windmillspeed'], repeat: -1});
    this.windmill.play('windmill');
  }

  onNextWave() {
    this.scene.player.addMoney(this.settings['income']);
    this.scene.stats['money'] += this.settings['income'];
    this.scene.player.addLives(this.settings['restoration']);
    this.scene.stats['lives'] = this.scene.player.lives;
  }
}