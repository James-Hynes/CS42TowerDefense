/**
 * Class representing Tile
 */
class Tile extends Phaser.GameObjects.Sprite {
  /**
   * Creates a new tile object
   * @param {Level} scene Level to place tile on
   * @param {number} t The type of the tile 
   * @param {number} x The x-value of the tile
   * @param {number} y The y-value of the tile 
   */
  constructor(scene, t, x, y) {
    super(scene, x*64, y*64, "tdtiles", tileFrameNames[0]);
    this.setOrigin(0.5, 0.5);
    this.type = t;
    this.tileX = x;
    this.tileY = y;
    this.tower;
    this.decorations = [];
    this.occupied = false;
    this.image_type = "";
    this.ghost_tower;
    this.ghost_tower_base;

    this.discovered  = false;
    this.prev = false;
  }

  /**
   * Checks if the tile is occupied
   * @returns {boolean} Occupied
   */
  isOccupied() {
    return this.occupied;
  }

  /**
   * Gets x and y value of Tile
   * @returns {Array} [x, y]
   */
  getPos() {
    return [this.x, this.y];
  }

  /**
   * Gets type of tile
   * @returns {number} Type
   */
  getType() {
    return this.type;
  }
  
  /**
   * Displays Tile data in string
   * @returns {string} 
   */
  toString() {
    return "Tile, Type: "+this.type+", Position: ["+this.tileX+", "+this.tileY+"], Image: "+this.frame.name+", Towers: []";
  }

  /**
   * Adds new tower to tile
   * @param {Level} scene The level to place the tower on
   * @param {number} t The type of tower
   * @param {number} x The x-value of the tower
   * @param {number} y The y-value of the tower
   * @param {number} base The image number in spritesheet of the base of the tower
   * @param {number} im The image number in spritesheet of the tower
   * @param {number} radius The radius of the tower
   */
  addTower(scene, t, x, y, base, im, radius) {
    this.tower = new Tower(scene, t, x, y, im, base, radius);
    this.scene.towerLayer.add(this.tower);
    this.occupied = true;
  }

  /**
   * Adds a decoration to the tile
   * @param {number} im The image number in spritesheet of the decoration to add
   */
  addDecoration(im) {
    this.scene.decorationLayer.add(im);
    this.decorations.push(im);
    this.occupied = true;
  }

  /**
   * Sets the image type of the tile
   * @param {number} image_num The image number in spritesheet of the tile
   * @returns {string} The type of image the tile represents
   */
  setImageType(image_num) {
    let im_type = getKeyByValue(THEME_KEY[theme], image_num);
    if(im_type) {
      this.image_type = im_type;
      return;
    }
    this.image_type = "ground";
  }

  /**
   * Removes all decorations from Tile
   */
  clearDecorations() {
    for(let decoration of this.decorations) {
      this.decorations.splice(this.decorations.indexOf(decoration), 1);
      decoration.destroy();
    }
    if(!this.tower) {
      this.occupied = false;
    }
  }

  /**
   * Adds a "ghost tower" to the tile - used when player mouses over
   * @param {Phaser.Sprite} ghost_tower_base Sprite of base of ghost tower
   * @param {Phaser.Sprite} ghost_tower Sprite of ghost tower
   */
  setGhostTower(ghost_tower_base, ghost_tower) {
    this.ghost_tower = ghost_tower;
    this.ghost_tower_base = ghost_tower_base;
    this.scene.towerLayer.add([this.ghost_tower_base, this.ghost_tower]);
  }

  /**
   * Removes ghost tower from tile
   */
  removeGhostTower() {
    if(this.ghost_tower) {
      this.ghost_tower.destroy();
      this.ghost_tower = null;
      this.ghost_tower_base.destroy();
      this.ghost_tower_base = null;
      this.scene.towerLayer.remove([this.ghost_tower, this.ghost_tower_base]);
    }
  }

}