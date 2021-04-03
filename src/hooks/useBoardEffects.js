import { useEffect, useState } from 'react';

import { GAME_CONFIG } from '../configs';
import { BOARD_EFFECTS, GENERATE_EFFECT_SCORE_STEP, EFFECT_CELLS_COUNT, INCREASE_SPEED_VALUE } from '../constants/boardEffectsConstants';
import { getRandomNumbersExcluded, getSampleFromArray } from '../utils/common/booleanUtils';
import { difference, arrayToHash } from '../utils/common/arrayUtils';


const effectsHash = arrayToHash(BOARD_EFFECTS, 'id');
const effectIds = Object.keys(effectsHash);

function getSkipEffectIds() {
  return BOARD_EFFECTS.filter(({ allowedAfter }) => allowedAfter).map(({ id }) => id);
}

export function getScoreUntilNextEffect(score) {
  const rest = score % GENERATE_EFFECT_SCORE_STEP;
  
  return GENERATE_EFFECT_SCORE_STEP - rest;
}

export const useBoardEffects = ({ score, snake, setSnakeSpeed, foodCells, setFoodCells, wallCells, setWallCells, setInsivibleWalls, setReverseControl }) => {
  const [ currentEffect, setCurrentEffect ] = useState(null);
  const [ skipEffectIds, setSkipEffectsIds ] = useState(getSkipEffectIds);

  useEffect(() => {
    // It's probably new game or restart - just re-init the initial state
    if (score === 0) {
      setCurrentEffect(null);
      setSkipEffectsIds(getSkipEffectIds);

      return;
    }

    if (shouldGenerateEffect()) {
      const effect = generateNextEffect();

      if (effect) {
        setCurrentEffect({ ...effect });
        applyEffect(effect);
      }
    }
  }, [score]);

  function shouldGenerateEffect() {
    return getScoreUntilNextEffect(score) === GENERATE_EFFECT_SCORE_STEP;
  }

  function generateNextEffect() {
    const allowedEffectIds = difference(effectIds, skipEffectIds);
    const effectId = getSampleFromArray(allowedEffectIds);
    const effect = effectsHash[effectId];

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
            EFFECT_CELLS_COUNT,
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
            EFFECT_CELLS_COUNT,
            [...snake.cells, ...foodCells, ...wallCells]
          );
          setWallCells([...wallCells, ...newWallCells]);
          return;

        case 'speedBoost':
          setSnakeSpeed(snakeSpeed => snakeSpeed - INCREASE_SPEED_VALUE);
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