/**
 * Returns 5 random points between 0-dimension[n]
 *
 * @param {number} dimensions The dimensions of the grid.
 * @returns {number} 5 random points between [(0, dimensions[0]), (0, dimensions[1])].
 */
function genRandomPoints(dimensions) {
  let random_points = [[Math.floor(Math.random() * 4) + 3, Math.max(2, Math.floor(Math.random() * dimensions[1])-1)]];
  for(let i = 1; i < 5; i++) {
    let point = [((i+1) * 4)-1, Math.max(i*2, Math.floor(Math.random() * dimensions[1])-1)];
    random_points.push(point);
  }
  return random_points
}
/**
 * Creates a 2d tile array with a 2x2 path.
 * @param {number} difficulty The difficulty of the requested level 
 * @returns {ProcGenPoint[][]} 2d tile array
 */
function generateLevel(difficulty) {
  let dimensions = [20, 12];
  random_points=genRandomPoints(dimensions);

  let startPoint=addPointAdjacentToPoint([0, Math.floor(Math.random() * 6)]);
  let endPoint=addPointAdjacentToPoint([19, Math.floor(Math.random() * 6) + 6]);
  let pathNodes = random_points.map((a) => {return addPointAdjacentToPoint(a)});

  let m = [];
  let pointMap = [];
  for(let i = 0; i < dimensions[1]; i++) {
    m.push([]);
    pointMap.push([]);
    for(let j =0; j < dimensions[0]; j++) {
      pointMap[i].push(new ProcGenPoint(j, i));
      if(startPoint.some((a) => {return (a[0] === j && a[1] === i)})) {
        m[i].push("S");
      } else if(endPoint.some((a) => {return (a[0] === j && a[1] === i)})) {
        m[i].push("E");
      } else if(pathNodes.some((a) => {return (a[0][0] === j && a[0][1] === i) || (a[1][0] === j && a[1][1] === i)})) {
        m[i].push("P");
      } else {
        m[i].push("G");
      }
    }
  }

  let sumPath = [startPoint[0]];
  while(pathNodes.length > 0) {
    let x = pathNodes.shift();
    sumPath = sumPath.concat(procGenBfs(pointMap, sumPath[sumPath.length-1], x[0]));
    unExploreMap(pointMap);
  }
  sumPath = sumPath.concat(procGenBfs(pointMap, sumPath[sumPath.length-1], endPoint[0]))
  sumPath = sumPath.filter(((v,i,a)=>a.findIndex(v2=>(v2.x===v.x) && (v2.y===v.y))===i))
  for(let i = 0; i < sumPath.length; i++) {
    m[sumPath[i].y][sumPath[i].x] = "P";
  }

  let pad = padPath(m, sumPath, sumPath[0], pointMap);
  if(typeof pad == "undefined") {
    return generateLevel(difficulty);
  }
  return m;
}

/**
 * Get point at (x, y) from Tile array map.
 * @param {Tile[][]} map the map to find the tile in
 * @param {number} x the x coordinate of the tile
 * @param {number} y the y coordinate of the tile
 * @returns {Tile} Tile at specified location in specified map
 */
function getPoint(map, x, y) {
  if(map[y] && map[y][x]) {
    return map[y][x];
  }
}

/**
 * Extend a 1x1 path into a 2x2 path, required for game to render path 
 * @param {string[][]} map first map, contains tiles as strings (what will eventually be returned) 
 * @param {ProcGenPoint[]} path the 1x1 path that has been created by genRandomLevel()
 * @param {ProcGenPoint} start start location of path
 * @param {ProcGenPoint[][]} map2 same as first map, but instead of strings the tiles are stored as Tile objects.
 * @returns {boolean} true or undefined, depending on success.
 */
