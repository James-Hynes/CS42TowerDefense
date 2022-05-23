let TOWER_TYPES = {
  0: {name: "Basic Tower", type: "Offensive", description: "Shoots high damage missiles at an average fire rate", radius: 150, rate: 90, bullet: 250, bullet_damage: 10, cost: 200, base_img: 180, img: 249, base_offset_settings: [0.5, 0.5], img_offset_settings: [0.5, 0.7], customFire: (scene, tower) => {for(let i = -10; i <= 10; i+=20) {let radian_angle = degrees_to_radians(tower.angle+6);let bullet = new Bullet(scene, ((Math.sin(radian_angle) * 50) + (tower.x))+i, (-Math.cos(radian_angle) * 50) + (tower.y), 12, tower.settings["bullet"], tower.settings["bullet_damage"]);bullet.angle = tower.angle;scene.bulletLayer.add(bullet)}tower.fireQueued = false;}},
  1: {name: "Missile Tower", type: "Offensive", description: "Shoots very high-damage missiles at a slow rate of fire", radius: 100, rate: 100, bullet: 250, bullet_damage: 4, cost: 500, base_img: 179, img: 203, base_offset_settings: [0.5, 0.5], img_offset_settings: [0.5, 0.7], customFire: (scene, tower) => {for(let i = -10; i <= 10; i+=20) {let radian_angle = degrees_to_radians(tower.angle+6);let bullet = new Bullet(scene, ((Math.sin(radian_angle) * 50) + (tower.x))+i, (-Math.cos(radian_angle) * 50) + (tower.y), 12, tower.settings["bullet"], tower.settings["bullet_damage"]);bullet.angle = tower.angle;scene.bulletLayer.add(bullet)}tower.fireQueued = false;}}, 
  2: {name: "Artillery", type: "Offensive", description: "Shoots very fast moving high damage bullets at slow rate of fire", radius: 400, rate: 100, bullet: 325, bullet_damage: 4, cost: 500, base_img: 179, img: 248, base_offset_settings: [0.5, 0.5], img_offset_settings: [0.5, 0.7], customFire: (scene, tower) => {let radian_angle = degrees_to_radians(tower.angle+6);let bullet = new Bullet(scene, ((Math.sin(radian_angle) * 50) + (tower.x)), (-Math.cos(radian_angle) * 50) + (tower.y), 20, tower.settings["bullet"], tower.settings["bullet_damage"]);bullet.angle = tower.angle;scene.bulletLayer.add(bullet);tower.fireQueued = false;}},
  3: {name:"Turret", type: "Offensive", description: "Shoots low damage bullets at a rapid rate of fire", radius: 400, rate: 10, bullet: 314, bullet_damage: 0.25, cost: 500, base_img: 181, img: 313, base_offset_settings: [0.5, 0.5], img_offset_settings: [0.5, 0.75], customFire: (scene, tower) => {for(let i = -10; i <= 10; i+=20) {let radian_angle = degrees_to_radians(tower.angle+6);let bullet = new Bullet(scene, ((Math.sin(radian_angle) * 50) + (tower.x))+i, (-Math.cos(radian_angle) * 50) + (tower.y), 20, tower.settings["bullet"], tower.settings["bullet_damage"]);bullet.angle = tower.angle;scene.bulletLayer.add(bullet)}tower.fireQueued = false;}},
  4: {name: "Laser Tower", type: "Offensive", description: "Shoots a laser that deals damage over time and can slow enemies", radius: 100, rate: 5, bullet: 325, bullet_damage: 0.75, cost: 500, base_img: 179, img: 504, base_offset_settings: [0.5, 0.5], img_offset_settings: [0.5, 0.7], customFire: false},
  5: {name: "Beacon", type: "Passive", description: "Gives towers around it a boost to their stats.", radius: 100, rate: 100, bullet: 325, bullet_damage: 4, cost: 500, base_img: 179, img: 507, base_offset_settings: [0.5, 0.5], img_offset_settings: [0.5, 0.7], customFire: (scene, tower) => {}},
  6: {name: "Factory", type: "Offensive", description: "Creates mines and places them on the track.", radius: 150, rate: 100, bullet: 325, bullet_damage: 4, cost: 500, base_img: 517, img: 505, base_offset_settings: [0.5, 0.5], img_offset_settings: [0.5, 0.5], customFire: (scene, tower) => {}},
  7: {name: "Store", type: "Passive", description: "Provides extra money for killing enemies and income after each wave", radius: 200, rate: 100, bullet: 325, bullet_damage: 4, cost: 500, base_img: 517, img: 506, base_offset_settings: [0.5, 0.5], img_offset_settings: [0.5, 0.5], customFire: (scene, tower) => {}},
  8: {name: "Lightning Tower", type: "Offensive", description: "Shoots bolts of lightning that inflict static condition and deal damage", radius: 110, rate: 5, bullet: 325, bullet_damage: 0.1, cost: 500, base_img: 517, img: 509, base_offset_settings: [0.5, 0.5], img_offset_settings: [0.5, 0.5], customFire: (scene, tower) => {}},
  9: {name: "Windmill", type: "Passive", description: "Regens health and provides income after each round", radius: 0, rate: 100, bullet: 325, bullet_damage: 4, cost: 500, base_img: 517, img: 537, base_offset_settings: [0.5, 0.5], img_offset_settings: [0.5, 0.5], customFire: (scene, tower) => {}},
  10: {name: "Bomb", type: "Temporary", description: "Detonates 3 seconds after being placed, dealing AOE damage.", radius: 100, rate: 100, bullet: 325, bullet_damage: 4, cost: 500, base_img: 517, img: 515, base_offset_settings: [0.5, 0.5], img_offset_settings: [0.5, 0.5], customFire: (scene, tower) => {}},
  11: {name: "Mine", type: "Temporary", description: "Detonates after being touched by an enemy, dealing AOE damage.", radius: 100, rate: 100, bullet: 325, bullet_damage: 4, cost: 500, base_img: 517, img: 516, base_offset_settings: [0.5, 0.5], img_offset_settings: [0.5, 0.5], customFire: (scene, tower) => {}},
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
   ],
   4: [
    [{title: "Ice Beam", description: "Inflicts ice status condition on enemies", eff: 
    (tower) => {
      let tx;
      if(tower.upgrades[1] < 2) {
        tx = "laser";
      } else {
        tx = "laser4";
      }
      for(let laser of tower.lasers) {
        laser.setTexture(tx);
      }
    }, cost: 300},
      {title: "Colder Ice", description: "Increases slowness from ice status condition", cost: 500, eff:
    (tower) => {
      let tx;
      if(tower.upgrades[1] < 2) {
        tx = "laser2";
      } else {
        tx = "laser4";
      }
      for(let laser of tower.lasers) {
        laser.setTexture(tx);
      }
      tower.settings['iceseverity']=3;
    }},
    {title: "Advanced Targeting", description: "Tower will try to freeze all enemies in its radius before targeting frozen enemies.", cost: 500, eff:
    (tower) => {
      tower.settings['targetpriority']=1;
    }},
    {title: "Extra Lasers", description: "Adds two more lasers to the tower", cost: 500, eff:
    (tower) => {
      tower.settings['activelasers']=3;
    }}
    ],
    [{title: "Faster Laser", description: "Lasers deal damage 10% faster", eff: (tower) => {
      tower.settings['rate'] = addPercentToNumber(tower.settings['rate'], 10);
    },
       cost: 300
    },
    {title: "Stronger Laser", description: "Laser deals more damage with each tick", cost: 500, eff:
    (tower) => {
      tower.settings['bullet_damage']=0.7;
    }},
    {title: "Fire Laser", description: "Inflicts fire status condition on enemies", cost: 500, eff:
    (tower) => {
      let tx;
      if(tower.upgrades[0] > 0) {
        if(tower.upgrades[0] > 1) {
          tx = "laser4"
        } else {
          tx = "laser4"
        }
      } else {
        tx = "laser5"
      }
      for(let laser of tower.lasers) {
        laser.setTexture(tx);
      }
    }},
    {title: "Extra Lasers", description: "Adds two more lasers to the tower", cost: 500, eff:
    (tower) => {
      tower.settings['activelasers']=3;
    }}]
   ],
   5: [
    [{title: "Faster Radar", description: "Radar works faster, giving +5% rate of fire to towers within radius.", eff: 
    (tower) => {
      tower.boostsToGive['rate'] -= 0.05;
      tower.circle_duration=1000;
      tower.clearCircles();
      tower.createCircle(0x1a65ac);
    }, cost: 300}, {
      title: "Better Deals", description: "All towers within radius sell for 25% more", cost: 750, eff: 
      (tower) => {
        tower.circles[0].setStrokeStyle(1, 0x27e85b);
        tower.boostsToGive['sell']=25;
      }
    }, {
      title: "Improved Radar", description: "Gives +15% boost to rate of fire of towers within radius", cost: 300, eff: 
      (tower) => {
        tower.boostsToGive['rate']-=0.15;
        tower.circles[0].setStrokeStyle(1, 0xed092f);
      }
    }, {
      title: "Triple Radar", description: "Increases all boosts by 15%", cost: 10000, eff: 
      (tower) => {
        tower.boostsToGive['sell']+=15;
        tower.boostsToGive['rate']-=0.15;
        tower.boostsToGive['radius']+=0.15;
        tower.clearCircles();
        for(let i = 0; i < 3; i++) {
          setTimeout(() => {
            tower.createCircle(0xed092f);
          }, i * 200);
        }

      }
    }],
    [{title: "Long Range Scan", description: "Increases tower's radius by 5%", eff: 
      (tower) => {
        tower.clearCircles();
        tower.settings['radius'] = addPercentToNumber(tower.settings['radius'], 5);
        let color = ((tower.upgrades[0] > 1) ? 0x27e85b : 0x1a65ac);
        tower.createCircle(color)
      },
       cost: 300
      }, 
      {title: "Better Boost", description: "Increases tower radius boost by 10%", 
      eff: (tower) => {
        tower.boostsToGive['radius']+=0.1;
      }
      , cost: 800}, 
      {title: "Maximum Range Scanners", description: "Tower can now boost the entire map.", eff: 
      (tower) => {
        tower.settings['radius'] = 1400;
        tower.clearCircles();
        let color = ((tower.upgrades[0] > 1) ? 0x27e85b : 0x1a65ac);
        tower.createCircle(color)
      }
      , cost: 800}, {
        title: "Advanced Scanners", cost: 4000, description: "Shows life bars for all enemies", eff: 
        (tower) => {
          tower.showLifeBars = true;
        }}]
   ],
   6: [
    [{title: "Faster Production", description: "Produces mines 10% faster.", eff: 
    (tower) => {
      tower.settings['rate'] = subtractPercentFromNumber(tower.settings['rate'], 0.1);
    }, cost: 300}, {
      title: "Improved Range", description: "Gives tower a 20% higher radius", cost: 750, eff: 
      (tower) => {
        tower.settings['radius'] = addPercentToNumber(tower.settings['radius'], 20);
        tower.roadOptions = tower.getNearestRoadTiles();
      }
    }, {
      title: "Ice Mines!", description: "Gives mines produced from this tower an ice effect.", cost: 300, eff: 
      (tower) => {
        tower.iceEnabled = 1;
      }
    }, {
      title: "Deep Freeze", description: "Mines do more damage and inflict a more severe ice effect.", cost: 10000, eff: 
      (tower) => {
        tower.settings['bullet_damage'] = 5;
        tower.iceEnabled = 2;
      }
    }],
    [{title: "Bigger Boom!", description: "Increases mine explosion radius by 5%", eff: 
      (tower) => {
        tower.mineBoosts["radius"]+=5;
      },
       cost: 300
      }, 
      {title: "Fast Production!", description: "Produces mines 10% faster.", 
      eff: (tower) => {
        tower.settings['rate'] = subtractPercentFromNumber(tower.settings['rate'], 0.1);
      }
      , cost: 800}, 
      {title: "Better Mines", description: "Mines do 20% more damage on explosion", eff: 
      (tower) => {
        tower.mineBoosts['damage'] += 20;
      }
      , cost: 800}, {
        title: "Crazy Mines!", cost: 4000, description: "Mines have significantly increasesed damage and radius.", eff: 
        (tower) => {
          tower.mineBoosts['damage'] += 20;
          tower.mineBoosts['radius'] += 20;
        }}]
   ],
   7: [
    [{title: "Income Up", description: "Tower produces 50% more income after each round.", eff: 
    (tower) => {
      tower.settings['income'] = addPercentToNumber(tower.settings['income'], 50);
    }, cost: 300}, {
      title: "Stock Items", description: "Tower generates extra money during rounds", cost: 750, eff: 
      (tower) => {
        tower.createItems("BAD_ITEMS");
        tower.settings['midroundincome']=true;
      }
    }, {
      title: "Better Items", description: "Tower generates even more money during each round", cost: 300, eff: 
      (tower) => {
        tower.settings['midroundincomemod']=1.5;
        tower.clearItems();
        tower.createItems("GOOD_ITEMS");
      }
    }, {
      title: "Final Upgrade(TEMP)", description: "Tower generates 200% income", cost: 10000, eff: 
      (tower) => {
        tower.settings['income'] *=2;
      }
    }],
    [{title: "Better Pay", description: "All Enemies killed within this tower's radius are worth 2x their base value", eff: 
      (tower) => {
        tower.createEmployee(0);
        tower.settings['moneymod'] = 2;
      },
       cost: 300
      }, 
      {title: "Income Up", description: "Tower produces 20% more income after each round", 
      eff: (tower) => {
        tower.settings['income'] = addPercentToNumber(tower.settings['income'], 20);
      }
      , cost: 600}, 
      {title: "More Employees", description: "All enemies killed within tower's radius are now worth 3x their base value", eff: 
      (tower) => {
        tower.createEmployee(1);
        tower.settings['moneymod'] = 3;
      }
      , cost: 800}, {
        title: "Final Upgrade (TEMP) ", cost: 4000, description: "Generate 200% more income from all enemies within this tower's radius", eff: 
        (tower) => {
          tower.settings['moneymod'] = 6;
        }}]
   ],
   8: [
    [{title: "More Chains", description: "Lightning can chain to +2 enemies", eff: 
    (tower) => {
      tower.settings['chains'] += 2;
    }, cost: 300}, {
      title: "Damage Up", description: "Lightning does +2 damage.", cost: 750, eff: 
      (tower) => {
        tower.settings['bolt_color'] = "0xf26b71";
        tower.settings['bullet_damage'] += 2;
      }
    }, {
      title: "Maximum Chains", description: "Tower can chain to every enemy within its radius", cost: 300, eff: 
      (tower) => {
        tower.settings['chains']=Infinity;
      }
    }, {
      title: "Unstable Lightning", description: "Lightning now has a chance to inflict a random status condition", cost: 10000, eff: 
      (tower) => {
        tower.settings['unstable'] = true;
      }
    }],
    [{title: "Rate Up", description: "Lightning shoots 20% faster", eff: 
      (tower) => {
        tower.settings['rate'] = subtractPercentFromNumber(tower.settings['rate'], 0.2);
      },
       cost: 300
      }, 
      {title: "Radius Up", description: "Tower has a +20% radius", 
      eff: (tower) => {
        tower.settings['radius'] = addPercentToNumber(tower.settings['radius'], 20);
      }
      , cost: 600}, 
      {title: "Damage Up", description: "Lightning does +3 damage", eff: 
      (tower) => {
        tower.settings['bullet_damage'] += 3;
      }
      , cost: 800}, {
        title: "Final Upgrade (TEMP) ", cost: 4000, description: "All tower stats are multiplied by 1.5.", eff: 
        (tower) => {
          tower.settings['radius'] = addPercentToNumber(tower.settings['radius'], 50);
          tower.settings['rate'] = subtractPercentFromNumber(tower.settings['rate'], 0.5);
          tower.settings['bullet_damage'] = addPercentToNumber(tower.settings['bullet_damage'], 50);
        }}]
   ],
   9: [
    [{title: "Restoration Up", description: "Restore one more life after each round", eff: 
    (tower) => {
      tower.settings['restoration']+=1;
    }, cost: 300}, {
      title: "More Restoration", description: "Restore two more lives after each round", cost: 750, eff: 
      (tower) => {
        tower.settings['restoration'] += 2;
      }
    }, {
      title: "Max Lives Up", description: "You can have a maximum of 25 more lives.", cost: 300, eff: 
      (tower) => {
        tower.scene.player.max_lives += 25;
      }
    }, {
      title: "Big Upgrade", description: "You can have 75 more lives and you restore 10 lives at the end of each round.", cost: 10000, eff: 
      (tower) => {
        tower.settings['restoration'] = 10;
        tower.scene.player.max_lives += 75;
      }
    }],
    [{title: "Income Up", description: "Gain 20% more income after each round", eff: 
      (tower) => {
        tower.settings['income'] = addPercentToNumber(tower.settings['income'], 20);
        tower.settings['windmillspeed'] = 12;
        tower.createWindmillAnimation();
      },
       cost: 300
      }, 
      {title: "Income Up", description: "Gain 20% more income after each round", eff: 
      (tower) => {
        tower.settings['income'] = addPercentToNumber(tower.settings['income'], 20);
        tower.settings['windmillspeed'] = 16;
        tower.createWindmillAnimation();
      },
       cost: 300
      },  
      {title: "Income Up", description: "Gain 20% more income after each round", eff: 
      (tower) => {
        tower.settings['income'] = addPercentToNumber(tower.settings['income'], 20);
        tower.settings['windmillspeed'] = 24;
        tower.createWindmillAnimation();
      },
       cost: 300
      },  {title: "Income Up", description: "Gain 20% more income after each round", eff: 
      (tower) => {
        tower.settings['income'] = addPercentToNumber(tower.settings['income'], 20);
        tower.settings['windmillspeed'] = 32;
        tower.createWindmillAnimation();
      },
       cost: 300
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
    },
  4: {"00": 504, "01": 518, "02": 519, "03": 519, "04": 519, 
        "10": 504, "20": 504, "30": 504, "40": 504, "11": 518, 
        "12": 519, "13": 519, "14": 519, "21": 518, "22": 519,
        "23": 519, "24": 519, "42": 519, "41": 518, "32": 519, 
        "31": 518, 
  },
  5: {"00": 507, "01": 520, "02": 521, "03": 522, "04": 522, 
          "10": 507, "20": 507, "30": 507, "40": 507, "11": 520, 
          "12": 521, "13": 522, "14": 522, "21": 520, "22": 521,
          "23": 522, "24": 522, "42": 521, "41": 520, "32": 521, 
          "31": 520, 
  },
  6: {"00": 505, "01": 505, "02": 505, "03": 505, "04": 505, 
          "10": 523, "20": 524, "30": 524, "40": 524, "11": 523, 
          "12": 523, "13": 523, "14": 523, "21": 524, "22": 524,
          "23": 524, "24": 524, "42": 524, "41": 524, "32": 524, 
          "31": 524, 
  },
  7: {"00": 506, "01": 506, "02": 506, "03": 506, "04": 532, 
          "10": 529, "20": 529, "30": 529, "40": 530, "11": 529, 
          "12": 529, "13": 529, "14": 531, "21": 529, "22": 529,
          "23": 529, "24": 531, "42": 530, "41": 530, "32": 529, 
          "31": 529
  },
  8: {"00": 509, "01": 533, "02": 534, "03": 535, "04": 536, 
          "10": 509, "20": 509, "30": 509, "40": 509, "11": 533, 
          "12": 534, "13": 535, "14": 536, "21": 533, "22": 534,
          "23": 535, "24": 536, "42": 534, "41": 533, "32": 534, 
          "31": 533
  },
  9: {"00": 514, "01": 514, "02": 514, "03": 514, "04": 514, 
          "10": 514, "20": 514, "30": 514, "40": 514, "11": 514, 
          "12": 514, "13": 514, "14": 514, "21": 514, "22": 514,
          "23": 514, "24": 514, "42": 514, "41": 514, "32": 514, 
          "31": 514
  }
}

const STANDARD_TOWERS = [0, 1, 2, 3]