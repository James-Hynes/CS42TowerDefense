/**
 * Convert number in degrees to number in radians
 * @param {number} degrees degrees to convert
 * @returns {number} number in radians
 */
function degrees_to_radians(degrees) {
  return degrees * (Math.PI / 180);
}

/**
 * Convert number in radians to number in degrees
 * @param {number} radians radians to convert
 * @returns {number} number in degrees
 */
function radians_to_degrees(radians) {
  return radians * (180 / Math.PI);
}

/**
 * Gets object key by value of object
 * @param {object} object object to find key in
 * @param {*} value value of key to find 
 * @returns {*} undefined or the key of the value
 */
function getKeyByValue(object, value) {
  return Object.keys(object).find(key => object[key] === value);
}

/**
 * Removes duplicate entries from a given array
 * @param {Array} arr array to remove duplicates in
 * @returns {Array} arr with removed duplicates
 */
function removeDuplicates(arr) {
  let tmpArr = [];

  for(let element of arr) {
    if(!tmpArr.includes(element)) {
      tmpArr.push(element);
    }
  }
  return tmpArr;
}

/**
 * Gets tile at given x,y in given map
 * @param {Tile[][]} map 2D Tilemap
 * @param {number} x the x-value
 * @param {number} y the y-value
 * @returns {Tile|number} -1 if not found, Tile if found
 */
function getTile(map, x, y) {
  if(map[y] !== undefined && map[y][x] !== undefined) {
    return map[y][x];
  }
  return -1;
}

/**
 * 
 * @param {Tile[][]} map 2D Tilemap
 * @param {number} x the x-value 
 * @param {number} y the y-value
 * @returns {string|number} type of tile if found or -1 if not found
 */
function getTileType(map, x, y) {
  if(map[y] !== undefined && map[y][x] !== undefined) {
    return map[y][x].type;
  }
  return -1;
}

/**
 * Get adjacent tiles of the same type of a given tile (Only for path tiles)
 * @param {Tile[][]} map 2D Tilemap
 * @param {number} x the x-value
 * @param {number} y the y-value
 * @returns {Tile[]} Array of adjacent same-type tiles
 */
function getSameTileConnections(map, x, y) {
  let startX = (x > 0) ? x-1 : x;
  let startY = (y > 0) ? y-1 : y;
  let endX = (x < map[0].length) ? x+1 : x;
  let endY = (y < map[0].length) ? y+1 : y;

  let connections = [];
  let tile = getTileType(map, x, y);
  if(tile === "E" || tile === "S") {
    tile="P";
  }
  for(let i = startY; i <= endY; i++) {
    for(let j = startX; j <= endX; j++) {
      if(getTileType(map, j, i) == tile && !(x === j && y === i)) {
        connections.push([j, i]);
      } else if(tile === "P") {
        if(getTileType(map, j, i) == "E" || getTileType(map, j, i) == "S") {
          connections.push([j, i]);
        }
      }
    }
  }
  return connections;
}

/**
 * Get adjacent tiles of the same type of a given tile (all tile types)
 * @param {Tile[][]} map 2D Tilemap
 * @param {number} x the x-value
 * @param {number} y the y-value
 * @returns {Tile[]} Array of adjacent same-type tiles
 */
function getSameTileConnections2(map, x, y) {
  let startX = (x > 0) ? x-1 : x;
  let startY = (y > 0) ? y-1 : y;
  let endX = (x < map[0].length) ? x+1 : x;
  let endY = (y < map[0].length) ? y+1 : y;

  let connections = [];
  let tile = getTileType(map, x, y);

  for(let i = startY; i <= endY; i++) {
    for(let j = startX; j <= endX; j++) {
      if(getTileType(map, j, i) == tile && !(x === j && y === i)) {
        connections.push([j, i]);
      }
    }
  }
  return connections;
}

/**
 * Gets adjacent path tiles to a given point
 * @param {Tile[][]} map 2D Tilemap
 * @param {number} x the x-value
 * @param {number} y the y-value
 * @returns {Tile[]} array of adjacent path tiles
 */
