/**
 * Class representing Title Screen scene
 */
class TitleScreen extends Phaser.Scene {
  /**
   * Creates a new Title Screen object
   */
  constructor() {
    super("TitleScreen");

    this.levelSelectActive=false;
    this.settingsMenuActive=false;
    this.settingsVolumeText;

    this.activeTooltip=[];
    this.titleScreenLayer;
    this.planeLayer;
    this.settingsLayer;
    this.starLayer;
    this.planeAngleCounter=0;

    this.active=false;
    titleScreen=this; // 4 debugging
    this.medals={};
    this.soundManager = new SoundManager(this);
  }

  /**
   * Loads Images, audio, etc.
   */
  preload() {
    this.load.image("TitleScreenBackground", "./res/img/TitleScreenBackground.png");
    this.load.image("SettingsBackground", './res/img/settingsbackground.png');
    this.load.atlas('titlescreensheet', './res/img/titlescreensheet.png', './res/titlescreensheet.json');
    this.load.audio('uiclick', './res/audio/click1.ogg');
    this.load.audio('backgroundtrack', './res/audio/village.ogg');
    this.load.image("ToggleButton", "./res/img/toggleButton.png");
    this.load.image("ToggleButtonOn", "./res/img/toggleButtonOn.png");
    this.load.image("CloseButton", "./res/img/iconCross_brown.png");
    this.load.image("down", "./res/img/down.png");
    this.load.image("up", "./res/img/up.png");
    this.load.image("LevelSelectBackground", "./res/img/LevelSelect.png");
    this.load.image("TitleScreenTitle", "./res/img/TitleScreenTitle.png");
    this.load.image("TitleScreenTitleNight", "./res/img/TitleScreenTitleNight.png");
    this.load.image("LevelPreview", "./res/img/LevelPreview.png");
    this.load.image("LevelPreview1", "./res/img/LevelPreview1.png");
    this.load.image("LevelPreview2", "./res/img/LevelPreview2.png");
    this.load.image("LevelPreview3", "./res/img/LevelPreview3.png");
    this.load.image("LevelPreview4", "./res/img/LevelPreview4.png");
    this.load.image("LevelPreview5", "./res/img/LevelPreview5.png");
    this.load.image("LevelPreview6", "./res/img/LevelPreview6.png");
    this.load.image("LevelPreview7", "./res/img/LevelPreview7.png");
    this.load.image("LevelPreview8", "./res/img/LevelPreview8.png");
    this.load.image("LevelPreview9", "./res/img/LevelPreview9.png");
    this.load.image("MedalShadow", "./res/img/medalshadow.png");
    this.load.image("medalbronze", "./res/img/medal_silver.png");
    this.load.image("medalsilver", "./res/img/medal_silver.png");
    this.load.image("medalgold", "./res/img/medal_gold.png");
    this.load.image("beige_panel", './res/img/panel_beige.png');
    this.load.image("random", './res/img/random.png');
    this.load.image("body_yellow", './res/img/body_yellow.png');

    this.load.image("planeBlue", "./res/img/planeBlue1.png");
    this.load.image("planeGreen", "./res/img/planeGreen1.png");
    this.load.image("planeRed", "./res/img/planeRed1.png");
    this.load.image("planeYellow", "./res/img/planeYellow1.png");

    this.load.atlas('star', './res/img/star.png', './res/star.json');
    this.load.image('trees', './res/img/trees.png');
    this.load.image('houses', './res/img/houses.png');
    this.load.image('sky', './res/img/sky.png');
    this.load.image('sky_night', './res/img/sky_night.png');
    this.load.image('sun', './res/img/sun.png');
    this.load.image('moon', './res/img/moon.png');
    this.load.image("medalselectpreview", "./res/img/medalselectpreview.png");
    this.load.image("medalselectbronze", "./res/img/medalselectbronze.png");
    this.load.image("medalselectsilver", "./res/img/medalselectsilver.png");
    this.load.image("medalselectgold", "./res/img/medalselectgold.png");
    this.load.image("medalselectScreenBackground", "./res/img/medalselectScreenBackground.png");
    this.load.image('medalselectlocked', './res/img/medalselectlocked.png');

    this.load.image("resumeDialog", "./res/img/resumeDialog.png");
    this.load.image("restart", "./res/img/restart.png");
    this.load.image("resume", "./res/img/resume.png");

    this.load.image("soundOff", "./res/img/soundOff.png");
    this.load.image("soundOn", "./res/img/soundOn.png");
    this.load.image("musicOff", "./res/img/musicOff.png");
    this.load.image("musicOn", "./res/img/musicOn.png");
    this.load.image("instructions", "./res/img/instructions.png");
  }

