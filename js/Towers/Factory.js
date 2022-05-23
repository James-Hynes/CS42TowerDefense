/**
 * Class representing a factory tower
 */
class Factory extends Tower {
  /**
   * Creates a new factory object
   * @param {Level} scene 
   * @param {number} t 
   * @param {number} x 
   * @param {number} y 
   * @param {number} im 
   * @param {number} base 
   * @param {number} radius 
   */
  constructor(scene, t, x, y, im, base, radius) {
    super(scene, t, x, y, im, base, radius);
    this.mines = [];
    this.roadOptions=this.getNearestRoadTiles();
    this.mineBoosts = {radius: 0, damage: 0};

    this.maxMines = 10;
    this.counter=0;
    this.iceEnabled = 0;

    this.spawnMine();
  }

  /**
   * Manages firing
   */
  update() {
    this.manageBoosts();
    if(this.scene.enemiesLeft) {
      this.counter++;
    }
    if(this.counter >= (this.settings['rate'] / this.scene.speedModifier) && !paused && this.scene.enemiesLeft===true && this.mines.length < this.maxMines) {
      this.spawnMine();
      this.counter=0;
    }
  }

  /**
   * Creates and moves new mine.
   */
  spawnMine() {
    let tileTarget = this.roadOptions[Math.floor(Math.random() * this.roadOptions.length)];
    let mine = new Barrel(this.scene, this.x, this.y);
    mine.on(("animationrepeat"), () => {
      this.mines.splice(this.mines.indexOf(mine), 1);
    })

    if(this.iceEnabled > 0) {
      mine.iceEnabled = this.iceEnabled;
      if(this.iceEnabled > 1) {
        mine.setTexture("tdtiles", tileFrameNames[526]);
      } else {
        mine.setTexture("tdtiles", tileFrameNames[525]);
      }
    }
    mine.damage = addPercentToNumber(this.settings['bullet_damage'], this.mineBoosts['damage']);
    mine.boostRad = this.mineBoosts['radius'];
    this.mines.push(mine);
    mine.move_tween = this.scene.tweens.add({
      targets: mine,
      x: tileTarget.x + Math.floor(Math.random() * 16) * ((Math.random() < 0.5) ? 1 : -1),
      y: tileTarget.y + Math.floor(Math.random() * 16) * ((Math.random() < 0.5) ? 1 : -1),
      angle: Math.random() * 360,
      duration: 1000
    });
    tileTarget.setTower(mine);
  }

  /**
   * Gets road tiles within radius
   * @returns {Tile} list of tiles within range
   */
  getNearestRoadTiles() {
    let currentTile=this.scene.tileMap[Math.floor(this.y/64)][Math.floor(this.x/64)];
    let inRangeTiles = [];
    for(let i = 0; i < this.scene.tileMap.length; i++) {
      for(let j = 0; j < this.scene.tileMap[i].length; j++) {
        if(this.scene.tileMap[i][j].type==="P") {
          if( Math.pow(this.scene.tileMap[i][j].x - this.x,2) + Math.pow(this.scene.tileMap[i][j].y - this.y, 2) < Math.pow(this.settings["radius"], 2) ) {
            inRangeTiles.push(this.scene.tileMap[i][j]);
          }
        }
      }
    }

    let sorted = inRangeTiles.sort((a, b) => {
      return (Math.abs(a.tileX-currentTile.tileX) + Math.abs(a.tileY-currentTile.tileY)) - (Math.abs(b.tileX-currentTile.tileX) + Math.abs(b.tileY-currentTile.tileY));
    })
    return sorted;
  }

  /**
   * Removes all mines and destroys tower.
   */
  clearTower() {
    for(let mine of this.mines) {
      let tX = Math.floor(mine.x/64);
      let tY = Math.floor(mine.y/64);
      getTile(currentLevel.tileMap, tX, tY).one_time_towers = [];
      mine.destroy();
    }
    this.mines = [];
    this.base.destroy();
    this.circle_image.destroy();
    this.destroy();
  }
}