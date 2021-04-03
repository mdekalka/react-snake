import foodSound from '../sounds/food.wav';
import dieSound from '../sounds/game-over.mp3';
import themeSound from '../sounds/main-theme.mp3';

export const SOUNDS_HASH = {
  Food: { name: 'Food', path: foodSound, repeat: false },
  GameOver: { name: 'GameOver', path: dieSound, repeat: false },
  MainTheme: { name: 'MainTheme', path: themeSound, repeat: true }
};