  /**
   * Sets up local storage settings as defaults or gets the previously established settings
   */
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
   * Called when scene starts, sets active to true
   */
  init() {
    this.active=true;
  }

  /**
   * Sets up background graphics, buttons, etc.
   */
  create() {
    // skip to level 1 (for testing) 
    let inp = this.input.keyboard.createCombo('789');
    this.input.keyboard.on('keycombomatch', () => {
      this.scene.start("Level", {levelID: 9, difficulty: 0});
    })
    this.setupLocalStorage();
    this.dayOrNight=1;
    // Setup title screen graphics w layering
    this.anims.create({key: 'staranim', frames: this.anims.generateFrameNames('star', {prefix:"star", end: 4, start: 1, zeroPad: 0, suffix: ".png"}), repeat: 3, frameRate: 12} );
    this.soundManager.playMusic('backgroundtrack', {loop: true, volume: this.settings['volume']});
    this.planeLayer = this.add.layer().setDepth(3);
    this.starLayer = this.add.layer().setDepth(3);
    this.titleScreenLayer = this.add.layer().setDepth(11);
    this.planeLayer.bringToTop();
    this.backgroundLayer=this.add.layer().setDepth(1);
    this.sky = this.add.image(0, 0, 'sky').setOrigin(0, 0);
    this.backgroundLayer.add(this.sky);
    this.sun = this.add.sprite(800, 100, 'sun').setScale(0.5);
    let trees = this.add.sprite(0, 255, 'trees').setOrigin(0, 0);
    let houses = this.add.sprite(220, 402, 'houses').setOrigin(0, 0);
    this.backgroundLayer.add(this.sun);
    this.backgroundLayer.add(trees);
    this.backgroundLayer.add(houses);
    this.backgroundLayer.add(this.add.image(0, 0, "TitleScreenBackground").setOrigin(0, 0));
    this.titleScreenTitle= this.add.image(400, 100, "TitleScreenTitle").setOrigin(0, 0);
    this.titleScreenLayer.add(this.titleScreenTitle);
    let buttons = ["Settings", "StartGame", "QuitGame"];

    for(let i = 0; i < buttons.length; i++) {
      let b = this.add.sprite(250 + (i*550), 650, "titlescreensheet", buttons[i]+"Reg.png").setInteractive({cursor: "pointer"});
      this.titleScreenLayer.add(b);
      b.on("pointerover", () => {
        if(!this.settingsMenuActive && !this.levelSelectActive) {
          b.setTint(0x6fd9c4);
        }
      });
      b.on("pointerout", () => {
        b.setTint(0xFFFFFF);
      });
      b.on("pointerdown", () => {
        if(!this.settingsMenuActive && !this.levelSelectActive) {
          this.soundManager.playSound('uiclick');
          // this.soundManager.playSound('uiclick');
          b.setTexture("titlescreensheet", buttons[i]+"Pressed.png");
          setTimeout(() => {
            b.setTexture('titlescreensheet', buttons[i]+"Reg.png");
          }, 200);
          switch(i) {
            case 0: 
              this.loadSettingsMenu();
              this.settingsMenuActive=true;
              console.log("Start Settings Scene...");
              break;
            case 1:
              this.levelSelectActive=true;
              this.loadLevelSelect();
              break;
            case 2: 
              this.loadInstructions();
              console.log("Quit Game Scene...");
              break;
          }
        }
        
      });
    }
    // if day -> make 2 planes
    if(this.dayOrNight === 1) {
      this.createPlane(1, ["Blue", "Green"][Math.floor(Math.random() * 2)]);
      this.createPlane(-1, ["Yellow", "Red"][Math.floor(Math.random()*2)]);
    } else {
      // make star
      this.createStar();
    }
    // start day night cycle
    this.doDayNightCycle();

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
    this.titleScreenLayer.add(musicToggle);

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
    this.titleScreenLayer.add(volumeToggle);
  }

