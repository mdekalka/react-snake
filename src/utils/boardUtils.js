export function createBoard(rowSize, colSize) {
  let cellId = 1;
  const board = [];

  for (let i = 0; i < rowSize; i++) {
    const currentRow = [];
    
    for (let j = 0; j < colSize; j++) {
      currentRow.push(cellId++);
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

export function getCellPosition(board, row, col) {
  return board[row][col];
}

function getFactorCellPosition(board, factor) {
  const rowSize = board.length;
  const colSize = board[0].length;

  const row = Math.round(rowSize / (board.length / factor));
  const col = Math.round(colSize / (board.length / factor));
  const cell = getCellPosition(board, row, col);

  return { row, col, cell };
}

export function createSnake(board, snakeHeadFactor) {
  const snakePosition = getFactorCellPosition(board, snakeHeadFactor);

  return { head: snakePosition, tail: snakePosition, cells: [snakePosition.cell] }
}
