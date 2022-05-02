let TOWER_TYPES = {
  0: {radius: 150, rate: 20, bullet: 250, bullet_damage: 10, cost: 200, base_img: 180, img: 249, 
    base_offset_settings: [0.5, 0.5], img_offset_settings: [0.5, 0.7], 
    customFire: (scene, tower) => {
      for(let i = -10; i <= 10; i+=20) {
        let radian_angle = degrees_to_radians(tower.angle+6);
        let bullet = new Bullet(scene, ((Math.sin(radian_angle) * 50) + (tower.x))+i, (-Math.cos(radian_angle) * 50) + (tower.y), 12, tower.settings["bullet"], tower.settings["bullet_damage"]);
        bullet.angle = tower.angle;
        scene.bulletLayer.add(bullet)
      }
      tower.fireQueued = false;
    }},
  1: {radius: 100, rate: 10, bullet: 250, bullet_damage: 4, cost: 500, base_img: 179, img: 203, base_offset_settings: [0.5, 0.5], img_offset_settings: [0.5, 0.7], customFire: (scene, tower) => {
    for(let i = -10; i <= 10; i+=20) {
      let radian_angle = degrees_to_radians(tower.angle+6);
      let bullet = new Bullet(scene, ((Math.sin(radian_angle) * 50) + (tower.x))+i, (-Math.cos(radian_angle) * 50) + (tower.y), 12, tower.settings["bullet"], tower.settings["bullet_damage"]);
      bullet.angle = tower.angle;
      scene.bulletLayer.add(bullet)}
      tower.fireQueued = false;
    }}, 
  2: {radius: 400, rate: 100, bullet: 325, bullet_damage: 4, cost: 500, base_img: 179, img: 248, base_offset_settings: [0.5, 0.5], img_offset_settings: [0.5, 0.7], customFire: (scene, tower) => {
    let radian_angle = degrees_to_radians(tower.angle+6);
    let bullet = new Bullet(scene, ((Math.sin(radian_angle) * 50) + (tower.x)), (-Math.cos(radian_angle) * 50) + (tower.y), 20, tower.settings["bullet"], tower.settings["bullet_damage"]);
    bullet.angle = tower.angle;
    scene.bulletLayer.add(bullet);
    tower.fireQueued = false;}},
    3: {
      radius: 400, rate: 10, bullet: 314, bullet_damage: 4, cost: 500, base_img: 181, img: 313, base_offset_settings: [0.5, 0.5], img_offset_settings: [0.5, 0.75], customFire: (scene, tower) => {for(let i = -10; i <= 10; i+=20) {let radian_angle = degrees_to_radians(tower.angle+6);let bullet = new Bullet(scene, ((Math.sin(radian_angle) * 50) + (tower.x))+i, (-Math.cos(radian_angle) * 50) + (tower.y), 20, tower.settings["bullet"], tower.settings["bullet_damage"]);bullet.angle = tower.angle;scene.bulletLayer.add(bullet)}tower.fireQueued = false;}
    }
};

