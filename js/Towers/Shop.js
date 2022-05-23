class Shop extends Tower {
  constructor(scene, t, x, y, im, base, radius) {
    super(scene, t, x, y, im, base, radius);
    this.settings['income'] = 200;
    this.settings["BAD_ITEMS"] = [0, 37, 87, 100, 120, 139];
    this.settings["GOOD_ITEMS"] = [38, 86, 101, 119, 140, 150];
    this.settings['midroundincome'] = false;
    this.settings['midroundincomemod']=1;
    this.settings['moneymod']=1;
    this.base_settings = Object.assign({}, this.settings);
    this.items = [];
    this.employees = [];
    this.cooldown=0;
  }

  update() {
    this.manageBoosts();
    if(this.cooldown >= (this.settings['rate'] / this.scene.speedModifier) && this.settings['midroundincome']) {
      this.giveMoneyInRound();
      this.cooldown=0;
    }
    if(!paused && this.scene.enemiesLeft && this.settings['midroundincome']) {
      this.cooldown++;
    }
    if(!paused && this.upgrades[1] > 0) {
      this.applyMoneyMod();
    }
  }

  onNextWave() {
    this.scene.player.addMoney(this.settings['income']);
    this.scene.stats['money'] += this.settings['income'];
  }

  giveMoneyInRound() {
    let amt = ((Math.floor(Math.random() * 4) + 1) / 10) * (this.settings['income']) * this.settings['midroundincomemod'];
    this.scene.player.addMoney(amt);
    this.scene.stats['money'] += amt;
    for(let i = 0; i < 3; i++) {
      let c = this.scene.add.text(this.x - 30 + (i * 15), this.y, "$", {color: "green", fontSize: "25px"});
      this.scene.towerLayer.add(c);
      this.scene.add.tween({
        targets: c,
        y: '-=90',
        x: ''+(((Math.random() < 0.5) ? '-' : '+')) + Math.floor(Math.random() * 80),
        alpha: 0,
        duration: 500,
        onComplete: () => {
          c.destroy();
        }
      })
    }
  }

  applyMoneyMod() {
    for(let enemy of this.getEnemiesInRadius()) {
      enemy.moneyMod=this.settings['moneymod'];
    }
  }

  createEmployee(i) {
    let names = this.scene.textures.get("employees").getFrameNames();
    let employee = this.scene.add.sprite(this.x-30 + (i * 45), this.y+20, "employees", names[Math.floor(Math.random() * names.length)]).setScale(0.12);
    this.scene.towerLayer.add(employee);
    this.employees.push(employee);
  }

  createItems(quality) {
    let names = this.scene.textures.get('genericitems').getFrameNames();
    let items = [];
    for(let i = 0; i < this.settings[quality].length; i+=2) {
      for(let j = this.settings[quality][i]; j < this.settings[quality][i+1]; j++) {
        items.push(j);
      }
    }

    for(let i = 0; i < 2; i++) {
      let item = this.scene.add.sprite(this.x - 20 + (i * 10), this.y+20, "genericitems", names[items[Math.floor(Math.random() * items.length)]]).setScale(0.07);
      this.items.push(item);
      this.scene.towerLayer.add(item);
    }
  }

  clearItems() {
    for(let i = 0; i < this.items.length; i++) {
      this.items[i].destroy()
    }
    this.items = [];
  }

  clearEmployees() {
    for(let i = 0; i < this.employees.length; i++) {
      this.employees[i].destroy();
    }
    this.employees = [];
  }

  clearTower() {
    this.clearItems();
    this.clearEmployees();
    this.circle_image.destroy();
    this.base.destroy();
    this.destroy();
  }
}