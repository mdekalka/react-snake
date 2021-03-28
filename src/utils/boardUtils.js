export function createBoard(rowSize, colSize) {
  let cell_id = 1;
  const board = [];

  for (let i = 0; i < rowSize; i++) {
    const currentRow = [];
    
    for (let j = 0; j < colSize; j++) {
      currentRow.push(cell_id++);
    }

    board.push(currentRow);
  }

  return board;
}

export function isOutOfBoundaries(nextPosition, board) {
  const { row, col } = nextPosition;

  if ( row < 0 || col < 0) return true;
  if (row >= board.length || col >= board[0].length) return true;

  return false;
}

export function isBodyCollision(cells, nextCell) {
  return cells.includes(nextCell);
}

export function getInitialSnakePosition(board, config) {
  const rowSize = board.length;
  const colSize = board[0].length;

  const row = Math.round(rowSize / (board.length / config.snakeHeadPositionFactor));
  const col = Math.round(colSize / (board.length / config.snakeHeadPositionFactor));
  const cell = board[row][col];

  return { row, col, cell };
}

export function getCellPosition(board, row, col) {
  return board[row][col];
}