import { SOUNDS_HASH } from '../constants/soundConstants'; 


class AudioWorkflow {
  constructor(sounds) {
    this.DEFAULT_AUDIO_LEVEL = 0.15;
    this.loading = null;
    this.listenCallback = () => {};

    this.sounds = sounds;
    this.audioContext = null;
    this.audioBuffers = {};
    this.currentPlayingAudio = null;

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

    Promise.all(Object.values(this.sounds).map(sound => this.fetchSound(sound)))
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
    } catch(e) {
      console.error('Fetching or decoding audio files failed with: ', e.message);
    }
  }

  play(sound) {
    if (!sound) return;

    const { name } = sound; 
    const audioBuffer = this.audioBuffers[name];
    const soundOptions = this.sounds[name];

    if (audioBuffer) {
      const playSound = this.audioContext.createBufferSource();
      const gainNode = this.audioContext.createGain();

      gainNode.gain.value = this.DEFAULT_AUDIO_LEVEL;
      gainNode.connect(this.audioContext.destination);

      playSound.buffer = audioBuffer;
      playSound.loop = soundOptions.repeat;
      playSound.connect(gainNode);

      if (playSound.loop) {
        this.stop();

        this.currentPlayingAudio = playSound;
      }

      playSound.start(0);
    }
  }

  pause() {
    if (this.currentPlayingAudio) {
      this.currentPlayingAudio.pause();
    }
  }

  stop() {
    if (this.currentPlayingAudio) {
      this.currentPlayingAudio.stop();
    }
  }
}

export const audioWorkflow = new AudioWorkflow(SOUNDS_HASH);
