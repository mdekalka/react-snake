const DIRECTION = {
  UP: 'up',
  RIGHT: 'right',
  DOWN: 'down',
  LEFT: 'left'
};

export const OPPOSITE_DIRECTION = {
  [DIRECTION.UP]: DIRECTION.DOWN,
  [DIRECTION.RIGHT]: DIRECTION.LEFT,
  [DIRECTION.DOWN]: DIRECTION.UP,
  [DIRECTION.LEFT]: DIRECTION.RIGHT
}

export function getKeyDirection(eventCode) {
  switch (eventCode) {
    case 'ArrowLeft':
      return DIRECTION.LEFT;
    case 'ArrowUp':
      return DIRECTION.UP;
    case 'ArrowRight':
      return DIRECTION.RIGHT;
    case 'ArrowDown':
      return DIRECTION.DOWN;

    default:
      return '';
  }
}

export function isOppositeDirection(direction, nextDirection) {
  return OPPOSITE_DIRECTION[direction] === nextDirection;
}

export function getCoordinatesByDirection(coordinates, direction) {
  const { row, col } = coordinates;

  switch (direction) {
    case DIRECTION.UP:
      return { row: row - 1, col };

    case DIRECTION.RIGHT:
        return { row, col: col + 1 };
    
    case DIRECTION.DOWN:
      return { row: row + 1, col };

    case DIRECTION.LEFT:
      return { row, col: col - 1 };

    default:
      return null;
  }
}

export function getBoundaryCoordinatesByDirection(coordinates, board, direction) {
  const { row, col } = coordinates;

  switch (direction) {
    case DIRECTION.UP:
      return { row: board.length - 1, col };

    case DIRECTION.RIGHT:
        return { row, col: 0 };
    
    case DIRECTION.DOWN:
      return { row: 0, col };

    case DIRECTION.LEFT:
      return { row, col: board[0].length - 1 };

    default:
      return null;
  }
}

export function getCoordinatesByValue(board, value) {
  for (let i = 0; i < board.length; i++) {
    for (let j = 0; j < board.length; j++) {
      if (board[i][j] === value) {
        return { row: i, col: j, cell: value }
      }
    }
  }
}