  /**
   * Manages/updates planes, stars, day/night cycle, etc.
   */
  update() {
    if(this.active) {
      this.soundManager.music.volume = (this.settings['volume'] / 5);
      if(!this.soundManager.music.isPlaying && this.settings['music']) {
        this.soundManager.music.play();
      } else if(this.soundManager.music.isPlaying && !this.settings['music']) {
        this.soundManager.music.stop();
      }
      if(this.settingsMenuActive) {
        this.settingsVolumeText.setText(parseInt(this.settings["volume"]*100));
      }
      this.planeAngleCounter+=0.1;
      
      // update planes
      for(let plane of this.backgroundLayer.getChildren()) {
        if(plane.texture.key.includes("plane")) {
          plane.x += (4*plane.dir);
          plane.angle = radians_to_degrees(Math.sin(this.planeAngleCounter))/6;
          if(plane.x >= 1650 && plane.dir === 1) {
            plane.destroy();
          } else if(plane.x <= 0 && plane.dir === -1) {
            plane.destroy();
          }
        }
      }
      // if day -> chance to spawn plane else -> chance to spawn star
      if(this.dayOrNight === 1) {
        if(this.planeLayer.getChildren().length < 2 && Math.random() > 0.9975) {
          this.createPlane();
        }
      } else {
        if(this.starLayer.getChildren().length===0 && Math.random() > 0.995) {
          for(let i = 0; i < Math.floor(Math.random() * 3); i++) {
            this.createStar();
          }
        }
      }
      // update sun around path
      this.sunpath.getPoint(this.sun.t, this.sun.vec);
      this.sun.x = this.sun.vec.x;
      this.sun.y = this.sun.vec.y;
    }
  }

  /**
   * Moves moon/sun back and forth, changing graphics each time they leave the screen
   */
  doDayNightCycle() {
    // setup path of sun/moon and star animation infinitely repeating
    this.sunpath = new Phaser.Curves.Path(-50, 500);
    this.sun.t=0;
    this.sun.vec = new Phaser.Math.Vector2();
    this.sunpath.splineTo([-50, 500, 50, 425, 100, 350, 200, 275, 300, 225, 400, 175, 500, 125, 600, 115, 700, 110, 800, 100, 900, 110, 1000, 115, 1100, 125, 1200, 175, 1300, 225, 1400, 275, 1500, 350, 1600, 425, 1700, 500]);
    this.tweens.add({
      targets: this.sun,
      t: 1,
      ease: 'Sine.easeInOut',
      duration: 36000, 
      repeat: -1,
      onRepeat: () => {
        let d = this.sun.texture.key.includes('sun');
        this.sun.setTexture(d ? "moon" : "sun");
        this.sky.setTexture(d ? 'sky_night' : 'sky');
        this.dayOrNight= (d ? -1 : 1)
        this.sky.setTexture(d ? 'sky_night' : 'sky');
        this.titleScreenTitle.setTexture(d ? "TitleScreenTitleNight" : "TitleScreenTitle")
      }
    })
  }

  /**
   * Gets settings data from localStorage
   * @returns {Object} Settings
   */
  getLocalStorageSettings() {
    // pull local storage settings object
    let settings = localStorage.getItem('settings');
    if(!settings) {
      // make new with default settings
      localStorage.setItem('settings', "{\"volume\": 0.25, \"autostart\": true, \"music\": false}");
    }
    let player_data = localStorage.getItem('player_data');
    if(player_data === null) {
      localStorage.setItem('player_data', "{\"medals\": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], \"personal_bests\": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]}");
    } 
    this.player_data = JSON.parse(localStorage.getItem("player_data"))
    this.settings = JSON.parse(localStorage.getItem("settings"));
    return this.settings;
  }

  /**
   * Gets and returns player data from localStorage
   * @returns {object} player data
   */
  getPlayerData() {
    return localStorage.getItem("player_data") || false;
  }

  /**
   * Changes and updates a setting in localStorage
   * @param {String} setting Key of setting to change
   * @param {number|String} value Value to change to
   */
  changeSetting(setting, value) {
    // change settings value both in this.settings and in LocalStorage
    this.settings[setting] = value;
    localStorage.setItem('settings', JSON.stringify(this.settings));
    this.getLocalStorageSettings();
  }

  /**
   * Changes and updates player data in localStorage
   * @param {string} setting 
   * @param {number} level 
   * @param {number} value 
   */
  changePlayerData(setting, level, value) {
    this.player_data[setting][level]+=value;
    localStorage.setItem('player_data', JSON.stringify(this.player_data));
    this.getLocalStorageSettings();
  }