function padPath(map, path, start, map2) {
  let turns = [];
  let pathSegmentDirections = [];
  let turnDirections = [];
  let currPoint = getNextTurn(path, start);
  pathSegmentDirections.push(getPathSegmentDirection(start, currPoint));
  turnDirections.push(getTurnDirection(currPoint, path));
  turns.push(currPoint);

  let nextPoint = 1;
  while(nextPoint) {
    nextPoint = getNextTurn(path, path[path.indexOf(currPoint)+1]);
    if(nextPoint) {
      turnDirections.push(getTurnDirection(nextPoint, path));
      turns.push(nextPoint);
      pathSegmentDirections.push(getPathSegmentDirection(currPoint, nextPoint));
      currPoint=nextPoint;
    } else {
      pathSegmentDirections.push(getPathSegmentDirection(currPoint, path[path.length-1]));
    }
  }
  let paddedPoints = [];
  if(pathSegmentDirections[0] === "Horizontal") {
    if(turnDirections[0] === "Down") {
      let nextPathTile = getNextHorizontalPathTile(map2, path, getPoint(map2, start.x, start.y+1), 1, turns[0]);
      for(let i = start.x; i <= nextPathTile.x-1; i++) {
        paddedPoints.push(getPoint(map2, i, start.y+1));
      }
    } else {
      let nextPathTile = getNextHorizontalPathTile(map2, path, getPoint(map2, start.x, start.y-1), 1, turns[0]);
      for(let i = start.x; i <= nextPathTile.x-1; i++) {
        paddedPoints.push(getPoint(map2, i, start.y-1));
      }
    }
  }

  turns.shift();
  turnDirections.shift();
  pathSegmentDirections.shift();
  let specialPadDisplay = [];
  for(let i = 0; i < turns.length-1; i++) {
    let pathDir = pathSegmentDirections.shift();
    let currPoint = paddedPoints[paddedPoints.length-1];
    let turnDir = turnDirections.shift();
    specialPadDisplay.push([currPoint, turnDir, pathDir]);


    if(pathDir === "Vertical") {
      let nextTurn = turns[i+1];
      if(nextTurn.y > currPoint.y) {
        let nextPathTile = getNextVerticalPathTile(map2, path, currPoint, 1, nextTurn);
        if(map[currPoint.y+1][currPoint.x]==="G") {
          map[currPoint.y+1][currPoint.x]="P";
        }
        if(nextPathTile) {
          if(map[currPoint.y+1][currPoint.x-1]==="G") {
            map[currPoint.y+1][currPoint.x-1]="P";
          }
          if(map[currPoint.y][currPoint.x+2]==="G") {
            map[currPoint.y][currPoint.x+2]="P";
          }
          // if(map[currPoint.y+1][currPoint.x]==="G") {
            // map[currPoint.y+1][currPoint.x]="P";
          // }
          // if(map[currPoint.y][currPoint.x+1]==="G") {
          //   map[currPoint.y][currPoint.x+1]="P";
          // }
          for(let j = currPoint.y; j <= nextTurn.y-1; j++) {
            paddedPoints.push(getPoint(map2, currPoint.x, j));
          }
        } else {
          if(map[currPoint.y+1][currPoint.x]==="G") {
            map[currPoint.y+1][currPoint.x]="P";
          }
          for(let j = currPoint.y; j <= nextTurn.y+1; j++) {
            paddedPoints.push(getPoint(map2, currPoint.x, j));
          }
        }
      } else {
        let nextPathTile = getNextVerticalPathTile(map2, path, currPoint, -1, nextTurn);
        if(nextPathTile) {
          if(map[currPoint.y-1][currPoint.x-1]==="G") {
            map[currPoint.y-1][currPoint.x-1]="P";
          }
          for(let j = currPoint.y; j >= nextTurn.y+1; j--) {
            paddedPoints.push(getPoint(map2, currPoint.x, j));
          }
        } else {
          if(map[currPoint.y-1][currPoint.x]==="G") {
            map[currPoint.y-1][currPoint.x]="P";
          }
          for(let j = currPoint.y; j >= nextTurn.y-1; j--) {
            paddedPoints.push(getPoint(map2, currPoint.x, j));
          }
        }
      }
    } else {
      let nextTurn = turns[i+1];
      if(nextTurn.x > currPoint.x) {
        let nextPathTile = getNextHorizontalPathTile(map2, path, currPoint, 1, nextTurn);
        if(nextPathTile) {
          if(map[currPoint.y][currPoint.x+1]==="G") {
            map[currPoint.y][currPoint.x+1]="P";
          }
          for(let j = currPoint.x; j <= nextTurn.x-1; j++) {
            paddedPoints.push(getPoint(map2, j, currPoint.y));
          }
        } else {
          if(map[currPoint.y][currPoint.x+1]==="G") {
            map[currPoint.y][currPoint.x+1]="P";
          }
          for(let j = currPoint.x; j <= nextTurn.x+1; j++) {
            paddedPoints.push(getPoint(map2, j, currPoint.y));
          }
        }
      } else {
        let nextPathTile = getNextHorizontalPathTile(map2, path, currPoint, -1, nextTurn);
        if(nextPathTile) {
          if(map[currPoint.y-1][currPoint.x-1]==="G") {
            map[currPoint.y][currPoint.x-1]="P";
          }
          for(let j = currPoint.x; j >= nextTurn.x+1; j--) {
            paddedPoints.push(getPoint(map2, j, currPoint.y));
          }
        } else {
          if(map[currPoint.y][currPoint.x-1]==="G") {
            map[currPoint.y][currPoint.x-1]="P";
          }
          for(let j = currPoint.x; j >= nextTurn.x-1; j--) {
            paddedPoints.push(getPoint(map2, j, currPoint.y));
          }
        }
      }
    }
  }
  for(let j = paddedPoints[paddedPoints.length-1].x; j < 20; j++) {
    paddedPoints.push(getPoint(map2, j, paddedPoints[paddedPoints.length-1].y));
  }

  let tmpMap = [];
  for(let i = 0; i < map.length; i++) {
    tmpMap.push([]);
    for(let j = 0; j < map[i].length;j++) {
      tmpMap[i].push(map[i][j]);
    }
  }
  for(let point of paddedPoints) {
    map[point.y][point.x]="P";
  }
  for(let i = 0; i < map.length; i++) {
    if(map[i][18] === "P") {
      map[i][19] = "E";
    } else {
      map[i][19] = "G";
    }
    if(map[i][0] === "P") {
      map[i][0] = "S";
    }
  }
  for(let point of specialPadDisplay) {
    tmpMap[point[0].y][point[0].x]="C"+point[1]+point[2];
  }
  return true;
}
/**
 * finds and returns the next path tile in a horizontal line from a given tile
 * @param {ProcGenPoint[][]} map 2d tile array 
 * @param {ProcGenPoint[]} path currently calculated path in order
 * @param {ProcGenPoint} start location to begin search
 * @param {number} direction left or right (-1, 1)
 * @param {ProcGenPoint} nextTurn tile location of the next turn
 * @returns {ProcGenPoint|boolean} false if no tile found, Tile if found
 */
