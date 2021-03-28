import React from 'react';

import './GameBoard.css';

function getCellClassName({ cell, foodCells, wallCells, snake, direction }) {
  let className = 'cell';

  if (foodCells.includes(cell)) {
    className += ' food-cell';
  }

  if (snake.cells.includes(cell)) {
    className += ' snake-cell';
  }

  if (snake.head.cell === cell) {
    className += ` head ${direction}`;
  }

  if (wallCells.includes(cell)) {
    className += ` wall-cell`;
  }

  return className;
}

export const GameBoard = ({ board, foodCells, snake, direction, wallCells, invisibleWalls }) => {
  return (
    <div className={`board ${invisibleWalls ? 'no-borders': ''}`}>
      {board.map((row, rowIndex) => (
        <div key={rowIndex} className="row">
          {row.map((cell, cellIndex) => (
            <div key={cellIndex} className={getCellClassName({
              cell, foodCells, wallCells, snake, direction })}>
              <div className="cell-content"></div>
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}

GameBoard.defaultProps = {
  board: [],
  foodCells: [],
  snake: {},
  direction: ''
}
