function degrees_to_radians(degrees) {
  return degrees * (Math.PI / 180);
}

function radians_to_degrees(radians) {
  return radians * (180 / Math.PI);
}

function getKeyByValue(object, value) {
  return Object.keys(object).find(key => object[key] === value);
}

function removeDuplicates(arr) {
  let tmpArr = [];

  for(let element of arr) {
    if(!tmpArr.includes(element)) {
      tmpArr.push(element);
    }
  }
  return tmpArr;
}

function getTile(map, x, y) {
  if(map[y] !== undefined && map[y][x] !== undefined) {
    return map[y][x];
  }
  return -1;
}

function getTileType(map, x, y) {
  if(map[y] !== undefined && map[y][x] !== undefined) {
    return map[y][x].type;
  }
  return -1;
}

function getTileCoords(map, x, y) {
  if(map[y] !== undefined && map[y][x] !== undefined) {
    return [map[y][x].x, map[y][x].y];
  }
  return -1;
}

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
}

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
}

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

function h(t1, t2) {
  let distX = Math.abs(t1.x - t2.x);
  let distY = Math.abs(t1.y - t2.y);

  return distX+distY;
}

function tileInSet(tile, tileset) {
  for(let t of tileset) {
    if(t.x === tile.x && t.y === tile.y) {
      return true;
    }
  }
  return false;
}

function runAnimation(sprite, tween, animation) {
  sprite.play(animation);
  sprite.on("animationcomplete", () => {
    sprite.destroy();
  })
}

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



function pause() {
  paused = true;
}

function play() {
  paused = false;
}

function lerp(a, b, x) {
  return a + ((b-a)*x);
}

function closestMultiple(n, x) {
  if(x > n) { return x;}
  n += parseInt(x / 2, 10);
  n -= (n % x);
  return n;
}

function addPercentToNumber(n, p) {
  return Math.floor(n * (1+(p/100)));
}

function giveplayermoney(n) {
  //temporary
  currentLevel.player.takeMoney(-n);
}

function getSettingValue(setting) {
  return localStorage.getItem(setting);
}