function getNextHorizontalPathTile(map, path, start, direction, nextTurn) {
  if(direction === 1) {
    for(let i = start.x; i <= nextTurn.x; i++) {
      if(path.indexOf(map[start.y][i]) > -1) {
        return map[start.y][i];
      }
    }
  } else {
    for(let i = start.x; i >= nextTurn.x; i--) {
      if(path.indexOf(map[start.y][i]) > -1) {
        return map[start.y][i];
      }
    }
  }
  return false;
}

/**
 * finds and returns the next path tile in a vertical line from a given tile
 * @param {ProcGenPoint[][]} map 2d tile array 
 * @param {ProcGenPoint[]} path currently calculated path in order
 * @param {ProcGenPoint} start location to begin search
 * @param {number} direction up or down (-1, 1)
 * @param {ProcGenPoint} nextTurn tile location of the next turn
 * @returns {ProcGenPoint|false} false if no tile found, Tile if found
 */
function getNextVerticalPathTile(map, path, start, direction, nextTurn) {
  if(direction === 1) {
    for(let i = start.y; i <= nextTurn.y; i++) {
      if(path.indexOf(map[i][start.x]) > -1) {
        return map[i][start.x];
      }
    }
  } else {
    for(let i = start.y; i >= nextTurn.y; i--) {
      if(path.indexOf(map[i][start.x]) > -1) {
        return map[i][start.x];
      }
    }
  }
}

/**
 * Gets the direction of a path segment
 * @param {ProcGenPoint} start Tile to start segment from
 * @param {ProcGenPoint} end Tile to end segment on
 * @returns {string} "Horizontal" or "Vertical"
 */
function getPathSegmentDirection(start, end) {
  if(Math.abs(start.x-end.x)>=1) {
    return "Horizontal";
  } else {
    return "Vertical";
  }
}

/**
 * Get the direction of a given turn
 * @param {ProcGenPoint} point turn to check direction of
 * @param {ProcGenPoint} path path in order
 * @returns {string} up, right, down, or left depending on next tile's location.
 */
function getTurnDirection(point, path) {
  let next = path[path.indexOf(point)+1];
  if(next.x > point.x) {
    return "Right";
  } else if(next.x < point.x) {
    return "Left";
  } else if(next.y > point.y) {
    return "Down";
  } else {
    return "Up";
  }
}

/**
 * Gets the location of the next turn from a given point.
 * @param {ProcGenPoint[]} path the current path of the level
 * @param {ProcGenPoint} point the point to begin searching from
 * @returns {ProcGenPoint|boolean} the next turn Tile if found, else false
 */
function getNextTurn(path, point) {
  let prevX;
  let prevY;
  if(path.indexOf(point) > 0) {
    prevX = path[path.indexOf(point)-1].x;
    prevY = path[path.indexOf(point)-1].y;
  } else {
    prevX = point.x;
    prevY = point.y;
  }
  
  for(let i = path.indexOf(point); i < path.length-1; i++) {
    if(i > 0) {
      if(Math.abs(prevX - path[i+1].x) >= 1 && Math.abs(prevY - path[i+1].y) >= 1) {
        return path[i];
      }
      prevX = path[i-1].x
      prevY = path[i-1].y;
    } else {
      prevX = point.x;
      prevY = point.y;
    }
  }
  return false;
}

/**
 * Check if Tile is in a given list based on x/y
 * @param {ProcGenPoint} point point to check existence of
 * @param {ProcGenPoint[]} list list to check for point
 * @returns {boolean} true if located, false otherwise
 */
function pointInList(point, list) {
  for(let tmpPoint of list) {
    if(tmpPoint.x == point.x && tmpPoint.y == point.y) {
      return true;
    }
  }
  return false;
}

/**
 * Does a breadth first search to find shortest path between two given points
 * @param {ProcGenPoint[][]} map 2D tile map
 * @param {ProcGenPoint} start tile to begin search
 * @param {ProcGenPoint} end tile to end search upon finding
 * @returns {ProcGenPoint[]|boolean} Tile array path if possible, else false
 */
function procGenBfs(map, start, end) {
  let p = [start];
  p[0].explored=true;
  p[0].prev=false;
  while(p.length > 0) {
    let n = p.pop();
    if((n.x == end.x && n.y == end.y)) {
      let fp = [n];
      while(n.prev) {
        fp.push(n.prev);
        n = n.prev;
      }
      return fp.reverse();
    }
    let adj = procGenGetAdjacentTiles(map, n);
    let newAdj = adj.filter((a) => {return !(a.isExplored())});
    for(let point of newAdj) {
      point.prev=n;
      point.setExplored();
      p.unshift(point);
    }
  }
  return false;
}

/**
 * Sets all tiles' explored value to false in a given map
 * @param {ProcGenPoint[][]} map 2D Tilemap
 */
function unExploreMap(map) {
  for(let i = 0; i < map.length; i++) {
    for(let j = 0; j < map[i].length; j++) {
      map[i][j].explored=false;
    }
  }
}

