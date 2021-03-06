/**
 * A class to represent a level of the game
 * @extends Phaser.Scene
 */
class Level extends Phaser.Scene {
  /**
   * Creates a new Level 
   */
  constructor() {
    super("Level");

    this.currentWave=0;
    this.waveCooldown=1001;
    this.complete = false;

    this.bulletLayer;
    this.tileLayer;
    this.uiLayer;
    this.enemyLayer;
    this.decorationLayer;
    this.spawnerLayer;
    this.towerLayer;

    this.settingsMenuLayer;
    this.settingsMenuActive = false;

    this.feedbackMenuLayer;
    this.feedbackMenuActive=false;

    this.player = new Player();

    this.player_money_text;
    this.pmc=0;
    this.player_lives_text;
    this.player_waves_text;

    this.towerUpgradeElements=[];
    this.selectedTower=-1;

    currentLevel=this; // 4 debugging

    this.enemiesLeft=true;
    this.nextWaveReady=false;

    this.active=false;
    
    this.stats = {waves: 0, kills: 0, money: this.player.money, towers: 0, lives: 0, time: 0};
    this.dead = false;
    this.activeTooltip =  [];
    this.speedModifier = 1;
    this.soundManager = new SoundManager(this);
    
    this.setupLocalStorage();
  }

  setupLocalStorage() {
    let settings = localStorage.getItem("settings");
    if(settings === null) {
      localStorage.setItem('settings', "{\"volume\": 0.25, \"autostart\": false, \"music\": true}");
      console.log('no settings data, setting up defaults');
    }
    this.settings = JSON.parse(localStorage.getItem("settings"));
    let player_data = localStorage.getItem("player_data");
    if(player_data === null) {
      console.log('no player data, setting up defaults');
      localStorage.setItem("player_data", "{\"medals\": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], \"personal_bests\": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]}");
    }
    this.player_data = JSON.parse(localStorage.getItem("player_data"));
    let level_save_data = localStorage.getItem("level_save_data");
    if(level_save_data === null) {
      localStorage.setItem("level_save_data", "{\"levels\": [[{}, {}, {}],[{}, {}, {}], [{}, {}, {}],[{}, {}, {}],[{}, {}, {}],[{}, {}, {}],[{}, {}, {}],[{}, {}, {}],[{}, {}, {}],[{}, {}, {}]]}");
    }
    this.level_save_data = JSON.parse(localStorage.getItem("level_save_data"));
  }

  /**
   * initialize - called at scene.start
   * @param {Object|number} data config object or levelID
   */
  init(data) {
    if(data["regenLevel"]) {
      console.log('resuming/restarting map')
      this.rLevel=true;
      if(data["restart"]) {
        this.restart=true;
      } else {
        this.restart=false;
      }
      this.level_info = JSON.parse(localStorage.getItem("level_save_data"))["levels"][data["levelID"]][data["difficulty"]];
    }
    this.difficulty = data["difficulty"];
    if(typeof data['levelID'] !== "undefined") {
      this.handleConfig(data['levelID']);
    } else {
      this.handleProcGenConfig(data);
    }
    this.resetLevel();
    this.active=true;
  }

  regenLevel(level_info, restart) {
    this.player.lives=level_info['lives'];
    this.player.money=level_info['money'];
    if(!restart) {
      this.currentWave=level_info['wave'];
    }
    for(let decoration of level_info["decorations"]) {
      this.tileMap[Math.floor(decoration['y']/64)][Math.floor(decoration['x']/64)].addDecoration(this.add.sprite(decoration['x'], decoration['y'], "tdtiles", decoration['name']));
    }
    for(let tower of level_info["towers"]) {
      let tower_info = TOWER_TYPES[tower.type];
      let tile = this.tileMap[Math.floor(tower.y/64)][Math.floor(tower.x/64)];
      tile.addTower(this, tower.type, tower.x, tower.y, tower_info["base_img"], tower_info["img"], tower_info["radius"]);
      let t = tile.tower;
      for(let i = 0; i < tower.upgrades[0]; i++) {
        TOWER_UPGRADES[tower.type][0][i]['eff'](t);
        t.upgrade([1, 0]);
        let upgradesToString = t.upgrades[0].toString() + t.upgrades[1].toString();
       t.setTexture("tdtiles", tileFrameNames[TOWER_UPGRADE_IMAGE_PERMUTATIONS[tower.type][upgradesToString]]);
      }
      for(let i = 0; i < tower.upgrades[1]; i++) {
        TOWER_UPGRADES[tower.type][1][i]['eff'](t);
        t.upgrade([0, 1]);
        let upgradesToString = t.upgrades[0].toString() + t.upgrades[1].toString();
       t.setTexture("tdtiles", tileFrameNames[TOWER_UPGRADE_IMAGE_PERMUTATIONS[tower.type][upgradesToString]]);
      }
    }
    this.rLevel=false;
  }

  /**
   * Sets config data for procedurally generated level
   * @param {Object} data config data 
   */
  handleProcGenConfig(data) {
    this.config = Object.assign({}, data);
    let w = [WAVES_EASY, WAVES_MEDIUM, WAVES_HARD][this.difficulty];
    this.waves = assignArrayValue(this.config['customWaves'] || w);
    theme = this.config['theme'];
    this.isProcGen=true;
  }

  /**
   * Generate new level data
   */
  regenProcGenSettings() {
    this.handleProcGenConfig({name: "Level Ten", index: 8, image_name: "", customWaves: false, theme: Object.keys(THEME_KEY)[Math.floor(Math.random() * Object.keys(THEME_KEY).length)], difficulty: "???", layout: generateLevel(1)});
  }

  /**
   * Sets config data for premade level
   * @param {number} levelID The index of the level in DESIGNED_LEVELS [0-8] 
   */
  handleConfig(levelID) {
    this.config = Object.assign({}, DESIGNED_LEVELS[levelID]);
    let w = [WAVES_EASY, WAVES_MEDIUM, WAVES_HARD][this.difficulty];
    this.waves = assignArrayValue(this.config['customWaves'] || w);
    theme = this.config['theme'];
    this.isProcGen=false;
  }

