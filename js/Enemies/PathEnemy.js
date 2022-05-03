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
    this.path = path;
    if(this.path[0].image_type) { // if path isn't already set
      this.setPath();
    }
  }

  /**
   * Adjust the exact position of each tile based on what type of image it has.
   * This is necesarry to keep the enemies on the center of each path tile.
   * Each path in this game is made up of 2 tiles, so in order to appear to be on the center of the path,
   * the enemy needs to stay in the center of those two parts of the path
   */
  setPath() {
    this.path = this.path.map((a) => {
      if(a.image_type.indexOf("start") > -1) {
        if(a.image_type.indexOf("Right") > -1 ) {
          return [a.image_type, a.x - 32, a.y+32, -this.speed];
        } else {
          return [a.image_type, a.x + 32, a.y+32, this.speed];
        }
      } else if(a.image_type.indexOf("vertical") > -1) {
        if(a.image_type.indexOf("Right") > -1) {
          return [a.image_type, a.x - 32, a.y, -this.speed];
        } else {
          return [a.image_type, a.x + 32, a.y, this.speed];
        }
      } else if(a.image_type.indexOf("horizontal") > -1) {
        if(a.image_type.indexOf("Top") > -1) {
          return [a.image_type, a.x, a.y+32, this.speed];
        } else {
          return [a.image_type, a.x, a.y-32, -this.speed];
        }
      } else if(a.image_type.indexOf("inside") > -1) {
        if(a.image_type.indexOf("Top") > -1) {
          if(a.image_type.indexOf("Right") > -1) {
            return [a.image_type, a.x-32, a.y+32, -this.speed];
          } else {
            return [a.image_type, a.x+32, a.y+32, -this.speed];
          }
        } else {
          if(a.image_type.indexOf("Right") > -1) {
            return [a.image_type, a.x-32, a.y-32, -this.speed];
          } else {
            return [a.image_type, a.x+32, a.y-32, -this.speed];
          }
        }
      } else if(a.image_type.indexOf("end") > -1) {
        if(a.image_type.indexOf("Right") > -1 ) {
          return [a.image_type, a.x - 32, a.y, -this.speed];
        } else {
          return [a.image_type, a.x + 32, a.y, this.speed];
        }
      };
    });
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
  update(scene) {
    this.handleStatus(scene);
    if(this.path.length > 0) {
      let distX = this.path[0][1] - this.x;
      let distY = this.path[0][2] - this.y;

      if(distX === 0 && distY === 0) {
        if(this.path.length === 1) {
          this.kill();
          scene.player.lives--;
          return;
        }
        this.path.shift();
        if(this.soldierPath) {
          this.soldierPath.shift();
        }
        distX = this.path[0][1] - this.x;
        distY = this.path[0][2] - this.y;
      }


      if(distX === 0) {
        if(distY < 0) {
          this.move('up', this.speed);
        } else {
          this.move('down', this.speed);
        }
      } else if (distY === 0) {
        if(distX < 0) {
          this.move('left', this.speed);
        } else {
          this.move('right', this.speed);
        }
      } else {
        if(distX < 0) {
          this.move('left', this.speed);
        } else if(distX > 0) {
          this.move('right', this.speed);
        } else if(distY < 0) {
          this.move('up', this.speed);
        } else if(distY > 0) {
          this.move('down', this.speed);
        }
      }
    }
  }
}