const THEME_KEY = {
  "dirt/grass": {"startLeft": 2, "startRight": 3, "endLeft": 25, "endRight": 26, "verticalLeft": 24, "verticalRight": 22, "horizontalTop": 46, "horizontalBottom": 0, "ground": [23, 161, 156], "insideTopRight": 45, "insideBottomLeft": 1, "insideBottomRight": 298, "insideTopLeft": 47, "outsideBottomRight": 26, "outsideBottomLeft": 25, "outsideTopLeft": 2, "outsideTopRight": 3},
  "dirt/sand": {"startLeft": 7, "startRight": 8, "endLeft": 30, "endRight": 31, "verticalLeft": 29, "verticalRight": 27, "horizontalTop": 51, "horizontalBottom": 5, "ground": [28, 97, 159, 240], "insideTopRight": 50, "insideBottomLeft": 6, "insideBottomRight": 4, "insideTopLeft": 52, "outsideBottomRight": 31, "outsideBottomLeft": 30, "outsideTopLeft": 7, "outsideTopRight": 8},
  "dirt/stone": {"startLeft": 12, "startRight": 13, "endLeft": 35, "endRight": 36, "verticalLeft": 34, "verticalRight": 32, "horizontalTop": 56, "horizontalBottom": 10, "ground": [102, 158, 171], "insideTopRight": 55, "insideBottomLeft": 11, "insideBottomRight": 9, "insideTopLeft": 57, "outsideBottomRight": 36, "outsideBottomLeft": 35, "outsideTopLeft": 12, "outsideTopRight": 13},
  "grass/dirt": {"startLeft": 71, "startRight": 72, "endLeft": 94, "endRight": 95, "verticalLeft": 93, "verticalRight": 91, "horizontalTop": 115, "horizontalBottom": 69, "ground": [92, 235, 166, 157], "insideTopRight": 114, "insideBottomLeft": 70, "insideBottomRight": 68, "insideTopLeft": 116, "outsideBottomRight": 95, "outsideBottomLeft": 94, "outsideTopLeft": 71, "outsideTopRight": 72},
  "grass/sand": {"startLeft": 76, "startRight": 77, "endLeft": 99, "endRight": 100, "verticalLeft": 98, "verticalRight": 96, "horizontalTop": 120, "horizontalBottom": 74, "ground": [28, 97, 159, 240], "insideTopRight": 119, "insideBottomLeft": 75, "insideBottomRight": 73, "insideTopLeft": 121, "outsideBottomRight": 100, "outsideBottomLeft": 99, "outsideTopLeft": 76, "outsideTopRight": 77},
  "grass/stone": {"startLeft": 81, "startRight": 82, "endLeft": 104, "endRight": 105, "verticalLeft": 103, "verticalRight": 101, "horizontalTop": 125, "horizontalBottom": 79, "ground": [102, 158, 171], "insideTopRight": 124, "insideBottomLeft": 80, "insideBottomRight": 78, "insideTopLeft": 126, "outsideBottomRight": 105, "outsideBottomLeft": 104, "outsideTopLeft": 81, "outsideTopRight": 82},
  "sand/grass": {"startLeft": 140, "startRight": 141, "endLeft": 163, "endRight": 164, "verticalLeft": 162, "verticalRight": 160, "horizontalTop": 184, "horizontalBottom": 138, "ground": [23, 161, 156], "insideTopRight": 183, "insideBottomLeft": 139, "insideBottomRight": 137, "insideTopLeft": 185, "outsideBottomRight": 164, "outsideBottomLeft": 163, "outsideTopLeft": 140, "outsideTopRight": 141},
  "sand/dirt": {"startLeft": 145, "startRight": 146, "endLeft": 168, "endRight": 169, "verticalLeft": 167, "verticalRight": 165, "horizontalTop": 189, "horizontalBottom": 143, "ground": [92, 235, 166, 157], "insideTopRight": 188, "insideBottomLeft": 144, "insideBottomRight": 142, "insideTopLeft": 190, "outsideBottomRight": 169, "outsideBottomLeft": 168, "outsideTopLeft": 145, "outsideTopRight": 146},
  "sand/stone": {"startLeft": 150, "startRight": 151, "endLeft": 173, "endRight": 174, "verticalLeft": 172, "verticalRight": 170, "horizontalTop": 194, "horizontalBottom": 148, "ground": [102, 158, 171], "insideTopRight": 193, "insideBottomLeft": 149, "insideBottomRight": 147, "insideTopLeft": 195, "outsideBottomRight": 174, "outsideBottomLeft": 173, "outsideTopLeft": 150, "outsideTopRight": 151},
  "stone/grass": {"startLeft": 209, "startRight": 210, "endLeft": 232, "endRight": 233, "verticalLeft": 231, "verticalRight": 229, "horizontalTop": 253, "horizontalBottom": 207, "ground": [23, 161, 156], "insideTopRight": 252, "insideBottomLeft": 208, "insideBottomRight": 206, "insideTopLeft": 254, "outsideBottomRight": 233, "outsideBottomLeft": 232, "outsideTopLeft": 209, "outsideTopRight": 210},
  "stone/dirt": {"startLeft": 214, "startRight": 215, "endLeft": 237, "endRight": 238, "verticalLeft": 236, "verticalRight": 234, "horizontalTop": 258, "horizontalBottom": 212, "ground": [92, 235, 166, 157], "insideTopRight": 257, "insideBottomLeft": 213, "insideBottomRight": 211, "insideTopLeft": 259, "outsideBottomRight": 238, "outsideBottomLeft": 237, "outsideTopLeft": 214, "outsideTopRight": 215},
  "stone/sand": {"startLeft": 219, "startRight": 220, "endLeft": 242, "endRight": 243, "verticalLeft": 241, "verticalRight": 239, "horizontalTop": 263, "horizontalBottom": 217, "ground": [28, 97, 159, 240], "insideTopRight": 262, "insideBottomLeft": 218, "insideBottomRight": 216, "insideTopLeft": 264, "outsideBottomRight": 243, "outsideBottomLeft": 242, "outsideTopLeft": 219, "outsideTopRight": 220},
}