  /**
   * Preloads images, audio, etc. Called when scene created
   */
  preload() {
    this.load.atlas('tdtiles', './res/img/tdtilesheet.png', './res/tdtilesheet.json');
    this.load.atlasXML('explosionanim', './res/img/spritesheet_regularExplosion.png', './res/spritesheet_regularExplosion.xml');
    this.load.atlasXML('genericitems', './res/img/genericItems_spritesheet_colored.png', './res/genericItems_spritesheet_colored.xml');
    this.load.atlas('employees', './res/img/employees.png', './res/employees.json');
    this.load.atlas('spawner', './res/img/spawnersheet.png', './res/spawnersheet.json');
    this.load.atlas('lightning', './res/img/lightning.png', './res/lightning.json');
    this.load.atlas('grenade', './res/img/grenadeanim.png', './res/grenadeanim.json');
    this.load.atlas('windmill', './res/img/windmill.png', './res/windmill.json');
    this.load.atlas('staticexplosion', './res/img/staticexplosion.png', './res/staticexplosion.json');
    this.load.image('RemoveUI', './res/img/RemoveUI.png');
    this.load.image('noUI', './res/img/NO.png');
    this.load.image('okUI', './res/img/OK.png');
    this.load.image("grey_panel", './res/img/grey_panel.png');
    this.load.image("lower_grey_panel", './res/img/grey_lower_panel.png');
    this.load.image("upgrade_button", './res/img/green_button05.png');
    this.load.image('tower_upgrade_panel', './res/img/TowerUpgradePanel.png');
    this.load.image('home-temp', './res/img/home-temp3.png');
    this.load.image('tower0ShopCard', './res/img/Tower0ShopCard.png');
    this.load.image('tower1ShopCard', './res/img/towerShopCard1.png');
    this.load.image('tower2ShopCard', './res/img/towerShopCard2.png');
    this.load.image('tower3ShopCard', './res/img/towerShopCard3.png');
    this.load.image('tower4ShopCard', './res/img/tower4ShopCard.png');
    this.load.image('tower5ShopCard', './res/img/tower5ShopCard.png');
    this.load.image('tower6ShopCard', './res/img/tower6ShopCard.png');
    this.load.image('tower7ShopCard', './res/img/tower7ShopCard.png');
    this.load.image('tower8ShopCard', './res/img/tower8ShopCard.png');
    this.load.image('tower9ShopCard', './res/img/tower9ShopCard.png');
    this.load.image('tower10ShopCard', './res/img/tower10ShopCard.png');
    this.load.image('tower11ShopCard', './res/img/tower11ShopCard.png');

    this.load.image('nextwave', './res/img/nextwave.png');
    this.load.image('settingsbutton', './res/img/settingsbutton.png');
    this.load.image('panelbg', './res/img/panel-bg.png');
    this.load.image('paneloutline', './res/img/panel-outline.png');

    this.load.image('mainMenuButton', './res/img/mainMenuReg.png');
    this.load.image('mainMenuButtonPressed', './res/img/mainMenuPressed.png');
    this.load.audio('backgroundtrack', './res/audio/village.ogg');
    this.load.audio('explosionsound', './res/audio/Explosion2.wav');
    this.load.audio('radar', './res/audio/radar1.ogg');
    this.load.audio('rumble', './res/audio/rumble1.ogg');

    this.load.image('randomLevelFeedbackMenu', './res/img/RandomLevelFormMenu.png');
    this.load.image('feedbackButtonReg', './res/img/feedbackReg.png');
    this.load.image('feedbackButtonPressed', './res/img/feedbackPressed.png');

    this.load.image('mainMenuVictory', './res/img/MainMenuVictory.png');
    this.load.image('freeplayVictory', './res/img/Freeplay.png');
    
    this.load.image('victoryScreen', './res/img/VictoryScreen.png');
    this.load.image("LevelPreview1", "./res/img/LevelPreview1.png");
    this.load.image("LevelPreview2", "./res/img/LevelPreview2.png");
    this.load.image("LevelPreview3", "./res/img/LevelPreview3.png");
    this.load.image("LevelPreview4", "./res/img/LevelPreview4.png");
    this.load.image("LevelPreview5", "./res/img/LevelPreview5.png");
    this.load.image("LevelPreview6", "./res/img/LevelPreview6.png");
    this.load.image("LevelPreview7", "./res/img/LevelPreview7.png");
    this.load.image("LevelPreview8", "./res/img/LevelPreview8.png");
    this.load.image("LevelPreview9", "./res/img/LevelPreview9.png");
    this.load.image("LevelPreview10", './res/img/random.png');
    
    this.load.image("defeatScreen", "./res/img/DefeatScreen.png");
    this.load.image("retryButton", "./res/img/Retry.png");
    this.load.image('house_test', './res/img/house_test.png');
    this.load.image('spike_test', './res/img/spike_test.png');
    this.load.image('mine_test', './res/img/mine-test.png');
    this.load.image("beacon_test", "./res/img/beaconTest.png");
    this.load.image("bomb", "./res/img/bomb.png");

    this.load.image("locked", "./res/img/locked.png");
    this.load.image("sellbutton", "./res/img/sellbutton.png");
    this.load.image("laser", "./res/img/laser.png");
    this.load.image("laser_default", "./res/img/laser_default.png");
    this.load.image("laser2", "./res/img/laser2.png");
    this.load.image("laser3", "./res/img/laser_purple.png");
    this.load.image("laser4", "./res/img/laser3.png");
    this.load.image("laser5", "./res/img/laser_red.png");
    this.load.image("beige_panel2", './res/img/panel_beige2.png');

    this.load.image("speedup1", './res/img/speedup1.png');
    this.load.image("speedup2", './res/img/speedup2.png');
    this.load.image("speedup3", './res/img/speedup3.png');

    this.load.image("soundOff", "./res/img/soundOff.png");
    this.load.image("soundOn", "./res/img/soundOn.png");
    this.load.image("musicOff", "./res/img/musicOff.png");
    this.load.image("musicOn", "./res/img/musicOn.png");
  }

  /**
   * Creates the Level - phaser method called when Level created
   */
  create() {
    try {
      // setup layers, music, animations, spritesheet
      this.tileLayer = this.add.layer().setDepth(1);
      this.towerLayer = this.add.layer().setDepth(3);
      this.decorationLayer = this.add.layer().setDepth(2);
      this.bulletLayer = this.add.layer().setDepth(4);
      this.enemyLayer = this.add.layer().setDepth(4);
      this.uiLayer = this.add.layer().setDepth(10);
      this.spawnerLayer = this.add.layer().setDepth(4);
      this.anims.create({ key: 'fire', frames: this.anims.generateFrameNames('tdtiles', { prefix: 'towerDefense_tile', start: 295, end: 298, suffix: ".png"}), repeat: 2, frameRate: 8 });
      this.anims.create({key: "explosion", frames: this.anims.generateFrameNames('explosionanim', {prefix: "regularExplosion0", start: 0, end: 8, suffix: ".png"}), frameRate: 8, repeat: 1 });
      this.anims.create({key: "lightning", frames: "lightning", frameRate: 8, repeat: -1});
      this.anims.create({key: "staticexplosion", frames: "staticexplosion", frameRate: 16});
      this.settingsMenuLayer = this.add.layer().setDepth(11);
      console.log('safe1');
      let texture = this.textures.get('tdtiles');
      tileFrameNames = texture.getFrameNames();

      this.soundManager.playMusic('backgroundtrack', {volume: this.settings['volume'] / 5, loop: true});
      console.log('safe2');

      // fade in from black
      let r = this.add.rectangle(0, 0, 1600, 800, 0x000000).setOrigin(0, 0);
      this.uiLayer.add(r);
      this.tweens.add({targets: r,alpha: {value: 0, duration: 1000, ease: "Power1"}})

      // setup tilemap, then set correct images for path
      this.setupTileFunctions();
      console.log('safe3');

      if(!this.rLevel) {
        let grassTiles = getTilesOfType(this.tileMap, "G");
        let decoration_images = [129, 130, 131, 132, 133, 134, 135, 136, 303, 304, 305, 306, 307, 308, 438, 439, 440];
        for(let grassTile of grassTiles) {
          if(!grassTile.isOccupied() && Math.random() < 0.2 && ( (grassTile.tileX < this.tileMap[0].length-1) && (grassTile.tileY < this.tileMap.length-1) && (grassTile.tileX > 0) && grassTile.tileY > 0)) {
            let decoration = this.add.sprite((grassTile.x)+32, (grassTile.y)+32, 'tdtiles', tileFrameNames[decoration_images[Math.floor(Math.random() * decoration_images.length)]]).setOrigin(0.5, 0.5);
            decoration.angle = Math.floor(Math.random() * 360);
            grassTile.addDecoration(decoration);
          }
        }
      }
      console.log('safe4');
      
      this.createSpawners(this, this.tileMap);
      this.createEnds(this, this.tileMap);

      console.log('spawner-ends check');
      this.setupUI();
      this.createTowerShopCards();
      console.log('ui tower cards - check');

      this.getLocalStorageSettings();
      console.log('lstorage check');

      // this.manageShopCards();
      console.log('shopcards check');

      console.log('safe5');

      let musicToggle = this.add.sprite(32, 32, "music" + ((this.settings['music']) ? "On" : "Off")).setInteractive({cursor: "pointer"});
      musicToggle.on("pointerover", () => {
        musicToggle.setTint("0x4dcaf7");
      });
      musicToggle.on("pointerout", () => {
        musicToggle.setTint("0xFFFFFF");
      });
      musicToggle.on("pointerdown", () => {
        if(this.settings['music']) {
          this.changeSetting("music", false);
        } else {
          this.changeSetting("music", true);
        }
        musicToggle.setTexture("music" + ((this.settings['music']) ? "On" : "Off"));
      })
      this.uiLayer.add(musicToggle);
      console.log('safe6');

      let volumeToggle = this.add.sprite(84, 32, "sound" + ((this.settings['volume'] > 0) ? "On" : "Off")).setInteractive({cursor: "pointer"});
      volumeToggle.on("pointerover", () => {
        volumeToggle.setTint("0x4dcaf7");
      });
      volumeToggle.on("pointerout", () => {
        volumeToggle.setTint("0xFFFFFF");
      });
      volumeToggle.on("pointerdown", () => {
        if(this.settings['volume'] > 0) {
          this.changeSetting("volume", 0);
        } else {
          this.changeSetting("volume", 0.25);
        }
        volumeToggle.setTexture("sound" + ((this.settings['volume'] > 0) ? "On" : "Off"));
      })
      this.uiLayer.add(volumeToggle);
      if(this.isProcGen) {
        this.loadFeedbackMenu();
      }
      console.log('safe7');

      this.setUpFreeplay();

      console.log('safe8');

    } catch(e) {
      this.regenProcGenSettings();
      this.create();
    }
    if(this.rLevel) {
      this.regenLevel(this.level_info, this.restart);
    }
  }

