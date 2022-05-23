/**
 * Class representing an enemy using a path
 * @extends Enemy
 */
class PathEnemy extends Enemy {
  /**
   * Create a new enemy
   * @param {Level} scene the level to put the enemy on
   * @param {number} x the x-value
   * @param {number} y the y-value
   * @param {number} t the type of enemy
   * @param {number} s the speed of the enemy
   * @param {number} im the image number in tilesheet of the enemy
   * @param {number} v the value of the enemy
   * @param {number} h the health of the enemy
   * @param {Tile[]} path the list of tiles to follow
   */
  constructor(scene, x, y, t, s, im, v, h, path) {
    super(scene, x, y, t, s, im, v, h);
    this.originX = x;
    this.originY = y;
    this.path = path.slice(0);
    if(this.path[0].image_type) { // if path isn't already set
      this.setPath();
    }
    this.prev_pos = {x: this.x, y: this.y};
    this.next_pos = {x: this.path[1][1], y: this.path[1][2]};

    this.path[0][1] = this.x;
    this.path[0][2] = this.y;

    this.path_tween = this.scene.tweens.add({
      targets: this,
      x: this.path[0][1],
      y: this.path[0][2],
      duration: dist_formula({x: this.x, y: this.y}, {x: this.path[0][1], y: this.path[0][2]}) * this.speed,
      onComplete: () => {
        this.doNextPathPart();
      }
    })
    this.x = this.path[0][1];
    this.y = this.path[0][2];
    this.starting_path = this.path.slice(0);
  }

  /**
   * Adjust the exact position of each tile based on what type of image it has.
   * This is necesarry to keep the enemies on the center of each path tile.
   * Each path in this game is made up of 2 tiles, so in order to appear to be on the center of the path,
   * the enemy needs to stay in the center of those two parts of the path
   */
  setPath() {
    let i = 0;
    this.path = this.path.map((a) => {
      let next_path_piece;
      if(i < this.path.length -1) {
        next_path_piece = this.path[i+1];
      }
      let distX = 0;
      let distY = 0;
      if(next_path_piece) {
        distX = a.x - next_path_piece.x;
        distY = a.y - next_path_piece.y;
      }
      let general_type = getTile(currentLevel.config['layout'], Math.floor(a.x/64), Math.floor(a.y/64));
      let image_name = (getKeyByValue(THEME_KEY[this.scene.config['theme']], parseInt(a.frame.name.split("_tile")[1].split(".png")[0])-1));
      let modX = 0;
      let modY = 0;
      if(distX < 0) { // moving right
        if(image_name.includes("Top")) {
          modY = 32;
        } else {
          modY = -32;
        }
      } else if (distX > 0) { // moving left
        if(image_name.includes("Top")) {
          modY = 32;
        } else {
          modY = -32;
        }
      }

      if(distY < 0) { // moving down
        if(image_name.includes("verticalRight") || image_name.includes("startRight") || image_name.includes("endRight")) {
          modX = -32;
          modY = 32;
        } else if(image_name.includes("verticalLeft") || image_name.includes("startLeft") || image_name.includes("endLeft")) {
          modX = 32;
          modY = 32;
        } else if(image_name.includes('inside')) {
          if(image_name.includes('Right')) {
            modX=0;
            modY=0;
          } else if(image_name.includes("Left")) {
            modX=0;
            modY=0;
          }
        }
      } else if(distY > 0) { // moving up
        if(image_name.includes("verticalRight") || image_name.includes("startRight") || image_name.includes("endRight")) {
          modX = -32;
          modY = 32;
        } else if(image_name.includes("verticalLeft") || image_name.includes("startLeft") || image_name.includes("endLeft")) {
          modX = 32;
          modY = 32;
        } else if(image_name.includes('inside')) {
          if(image_name.includes('Right')) {
            modX=0;
            modY=32;
          } else if(image_name.includes("Left")) {
            modX=0;
            modY=32;
          }
        }
      }

      i++;
      return [image_name, a.x+modX, a.y+modY, parseInt(a.frame.name.split("_tile")[1].split(".png")[0])];
    });
  }

  /**
   * Handles the next part of enemy path.
   */
  doNextPathPart() {
    let distX = this.x - this.next_pos['x'];
    let distY = this.y - this.next_pos['y'];

    if(distX < 0) {
      this.angle = 0;
    } else if(distX > 0) {
      this.angle = 180;
    }

    if(distY < 0) {
      this.angle = 90;
    } else if(distY > 0) {
      this.angle = 270;
    }
    this.path.shift();
    if(!this.dead && typeof this.scene !== "undefined") {
      if(this.path.length === 0) {
        let damage;
        if(this instanceof Carrier) {
          damage = 1 + this.soldiers;
        } else if(this instanceof Tank) {
          damage = 10000;
        } else {
          damage = 1;
        }
        if(!this.scene.player.takeLives(damage)) {
          this.scene.die();
        }
        this.destroy();
        return;
      }
      this.path_tween.stop();
      this.path_tween = this.scene.tweens.add({
        targets: this,
        x: this.path[0][1],
        y: this.path[0][2],
        duration: dist_formula({x: this.x, y: this.y}, {x: this.path[0][1], y: this.path[0][2]}) * ((24 / this.scene.speedModifier) / this.speed),
        onComplete: () => {
          this.doNextPathPart();
        }
      })
    }
  }

  /**
   * Moves the enemy in a given direction at a given speed
   * @param {string} dir the direction to move ['up', 'down', 'left', 'right']
   * @param {number} speed the speed to move at
   */
  move(dir, speed) {
    switch(dir) {
      case "up": this.y -= speed; this.angle = 270; break;
      case "down": this.y += speed; this.angle = 90; break;
      case "right": this.x += speed; this.angle = 0; break;
      case "left": this.x -= speed; this.angle = 180; break;
    }
  }

  /**
   * Manages the enemies movements, and checks if enemy has finished it's path
   * @param {Level} scene the level the enemy is in
   */
  update() {
    this.handleLifeBar();
    this.handleStatus();
    this.prev_pos = {x: this.x, y: this.y};
    if(this.path.length >= 2) {
      this.next_pos = {x: this.path[1][1], y: this.path[1][2]};
    }

    this.checkFinished();
    this.moneyMod=1;
  }

  /**
   * Checks if enemy finished path.
   */
  checkFinished() {
    let endPoint = this.path[this.path.length-1];
    if(this.x > endPoint[1]-32 && this.x < endPoint[1]+32 && this.y > endPoint[2]-32 && this.y < endPoint[2]+32) {
      let damage;
      if(this instanceof Carrier) {
        damage = 1 + this.soldiers;
      } else if(this instanceof Tank) {
        damage = 10000;
      } else {
        damage = 1;
      }
      if(!this.scene.player.takeLives(damage)) {
        this.scene.die();
      }
      this.destroy();
      return;
    }
  }
}