/**
 * Creates a new point adjacent to a given point in a random location
 * @param {ProcGenPoint} point given point to add random adjacent point to 
 * @returns {ProcGenPoint[]} 2-length array of adjacent ProcGenPoints
 */
function addPointAdjacentToPoint(point) {
  let dimensions = [20, 12];
  let perm = [[1, 0], [-1, 0], [0, 1], [0, -1]];

  let newPoint = new ProcGenPoint(-1, -1);

  while(newPoint.x < 0 || newPoint.x >= dimensions[0] || newPoint.y < 0 || newPoint.y >= dimensions[1]) {
    let rand_perm = perm[Math.floor(Math.random() * 4)];
    newPoint.setPos(point[0]+rand_perm[0], point[1]+rand_perm[1]);
  }
  return [new ProcGenPoint(point[0], point[1]), newPoint];
}

/**
 * gets adjacent tiles that exist on a given map at a given point
 * @param {Array.<Array.<ProcGenPoint>>} map 2D Tile map
 * @param {ProcGenPoint} point point to find adjacent tiles of
 * @returns {ProcGenPoint[]} adjacent tiles or empty array
 */
function procGenGetAdjacentTiles(map, point) {
  let adjacent_points = [];
  let w = [[-1, 0], [1, 0], [0, -1], [0, 1]];
  for(let a of w) {
    let aX = point.x+a[0];
    let aY = point.y+a[1];
    if(map[aY]!== undefined && map[aY][aX] !== undefined) {
      adjacent_points.push(map[aY][aX]);
    }
  }
  return adjacent_points;
}
/** Class representing a point only used for procedural generation */
class ProcGenPoint {
  /**
   * Create a new procedural generation point
   * @param {number} x point's x-value
   * @param {number} y point's y-value
   */
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.prev;
    this.explored=false;
  }

  /**
   * Checks if x and y are equal to a given point
   * @param {ProcGenPoint} point point to check against 
   * @returns {boolean} true if equal, false otherwise
   */
  equalsPoint(point) {
    return ((this.x == point.x) && (this.y == point.y));
  }

  /**
   * Sets the x and y position of point
   * @param {number} x the x-value
   * @param {number} y the y-value
   */
  setPos(x, y) {
    this.setX(x);
    this.setY(y);
  }

  /**
   * Sets x position of point
   * @param {number} x the x-value
   */
  setX(x) {
    this.x=x;
  }

  /**
   * Sets y position of point
   * @param {number} y the y-value
   */
  setY(y) {
    this.y=y;
  }

  /**
   * Sets point's explored value to true
   */
  setExplored() {
    this.explored=true;
  }

  /**
   * Gets point's explored value
   * @returns {boolean} value of point.explored
   */
  isExplored() {
    return this.explored;
  }
}