  /**
   * Updates elements in the level - enemies, towers, etc.
   */
  update() {
    if(this.active) {
      this.manageShopCards();
      this.stats['time']++;
      this.stats['lives']=this.player.lives;
      this.soundManager.music.volume=this.settings['volume'] / 5;
      if(!this.soundManager.music.isPlaying && this.settings["music"]) {
        this.soundManager.music.play();
      } else if(this.soundManager.music.isPlaying && !this.settings['music']) {
        this.soundManager.music.stop();
      }
      if(!paused) {
        for(let tower of this.getTowers().sort((a, b) => {
          return (((a instanceof Beacon || a instanceof Shop || a instanceof Windmill)) ? 0 : 1) - (((b instanceof Beacon || b instanceof Shop || b instanceof Windmill)) ? 0 : 1)
        })) {
          tower.update();
        }
        for(let tower of this.getOneTimeTowers()) {
          tower.update();
        }

        for(let bullet of this.bulletLayer.getChildren()) {
          let hitEnemy = bullet.checkHitEnemy();
          if(hitEnemy) {
            let hitEnemyCoords = [hitEnemy.x, hitEnemy.y];
            if(bullet.status.length > 1) {
              hitEnemy.applyStatus(bullet.status[0], bullet.status[1]);
            }
            if( (hitEnemy.takeDamage(bullet.damage, this))) {
              if((hitEnemy instanceof Tank || hitEnemy instanceof Plane || hitEnemy instanceof Carrier) || bullet.frame.name.includes("251") ) {
                let explosion = this.add.sprite(hitEnemyCoords[0], hitEnemyCoords[1], "tdtiles", tileFrameNames[297]).setScale(0.01);
                this.uiLayer.add(explosion);
                runAnimation(explosion, this.tweens.add({targets:explosion ,scale:0.9,ease:'Power2',duration:150,yoyo: true,loop: -1}), 'explosion');
              }
            }
            bullet.kill();
            
          }
          bullet.update();
        }

        for(let enemy of this.enemyLayer.getChildren()) {
          enemy.update();
        }

        for(let spawner of this.spawnerLayer.getChildren()) {
          spawner.update();
        }
      }
  
      if(!this.complete && !paused) {
        if(this.nextWaveReady && !this.enemiesLeft) {
          if(this.currentWave >= this.waves.length-1) {
            this.complete=true;
            let medalsOnLevel = JSON.parse(localStorage.getItem("player_data"))["medals"][this.config["index"]];
            if(this.difficulty >= medalsOnLevel && medalsOnLevel < 3) {
              this.addMedal(this.config['index']);
            }
            this.stats['waves']=this.currentWave;
            this.stats['lives']=this.player.lives;
            this.loadVictoryDefeatScreen(1);
            return;
          }
          if(JSON.parse(getSettingValue("settings"))['autostart']) {
            this.startNextWave();
          }
        } else if(this.nextWaveReady) {
          for(let spawner of this.spawnerLayer.getChildren()) {
            if(spawner instanceof Spawner) {
              spawner.stop('spawner');
            }
          }
          this.enemiesLeft = !(this.enemyLayer.getChildren().length === 0);
        } else {
          for(let spawner of this.spawnerLayer.getChildren()) {
            let nextEnemyCount=0;
            let nextEnemy;
            let nextEnemyType;
            while(nextEnemyCount < 1) {
              let currentWaveEnemies = this.waves[this.currentWave][0].split('x');
              nextEnemy=currentWaveEnemies[0][0];
              nextEnemyType = parseInt(currentWaveEnemies[0][1]);
              nextEnemyCount = parseInt(currentWaveEnemies[1]);
  
              if(nextEnemyCount===0) {
                this.waves[this.currentWave].shift();
                spawner.ready = false;
                if(this.waves[this.currentWave].length === 0) {
                  this.nextWaveReady=true;
                  return;
                }
              }
            }
            if(spawner.ready && spawner.counter >= spawner.rate) {
                let en;
                switch(nextEnemy) {
                  case "S": en = new Soldier(this, spawner.x, spawner.y, nextEnemyType, spawner.path); break;
                  case "P": en = new Plane(this, spawner.x, spawner.y, nextEnemyType, spawner.path[spawner.path.length-1]); break;
                  case "C": en = new Carrier(this, spawner.x, spawner.y, nextEnemyType, spawner.path); break;
                  case "T": en = new Tank(this, spawner.x, spawner.y, nextEnemyType, spawner.path); break;
                }
                this.enemyLayer.add(en);
                this.enemiesLeft=true;
                nextEnemyCount--;
                this.waves[this.currentWave][0] = nextEnemy+""+nextEnemyType+"x"+nextEnemyCount;
                // spawner.ready=false;
                spawner.counter=0;
            }
          }
        }
      }
  
      
      
      this.player_money_text.setText("Money: " + this.player.display_money);
      if(this.player.display_money < this.player.money) {
        this.player_money_text.setColor("green");
      } else if(this.player.display_money > this.player.money) {
        this.player_money_text.setColor("red");
      } else {
        this.player_money_text.setColor("black");
      }
      this.player_lives_text.setText("Lives: " + this.player.lives, {fontFamily: "Sans-Serif"});
      this.player_waves_text.setText("Wave: " + parseInt(this.currentWave+1), {fontFamily: "Sans-Serif"});
      
      let display_add = Math.round(Math.abs(this.player.display_money - this.player.money) * 0.05) * ((this.player.display_money < this.player.money) ? 1 : -1);
      this.player.display_money += display_add;
      if(display_add === 0) {
        this.player.display_money = this.player.money;
      }

      if(this.enemiesLeft && !this.nextWaveReady) {
        this.NEXT_WAVE_BUTTON.setTexture("speedup" + this.speedModifier);
      } else if(this.nextWaveReady) {
        this.NEXT_WAVE_BUTTON.setTexture("nextwave");
      }
    }
  }

  /**
   * Sets up UI
   */
  setupUI() {
    LOWER_STATS_UI_PANEL = this.add.sprite(0, 736, 'lower_grey_panel').setOrigin(0, 0);
    this.uiLayer.add(LOWER_STATS_UI_PANEL);
    RIGHT_TOWER_UI_BG = this.add.sprite(1248, 0, 'panelbg').setOrigin(0, 0);
    this.uiLayer.add(RIGHT_TOWER_UI_BG);
    this.NEXT_WAVE_BUTTON = this.add.sprite(1340, 755, 'nextwave').setInteractive({cursor: "pointer"});
    this.uiLayer.add(this.NEXT_WAVE_BUTTON);

    this.NEXT_WAVE_BUTTON.on(("pointerdown"), () => {
      switch(this.NEXT_WAVE_BUTTON.texture.key) {
        case "speedup1": this.speedModifier = 2; break;
        case "speedup2": this.speedModifier = 3; break;
        case "speedup3": this.speedModifier = 1; break;
        case "nextwave": this.startNextWave(); break;
      }
    });
    
    let SETTINGS_BUTTON = this.add.sprite(1509, 755, 'settingsbutton').setInteractive({cursor: "pointer"});
    this.uiLayer.add(SETTINGS_BUTTON);

    SETTINGS_BUTTON.on(("pointerdown"), () => {
      if(!paused) {
        this.settingsMenuActive = true;
        pause();
        this.spawnerLayer.getChildren().filter((a) => {return a instanceof Spawner}).forEach((a) => {
          a.update();
        })
        this.loadSettingsMenu();
      }
    })

    RIGHT_TOWER_UI_PANEL = this.add.sprite(1248, 0, 'paneloutline').setOrigin(0, 0);
    this.uiLayer.add(RIGHT_TOWER_UI_PANEL);
    this.player_money_text= this.add.text(30, 750, "Money: " + this.player.money, {fontFamily: "Sans-Serif", fontSize:"32px", color:"black"});
    this.uiLayer.add(this.player_money_text);

    this.player_lives_text = this.add.text(570, 750, "Lives: " +this.player.lives, {fontSize:"32px", color:"black", fontFamily: "Sans-Serif"});
    this.uiLayer.add(this.player_lives_text);

    this.player_waves_text = this.add.text(1100, 750, "Wave: " + parseInt(this.currentWave+1), {fontSize:"32px", color:"black", fontFamily: "Sans-Serif"});
    this.uiLayer.add(this.player_waves_text);
  }

