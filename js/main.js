let config = {
  type: Phaser.AUTO,
  width: 1600,
  height: 800,
  scene: [TitleScreen, Level],
  physics: {
    default: 'arcade',
    arcade: {
      debug: true,
      gravity: { y: 0 },
    }
  }
}

let tileFrameNames;
let currentLevel;

let paused = false;

let RIGHT_TOWER_UI_PANEL;
let LOWER_STATS_UI_PANEL;

let towerShopCards = [];

let theme = "grass/stone";

let game = new Phaser.Game(config);