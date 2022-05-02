class Soldier extends PathEnemy {
  constructor(scene, x, y, t, path) {
    let soldierTypes = {1: {img: 244, speed: 1, value: 10, health: 4}, 2: {img: 245, speed: 2, value: 20, health: 6}, 3: {img: 246, speed: 4, value: 40, health: 12}, 4: {img: 247, speed: 8, value: 80, health: 16}};
    super(scene, x, y, t, soldierTypes[t]["speed"], soldierTypes[t]["img"], soldierTypes[t]["value"], soldierTypes[t]["health"], path);
  }
}