  /**
   * Handles tilemap setup and tile interactivity
   */
  setupTileFunctions() {
    this.tileMap = this.createTileMap(this, this.config['layout']);

      for(let i = 0; i < this.tileMap.length; i++) {
        for(let j = 0; j < this.tileMap[i].length; j++) {
          let im = this.getRoadImageType(this.tileMap, j, i);
          let t = getTile(this.tileMap, j, i);
          t.setTexture('tdtiles', im);
          let c = parseInt(im.split('tile')[1].split(".png")[0]-1);
          t.setInteractive();
          t.on("pointerover", () => { 
            t.alpha = 0.5; 
            if(t.tower || t.type !== "G") {
              if(t.type === "P" && (this.selectedTower === 10 || this.selectedTower === 11)) {
                let tower_settings = TOWER_TYPES[this.selectedTower];
                t.setGhostTower(this.add.sprite(t.x, t.y, "tdtiles", tileFrameNames[tower_settings["base_img"]]).setOrigin(tower_settings["base_offset_settings"][0], tower_settings["base_offset_settings"][1]), this.add.sprite(t.x, t.y, "tdtiles", tileFrameNames[tower_settings["img"]]).setOrigin(tower_settings["img_offset_settings"][0], tower_settings["img_offset_settings"][1]), false );
              } else {
                t.setTint(0xFF0000);
              }
            } else if(t.type === "G" && !t.isOccupied()) {
              if(this.selectedTower > -1 && this.selectedTower < 10) {
                let tower_settings = TOWER_TYPES[this.selectedTower];
                if(tower_settings["base_img"] > 0) {
                  t.setGhostTower(this.add.sprite(t.x, t.y, "tdtiles", tileFrameNames[tower_settings["base_img"]]).setOrigin(tower_settings["base_offset_settings"][0], tower_settings["base_offset_settings"][1]), this.add.sprite(t.x, t.y, "tdtiles", tileFrameNames[tower_settings["img"]]).setOrigin(tower_settings["img_offset_settings"][0], tower_settings["img_offset_settings"][1]), true );
                } else {
                  t.setGhostTower(this.add.sprite(t.x, t.y, "tdtiles", tileFrameNames[tower_settings["base_img"]]).setOrigin(tower_settings["base_offset_settings"][0], tower_settings["base_offset_settings"][1]), this.add.sprite(t.x, t.y, "tdtiles", tileFrameNames[tower_settings["img"]]).setOrigin(tower_settings["img_offset_settings"][0], tower_settings["img_offset_settings"][1]), false );
                }
              } else if(this.selectedTower > -1) {
                t.setTint(0xFF0000);
              }
            };
          });
          t.on("pointerout", () => { t.alpha = 1; t.setTint(0xFFFFFF); t.removeGhostTower();});
          t.on("pointerdown", () => { 
            if(!paused) {
              if(!t.isOccupied() && t.type === "G") {
                if(this.selectedTower > -1 && this.selectedTower < 10) {
                  if(this.player.takeMoney(TOWER_TYPES[this.selectedTower].cost)) {
                    t.removeGhostTower();
                    let tower_info = TOWER_TYPES[this.selectedTower];
                    t.addTower(this, this.selectedTower, t.x, t.y, tower_info["base_img"], tower_info["img"], tower_info["radius"]);
                    this.stats['towers']++;
                    this.selectedTower=-1;
                  }
                }
              } else if(t.type === "G" && t.decorations.length > 0) {
                t.clearDecorations();
                if(this.selectedTower > -1 && this.selectedTower < 10) {
                  if(this.player.takeMoney(TOWER_TYPES[this.selectedTower].cost)) {
                    t.removeGhostTower();
                    let tower_info = TOWER_TYPES[this.selectedTower];
                    t.addTower(this, this.selectedTower, t.x, t.y, tower_info["base_img"], tower_info["img"], tower_info["radius"]);
                    this.stats['towers']++;
                    this.selectedTower=-1;
                  }
                }
              } else if(t.type === "G" && t.tower) {
                for(let towerUpgradeElement of this.towerUpgradeElements) {
                  towerUpgradeElement.destroy();
                }
                this.towerUpgradeElements = [];
                clearAllRangeCircles(this.tileMap);
                t.tower.circle_image.alpha = 0.5;
                RIGHT_TOWER_UI_PANEL.setTexture('tower_upgrade_panel');
                for(let towerShopCard of towerShopCards) {
                  towerShopCard.alpha = 0;
                }
                this.createTowerUpgrades(this, t);
                return;
              } else if(t.type === "P" && this.selectedTower > 9) {
                if(this.player.takeMoney(TOWER_TYPES[this.selectedTower].cost)) {
                  t.removeGhostTower();
                  let tower_info = TOWER_TYPES[this.selectedTower];
                  t.addTower(this, this.selectedTower, t.x, t.y, tower_info["base_img"], tower_info["img"], tower_info["radius"]);
                  this.stats['towers']++;
                  this.selectedTower=-1;
                }
              }
              clearAllRangeCircles(this.tileMap);
              RIGHT_TOWER_UI_PANEL.setTexture('paneloutline');
              RIGHT_TOWER_UI_BG.setTexture('panelbg');
              for(let towerShopCard of towerShopCards) {
                towerShopCard.alpha = 1;
              }
              this.clearTowerUpgrades();
            }
          });
          t.setImageType(c);
        }
    }
  }

  /**
   * Sets up shop cards on right side of screen
   */
  createTowerShopCards() {
    for(let i = 0; i < Object.keys(TOWER_TYPES).length; i++) {
      let towerShopCard = this.add.sprite(1330 + ((i % 2 === 0) ? 0 : 180), (120 * (Math.floor(i / 2)))+65, "tower"+i+"ShopCard").setInteractive({cursor: "pointer"});
      // let isLocked= (i > 6 && i < 10);
      let isLocked = false;
      towerShopCard.on("pointerdown", () => {
        if(!paused && !isLocked) {
          this.selectedTower = i;
        }
      });
      towerShopCard.on("pointerover", () => {
        if(!paused && !isLocked) {
          towerShopCard.setTint(0x42f57e);
          this.showToolTip(towerShopCard, i);
        }
      });
      towerShopCard.on("pointerout", () => {
        if(!paused && !isLocked) {
          towerShopCard.setTint(0xFFFFFF);
          this.clearToolTip();
        }
      })
      this.uiLayer.add(towerShopCard);
      towerShopCards.push(towerShopCard);
      if(isLocked) {
        let lock = this.add.sprite(1330 + ((i % 2 === 0) ? 0 : 180), (120 * (Math.floor(i / 2)))+65, "locked");
        this.uiLayer.add(lock);
        towerShopCards.push(lock);
      }
    }
  }

  /**
   * Starts the next wave
   */
  startNextWave() {
    for(let tower of this.towerLayer.getChildren().filter((a) => {return a instanceof Shop || a instanceof Windmill})) {
      tower.onNextWave();
    }
    if(this.nextWaveReady && !this.enemiesLeft && !paused) {
      this.currentWave++;
      for(let spawner of this.spawnerLayer.getChildren()) {
        if(spawner instanceof Spawner) {
          spawner.play('spawner');
        }
      }
      this.nextWaveReady=false;
      this.enemiesLeft=true;
      this.saveGame();
    }
  }

  /**
   * adds medal to level stats
   * @param {number} level to add number to 
   */
  addMedal(level) {
    let pd = JSON.parse(localStorage.getItem("player_data"));
    pd["medals"][level]++;
    localStorage.setItem("player_data", JSON.stringify(pd));
  }

