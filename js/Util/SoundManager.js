class SoundManager {
  constructor(scene) {
    this.scene = scene;
    this.music;
    this.sounds = [];
  }

  playMusic(music, config) {
    this.music = this.scene.sound.add(music, config);
    this.music.volume = this.scene.settings.volume / 5;
    this.music.play();
  }

  playSound(sound, config) {
    let s = this.scene.sound.add(sound, config);
    if(this.checkSoundPlaying(s) < 3) {
      this.sounds.push(s);
      if(config && typeof config['volume'] !== "undefined") {
        s.volume = config['volume'];
      } else {
        s.volume = (this.scene.settings['volume']);
      }
      s.play();
      s.once('complete', () => {this.removeSound(s)});
    }
  }

  removeSound(sound) {
    for(let s of this.sounds) {
      if(s === sound) {
        this.sounds.splice(this.sounds.indexOf(s), 1);
        s.stop();
        s.destroy();
        return;
      }
    }
  }

  removeAllSounds() {
    for(let s of this.sounds) {
      s.stop();
      s.destroy();
    }
    this.sounds = [];
  }

  removeMusic() {
    if(typeof this.music !== "undefined") {
      if(this.music.isPlaying) {
        this.music.stop();
        this.music.destroy();
        this.music = undefined;
      }
    }
  }

  checkSoundPlaying(sound) {
    let count = 0;
    for(let s of this.sounds) {
      if(s.key === sound.key) {
        count++;
      }
    }
    return count;
  }

  getSoundByKey(key) {
    for(let s of this.sounds) {
      if(s.key === key) {
        return s;
      }
    }
  }
}