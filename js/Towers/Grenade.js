class Grenade extends Phaser.GameObjects.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, "grenade", "bombf1.png");
    this.play('grenade');
    this.on("animationcomplete", () => {
      for(let enemy of this.getEnemiesInRadius()) {
        enemy.takeDamage(20);
      }
      this.play('explosion');
    })
    this.on('animationrepeat', () => {
      this.destroy();
    })
  }

  update() {
  }

  getEnemiesInRadius() {
    let inRange = [];
    for(let enemy of this.scene.enemyLayer.getChildren()) {
      if( Math.pow(enemy.x - this.x,2) + Math.pow(enemy.y - this.y, 2) < Math.pow(120, 2) )
      {
        inRange.push(enemy);
      }
    }
    return inRange;
  }
}