const TOWER_UPGRADES = {
  0: [
    [{title: "Range Up", description: "Increases tower's range by 50%", 
    eff: (tower) => {
      tower.settings["radius"] = addPercentToNumber(tower.settings["radius"], 50);
    }, cost: 300}, 
    {title: "Rate Up", description: "Increases tower's rate by 10%", 
    eff: (tower) => {tower.settings["rate"] = addPercentToNumber(tower.settings["rate"], 10);
    }, cost: 600}, 
    {title: "Range Up", description: "Increases tower's range by 50%", 
    eff: (tower) => {tower.settings["radius"] = addPercentToNumber(tower.settings["radius"], 50);
    }, cost: 300}, 
    {title: "Big Tower Upgrade 4 0", description: "Increases tower's range by 75% and rate by a lot", 
    eff: (tower) => {tower.settings["radius"] = addPercentToNumber(tower.settings["radius"], 75);
    tower.settings["rate"] = (5);
    }, cost: 50000}
  ],
    [{title: "Rate Up", description: "Increases tower's rate of fire by 25%", 
    eff: (tower) => {tower.settings["rate"] = addPercentToNumber(tower.settings["rate"], 25);
    }, cost: 500}, 
    {title: "Range Up!", description: "Increases tower's range by 50%", 
    eff: (tower) => {tower.settings["radius"] = addPercentToNumber(tower.settings["radius"], 50);
    }, cost: 600}, 
    {title: "Rate Up", description: "Increases tower's rate by 25%", 
    eff: (tower) => {tower.settings["rate"] = addPercentToNumber(tower.settings["rate"], 25);
    }, cost: 600}, 
    {title: "Big Tower Upgrade 4 1", description: "Does things", 
    eff: (tower) => {tower.settings["radius"] = addPercentToNumber(tower.settings["radius"], 50);
    tower.settings["rate"] = addPercentToNumber(tower.settings["rate"], 50);
    tower.settings["customFire"] = ((scene, tower) => {
      for(let i = -40; i <= 40; i+=16) {
        let radian_angle = degrees_to_radians(tower.angle+6);
        let bullet = new Bullet(scene, ((Math.sin(radian_angle) * 50) + (tower.x))+i, (-Math.cos(radian_angle) * 50) + (tower.y), 40, tower.settings["bullet"], tower.settings["bullet_damage"]);
        bullet.angle = tower.angle;
        scene.bulletLayer.add(bullet)
      }
      tower.fireQueued = false;
    });
    }, cost: 30000}
  ]],
   1: [
    [{title: "Range Up", description: "Increases tower's range by 50%", eff: (tower) => {
      tower.settings["radius"] = addPercentToNumber(tower.settings["radius"], 50);}, cost: 300}, 
      {title: "Range Up!", description: "Increases tower's range by 50%", 
      eff: (tower) => {tower.settings["radius"] = addPercentToNumber(tower.settings["radius"], 50);}, cost: 600}, {title: "Range Up", description: "Increases tower's range by 50%", eff: (tower) => {
        tower.settings["radius"] = addPercentToNumber(tower.settings["radius"], 50);}, cost: 300}, 
        {title: "Range Up!", description: "Increases tower's range by 50%", 
        eff: (tower) => {tower.settings["radius"] = addPercentToNumber(tower.settings["radius"], 50);}, cost: 600}],
    [{title: "Rate Up", description: "Increases tower's rate of fire by 50%", eff: (tower) => {
      tower.settings["rate"] = (tower.settings["rate"] - (tower.settings["rate"] / 2))}, cost: 200}, {title: "Range Up!", description: "Increases tower's range by 50%", eff: (tower) => {tower.settings["radius"] = (tower.settings["radius"] + (tower.settings["radius"] / 2))}, cost: 600}, {title: "Rate Up", description: "Increases tower's rate of fire by 50%", eff: (tower) => {
        tower.settings["rate"] = (tower.settings["rate"] - (tower.settings["rate"] / 2))}, cost: 200}, {title: "Range Up!", description: "Increases tower's range by 50%", eff: (tower) => {tower.settings["radius"] = (tower.settings["radius"] + (tower.settings["radius"] / 2))}, cost: 600}]
   ],
   2: [
    [{title: "Range Up", description: "Increases tower's range by 50%", 
    eff: (tower) => {tower.settings["radius"] = (tower.settings["radius"] + (tower.settings["radius"] / 2))}, cost: 300}, 
    {title: "Damage Up", description: "Increases tower's damage", 
    eff: (tower) => {tower.settings["radius"] = (tower.settings["radius"] + (tower.settings["radius"] / 2))}, cost: 300}, 
    {title: "Fire Bullets", description: "fire bullets", 
    eff: (tower) => {
      tower.settings["radius"] = (tower.settings["radius"] + (tower.settings["radius"] / 2));
      tower.settings["customFire"] = ((scene, tower) => {
        for(let i = -20; i <= 20; i+=20) {
          let radian_angle = degrees_to_radians(tower.angle+6);
          let bullet = new Bullet(scene, ((Math.sin(radian_angle) * 50) + (tower.x))+i, (-Math.cos(radian_angle) * 50) + (tower.y), 40, tower.settings["bullet"], tower.settings["bullet_damage"], ["fire", 2]);
          bullet.angle = tower.angle;
          scene.bulletLayer.add(bullet)
        }
        tower.fireQueued = false;
      });
    }, cost: 300}, 
    {title: "Big Tower Upgrade 4 0", description: "does things", 
    eff: (tower) => {
      tower.settings["radius"] = (tower.settings["radius"] + (tower.settings["radius"] / 2));
      tower.settings["customFire"] = ((scene, tower) => {
        for(let i = -20; i <= 20; i+=20) {
          let radian_angle = degrees_to_radians(tower.angle+6);
          let bullet = new Bullet(scene, ((Math.sin(radian_angle) * 50) + (tower.x))+i, (-Math.cos(radian_angle) * 50) + (tower.y), 40, tower.settings["bullet"], tower.settings["bullet_damage"], ["fire", 4]);
          bullet.angle = tower.angle;
          scene.bulletLayer.add(bullet)
        }
        tower.fireQueued = false;
      });
    }, cost: 30000}],
    
    
    [{title: "Rate Up", description: "Increases tower's rate by 15%", 
      eff: (tower) => {tower.settings["rate"] = addPercentToNumber(tower.settings['rate'], 15)}, cost: 300}, {
        title: "Range Up", description: "Increases tower's range by 25%", cost: 500, eff: (tower) => {tower.settings['radius'] = addPercentToNumber(tower.settings['radius'], 25)}
      }, {title: "Damage Up", description: "Increases tower's damage", 
      eff: (tower) => {tower.settings["radius"] = (tower.settings["radius"] + (tower.settings["radius"] / 2))}, cost: 300}, 
      {title: "Big Tower Upgrade 4 1", description: "does stuff", cost: 5000, eff: (tower) => {
        tower.settings['radius']=1000;
        tower.settings['rate']=4;
        tower.settings["customFire"] = ((scene, tower) => {
          for(let i = -10; i <= 10; i+=20) {
            let radian_angle = degrees_to_radians(tower.angle+6);
            let bullet = new Bullet(scene, ((Math.sin(radian_angle) * 50) + (tower.x))+i, (-Math.cos(radian_angle) * 50) + (tower.y), 40, tower.settings["bullet"], tower.settings["bullet_damage"]);
            bullet.angle = tower.angle;
            scene.bulletLayer.add(bullet)
          }
          tower.fireQueued = false;
        }); 
      }}]
   ],
   3: [
    [{title: "Third Barrel", description: "Adds an extra barrel to the tower, shoots more", eff: 
    (tower) => {
      tower.settings["customFire"] = ((scene, tower) => {
        for(let i = -20; i <= 20; i+=20) {
          let radian_angle = degrees_to_radians(tower.angle+6);
          let bullet = new Bullet(scene, ((Math.sin(radian_angle) * 50) + (tower.x))+i, (-Math.cos(radian_angle) * 50) + (tower.y), 40, tower.settings["bullet"], tower.settings["bullet_damage"]);
          bullet.angle = tower.angle;
          scene.bulletLayer.add(bullet)
        }
        tower.fireQueued = false;
      }); 
    }, cost: 300}, {
      title: "Faster Barrels", description: "Shoot 25% faster", cost: 750, eff: (tower) => {
        tower.settings["rate"] = tower.settings["rate"] + (tower.settings["rate"] / 4);
      }
    }, {
      title: "Range Up", description: "Increases tower's range by 10%", cost: 300, eff: (tower) => {
        tower.settings["radius"] = tower.settings["radius"] + (tower.settings["radius"] / 10);
      }
    }, {
      title: "Big Tower Upgrade 4 1", description: "Increases range by 50% and shoots a ton of bullets", cost: 10000, eff: (tower) => {
        tower.settings["radius"] = tower.settings["radius"] + (tower.settings["radius"] / 2);
        tower.settings["rate"] = 3;
      }
    }],
    [{title: "Range Up", description: "Increases tower's range by 50%", eff: (tower) => {
      tower.settings["radius"] = (tower.settings["radius"] + (tower.settings["radius"] / 2))},
       cost: 300
      }, 
      {title: "Damage Up", description: "Increases bullet damage by 25%", eff: (tower) => {
        tower.settings["bullet"] = 339;
        tower.settings["bullet_damage"] = (tower.settings["bullet_damage"] + (tower.settings["bullet_damage"]/2))}
      , cost: 800}, {title: "Bigger Bullets", description: "Increases bullet damage by 25%", eff: (tower) => {
        tower.settings["bullet"] = 337;
        tower.settings["bullet_damage"] = (tower.settings["bullet_damage"] + (tower.settings["bullet_damage"]/2))}
      , cost: 800}, {
        title: "Big Tower Upgrade 4 2", cost: 4000, description: "Shoots missiles dealing 10x damage!", eff: (tower) => {
          if(tower.upgrades[0] < 1) {
            tower.setTexture('tdtiles', tileFrameNames[472]);
          } else {
            tower.setTexture('tdtiles', tileFrameNames[471]);
          }
          tower.settings["bullet_damage"] *= 10;
          tower.settings["bullet"] = 250;
        }
      }]
   ]
}

