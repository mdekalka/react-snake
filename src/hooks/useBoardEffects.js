import { useEffect, useState } from 'react';
import { GAME_CONFIG } from '../configs';
import { getRandomNumbersExcluded } from '../utils/booleanUtils';
import { difference, arrayToHash } from '../utils/arrayUtils';

export const BOARD_EFFECTS = [
  {
    id: '#1',
    name: 'speedRecovery',
    description: 'Recovers speed to original start value.',
    icon: '✈',
    quality: 'positive'
  },
   {
     id: '#2',
     name: 'foodRain',
     description: 'Generates multiple food cells across the board.',
     icon: '✵',
     quality: 'positive',
   },
   {
     id: '#3',
     name: 'noBorders',
     description: 'Allow snake to go through borders w/o damage.',
     icon: '↹',
     quality: 'positive',
     interactWith: '$8'
   },
   {
    id: '#4',
    name: 'normalControl',
    description: 'Arrow controls become normal.',
    icon: '↔',
    quality: 'positive',
    allowedAfter: '#7'
  },

   {
    id: '#5',
    name: 'wallRain',
    description: 'Generates multiple walls across the board.',
    icon: '☲',
    quality: 'negative',
  },
  {
    id: '#6',
    name: 'speedBoost',
    description: 'Significantly increase speed.',
    icon: '➢',
    quality: 'negative',
  },
  {
    id: '#7',
    name: 'reverseControl',
    description: 'Arrow controls become reversed.',
    icon: '⤮',
    quality: 'negative',
    interactWith: '#4'
  },
  {
    id: '#8',
    name: 'borders',
    description: 'Moving through borders not allowed.',
    icon: '↛',
    quality: 'negative',
    allowedAfter: '#3'
  },
]

// Generate effect on every step value
export const EFFECT_UPDATE_STEP = 5;
// Limit count of new generated cells
const ADDITIONAL_CELLS_LIMIT = 5;
// Increase speed value
const SPEED_BOOST_VALUE = 20;

const effectsHash = arrayToHash(BOARD_EFFECTS, 'id');
const effectIds = Object.keys(effectsHash);

function getSkipEffectIds() {
  return BOARD_EFFECTS
    .filter(effect => effect.allowedAfter)
    .map(effect => effect.id);
}

export function getScoreUntilNextEffect(score) {
  const rest = score % EFFECT_UPDATE_STEP;
  
  return EFFECT_UPDATE_STEP - rest;
}

export const useBoardEffects = ({ score, snake, setSnakeSpeed, foodCells, setFoodCells, wallCells, setWallCells, setInsivibleWalls, setReverseControl }) => {
  const [ currentEffect, setCurrentEffect ] = useState(null);
  const [ skipEffectIds, setSkipEffectsIds ] = useState(getSkipEffectIds);

  useEffect(() => {
    const shouldGenerate = shouldGenerateEffect();
    console.log(score, 'SCORE')
    console.log(shouldGenerate, 'shouldGenerate')

    if (shouldGenerate) {
      const effect = generateNextEffect();

      console.log(effect, 'EFFETCT')

      if (effect) {
        setCurrentEffect({ ...effect });
        applyEffect(effect);
      }
    }
  }, [score]);

  function shouldGenerateEffect() {
    if (!score) return false;

    return getScoreUntilNextEffect(score) === EFFECT_UPDATE_STEP;
  }

  function generateNextEffect() {
    // TODO: Too over bloated, this should be much easier logic.
    const allowedEffectIds = difference(effectIds, skipEffectIds);
    const effectId = allowedEffectIds[Math.floor(Math.random() * allowedEffectIds.length)];
    const effect = effectsHash[effectId];

    console.log(effect, 'ASFASF')

    if (effect.interactWith) {
      if (skipEffectIds.includes(effect.interactWith)) {
        setSkipEffectsIds(skipEffectIds.filter(id => id !== effect.interactWith));
      } else {
        setSkipEffectsIds([...skipEffectIds, effect.interactWith])
      }
    }

    return effect;
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