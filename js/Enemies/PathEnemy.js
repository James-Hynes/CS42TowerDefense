class PathEnemy extends Enemy {
  constructor(scene, x, y, t, s, im, v, h, path) {
    super(scene, x, y, t, s, im, v, h);
    this.path = path;
    if(this.path[0].image_type) { // if path isn't already set
      this.setPath();
    }
  }

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

  move(dir, speed) {
    switch(dir) {
      case "up": this.y -= speed; this.angle = 270; break;
      case "down": this.y += speed; this.angle = 90; break;
      case "right": this.x += speed; this.angle = 0; break;
      case "left": this.x -= speed; this.angle = 180; break;
    }
  }

  update(scene) {
    if(typeof scene === "undefined") {
      pause();
      console.log(this, scene);
    }
    this.handleStatus(scene);
    if(typeof scene === "undefined") {
      pause();
      console.log(this);
    }
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
    return;
  }
}