function getNeighboringPathTiles(map, x, y) {
  let w = [[-1, 0], [1, 0], [0, -1], [0, 1]];
  let tmpArr = [];
  for(let a of w) {
    let t = getTile(map, x+a[0], y+a[1]);
    if(["P", "E"].indexOf(t.type) > -1) {
      tmpArr.push(t);
    }
  }
  return tmpArr;
}

/**
 * Get a list of adjacent path tiles vertically
 * @param {Tile[][]} map 2D Tilemap
 * @param {number} x the x-value
 * @param {number} y the y-value
 * @returns {Tile[]} Array of vertically adjacent same-tile connections
 */
function getVerticalConnections(map, x, y) {
  let connections = getSameTileConnections(map, x, y);
  let vert_connections = [];
  for(let i = 0; i < connections.length; i++) {
    if(x === connections[i][0]) {
      vert_connections.push(connections[i])
    }
  }
  return vert_connections;
}

/**
 * Get a list of adjacent path tiles horizontally
 * @param {Tile[][]} map 2D Tilemap
 * @param {number} x the x-value
 * @param {number} y the y-value
 * @returns {Tile[]} Array of horizontally adjacent same-tile connections
 */
function getHorizontalConnections(map, x, y) {
  let connections = getSameTileConnections(map, x, y);
  let horizontal_connections = [];
  for(let i = 0; i < connections.length; i++) {
    if(y === connections[i][1]) {
      horizontal_connections.push(connections[i])
    }
  }
  return horizontal_connections;
}

/**
 * Get the first adjacent empty tile
 * @param {*} map 2D Tilemap
 * @param {*} x the x-value
 * @param {*} y the y-value
 * @returns {number[]|boolean} Tile coordinates or false
 */
function getAdjacentEmptyTile(map, x, y) {
  let startX = (x > 0) ? x-1 : x;
  let startY = (y > 0) ? y-1 : y;
  let endX = (x < map[0].length) ? x+1 : x;
  let endY = (y < map[0].length) ? y+1 : y;

  for(let i = startY; i <= endY; i++) {
    for(let j = startX; j <= endX; j++) {
      if(getTileType(map, j, i) === "G") {
        return [j, i];
      }
    }
  }
  return false;
}

/**
 * Get the nearest adjacent empty tile but return coords relative to the given point
 * @param {*} map 2D Tilemap
 * @param {*} x the x-value
 * @param {*} y the y-value
 * @returns {number[]|boolean} Relative tile coordinates or false
 */
function getAdjacentEmptyTileRelative(map, x, y) {
  let startX = (x > 0) ? x-1 : x;
  let startY = (y > 0) ? y-1 : y;
  let endX = (x < map[0].length) ? x+1 : x;
  let endY = (y < map[0].length) ? y+1 : y;

  for(let i = startY; i <= endY; i++) {
    for(let j = startX; j <= endX; j++) {
      if(getTileType(map, j, i) === "G") {
        return [j-x, i-y];
      }
    }
  }
  return false;
}

/**
 * Get array of tiles with given type
 * @param {*} map 2D Tilemap
 * @param {*} t Tile type
 * @returns {Tile[]} Array of tiles with given type
 */
function getTilesOfType(map, t) {
  let tiles = [];
  for(let i = 0; i < map.length; i++) {
    for(let j = 0; j < map[i].length; j++) {
      if(getTile(map, j, i).type === t) {
        tiles.push(getTile(map, j, i));
      }
    }
  }
  return tiles;
}

/**
 * Given a map, start, and end, calculate a workable path for ground enemies.
 * @param {Tile[][]} map 2D Tilemap
 * @param {Tile} startPos Tile to begin path
 * @param {Tile} goal Tile to end path
 * @returns {Tile[]} path from startPos to goal
 */