let DESIGNED_LEVELS = [
  {name: "Level One", index: 0, image_name: "LevelPreview1TEMP", customWaves: false, theme: "stone/grass", difficulty: 1, layout:
  [["G","G", "G", "G", "G", "G", "G", "G", "G", "G", "G","G", "G", "G", "G", "G", "G", "G", "G", "G"],
  ["G","G", "G", "G", "G", "G", "G", "G", "G", "G", "G","G", "G", "G", "G", "G", "G", "G", "G", "G"],
  ["G","S", "P", "P", "P", "P", "P", "P", "P", "P", "P","P", "P", "G", "G", "G", "E", "E", "G", "G"],
  ["G","S", "P", "P", "P", "P", "P", "P", "P", "P", "P","P", "P", "G", "G", "G", "P", "P", "G", "G"],
  ["G","G", "G", "G", "G", "G", "G", "G", "P", "P", "G","P", "P", "G", "G", "G", "P", "P", "G", "G"],
  ["G","G", "G", "G", "G", "G", "G", "G", "P", "P", "G","P", "P", "G", "G", "G", "P", "P", "G", "G"],
  ["G","G", "G", "G", "G", "G", "G", "G", "P", "P", "G","P", "P", "P", "P", "P", "P", "P", "G", "G"],
  ["G","G", "G", "G", "G", "G", "G", "G", "P", "P", "G","P", "P", "P", "P", "P", "P", "P", "G", "G"],
  ["G","S", "P", "P", "P", "P", "P", "P", "P", "P", "G","G", "G", "G", "G", "G", "G", "G", "G", "G"],
  ["G","S", "P", "P", "P", "P", "P", "P", "P", "P", "G","G", "G", "G", "G", "G", "G", "G", "G", "G"],
  ["G","G", "G", "G", "G", "G", "G", "G", "G", "G", "G","G", "G", "G", "G", "G", "G", "G", "G", "G"],
  ["G","G", "G", "G", "G", "G", "G", "G", "G", "G", "G","G", "G", "G", "G", "G", "G", "G", "G", "G"]]},

  {name: "Level Two", index: 1, image_name: "LevelPreview2", customWaves: false, theme: "stone/sand", difficulty: 2, layout:
  [["G","G", "G", "G", "G", "G", "G", "G", "G", "G", "G","G", "G", "G", "G", "G", "G", "G", "G", "G"],
  ["G","S", "S", "G", "G", "S", "S", "G", "G", "G", "G","G", "G", "G", "G", "G", "G", "G", "G", "G"],
  ["G","P", "P", "G", "G", "P", "P", "G", "G", "G", "G","G", "G", "G", "G", "G", "G", "G", "G", "G"],
  ["G","P", "P", "G", "G", "P", "P", "G", "G", "G", "G","G", "G", "G", "G", "G", "G", "G", "G", "G"],
  ["G","P", "P", "G", "G", "P", "P", "G", "G", "G", "G","G", "G", "G", "G", "G", "G", "G", "G", "G"],
  ["G","P", "P", "G", "G", "P", "P", "G", "G", "G", "G","G", "G", "G", "G", "G", "G", "G", "G", "G"],
  ["G","P", "P", "G", "G", "P", "P", "G", "G", "G", "G","G", "G", "G", "G", "G", "G", "G", "G", "G"],
  ["G","P", "P", "G", "G", "P", "P", "G", "G", "G", "G","G", "G", "G", "G", "G", "G", "G", "G", "G"],
  ["G","P", "P", "G", "G", "P", "P", "G", "G", "G", "G","G", "G", "G", "G", "G", "G", "G", "G", "G"],
  ["G","P", "P", "P", "P", "P", "P", "P", "P", "P", "P","P", "P", "P", "P", "P", "P", "P", "E", "G"],
  ["G","P", "P", "P", "P", "P", "P", "P", "P", "P", "P","P", "P", "P", "P", "P", "P", "P", "E", "G"],
  ["G","G", "G", "G", "G", "G", "G", "G", "G", "G", "G","G", "G", "G", "G", "G", "G", "G", "G", "G"]]
  },
  {name: "Level Three", index: 2, image_name: "", customWaves: false, theme: "dirt/grass", difficulty: 3, layout:
  [["G","G", "G", "G", "G", "G", "G", "G", "G", "G", "G","G", "G", "G", "G", "G", "G", "G", "G", "G"],
  ["G","P", "P", "P", "P", "P", "P", "P", "P", "P", "P","P", "P", "P", "P", "P", "P", "P", "P", "G"],
  ["G","P", "P", "P", "P", "P", "P", "P", "P", "P", "P","P", "P", "P", "P", "P", "P", "P", "P", "G"],
  ["G","P", "P", "G", "G", "G", "G", "G", "G", "G", "G","G", "G", "G", "G", "G", "G", "P", "P", "G"],
  ["G","P", "P", "G", "G", "G", "G", "G", "G", "G", "G","G", "G", "G", "G", "G", "G", "P", "P", "G"],
  ["G","P", "P", "G", "G", "G", "G", "G", "G", "G", "G","G", "G", "G", "G", "G", "G", "P", "P", "G"],
  ["G","P", "P", "P", "P", "P", "P", "P", "P", "P", "P","P", "P", "P", "P", "E", "G", "P", "P", "G"],
  ["G","P", "P", "P", "P", "P", "P", "P", "P", "P", "P","P", "P", "P", "P", "E", "G", "P", "P", "G"],
  ["G","G", "G", "G", "G", "G", "G", "G", "G", "G", "G","G", "G", "G", "G", "G", "G", "P", "P", "G"],
  ["S","P", "P", "P", "P", "P", "P", "P", "P", "P", "P","P", "P", "P", "P", "P", "P", "P", "P", "G"],
  ["S","P", "P", "P", "P", "P", "P", "P", "P", "P", "P","P", "P", "P", "P", "P", "P", "P", "P", "G"],
  ["G","G", "G", "G", "G", "G", "G", "G", "G", "G", "G","G", "G", "G", "G", "G", "G", "G", "G", "G"]]
  },
  {name: "Level Four", index: 3, image_name: "", customWaves: false, theme: "sand/grass", difficulty: 9, layout:
  [["G","G", "G", "G", "G", "G", "G", "G", "G", "G", "G","G", "G", "G", "G", "G", "G", "G", "G", "G"],
  ["S","S", "G", "G", "G", "G", "E", "E", "G", "G", "G","G", "G", "G", "G", "G", "G", "G", "G", "G"],
  ["P","P", "G", "G", "G", "G", "P", "P", "G", "G", "G","G", "G", "G", "G", "G", "G", "G", "G", "G"],
  ["P","P", "G", "G", "G", "G", "P", "P", "G", "G", "G","G", "G", "G", "G", "G", "G", "G", "G", "G"],
  ["P","P", "G", "G", "G", "G", "P", "P", "G", "G", "G","G", "G", "G", "G", "G", "G", "G", "G", "G"],
  ["P","P", "G", "G", "G", "G", "P", "P", "G", "G", "G","G", "G", "G", "G", "G", "G", "G", "G", "G"],
  ["P","P", "G", "G", "G", "G", "P", "P", "G", "G", "G","G", "G", "G", "G", "G", "G", "G", "G", "G"],
  ["P","P", "G", "G", "G", "G", "P", "P", "G", "G", "G","G", "G", "G", "G", "G", "G", "G", "G", "G"],
  ["P","P", "P", "P", "P", "P", "P", "P", "G", "G", "G","G", "G", "G", "G", "G", "G", "G", "G", "G"],
  ["P","P", "P", "P", "P", "P", "P", "P", "G", "G", "G","G", "G", "G", "G", "G", "G", "G", "G", "G"],
  ["G","G", "G", "G", "G", "G", "G", "G", "G", "G", "G","G", "G", "G", "G", "G", "G", "G", "G", "G"],
  ["G","G", "G", "G", "G", "G", "G", "G", "G", "G", "G","G", "G", "G", "G", "G", "G", "G", "G", "G"]]
  },
  {name: "Level Five", index: 4, image_name: "", customWaves: false, theme: "dirt/stone", difficulty: 5, layout:
  [["G","G", "G", "G", "G", "G", "G", "G", "G", "G", "G","G", "G", "G", "G", "G", "G", "G", "G", "G"],
  ["G","G", "G", "P", "P", "P", "P", "P", "P", "P", "P","P", "P", "P", "P", "P", "P", "P", "P", "S"],
  ["G","G", "G", "P", "P", "P", "P", "P", "P", "P", "P","P", "P", "P", "P", "P", "P", "P", "P", "S"],
  ["G","G", "G", "P", "P", "G", "G", "G", "G", "G", "G","G", "G", "G", "G", "G", "G", "G", "G", "G"],
  ["G","G", "G", "P", "P", "G", "G", "G", "G", "G", "G","G", "G", "G", "G", "G", "G", "G", "G", "G"],
  ["E","P", "P", "P", "P", "G", "G", "G", "G", "G", "G","G", "G", "G", "G", "G", "G", "G", "G", "G"],
  ["E","P", "P", "P", "P", "G", "G", "G", "G", "G", "G","G", "G", "G", "G", "G", "G", "G", "G", "G"],
  ["G","G", "G", "P", "P", "G", "G", "G", "G", "G", "G","G", "G", "G", "G", "G", "G", "G", "G", "G"],
  ["G","G", "G", "P", "P", "G", "G", "G", "G", "G", "G","G", "G", "G", "G", "G", "G", "G", "G", "G"],
  ["G","G", "G", "P", "P", "P", "P", "P", "P", "P", "P","P", "P", "P", "P", "P", "P", "P", "P", "S"],
  ["G","G", "G", "P", "P", "P", "P", "P", "P", "P", "P","P", "P", "P", "P", "P", "P", "P", "P", "S"],
  ["G","G", "G", "G", "G", "G", "G", "G", "G", "G", "G","G", "G", "G", "G", "G", "G", "G", "G", "G"]]
  },
  {name: "Level Six", index: 5, image_name: "", customWaves: false, theme: "grass/stone", difficulty: 6, layout:
  [["G","G", "G", "G", "G", "G", "G", "G", "P", "P", "P","P", "P", "P", "P", "P", "P", "P", "P", "E"],
  ["G","G", "G", "G", "G", "G", "G", "G", "P", "P", "P","P", "P", "P", "P", "P", "P", "P", "P", "E"],
  ["G","G", "G", "G", "G", "G", "G", "G", "P", "P", "G","G", "G", "G", "G", "G", "G", "G", "G", "G"],
  ["G","G", "G", "G", "G", "G", "G", "G", "P", "P", "G","G", "G", "G", "G", "G", "G", "G", "G", "G"],
  ["G","G", "G", "G", "G", "G", "G", "G", "P", "P", "G","G", "G", "G", "G", "G", "G", "G", "G", "G"],
  ["G","G", "G", "G", "G", "G", "G", "G", "P", "P", "G","G", "G", "G", "G", "G", "G", "G", "G", "G"],
  ["G","G", "G", "G", "G", "G", "G", "G", "P", "P", "G","G", "G", "G", "G", "G", "G", "G", "G", "G"],
  ["G","G", "G", "G", "G", "G", "G", "G", "P", "P", "G","G", "G", "G", "G", "G", "G", "G", "G", "G"],
  ["S","P", "P", "P", "P", "P", "P", "P", "P", "P", "P","P", "P", "P", "P", "P", "P", "P", "P", "S"],
  ["S","P", "P", "P", "P", "P", "P", "P", "P", "P", "P","P", "P", "P", "P", "P", "P", "P", "P", "S"],
  ["G","G", "G", "G", "G", "G", "G", "G", "G", "G", "G","G", "G", "G", "G", "G", "G", "G", "G", "G"],
  ["G","G", "G", "G", "G", "G", "G", "G", "G", "G", "G","G", "G", "G", "G", "G", "G", "G", "G", "G"]]
  },
  {name: "Level Seven", index: 6, image_name: "", customWaves: false, theme: "grass/dirt", difficulty: 7, layout:
  [["G","G", "G", "G", "G", "G", "G", "G", "G", "G", "G","G", "G", "G", "G", "G", "G", "G", "G", "G"],
  ["G","G", "G", "G", "G", "G", "G", "G", "G", "G", "G","G", "G", "G", "G", "S", "S", "G", "G", "G"],
  ["G","G", "G", "G", "G", "G", "G", "G", "G", "G", "G","G", "G", "G", "G", "P", "P", "G", "G", "G"],
  ["G","G", "P", "P", "P", "P", "P", "P", "P", "P", "P","P", "P", "P", "P", "P", "P", "G", "G", "G"],
  ["G","G", "P", "P", "P", "P", "P", "P", "P", "P", "P","P", "P", "P", "P", "P", "P", "G", "G", "G"],
  ["G","G", "P", "P", "G", "G", "G", "G", "G", "G", "S","S", "G", "G", "G", "P", "P", "G", "G", "G"],
  ["G","G", "P", "P", "G", "G", "G", "G", "G", "G", "G","G", "G", "G", "G", "S", "S", "G", "G", "G"],
  ["G","G", "P", "P", "G", "G", "G", "G", "G", "G", "G","G", "G", "G", "G", "G", "G", "G", "G", "G"],
  ["G","G", "P", "P", "G", "G", "G", "G", "G", "G", "G","G", "G", "G", "G", "G", "G", "G", "G", "G"],
  ["G","G", "E", "E", "G", "G", "G", "G", "G", "G", "G","G", "G", "G", "G", "G", "G", "G", "G", "G"],
  ["G","G", "G", "G", "G", "G", "G", "G", "G", "G", "G","G", "G", "G", "G", "G", "G", "G", "G", "G"],
  ["G","G", "G", "G", "G", "G", "G", "G", "G", "G", "G","G", "G", "G", "G", "G", "G", "G", "G", "G"]]
  },
  {name: "Level Eight", index: 7, image_name: "", customWaves: false, theme: "stone/grass", difficulty: 8, layout:
  [["G","G", "G", "G", "G", "E", "E", "G", "G", "G", "G","G", "G", "G", "G", "G", "G", "G", "G", "G"],
  ["G","G", "G", "G", "G", "P", "P", "G", "G", "G", "G","G", "G", "G", "G", "G", "G", "G", "G", "G"],
  ["G","G", "G", "G", "G", "P", "P", "P", "P", "P", "P","P", "P", "G", "G", "G", "G", "G", "G", "G"],
  ["G","G", "G", "G", "G", "P", "P", "P", "P", "P", "P","P", "P", "G", "G", "G", "G", "G", "G", "G"],
  ["G","G", "G", "G", "G", "P", "P", "G", "G", "G", "G","P", "P", "G", "G", "G", "G", "G", "G", "G"],
  ["G","G", "G", "G", "G", "P", "P", "G", "G", "G", "G","P", "P", "G", "G", "G", "G", "G", "G", "G"],
  ["G","G", "G", "G", "G", "P", "P", "G", "G", "G", "G","P", "P", "G", "G", "G", "G", "G", "G", "G"],
  ["G","G", "G", "G", "G", "P", "P", "P", "P", "P", "G","P", "P", "G", "G", "G", "G", "G", "G", "G"],
  ["G","G", "G", "G", "G", "P", "P", "P", "P", "P", "G","P", "P", "G", "G", "G", "G", "G", "G", "G"],
  ["G","G", "G", "G", "G", "P", "P", "G", "P", "P", "G","P", "P", "G", "G", "G", "G", "G", "G", "G"],
  ["G","G", "G", "G", "G", "P", "P", "G", "P", "P", "G","P", "P", "G", "G", "G", "G", "G", "G", "G"],
  ["G","G", "G", "G", "G", "S", "S", "G", "S", "S", "G","S", "S", "G", "G", "G", "G", "G", "G", "G"]]
  },
  {name: "Level Nine", index: 8, image_name: "", customWaves: false, theme: "grass/sand", difficulty: 10, layout:
  [["G","G", "G", "G", "G", "G", "G", "G", "G", "G", "G","G", "G", "G", "G", "G", "G", "G", "G", "G"],
  ["S","P", "P", "P", "P", "P", "P", "P", "P", "P", "P","P", "P", "P", "P", "P", "P", "P", "P", "E"],
  ["S","P", "P", "P", "P", "P", "P", "P", "P", "P", "P","P", "P", "P", "P", "P", "P", "P", "P", "E"],
  ["G","G", "G", "G", "G", "G", "G", "G", "G", "G", "G","G", "G", "G", "G", "G", "G", "G", "G", "G"],
  ["S","P", "P", "P", "P", "P", "P", "P", "P", "P", "P","P", "P", "P", "P", "P", "P", "P", "P", "E"],
  ["S","P", "P", "P", "P", "P", "P", "P", "P", "P", "P","P", "P", "P", "P", "P", "P", "P", "P", "E"],
  ["G","G", "G", "G", "G", "G", "G", "G", "G", "G", "G","G", "G", "G", "G", "G", "G", "G", "G", "G"],
  ["S","P", "P", "P", "P", "P", "P", "P", "P", "P", "P","P", "P", "P", "P", "P", "P", "P", "P", "E"],
  ["S","P", "P", "P", "P", "P", "P", "P", "P", "P", "P","P", "P", "P", "P", "P", "P", "P", "P", "E"],
  ["G","G", "G", "G", "G", "G", "G", "G", "G", "G", "G","G", "G", "G", "G", "G", "G", "G", "G", "G"],
  ["S","P", "P", "P", "P", "P", "P", "P", "P", "P", "P","P", "P", "P", "P", "P", "P", "P", "P", "E"],
  ["S","P", "P", "P", "P", "P", "P", "P", "P", "P", "P","P", "P", "P", "P", "P", "P", "P", "P", "E"]]
  },
  {name: "Level Ten", index: 8, image_name: "", customWaves: false, theme: Object.keys(THEME_KEY)[Math.floor(Math.random() * Object.keys(THEME_KEY).length)], difficulty: "???", layout: generateLevel(1)}
]