  /**
   * Sets up and displays victory/defeat screen
   * @param {number} vD victory or defeat 
   */
  loadVictoryDefeatScreen(vD) {
    let direction = [{x:+1250,y:+0}, {x:-1250,y:+0}, {x:+0,y:+700}, {x:+0,y:-700}][Math.floor(Math.random() * 4)];
    this.victoryScreenLayer = this.add.layer().setDepth(12);
    let glow = this.add.rectangle(0, 0, 1600, 800, 0x000000).setOrigin(0, 0);
    glow.alpha = 0.5;
    this.victoryScreenLayer.add(glow);

    let s = this.add.sprite(400+direction['x'], 200+direction['y'], (vD === 1) ? "victoryScreen" : "defeatScreen").setOrigin(0, 0);
    let o = this.add.sprite(1195+direction['x'], 200+direction['y'], 'CloseButton').setInteractive({cursor: "pointer"});
    let m = this.add.sprite(558.5+direction['x'], 427+direction['y'], "LevelPreview"+(this.config['index']+1));
    let ltext = this.add.text(690+direction['x'], 385+direction['y'], this.config["name"], {color: "0x000000", fontSize: "20px"});
    let dtext = this.add.text(730+direction['x'], 418+direction['y'], ["Easy", "Medium", "Hard"][this.difficulty], {color: "0x000000", fontSize: "20px"});
    let etext = this.add.text(745+direction['x'], 453+direction['y'], "???", {color: "0x000000", fontSize: "20px"});

    let wavestext = this.add.text(1015+direction['x'], 407+direction['y'], this.currentWave, {color: "0x000000", fontSize: "14px"});
    let killstext = this.add.text(1000+direction['x'], 428+direction['y'], this.stats['kills'], {color: "0x000000", fontSize: "14px"});
    let moneytext = this.add.text(1015+direction['x'], 448+direction['y'], this.stats['money'], {color: "0x000000", fontSize: "14px"});
    let towerstext = this.add.text(1017+direction['x'], 470+direction['y'], this.stats['towers'], {color: "0x000000", fontSize: "14px"});
    let livestext = this.add.text(1002+direction['x'], 492+direction['y'], this.player.lives, {color: "0x000000", fontSize: "14px"});
    let timetext = this.add.text(1002+direction['x'], 512+direction['y'], Math.floor(this.stats['time']/60)+"s", {color: "0x000000", fontSize: "14px"});

    let freeplaybutton = this.add.sprite(600+direction['x'], 585+direction['y'], (vD === 1) ? "freeplayVictory" : "retryButton").setInteractive({cursor: "pointer"});
    let mainmenubutton = this.add.sprite(1000+direction['x'], 585+direction['y'], "mainMenuVictory").setInteractive({cursor: "pointer"});

    freeplaybutton.on("pointerover", () => {
      freeplaybutton.setTint(0x6fd9c4);
    });
    freeplaybutton.on("pointerout", () => {
      freeplaybutton.setTint(0xFFFFFF);
    });
    mainmenubutton.on("pointerover", () => {
      mainmenubutton.setTint(0x6fd9c4);
    });
    mainmenubutton.on("pointerout", () => {
      mainmenubutton.setTint(0xFFFFFF);
    });
    freeplaybutton.on("pointerdown", () => {
      if(vD === 1) {
        for(let i = 0; i < 50; i++) {
          this.waves.push(this.generateFreeplayWave());
        }
        this.complete=false;
        this.sound.add('uiclick').play();
        glow.destroy();
        this.tweens.add({
          targets: this.victoryScreenLayer.getChildren().filter((a) => {return a.type !== "Rectangle"}),
          y: "+="+direction['y'],
          x: "+="+direction['x'],
          duration: 1250,
          ease: "Bounce.easeOut",
          easeParams: [4],
          onComplete: () => {
            this.victoryScreenLayer.destroy();
            this.victoryScreenActive=false;
            play();
          }
        });
        if(this.settings['autostart']) {
          this.startNextWave();
        }
      } else {
        this.resetLevel();
        this.active=true;
        this.create();
        console.log("not here!");
      }
      console.log('load new wave -> toggle wave ready');
    });
    mainmenubutton.on("pointerdown", () => {
      let r = this.add.rectangle(0, 0, 1600, 800, 0x000000).setOrigin(0, 0);
        r.alpha=0;
        this.victoryScreenLayer.add(r);
        this.tweens.add({
          targets: r,
          alpha: {value: 1, duration: 1000, ease: "Power1"},
          onComplete: () => {
            console.log('go back to main menu -> give player medal if earned');
            this.scene.start("TitleScreen");
            this.active=false;
            this.soundManager.music.destroy();
            play();
          }
        })
    })
    o.on("pointerover", () => {
      o.setTint(0xf53d3d);
    })
    o.on("pointerout", () => {
      o.setTint(0xFFFFFF);
    })
    o.on("pointerdown", () => {
      for(let i = 0; i < 50; i++) {
        this.waves.push(this.generateFreeplayWave());
      }
      this.complete=false;
      this.sound.add('uiclick').play();
      glow.destroy();
      this.tweens.add({
        targets: this.victoryScreenLayer.getChildren().filter((a) => {return a.type !== "Rectangle"}),
        y: "+="+direction['y'],
        x: "+="+direction['x'],
        duration: 1250,
        ease: "Bounce.easeOut",
        easeParams: [4],
        onComplete: () => {
          this.victoryScreenLayer.destroy();
          this.victoryScreenActive=false;
          play();
        }
      });
      if(this.settings['autostart']) {
        this.startNextWave();
      }
    });
    this.victoryScreenLayer.add([s, m, o, ltext, dtext, etext, wavestext, killstext, moneytext, towerstext, livestext, timetext, freeplaybutton, mainmenubutton]);

    this.tweens.add({
      targets: this.victoryScreenLayer.getChildren().filter((a) => {return a.type !== "Rectangle"}),
      y: "+="+direction['y']*-1,
      x: "+="+direction['x']*-1,
      duration: 1250,
      ease: "Bounce.easeOut",
      easeParams: [4]
    });
  }

  /**
   * Ends level
   */
  die() {
    if(!this.dead) {
      this.loadVictoryDefeatScreen(-1);
    }
    this.active = false;
    this.dead = true;
  }

  /**
   * Resets all elements of level
   */
  resetLevel() {
    if(typeof this.decorationLayer !== "undefined") {
      this.decorationLayer.destroy();
      this.towerLayer.destroy();
      this.tileLayer.destroy();
      this.bulletLayer.destroy();
      this.enemyLayer.destroy();
      this.uiLayer.destroy();
      this.spawnerLayer.destroy();
    }
    if(typeof this.victoryScreenLayer !== "undefined") {
      this.victoryScreenLayer.destroy();
    }
    if(typeof this.settingsMenuLayer !== "undefined") {
      this.settingsMenuLayer.destroy();
    }
    this.currentWave=0;
    this.waveCooldown=1001;
    this.complete = false;
    this.feedbackMenuActive=false;
    this.player = new Player();
    this.towerUpgradeElements=[];
    this.selectedTower=-1;
    this.enemiesLeft=true;
    this.nextWaveReady=false;
    this.active=false;
    this.stats = {waves: 0, kills: 0, money: this.player.money, towers: 0, lives: 0, time: 0};
    this.dead = false;
    this.waves = assignArrayValue([WAVES_EASY, WAVES_MEDIUM, WAVES_HARD][this.difficulty]);
    this.soundManager.removeAllSounds();
    this.soundManager.removeMusic();
    for(let tower of towerShopCards) {
      tower.destroy();
    }
    towerShopCards = [];
  }

  /**
   * Sets up and displays feedback menu - Only on procedurally generated levels
   */
  loadFeedbackMenu() {
    pause();
    this.spawnerLayer.getChildren().filter((a) => {return a instanceof Spawner}).forEach((a) => {
      a.update();
    })
    let direction = [{x:+1250,y:+0}, {x:-1250,y:+0}, {x:+0,y:+700}, {x:+0,y:-700}][Math.floor(Math.random() * 4)];
    this.feedbackMenuLayer=this.add.layer().setDepth(12);
    let glow = this.add.rectangle(0, 0, 1600, 800, 0x000000).setOrigin(0, 0);
    glow.alpha=0.5;
    this.feedbackMenuLayer.add(glow);

    let s = this.add.sprite(650+direction['x'], 200+direction['y'], "randomLevelFeedbackMenu").setOrigin(0, 0);
    let o = this.add.sprite(1045+direction['x'], 205+direction['y'], "CloseButton").setInteractive({cursor: "pointer"});
    this.feedbackMenuLayer.add([s, o]);

    let m = this.add.sprite(850+direction['x'], 530+direction['y'], 'feedbackButtonReg').setInteractive({cursor: "pointer"});
    m.on("pointerover", () => {
      m.setTint(0x6fd9c4);
    })
    m.on("pointerout", () => {
      m.setTint(0xFFFFFF);
    });
    m.on("pointerdown", () => {
      let baselayout = btoa(this.config.layout.toString());
      let basedimensions = btoa([this.config.layout[0].length, this.config.layout.length]);
      let basetheme = btoa(this.config['theme']);
      let y = "https://james-hynes.github.io/TowerDefenseMapWebsite/#"+baselayout+"#"+basedimensions+"#"+basetheme;
      window.open(y, "_blank");
      this.sound.add('uiclick').play();
      glow.destroy();
      this.tweens.add({
        targets: this.feedbackMenuLayer.getChildren().filter((a) => {return a.type !== "Rectangle"}),
        y: "+="+direction['y'],
        x: "+="+direction['x'],
        duration: 1250,
        ease: "Bounce.easeOut",
        easeParams: [4],
        onComplete: () => {
          this.feedbackMenuLayer.destroy();
          this.feedbackMenuActive=false;
          play();
        }
      });
    })
    this.feedbackMenuLayer.add(m);
    o.on("pointerover", () => {
      o.setTint(0xf53d3d);
    })
    o.on("pointerout", () => {
      o.setTint(0xFFFFFF);
    })

    o.on("pointerdown", () => {
      this.sound.add('uiclick').play();
      glow.destroy();
      this.enemiesLeft=true;
      this.nextWaveReady=false;
      this.stats = {waves: 0, kills: 0, money: this.player.money, towers: 0, lives: 0, time: 0};
      this.dead = false;
      this.tweens.add({
        targets: this.feedbackMenuLayer.getChildren().filter((a) => {return a.type !== "Rectangle"}),
        y: "+="+direction['y'],
        x: "+="+direction['x'],
        duration: 1250,
        ease: "Bounce.easeOut",
        easeParams: [4],
        onComplete: () => {
          this.feedbackMenuLayer.destroy();
          this.feedbackMenuActive=false;
          play();
        }
      });
    })

    this.tweens.add({
      targets: this.feedbackMenuLayer.getChildren().filter((a) => {return a.type !== "Rectangle"}),
      x: "+="+-direction['x'],
      y: "+="+-direction['y'],
      duration: 1250,
      ease: "Bounce.easeOut",
      easeParams: [4]
    });
  }