function createEnemyPath(map, startPos, goal) {
  for(let i = 0; i < map.length; i++) {
    for(let j = 0; j < map[i].length; j++) {
      map[i][j].discovered = false;
      map[i][j].prev = false;
    }
  }
  let enemyPath = [];
  let queue = [startPos];
  while(queue.length > 0) {
    let u = queue.shift();
    if((u.tileX === goal.tileX) && (u.tileY === goal.tileY)) {
      let p = [u];
      while(u.prev) {
        p.push(u.prev);
        u = u.prev;
      }

      enemyPath = p.reverse();
    }

    let neighbors = getNeighboringPathTiles(map, u.tileX, u.tileY);
    neighbors = neighbors.filter((a) => {return !(a.discovered)});
    for(let neighbor of neighbors) {
      neighbor.prev = u;
      neighbor.discovered = true;
      queue.push(neighbor);
    }
  }
  return enemyPath;
}

/**
 * Simple manhattan distance heuristic
 * @param {Object} t1 - the first point to check
 * @param {number} t1.x - t1's x value
 * @param {number} t1.y - t1's y value
 * @param {Object} t2 - the second point to check
 * @param {number} t2.x - t2's x value
 * @param {number} t2.y - t2's y value
 * @returns {number} - manhattan distance between two points
 */
function h(t1, t2) {
  let distX = Math.abs(t1.x - t2.x);
  let distY = Math.abs(t1.y - t2.y);

  return distX+distY;
}

/**
 * Check if tile is in a set of tiles
 * @param {Tile} tile The tile to look for 
 * @param {Tile[]} tileset The tileset to check
 * @returns {boolean} True if found, false if not
 */
function tileInSet(tile, tileset) {
  for(let t of tileset) {
    if(t.x === tile.x && t.y === tile.y) {
      return true;
    }
  }
  return false;
}

/**
 * Runs a phaser animation on a sprite
 * @param {Phaser.Sprite} sprite The sprite to run animation on
 * @param {*} tween The tween to run on the sprite
 * @param {*} animation  The animation to run on the sprite
 */
function runAnimation(sprite, tween, animation) {
  sprite.play(animation);
  sprite.on("animationcomplete", () => {
    sprite.destroy();
  })
}

/**
 * Removes all tower radius displays from the current map
 * @param {Tile[][]} map the map to remove radius displays from
 */
function clearAllRangeCircles(map) {
  for(let i = 0; i < map.length; i++) {
    for(let j = 0; j < map[i].length; j++) {
      let tmp_tile = getTile(map, j, i);
      if(tmp_tile.tower) {
        tmp_tile.tower.circle_image.alpha = 0;
      }
    }
  }
}

/**
 * Pauses the game
 */
function pause() {
  paused = true;
}

/**
 * Plays the game
 */
function play() {
  paused = false;
}

/**
 * Simple linear interpolation
 * @param {number} a first number
 * @param {number} b second number
 * @param {number} x percentage to interpolate by
 * @returns {number} next value by percentage
 */
function lerp(a, b, x) {
  return a + ((b-a)*x);
}

/**
 * Gets the closest mutliple of x to n
 * @param {number} n number to find nearest multiple from 
 * @param {number} x multiple of 
 * @returns {number} the nearest multiple to n of x
 */
function closestMultiple(n, x) {
  if(x > n) { return x;}
  n += parseInt(x / 2, 10);
  n -= (n % x);
  return n;
}

/**
 * Adds a percentage of a number to the number
 * @param {number} n number to add percentage to 
 * @param {number} p percentage to add 
 * @returns {number} n + p% of n
 */
function addPercentToNumber(n, p) {
  return Math.floor(n * (1+(p/100)));
}

/**
 * Gives player money
 * @param {number} n amount of money 
 */
function giveplayermoney(n) {
  //temporary
  currentLevel.player.takeMoney(-n);
}

/**
 * Gets a setting value from localStorage
 * @param {string} setting the setting to get value of 
 * @returns {string} the value of the setting
 */
function getSettingValue(setting) {
  return localStorage.getItem(setting);
}