const TOWER_UPGRADE_IMAGE_PERMUTATIONS = {
  0: {"00": 249, "01": 482, "02": 483, "03": 484, "04": 485, 
      "10": 249, "20": 249, "30": 249, "40": 487, "11": 482, 
      "12": 483, "13": 484, "14": 486, "21": 482, "22": 483,
      "23": 484, "24": 486, "42": 489, "41": 488, "32": 484,
      "31": 482, 
      },
  1: {"00": 203, "01": 500, "02": 501, "03": 501, "04": 501, 
      "10": 498, "20": 499, "30": 499, "40": 499, "11": 503, 
      "12": 502, "13": 502, "14": 502, "21": 503, "22": 502,
      "23": 502, "24": 502, "42": 502, "41": 502, "32": 502,
      "31": 502, 
      },
  2: {"00": 248, "01": 493, "02": 493, "03": 493, "04": 495, 
      "10": 490, "20": 490, "30": 490, "40": 491, "11": 492, 
      "12": 492, "13": 492, "14": 494, "21": 492, "22": 492,
      "23": 492, "24": 496, "42": 494, "41": 494, "32": 492,
      "31": 492, 
  },
  3: {"00": 313, "01": 469, "02": 469, "03": 469, "04": 472, 
      "10": 315, "20": 480, "30": 480, "40": 479, "11": 470, 
      "12": 470, "13": 470, "14": 471, "21": 478, "22": 478,
      "23": 478, "24": 474, "42": 481, "41": 481, "32": 478, 
      "31": 478, 
      }
}