  /**
   * Sets up and displays settings menu
   */
  loadSettingsMenu() {
    let direction = [{x:+1250,y:+0}, {x:-1250,y:+0}, {x:+0,y:+700}, {x:+0,y:-700}][Math.floor(Math.random() * 4)];
    this.settingsMenuLayer = this.add.layer().setDepth(12);
    let glow = this.add.rectangle(0, 0, 1600, 800, 0x000000).setOrigin(0, 0);
    glow.alpha=0.5;
    this.settingsMenuLayer.add(glow);
    let togglesettings = ["music", "autostart"];
    let s = this.add.sprite(650+direction['x'], 200+direction['y'], 'SettingsBackground').setOrigin(0, 0);
    let o = this.add.sprite(1045+direction['x'], 205+direction['y'], "CloseButton").setInteractive({cursor: "pointer"});

    let mm = this.add.sprite(850+direction['x'], 580+direction['y'], "mainMenuButton").setInteractive({cursor: "pointer"});
    mm.on("pointerover", () => {
      mm.setTint(0x6fd9c4);
    })
    mm.on("pointerout", () => {
      mm.setTint(0xFFFFFF);
    })

    mm.on("pointerdown", () => {
        let r = this.add.rectangle(0, 0, 1600, 800, 0x000000).setOrigin(0, 0);
        r.alpha=0;
        this.settingsMenuLayer.add(r);
        this.tweens.add({
          targets: r,
          alpha: {value: 1, duration: 1000, ease: "Power1"},
          onComplete: () => {
            this.scene.start("TitleScreen");
            this.active=false;
            this.soundManager.music.destroy();
            this.settingsMenuActive=false;
            play();
          }
        })
    });
    o.on("pointerover", () => {
      o.setTint(0xf53d3d);
    })
    o.on("pointerout", () => {
      o.setTint(0xFFFFFF);
    })
    this.settingsMenuLayer.add(s);
    this.settingsMenuLayer.add(o);
    o.on("pointerdown", () => {
      this.sound.add('uiclick').play();
      glow.destroy();
      this.tweens.add({
        targets: this.settingsMenuLayer.getChildren().filter((a) => {return a.type !== "Rectangle"}),
        y: "+="+direction['y'],
        x: "+="+direction['x'],
        duration: 1250,
        ease: "Bounce.easeOut",
        easeParams: [4],
        onComplete: () => {
          this.sound.add('uiclick').play();
          this.settingsMenuLayer.destroy();
          this.settingsMenuActive=false;
          play();
        }
      });
    })
    for(let i = 0; i < 2; i++) {
      let n = this.add.sprite(975+direction['x'], (295+direction['y']) + (i*100), "ToggleButton" + ((this.settings[togglesettings[i]]) ? "On" : "")).setOrigin(0, 0).setInteractive({cursor: "pointer"});
      this.settingsMenuLayer.add(n);
      n.on("pointerdown", () => {
        this.sound.add('uiclick').play();
        let toggled = n.texture.key.includes("On");
        n.setTexture("ToggleButton" + ((toggled) ? "" : "On"));
        this.changeSetting(togglesettings[i], !toggled);
      });
    }

    let downButton = this.add.sprite(920+direction['x'], 520+direction['y'], "down").setInteractive({cursor: "pointer"});
    let upButton = this.add.sprite(1010+direction['x'], 520+direction['y'], "up").setInteractive({cursor: "pointer"});
    downButton.on(("pointerdown"), () => {
      this.sound.add('uiclick').play();
      this.changeSetting("volume", (this.settings["volume"] <= 0.05) ? 0 : this.settings['volume']-0.05);
    });
    upButton.on(("pointerdown"), () => {
      this.sound.add('uiclick').play();
      this.changeSetting("volume", (this.settings["volume"] >= 0.95) ? 1 : this.settings['volume']+0.05);
    });
    this.settingsMenuLayer.add(this.add.sprite(965+direction['x'], 520+direction['y'], "ToggleButton"));
    this.settingsVolumeText = this.add.text(953+direction['x'], 507+direction['y'], parseInt(this.settings["volume"]*100) + "%", {font: "16px Arial", color: "0x000000"})
    this.settingsMenuLayer.add([this.settingsVolumeText, downButton, upButton]);
    this.settingsMenuLayer.add(mm);

    this.tweens.add({
      targets: this.settingsMenuLayer.getChildren().filter((a) => {return a.type !== "Rectangle"}),
      x: "+="+-direction['x'],
      y: "+="+-direction['y'],
      duration: 1250,
      ease: "Bounce.easeOut",
      easeParams: [4]
    });

  }

  /**
   * Gets and updates localStorage settings
   * @returns {object} Settings
   */
  getLocalStorageSettings() {
    let settings = localStorage.getItem('settings');
    if(!settings) {
      localStorage.setItem('settings', "{\"volume\": 0.25, \"autostart\": true, \"music\": false}");
    } 
    this.settings = JSON.parse(localStorage.getItem("settings"));
    return this.settings;
  }
  
  /**
   * Updates setting in localStorage then updates settings object
   * @param {String} setting setting to change
   * @param {String|number} value new value 
   */
  changeSetting(setting, value) {
    this.settings[setting] = value;
    localStorage.setItem('settings', JSON.stringify(this.settings));
    this.getLocalStorageSettings();
  }

  /**
   * Gets the image type of a given tile
   * @param {Tile[][]} map 2D Tilemap 
   * @param {*} x the x-value of the tile
   * @param {*} y the y-value of the tile
   * @returns {number} The number of the image in the spritesheet
   */
  getRoadImageType(map, x, y) {
    let tile = getTileType(map, x, y);
    if(tile === "S" || tile === "E") {
      let sameTileConnection = getSameTileConnections2(map, x, y)[0];
  
      if(sameTileConnection[0] === x) {
        if(getTileType(map, x-1, y) === "P") {
          if(sameTileConnection[1] > y) {
            return tileFrameNames[THEME_KEY[theme]["startRight"]];
          } else {
            return tileFrameNames[THEME_KEY[theme]["endRight"]];
          }
        } else {
          if(sameTileConnection[1] > y) {
            return tileFrameNames[THEME_KEY[theme]["startLeft"]];
          } else {
            return tileFrameNames[THEME_KEY[theme]["endLeft"]];
          }
        }
      } else if (sameTileConnection[1] === y) {
        if(getTileType(map, x, y-1) === "P") {
          if(sameTileConnection[0] > x) {
            return tileFrameNames[THEME_KEY[theme]["endLeft"]];
          } else {
            return tileFrameNames[THEME_KEY[theme]["endRight"]];
          }
        } else {
          if(sameTileConnection[0] > x) {
            return tileFrameNames[THEME_KEY[theme]["startLeft"]];
          } else {
            return tileFrameNames[THEME_KEY[theme]["startRight"]];
          }
        }
      }
  
      if(getTileType(map, x+1, y) === tile) {
        return tileFrameNames[THEME_KEY[theme][i + "Left"]];
      } else if(getTileType(map, x-1, y) === tile) {
        return tileFrameNames[THEME_KEY[theme][i + "Right"]];
      }
    }
  
    if(tile === "P") {
      let vertical_connections = getVerticalConnections(map, x, y);
      let horizontal_connections = getHorizontalConnections(map, x, y);
  
      // Vertical Roads have 2 vertically adjacent path tiles and 1 horizontally adjacent path tile, whereas horizontal roads have the inverse
      // Turns have either 1 or 2 of each, depending on whether they're inside or outside turns.
      // to determine which direction an inside turn is the we find its diagonally adjacent non-path tile
      // the location of that tile shows which kind of turn tile is needed.
      if(vertical_connections.length === 2 && horizontal_connections.length === 1) {
        return tileFrameNames[((horizontal_connections[0][0] > x) ? THEME_KEY[theme]["verticalLeft"] :THEME_KEY[theme]["verticalRight"])]
      } else if(vertical_connections.length === 1 && horizontal_connections.length === 2) {
        return tileFrameNames[((vertical_connections[0][1] > y) ? THEME_KEY[theme]["horizontalTop"] : THEME_KEY[theme]["horizontalBottom"])]
      } else {
        if(vertical_connections.length === 2 && horizontal_connections.length === 2) {
          if(vertical_connections[1][1] > y) {
            let turnType = getAdjacentEmptyTileRelative(map, x, y);
            if(turnType[0] === 1 && turnType[1] === -1) {
              return tileFrameNames[THEME_KEY[theme]["insideTopRight"]]
            } else if (turnType[0] === -1 && turnType[1] === 1) {
              return tileFrameNames[THEME_KEY[theme]["insideBottomLeft"]];
            } else if(turnType[0] === -1 && turnType[1] === -1) {
              return tileFrameNames[THEME_KEY[theme]["insideTopLeft"]];
            } else if(turnType[0] === 1 && turnType[1] === 1) {
              return tileFrameNames[THEME_KEY[theme]["insideBottomRight"]];
            }
          }
        } else {
          if(horizontal_connections[0][0] < x) {
            if(vertical_connections[0][1] < y) {
              return tileFrameNames[THEME_KEY[theme]["outsideBottomRight"]];
            }
            return tileFrameNames[THEME_KEY[theme]["outsideTopRight"]];
          } else {
            if(vertical_connections[0][1] > y) {
              return tileFrameNames[THEME_KEY[theme]["outsideTopLeft"]];
            }
          }
          return tileFrameNames[THEME_KEY[theme]["outsideBottomLeft"]];
        }
      }
    }
    return tileFrameNames[THEME_KEY[theme]["ground"][Math.floor(Math.random() * THEME_KEY[theme]["ground"].length)]];
  }