  /**
   * Creates a new place to fly across screen
   * @param {number} d Direction, either -1 or 1
   * @param {string} c Color, ["Blue", "Green", "Red", "Yellow"]
   */
  createPlane(d, c) {
    let dir = d || (Math.random() < 0.5 ? 1 : -1);
    let color = c || ["Blue", "Green", "Red", "Yellow"][Math.floor(Math.random()*4)];
    let p = this.add.sprite(((dir > 0) ? (-100) : 1650), 100 + (Math.random() * 300), "plane"+color).setScale((Math.random() * 0.3)+0.5);
    if(dir<0) {p.flipX=true;}
    p.dir=dir;
    this.backgroundLayer.add(p);
  }

  /**
   * Creates a new star on screen
   */
  createStar() {
    let s = this.add.sprite(Math.random() * 1200, Math.random() * 300, "star", "star1.png").play('staranim');
    s.on(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
      s.destroy();
    })
    this.starLayer.add(s);
  }

  /**
   * Loads and displays the settings menu
   */
  loadSettingsMenu() {
    let direction = [{x:+1250,y:+0}, {x:-1250,y:+0}, {x:+0,y:+700}, {x:+0,y:-700}][Math.floor(Math.random() * 4)];
    this.settingsLayer = this.add.layer().setDepth(12);
    let glow = this.add.rectangle(0, 0, 1600, 800, 0x000000).setOrigin(0, 0);
    glow.alpha=0.5;
    this.settingsLayer.add(glow);
    let togglesettings = ["music", "autostart"];
    let s = this.add.sprite(650+direction['x'], 200+direction['y'], 'SettingsBackground').setOrigin(0, 0);
    let o = this.add.sprite(1045+direction['x'], 205+direction['y'], "CloseButton").setInteractive({cursor: "pointer"});
    o.on("pointerover", () => {
      o.setTint(0xf53d3d);
    })
    o.on("pointerout", () => {
      o.setTint(0xFFFFFF);
    })
    this.settingsLayer.add(s);
    this.settingsLayer.add(o);
    o.on("pointerdown", () => {
      this.soundManager.playSound('uiclick');
      glow.destroy();
      this.tweens.add({
        targets: this.settingsLayer.getChildren().filter((a) => {return a.type !== "Rectangle"}),
        y: "+="+direction['y'],
        x: "+="+direction['x'],
        duration: 1250,
        ease: "Bounce.easeOut",
        easeParams: [4],
        onComplete: () => {
          this.settingsLayer.destroy();
          this.settingsMenuActive=false;
        }
      });
    })
    for(let i = 0; i < 2; i++) {
      let n = this.add.sprite(975+direction['x'], (295+direction['y']) + (i*100), "ToggleButton" + ((this.settings[togglesettings[i]]) ? "On" : "")).setOrigin(0, 0).setInteractive({cursor: "pointer"});
      this.settingsLayer.add(n);
      n.on("pointerdown", () => {
        this.soundManager.playSound('uiclick');
        let toggled = n.texture.key.includes("On");
        n.setTexture("ToggleButton" + ((toggled) ? "" : "On"));
        this.changeSetting(togglesettings[i], !toggled);
      });
    }

    let downButton = this.add.sprite(920+direction['x'], 520+direction['y'], "down").setInteractive({cursor: "pointer"});
    let upButton = this.add.sprite(1010+direction['x'], 520+direction['y'], "up").setInteractive({cursor: "pointer"});
    downButton.on(("pointerdown"), () => {
      this.soundManager.playSound('uiclick');
      this.changeSetting("volume", (this.settings["volume"] <= 0.05) ? 0 : this.settings['volume']-0.05);
    });
    upButton.on(("pointerdown"), () => {
      this.soundManager.playSound('uiclick');
      this.changeSetting("volume", (this.settings["volume"] >= 0.95) ? 1 : this.settings['volume']+0.05);
    });
    this.settingsLayer.add(this.add.sprite(965+direction['x'], 520+direction['y'], "ToggleButton"));
    this.settingsVolumeText = this.add.text(953+direction['x'], 507+direction['y'], parseInt(this.settings["volume"]*100), 2, {font: "16px Arial", color: "0x000000"})
    this.settingsLayer.add([this.settingsVolumeText, downButton, upButton]);

    this.tweens.add({
      targets: this.settingsLayer.getChildren().filter((a) => {return a.type !== "Rectangle"}),
      x: "+="+-direction['x'],
      y: "+="+-direction['y'],
      duration: 1250,
      ease: "Bounce.easeOut",
      easeParams: [4]
    });

  }

  /**
   * Loads and displays the settings menu
   */
   loadInstructions() {
    let direction = [{x:+1250,y:+0}, {x:-1250,y:+0}, {x:+0,y:+700}, {x:+0,y:-700}][Math.floor(Math.random() * 4)];
    this.instructionsLayer = this.add.layer().setDepth(12);
    let glow = this.add.rectangle(0, 0, 1600, 800, 0x000000).setOrigin(0, 0);
    glow.alpha=0.5;
    this.instructionsLayer.add(glow);
    let s = this.add.sprite(650+direction['x'], 200+direction['y'], 'instructions').setOrigin(0, 0);
    let o = this.add.sprite(1045+direction['x'], 205+direction['y'], "CloseButton").setInteractive({cursor: "pointer"});
    o.on("pointerover", () => {
      o.setTint(0xf53d3d);
    })
    o.on("pointerout", () => {
      o.setTint(0xFFFFFF);
    })
    this.instructionsLayer.add(s);
    this.instructionsLayer.add(o);
    o.on("pointerdown", () => {
      this.soundManager.playSound('uiclick');
      glow.destroy();
      this.tweens.add({
        targets: this.instructionsLayer.getChildren().filter((a) => {return a.type !== "Rectangle"}),
        y: "+="+direction['y'],
        x: "+="+direction['x'],
        duration: 1250,
        ease: "Bounce.easeOut",
        easeParams: [4],
        onComplete: () => {
          this.instructionsLayer.destroy();
          this.settingsMenuActive=false;
        }
      });
    })
    this.tweens.add({
      targets: this.instructionsLayer.getChildren().filter((a) => {return a.type !== "Rectangle"}),
      x: "+="+-direction['x'],
      y: "+="+-direction['y'],
      duration: 1250,
      ease: "Bounce.easeOut",
      easeParams: [4]
    });

  }

  /**
   * Loads and displays the level select menu
   */
  loadLevelSelect() {
    let direction = [{x:+1250,y:+0}, {x:-1250,y:+0}, {x:+0,y:+700}, {x:+0,y:-700}][Math.floor(Math.random() * 4)];
    this.levelSelectLayer = this.add.layer().setDepth(1000);
    let glow = this.add.rectangle(0, 0, 1600, 800, 0x000000).setOrigin(0, 0);
    glow.alpha=0.5;
    this.levelSelectLayer.add(glow);
    this.levelSelectLayer.add(this.add.sprite(800+direction["x"], 350+direction["y"], "LevelSelectBackground"));
    let l = this.add.sprite(1195+direction["x"], 155+direction["y"], 'CloseButton').setInteractive({cursor: "pointer"});
    l.on("pointerover", () => {
      if(!this.medalSelectActive) {
        l.setTint(0xf53d3d);
      }
    })
    l.on("pointerout", () => {
      if(!this.medalSelectActive) {
        l.setTint(0xFFFFFF);
      }
    })
    this.levelSelectLayer.add(l);
    l.on(("pointerdown"), () => {
      if(!this.medalSelectActive) {
        this.soundManager.playSound('uiclick');
        glow.destroy();
      this.tweens.add({
        targets: this.levelSelectLayer.getChildren().filter((a) => {return a.type !== "Rectangle"}),
        y: "+="+direction['y'],
        x: "+="+direction['x'],
        duration: 1250,
        ease: "Bounce.easeOut",
        easeParams: [4],
        onComplete: () => {
          this.medals={};
          this.levelSelectLayer.destroy();
          this.levelSelectActive=false;
        }
      });
      }
    });

    for(let i = 0; i < 5; i++) {
      let m = this.add.sprite((516+direction["x"]) + (i * 141), 240+direction["y"], "LevelPreview").setInteractive({cursor: "pointer"});
      let p1 = this.add.sprite((516+direction["x"]) + (i * 141), 240+direction["y"], "LevelPreview" + (i+1));
      let p2;
      let n;
      if(i!==4) {
        p2 = this.add.sprite((516+direction["x"]) + (i * 141), 420+direction['y'], "LevelPreview"+ (i+6));
        n = this.add.sprite((516+direction["x"]) + (i * 141), 420+direction['y'], "LevelPreview").setInteractive({cursor: "pointer"});
      } else {
        n = this.add.sprite((516+direction["x"]) + (i*141), 420+direction["y"], "LevelPreview").setInteractive({cursor: "pointer"});
        p2 = this.add.sprite((516+direction["x"]) + (i * 141), 420+direction["y"], "random");
      }

      m.on(("pointerdown"), () => {
        if(!this.medalSelectActive) {
          this.loadMedalSelect(i);
        }
      })

      n.on(("pointerdown"), () => {
        if(!this.medalSelectActive) {
          this.loadMedalSelect(i+5);
        }
      })

      m.on("pointerover", () => {
        if(!this.medalSelectActive) {
          this.showToolTip(m, i);
        }
      })

      m.on("pointerout", () => {
        this.clearToolTip();
      })

      n.on("pointerover", () => {
        if(!this.medalSelectActive) {
          this.showToolTip(n, i+5);
        }
      })

      n.on("pointerout", () => {
        this.clearToolTip();
      })

      let a = this.add.sprite((515+direction["x"])+ (i*141), 325+direction['y'], 'MedalShadow');
      this.levelSelectLayer.add(a);
      let f = this.add.sprite((498+direction["x"]) + (i*141), 328+direction['y'], "MedalShadow").setAngle(-22);
      let h = this.add.sprite((533+direction["x"]) + (i*141), 328+direction['y'], "MedalShadow").setAngle(22);
      this.levelSelectLayer.add([f, h]);

      this.medals[i] = [f, h, a];

      let b = this.add.sprite((515+direction["x"])+ (i*141), 505+direction['y'], 'MedalShadow');
      this.levelSelectLayer.add(b);
      let g = this.add.sprite((498+direction["x"]) + (i*141), 508+direction['y'], "MedalShadow").setAngle(-22);
      let j = this.add.sprite((533+direction["x"]) + (i*141), 508+direction['y'], "MedalShadow").setAngle(22);
      this.levelSelectLayer.add([g, j]);
      this.levelSelectLayer.add([p1, p2, m, n]);
      this.medals[i+5] = [g, j, b];
    }

    this.tweens.add({
      targets: this.levelSelectLayer.getChildren().filter((a) => {return a.type !== "Rectangle"}),
      y: "+="+direction['y']*-1,
      x: "+="+direction['x']*-1,
      duration: 1250,
      ease: "Bounce.easeOut",
      easeParams: [4]
    });
    this.setupMedals();
  }

  /**
   * Loads and displays medal select menu
   * @param {number} levelID the level to display medals for
   */
  loadMedalSelect(levelID) {
    this.medalSelectActive=true;
    let direction = [{x:+1250,y:+0}, {x:-1250,y:+0}, {x:+0,y:+700}, {x:+0,y:-700}][Math.floor(Math.random() * 4)];
    this.medalSelectLayer = this.add.layer().setDepth(1001);
    let glow = this.add.rectangle(0, 0, 1600, 800, 0x000000).setOrigin(0, 0);
    glow.alpha=0.5;
    this.medalSelectLayer.add(glow);
    this.medalSelectLayer.add(this.add.sprite(800+direction["x"], 350+direction["y"], "medalselectScreenBackground"));
    let m = ["bronze", "silver", "gold"];
    for(let i = 0; i < 3; i++) {
      let im = "";
      if(this.player_data["medals"][levelID] > i) {
        im = m[i];
      } else if(this.player_data['medals'][levelID] <= i-1) {
        im = "locked";
      } else {
        im = "preview";
      }
      let a = this.add.sprite(650+direction['x']+(i*140), 330+direction['y'], "medalselect"+im);
      if(im !== "locked") {
        a.setInteractive({cursor: "pointer"});
      }
      a.on("pointerover", () => {
        if(!this.resumeGameActive) {
          a.setTint("0x4dcaf7");
        }
      });
      a.on("pointerout", () => {
        a.setTint("0xFFFFFF");
      })
      a.on("pointerdown", () => {
        if(!this.resumeGameActive) {
          let level_save = this.level_save_data["levels"][levelID][i];
          if(Object.keys(level_save).length > 0) {
            this.loadResumeGame(levelID, i)
          } else {
            let r = this.add.rectangle(0, 0, 1600, 800, 0x000000).setOrigin(0, 0);
            r.alpha=0;
            this.medalSelectLayer.add(r);
            this.tweens.add({
              targets: r,
              alpha: {value: 1, duration: 1000, ease: "Power1"},
              onComplete: () => {
                this.settingsMenuActive=false;
                this.medalSelectActive=false;
                this.levelSelectActive=false;
                this.active=false;
                this.soundManager.music.stop();
                this.medals={};
                this.scene.start("Level", {levelID: levelID, difficulty: i});
              }
            })
          }
        }
      })
      this.medalSelectLayer.add(a);
    }

    let l = this.add.sprite(1025+direction["x"], 265+direction["y"], 'CloseButton').setInteractive({cursor: "pointer"});
    l.on("pointerover", () => {
        l.setTint(0xf53d3d);
    })
    l.on("pointerout", () => {
        l.setTint(0xFFFFFF);
    })
    this.medalSelectLayer.add(l);
    l.on(("pointerdown"), () => {
      this.soundManager.playSound('uiclick');
        glow.destroy();
      this.tweens.add({
        targets: this.medalSelectLayer.getChildren().filter((a) => {return a.type !== "Rectangle"}),
        y: "+="+direction['y'],
        x: "+="+direction['x'],
        duration: 1250,
        ease: "Bounce.easeOut",
        easeParams: [4],
        onComplete: () => {
          this.medals={};
          this.medalSelectLayer.destroy();
          this.medalSelectActive=false;
        }
      });
    });

    this.tweens.add({
      targets: this.medalSelectLayer.getChildren().filter((a) => {return a.type !== "Rectangle"}),
      y: "+="+direction['y']*-1,
      x: "+="+direction['x']*-1,
      duration: 1250,
      ease: "Bounce.easeOut",
      easeParams: [4]
    });
  }

  loadResumeGame(levelID, difficulty) {
    this.resumeGameActive=true;
    let direction = [{x:+1250,y:+0}, {x:-1250,y:+0}, {x:+0,y:+700}, {x:+0,y:-700}][Math.floor(Math.random() * 4)];
    this.resumeGameLayer = this.add.layer().setDepth(1002);
    let glow = this.add.rectangle(0, 0, 1600, 800, 0x000000).setOrigin(0, 0);
    glow.alpha=0.5;
    this.resumeGameLayer.add(glow);
    this.resumeGameLayer.add(this.add.sprite(800+direction['x'], 350+direction['y'], "resumeDialog"));
    let resumebutton = this.add.sprite(750+direction['x'], 400+direction['y'], 'resume').setInteractive({cursor: "pointer"});
    let restartbutton = this.add.sprite(850+direction['x'], 400+direction['y'], 'restart').setInteractive({cursor: "pointer"});

    resumebutton.on(("pointerover") , () => {
      resumebutton.setTint("0x4dcaf7");
    })
    restartbutton.on(("pointerover"), () => {
      restartbutton.setTint("0x4dcaf7");
    })
    resumebutton.on(("pointerout"), () => {
      resumebutton.setTint("0xFFFFFF");
    })
    restartbutton.on(("pointerout"), () => {
      restartbutton.setTint("0xFFFFFF");
    });
    resumebutton.on(("pointerdown"), () => {
      let r = this.add.rectangle(0, 0, 1600, 800, 0x000000).setOrigin(0, 0);
      r.alpha=0;
      this.soundManager.playSound('uiclick');
      this.resumeGameLayer.add(r);
      this.tweens.add({
        targets: r,
        alpha: {value: 1, duration: 1000, ease: "Power1"},
        onComplete: () => {
          this.settingsMenuActive=false;
          this.medalSelectActive=false;
          this.resumeGameActive=false;
          this.levelSelectActive=false;
          this.active=false;
          this.soundManager.music.stop();
          this.medals={};
          this.scene.start("Level", {levelID: levelID, difficulty: difficulty, regenLevel: true, restart: false});
        }
      })
    });
    restartbutton.on(("pointerdown"), () => {
      let r = this.add.rectangle(0, 0, 1600, 800, 0x000000).setOrigin(0, 0);
      r.alpha=0;
      this.soundManager.playSound('uiclick');
      this.resumeGameLayer.add(r);
      this.tweens.add({
        targets: r,
        alpha: {value: 1, duration: 1000, ease: "Power1"},
        onComplete: () => {
          this.settingsMenuActive=false;
          this.medalSelectActive=false;
          this.resumeGameActive=false;
          this.levelSelectActive=false;
          this.active=false;
          this.soundManager.music.stop();
          this.medals={};
          this.scene.start("Level", {levelID: levelID, difficulty: difficulty, restart: true});
        }
      })
    });
    this.resumeGameLayer.add([resumebutton, restartbutton]);

    this.tweens.add({
      targets: this.resumeGameLayer.getChildren().filter((a) => {return a.type !== "Rectangle"}),
      y: "+="+direction['y']*-1,
      x: "+="+direction['x']*-1,
      duration: 1250,
      ease: "Bounce.easeOut",
      easeParams: [4]
    });
  }

  /**
   * Gets medal from given level and medal number
   * @param {number} level Level to get medal for [0-9]
   * @param {number} n Medal number [0-2]
   * @returns {Phaser.Sprite|boolean} Medal sprite or false
   */
  getMedal(level, n) {
    if(this.medals[level]) {
      return this.medals[level][n];
    }
    return false;
  }

  /**
   * Toggles the medal texture for a given medal sprite
   * @param {Phaser.Sprite} medal 
   * @param {number} type type of medal to change to
   */
  toggleMedal(medal, type) {
    let m = ["bronze", "silver", "gold"];
    if(type < 0) {
      medal.setTexture("MedalShadow");
    } else {
      medal.setTexture("medal"+m[type]);
    }
  }

  /**
   * Toggles all unlocked medal textures
   */
  setupMedals() {
    for(let level of Object.keys(this.medals)) {
      for(let i = 0; i < this.player_data["medals"][level]; i++) {
        this.toggleMedal(this.getMedal(level, i), i);
      }
    }
  }

  /**
   * Displays tooltip for level select screen
   * @param {Phaser.GameObjects.Sprite} target Level preview user moused over
   * @param {number} levelID ID of level selected 
   */
  showToolTip(target, levelID) {
    if(levelID < 9) {
      this.clearToolTip();
      let container = this.add.sprite(target.x-120, target.y, "beige_panel");
      this.levelSelectLayer.add(container);
      let levelNameText = this.add.text(target.x-165, target.y-40, DESIGNED_LEVELS[levelID]['name'], {fontSize: "13px", color: "0x000000"});
      this.levelSelectLayer.add(levelNameText);
      let levelDifficultyText = this.add.text(target.x-165, target.y-20, "Difficulty:\n" + DESIGNED_LEVELS[levelID]['difficulty']+"/10", {fontSize: "13px", color: "0x000000"});
      this.levelSelectLayer.add(levelDifficultyText);
      let levelWavesText = this.add.text(target.x-165, target.y+15, "Waves: " + ((DESIGNED_LEVELS[levelID]['customWaves']) ? DESIGNED_LEVELS[levelID]['customWaves'].length : WAVES.length), {fontSize: "13px", color: "0x000000"} );
      this.levelSelectLayer.add(levelWavesText);

      this.activeTooltip=[container, levelNameText, levelDifficultyText, levelWavesText];

    } else {
      this.showRandomMapToolTip(target);
    }
  }

  /**
   * Remove all tool tips from level
   */
  clearToolTip() {
    for(let i = 0; i < this.activeTooltip.length; i++) {
      this.activeTooltip[i].destroy();
    }
    this.activeTooltip=[];
  }

  /**
   * Displays tooltip for level select screen for a randomly generated level
   * @param {Phaser.GameObjects.Sprite} target Level preview user moused over
   * @param {number} levelID ID of level selected 
   */
  showRandomMapToolTip(target) {
    this.clearToolTip();
    let container = this.add.sprite(target.x-120, target.y, "beige_panel");
    this.levelSelectLayer.add(container);
    let levelNameText = this.add.text(target.x-165, target.y-40, "Randomly\nGenerated\nLevel", {fontSize: "13px", color: "0x000000"});
    this.levelSelectLayer.add(levelNameText);
    let levelDifficultyText = this.add.text(target.x-165, target.y+2.5, "Difficulty:\n?/10", {fontSize: "13px", color: "0x000000"});
    this.levelSelectLayer.add(levelDifficultyText);
    let levelWavesText = this.add.text(target.x-165, target.y+30, "Waves: 100", {fontSize: "13px", color: "0x000000"});
    this.levelSelectLayer.add(levelWavesText);

    this.activeTooltip=[container, levelNameText, levelDifficultyText, levelWavesText];
  }
}