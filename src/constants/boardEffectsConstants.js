export const GENERATE_EFFECT_SCORE_STEP = 5;
// Numbers of cells that would be generated on board effect
export const EFFECT_CELLS_COUNT = 5;
// Boost snake speed value
export const INCREASE_SPEED_VALUE = 20;

/*
  List of possible generated board effects
  [allowedAfter]: could be generated only after related effect generated first
  [interactWith]: some effects can be dependent by this effect
*/
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
