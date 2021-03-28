import { useEffect, useState } from 'react';
import { GAME_CONFIG } from '../configs';
import { getRandomNumber, getRandomNumbersExcluded } from '../utils/booleanUtils'

export const BOARD_EFFECTS = [
  {
    id: 1,
    name: 'speedRecovery',
    description: 'Recovers speed to original start value.',
    icon: '✈',
    quality: 'positive'
  },
   {
     id: 2,
     name: 'foodRain',
     description: 'Generates multiple food cells across the board.',
     icon: '✵',
     quality: 'positive',
   },
   {
     id: 3,
     name: 'noBorders',
     description: 'Allow snake to go through borders w/o damage.',
     icon: '↹',
     quality: 'positive',
   },
   {
    id: 4,
    name: 'normalControl',
    description: 'Arrow controls become normal.',
    icon: '↔',
    quality: 'positive',
  },

   {
    id: 5,
    name: 'wallRain',
    description: 'Generates multiple walls across the board.',
    icon: '☲',
    quality: 'negative',
  },
  {
    id: 6,
    name: 'speedBoost',
    description: 'Significantly increase speed.',
    icon: '➢',
    quality: 'negative',
  },
  {
    id: 7,
    name: 'reverseControl',
    description: 'Arrow controls become reversed.',
    icon: '⤮',
    quality: 'negative',
  },
  {
    id: 8,
    name: 'borders',
    description: 'Moving through borders not allowed.',
    icon: '↛',
    quality: 'negative',
  },
]

// Generate effect on every count value
export const EFFECT_UPDATE_COUNT = 5;
// Limit count of new generated cells
const ADDITIONAL_CELLS_LIMIT = 5;
// Increase speed value
const SPEED_BOOST_VALUE = 20;

export const useBoardEffects = ({ score, snake, setSnakeSpeed, foodCells, setFoodCells, wallCells, setWallCells, setInsivibleWalls, setReverseControl }) => {
  const [ effectCount, setEffectCount ] = useState(1);
  const [ currentEffect, setCurrentEffect ] = useState(null);

  useEffect(() => {
    const generateEffect = shouldGenerateEffect();

    if (generateEffect) {
      const index = getRandomNumber(0, BOARD_EFFECTS.length - 1);
      const effect = BOARD_EFFECTS[index];

      if (effect) {
        setCurrentEffect(effect);
        applyEffect(effect);
      }
    }  else {
      setCurrentEffect(null);
    };
  }, [score]);

  function shouldGenerateEffect() {
    if (score - (EFFECT_UPDATE_COUNT * effectCount) === 0) {
      setEffectCount(effectCount => effectCount + 1);

      return true;
    }

    return false;
  }

  function applyEffect(effect) {
      switch (effect.name) {
        case 'speedRecovery':
          setSnakeSpeed(GAME_CONFIG.snakeSpeed);
          return;

        case 'foodRain':
          const newFoodCells = getRandomNumbersExcluded(
            GAME_CONFIG.boardStartCellId,
            GAME_CONFIG.boardEndCellId,
            ADDITIONAL_CELLS_LIMIT,
            [...snake.cells, ...foodCells]
          );

          setFoodCells([...newFoodCells, ...foodCells]);
          return;

        case 'noBorders':
          setInsivibleWalls(true);
          return;
          
        case 'wallRain':
          const newWallCells = getRandomNumbersExcluded(
            GAME_CONFIG.boardStartCellId,
            GAME_CONFIG.boardEndCellId,
            ADDITIONAL_CELLS_LIMIT,
            [...snake.cells, ...foodCells, ...wallCells]
          );
          setWallCells([...wallCells, ...newWallCells]);
          return;

        case 'speedBoost':
          setSnakeSpeed(snakeSpeed => snakeSpeed - SPEED_BOOST_VALUE);
          return;

        case 'normalControl':
          setReverseControl(false);
          return

        case 'reverseControl':
          setReverseControl(true);
          return;

        case 'borders':
          setInsivibleWalls(false);
          return;

        default:
          return;
      
      }
  }

  return currentEffect;
}