  /**
   * Creates a 2D Tilemap of Tile objects
   * @param {Level} scene Level to create the tilemap for
   * @param {String[][]} map 2D Map layout of level
   * @returns {Tile[][]} 2D Tilemap
   */
  createTileMap(scene, map) {
    let tmap = [];
    for(let i = 0; i < map.length; i++) {
      tmap.push([]);
      for(let j = 0; j < map[i].length; j++) {
        let t = getTile(map, j, i);
        let tile = new Tile(scene, t, j, i);
        tmap[i].push(tile);
        this.tileLayer.add(tile);
      }
    }
    return tmap;
  }

  /**
   * Creates and places spawners on startTiles of a given map
   * @param {Level} scene Level to place spawners on 
   * @param {Tile[][]} map 2D Tilemap 
   */
  createSpawners(scene, map) {
    let startTiles = getTilesOfType(map, "S");
    let spawnerTiles = [];
  
    for(let i = 0; i < startTiles.length; i++) {
      if(!spawnerTiles.some((a) => {
        return (Math.abs(a.tileX - startTiles[i].tileX) <= 1 && Math.abs(a.tileY - startTiles[i].tileY) <= 1);
      })) {
        spawnerTiles.push(startTiles[i])
      }
    }
    let xOffset = 0;
    let yOffset = 0;
    for(let tile of spawnerTiles) {
      if(["startLeft", "startRight", "endLeft", "endRight"].includes(tile.image_type)) {
        if(tile.image_type.includes("Left")) {
          xOffset=32;
        } else {
          xOffset=-32;
        }
        if(tile.image_type.includes("end")) {
          yOffset=-32;
        } else {
          yOffset=32;
        }
      } else {
        if(tile.image_type.includes("Top")) {
          yOffset=32;
        } else {
          yOffset=32;
        }
        if(tile.image_type.includes("Left")) {
          xOffset=32;
        } else {
          xOffset=-32;
        }
      }
  
      let enemyPath = [];
      for(let endTile of getTilesOfType(map, "E")) {
        let path = createEnemyPath(map, tile, endTile);
        if(path.length > 0) {
          enemyPath = path;
          break;
        }
      }
  
      let spawner = new Spawner(scene, tile.x+xOffset, tile.y+yOffset, 267, enemyPath);
      if(map[tile.tileY-1] && (map[tile.tileY-1][tile.tileX].type === "P")) {
        spawner.angle=180;
      } else if(map[tile.tileY+1] && (map[tile.tileY+1][tile.tileX].type === "P"))  {
        spawner.angle=0;
      } else if(map[tile.tileY][tile.tileX+1] && (map[tile.tileY][tile.tileX+1].type === "P")) {
        spawner.angle=270;
      } else if(map[tile.tileY][tile.tileX-1] && (map[tile.tileY][tile.tileX-1].type==="P")) {
        spawner.angle=90;
      }
      this.spawnerLayer.add(spawner);
    }
  }

  /**
   * Creates and places end graphics on endTiles
   * @param {Level} scene Level to place graphics on 
   * @param {Tile[][]} map 2D Tilemap
   */
  createEnds(scene, map) {
    let endTiles = getTilesOfType(map, "E");
    let homeTiles = [];
    for(let i = 0; i < endTiles.length; i++) {
      if(!homeTiles.some((a) => {
        return (Math.abs(a.tileX - endTiles[i].tileX) <= 1 && Math.abs(a.tileY - endTiles[i].tileY) <= 1);
      })) {
        homeTiles.push(endTiles[i]);
      }
    }
    let xOffset = 0;
    let yOffset = 0;
  
    for(let tile of homeTiles) {
      if(["startLeft", "startRight", "endLeft", "endRight"].includes(tile.image_type)) {
        if(tile.image_type.includes("Left")) {
          xOffset=32;
        } else {
          xOffset=-32;
        }
        if(tile.image_type.includes("end")) {
          yOffset=-32;
        } else {
          yOffset=32;
        }
      } else {
        if(tile.image_type.includes("Top")) {
          yOffset=32;
        } else {
          yOffset=32;
        }
        if(tile.image_type.includes("Left")) {
          xOffset=32;
        } else {
          xOffset=-32;
        }
      }
      let home = scene.add.sprite(tile.x + xOffset, tile.y+yOffset, "home-temp").setScale(0.7);

      if(map[tile.tileY-1] && (map[tile.tileY-1][tile.tileX].type === "P")) {
        home.angle=180;
      } else if(map[tile.tileY+1] && (map[tile.tileY+1][tile.tileX].type === "P"))  {
        home.angle=0;
      } else if(map[tile.tileY][tile.tileX+1] && (map[tile.tileY][tile.tileX+1].type === "P")) {
        home.angle=270;
      } else if(map[tile.tileY][tile.tileX-1] && (map[tile.tileY][tile.tileX-1].type==="P")) {
        home.angle=90;
      }
      this.spawnerLayer.add(home);
    }
  }

  /**
   * Sets up tower upgrades on right side of screen
   * @param {Level} scene Level towers are on
   * @param {Tile} tile Tile containing tower to upgrade
   */
  createTowerUpgrades(scene, tile) {
    let upgradeLocked = -1;
    if(tile.tower.upgrades[0] > 2 && tile.tower.upgrades[1] === 2) {
      upgradeLocked = 1;
    } else if(tile.tower.upgrades[1] > 2 && tile.tower.upgrades[0] === 2) {
      upgradeLocked = 0;
    }
    let sellMoney = Math.round(tile.tower.getTotalCost() / 2);
    if(tile.tower.getBoost("sell")) {
      sellMoney = addPercentToNumber(sellMoney, 25);
    }
    let sellButton = scene.add.sprite(1425, 400, "sellbutton").setInteractive({cursor: "pointer"});
    let sellText = scene.add.text(1370, 390, "Sell: $"+sellMoney, {color: "black"});
    sellButton.on(("pointerdown"), () => {
      this.player.addMoney(sellMoney);
      tile.clearTile();
      RIGHT_TOWER_UI_PANEL.setTexture('paneloutline');
      RIGHT_TOWER_UI_BG.setTexture('panelbg');
      for(let towerShopCard of towerShopCards) {
        towerShopCard.alpha = 1;
      }
      this.clearTowerUpgrades();
    })
    this.towerUpgradeElements.push(sellButton, sellText);
    for(let i = 0; i < 2; i++) {
      if(tile.tower.upgrades[i] < 4 && i !== upgradeLocked) {
        
        let upgradeTitle = scene.add.text(1425, 50+(i*410), (TOWER_UPGRADES[tile.tower.type][i][tile.tower.upgrades[i]]['title'] || "Maxed!"), {color: 'black', fontSize: '48px', wordWrap: {width: "300"}}).setOrigin(0.5, 0.5);
        let upgradeDesc = scene.add.text(1425, 300+(i*410), (TOWER_UPGRADES[tile.tower.type][i][tile.tower.upgrades[i]]['description'] || "No more upgrades in this path"), {color: 'black', fontSize: '24px', wordWrap: {width: "300"}}).setOrigin(0.5, 0.5);
        let upgradeCost = scene.add.text(1425, 200+(i*410), "($"+ (TOWER_UPGRADES[tile.tower.type][i][tile.tower.upgrades[i]]['cost'] || "0")+")", {color: 'black', fontSize: '16px', wordWrap: {width: "300"}}).setOrigin(0.5, 0.5);
        if(TOWER_UPGRADES[tile.tower.type][i][tile.tower.upgrades[i]]['title']) {
          let upgradeButton = scene.add.sprite(1425, 165+(i*410), "upgrade_button").setInteractive({cursor: "pointer"}).setOrigin(0.5, 0.5);
          upgradeButton.on("pointerdown", () => {
            if(this.player.takeMoney(TOWER_UPGRADES[tile.tower.type][i][tile.tower.upgrades[i]]['cost'])) {
              this.clearTowerUpgrades();
              tile.tower.upgrade(((i == 0) ? [1, 0] : [0, 1]));
              this.createTowerUpgrades(scene, tile);
            }
          });
          this.towerUpgradeElements.push(upgradeButton);
          this.uiLayer.add(upgradeButton);
        }
    
        
        this.towerUpgradeElements.push(upgradeTitle, upgradeDesc, upgradeCost);
        this.uiLayer.add([upgradeTitle, upgradeDesc, upgradeCost, sellButton, sellText]);
      } else {
        let upgradeTitle = scene.add.text(1425, 50+(i*410), "Maxed!", {color: 'black', fontSize: '48px', wordWrap: {width: "300"}}).setOrigin(0.5, 0.5);
        let upgradeDesc = scene.add.text(1425, 300+(i*410), "No more upgrades in this path", {color: 'black', fontSize: '24px', wordWrap: {width: "300"}}).setOrigin(0.5, 0.5);
        let upgradeCost = scene.add.text(1425, 200+(i*410), "($0)", {color: 'black', fontSize: '16px', wordWrap: {width: "300"}}).setOrigin(0.5, 0.5);
        this.towerUpgradeElements.push(upgradeTitle, upgradeDesc, upgradeCost);
        this.uiLayer.add([upgradeTitle, upgradeDesc, upgradeCost, sellButton, sellText]);
      }
    }
  }

