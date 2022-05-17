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
  },
  scale: {
    parent: "Game",
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_HORIZONTALLY,
    min: {
      width: 800,
      height: 400
    },
    max: {
      width: 1600,
      height: 800
    },
    zoom: 1
  }
}

let tileFrameNames;
let currentLevel;
let titleScreen;

let paused = false;

let RIGHT_TOWER_UI_PANEL;
let LOWER_STATS_UI_PANEL;
let RIGHT_TOWER_UI_BG;

let towerShopCards = [];

let theme = "grass/stone";

let game = new Phaser.Game(config);