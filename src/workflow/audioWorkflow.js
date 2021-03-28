import foodSound from '../sounds/food.wav';
import dieSound from '../sounds/game-over.mp3';
import themeSound from '../sounds/main-theme.mp3';

const SOUND_MAPPER = {
  Food: { name: 'Food', path: foodSound, repeat: false },
  GameOver: { name: 'GameOver', path: dieSound, repeat: false },
  MainTheme: { name: 'MainTheme', path: themeSound, repeat: true }
};

class AudioWorkflow {
  constructor(soundsList) {
    this.loading = null;
    this.listenCallback = () => {};

    this.sounds = {};
    this.soundsList = soundsList;
    this.audioContext = null;
    this.audioBuffers = {};
    this.currentPlayingSound = null;

    this.init();
  }

  init() {
    try {
      this.audioContext = new AudioContext();
    } catch(e) {
      console.error('Audio context is not suppoorted by browser: ', e.message);
    }

    if (this.audioContext) {
      this.loadSounds();
    }
  }

  loadSounds() {
    this.loading = true;
    this.listenCallback(this.loading);

    Promise.all(Object.values(this.soundsList).map(sound => this.fetchSound(sound)))
      .finally(_ => {
        this.loading = false;
        this.listenCallback(this.loading);
      });
  }

  onStateUpdate(callback) {
    this.listenCallback = callback;
    
    this.listenCallback(this.loading);
  }

  async fetchSound(sound) {
    try {
      const response = await fetch(sound.path);

      if (!response.ok) {
        throw new Error(`Fetch http error: ${response.status}`);
      }

      const soundBuffer = await response.arrayBuffer();
      const audioSound = await this.audioContext.decodeAudioData(soundBuffer);

      this.audioBuffers[sound.name] = audioSound;
      this.sounds[sound.name] = sound.name;
    } catch(e) {
      console.error('Fetching audio files failed with: ', e.message);
    }
  }

  play(soundName) {
    const sound = this.audioBuffers[soundName];
    const soundOptions = this.soundsList[soundName];

    if (sound) {
      const playSound = this.audioContext.createBufferSource();
      const gainNode = this.audioContext.createGain();

      gainNode.gain.value = 0.15; // default sound level
      gainNode.connect(this.audioContext.destination);

      playSound.buffer = sound;
      playSound.loop = soundOptions.repeat;
      playSound.connect(gainNode);

      if (playSound.loop) {
        this.stop();

        this.currentPlayingSound = playSound;
      }

      playSound.start(0);
    }
  }

  pause() {
    if (this.currentPlayingSound) {
      this.currentPlayingSound.pause();
    }
  }

  stop() {
    if (this.currentPlayingSound) {
      this.currentPlayingSound.stop();
    }
  }
}

export const audioWorkflow = new AudioWorkflow(SOUND_MAPPER);