  /**
   * Removes all tower upgrades from screen
   */
  clearTowerUpgrades() {
    for(let towerUpgradeElement of this.towerUpgradeElements) {
      towerUpgradeElement.destroy();
    }
    this.towerUpgradeElements = [];
  }

  /**
   * Saves the current level fully at last wave to be restored later
   */
  saveGame() {
    let levelInfo = {};
    levelInfo["wave"] = this.currentWave;
    levelInfo["money"] = this.player.money;
    levelInfo['lives'] = this.player.lives;
    levelInfo['layout'] = this.config['layout'];
    levelInfo["theme"] = this.config['theme'];

    levelInfo["decorations"] = [];
    for(let decoration of this.decorationLayer.getChildren()) {
      levelInfo["decorations"].push({x: decoration.x, y: decoration.y, name: decoration.frame.name, angle: decoration.angle})
    }
    levelInfo["towers"] = [];
    for(let tower of this.towerLayer.getChildren()) {
      if(tower instanceof Tower) {
        levelInfo["towers"].push({x: tower.x, y: tower.y, upgrades: tower.upgrades, type: tower.type});
      }
    }
    let level_save_data = JSON.parse(localStorage.getItem("level_save_data"));
    level_save_data["levels"][this.config["index"]][this.difficulty] = levelInfo;
    localStorage.setItem("level_save_data", JSON.stringify(level_save_data));
  }

  getTowers() {
    let t = [];
    for(let tower of this.towerLayer.getChildren()) {
      if(tower instanceof Tower) {
        t.push(tower);
      }
    }
    return t;
  }

  getOneTimeTowers() {
    let t = [];
    for(let tower of this.towerLayer.getChildren()) {
      if(tower instanceof Grenade || tower instanceof Barrel) {
        t.push(tower);
      }
    }
    return t;
  }

  showToolTip(target, tower) {
    this.clearToolTip();
    let container = this.add.sprite(target.x-120, target.y+20, "beige_panel2");
    let towerNameText = this.add.text(target.x-165, target.y-40, TOWER_TYPES[tower]["name"], {fontSize: "13px", color: "black", fontStyle: "bold"});
    let towerDescriptionText = this.add.text(target.x-185, target.y, TOWER_TYPES[tower]["description"], {fontSize: "13px", color: "black", wordWrap: {width: "140"}})
    let towerTypeText = this.add.text(target.x-165, target.y-20, TOWER_TYPES[tower]["type"], {fontSize: "13px", color: "black", fontStyle: "bold"})
    let towerCostText = this.add.text(target.x-165, target.y+70, "Cost: $"+TOWER_TYPES[tower]["cost"], {fontSize: "13px", color: "black", fontStyle: "bold"})
    this.activeTooltip = [container, towerNameText, towerDescriptionText, towerTypeText, towerCostText];
    this.uiLayer.add([container, towerNameText, towerDescriptionText, towerTypeText, towerCostText]);
  }

  clearToolTip() {
    for(let p of this.activeTooltip) {
      p.destroy();
    }
    this.activeTooltip=[];
  }

  manageShopCards() {
    for(let i = 0; i < towerShopCards.length; i++) {
      if(this.player.money < TOWER_TYPES[i]['cost']) {
        towerShopCards[i].setTint(0x403e3d);
      } else {
        towerShopCards[i].setTint(0xFFFFFF);
      }
    }
  }

  setUpFreeplay() {
    let base_freeplay_waves = [];
    let startWave = Math.max(0, this.waves.length-5);
    for(let i = startWave; i < this.waves.length; i++) {
      base_freeplay_waves.push({value: 0, enemies: []})
      for(let j = 0; j < this.waves[i].length; j++) {
        let enemy = this.waves[i][j];
        let enemyType = enemy.split('x')[0][0];
        let enemyVariation = enemy.split('x')[0][1];
        let enemyQuantity = parseInt(enemy.split('x')[1]);
        let enemyValue = parseInt(ENEMY_VALUES[enemyType + enemyVariation])
        base_freeplay_waves[i-startWave]['value'] += (enemyValue * enemyQuantity)
        base_freeplay_waves[i-startWave]['enemies'].push({type: enemyType, variation: enemyVariation, quantity: enemyQuantity, value: enemyValue});
      }
    }
    let avg_val = ( base_freeplay_waves.map((a) => {return a.value}).reduce( (a, b) => {return a + b}) / base_freeplay_waves.length);

    this.freeplay_wave_value = (avg_val * 2);
  }

  generateFreeplayWave() {
    let points = this.freeplay_wave_value;
    let wave = [];
    this.freeplay_wave_value += Math.floor(this.currentWave / 10);
    while(points > 0) {
      let enemy = this.chooseEnemy(points);
      points -= ENEMY_VALUES[enemy];
      if(!enemy) {
        break;
      }
      wave.push(enemy);
    }

    let waveData = {};
    for(let i = 0; i < wave.length; i++) {
      if(waveData[wave[i]]) {
        waveData[wave[i]] += 1;
      } else {
        waveData[wave[i]] = 1;
      }
    }
    let formattedWave = [];
    for(let k of Object.keys(waveData)) {
      formattedWave.push(""+k+"x"+waveData[k]);
    }

    formattedWave = shuffle(formattedWave);

    let wave_padding = ["S1", "S2", "S3", "S1", "S2", "S3", "P1", "C1"][Math.floor(Math.random() * 8)];
    let padding_quantity_base = (wave_padding.includes("S") ? 10 * (4 - parseInt(wave_padding[1])) : 3);
    let wave_tmp = formattedWave.slice(0);
    for(let i = 0; i < wave_tmp.length; i+=2) {
      formattedWave.push(wave_padding + "x" + (((Math.floor(Math.random() * (padding_quantity_base-1))))+2));
    }
    return formattedWave;
  }

  chooseEnemy(points) {
    if(Math.random() < 0.5) {
      if(Math.random() < 0.3 && points >= ENEMY_VALUES["T4"]) {
        return "T4";
      }
      if(Math.random() < 0.3 && points >= ENEMY_VALUES["T3"]) {
        return "T3";
      }
      if(Math.random() < 0.3 && points >= ENEMY_VALUES["T2"]) {
        return "T2";
      }
      if(Math.random() < 0.3 && points >= ENEMY_VALUES["T1"]) {
        return "T1";
      }
    }
    if(Math.random() < 0.5) {
      if(Math.random() < 0.5 && points >= ENEMY_VALUES["P2"]) {
        return "P2";
      }
      if(Math.random() < 0.5 && points >= ENEMY_VALUES["P1"]) {
        return "P1";
      }
    }
    if(Math.random() < 0.5) {
      if(Math.random() < 0.5 && points >= ENEMY_VALUES["C4"]) {
        return "C4";
      }
      if(Math.random() < 0.5 && points >= ENEMY_VALUES["C3"]) {
        return "C3";
      }
      if(Math.random() < 0.5 && points >= ENEMY_VALUES["C2"]) {
        return "C2";
      }
      if(Math.random() < 0.5 && points >= ENEMY_VALUES["C1"]) {
        return "C1";
      }
    }
    if(Math.random() < 0.5) {
      if(Math.random() < 0.5 && points >= ENEMY_VALUES["S4"]) {
        return "S4";
      }
      if(Math.random() < 0.5 && points >= ENEMY_VALUES["S3"]) {
        return "S3";
      }
      if(Math.random() < 0.5 && points >= ENEMY_VALUES["S2"]) {
        return "S2";
      }
      if(Math.random() < 0.5 && points >= ENEMY_VALUES["S1"]) {
        return "S1";
      }
    }
    if(points >= ENEMY_VALUES["S1"]) {
      return "S1";
    }
    return false;
  }
}