import { useState, useEffect, useCallback } from 'react';
import { GameBoard } from './components/GameBoard';
import { GameOver } from './components/GameOver';
import { EffectNotification } from './components/EffectNotification'

import { useInterval, useAudio, useBoardEffects, useLocalStorage, BOARD_EFFECTS, EFFECT_UPDATE_COUNT } from './hooks';
import { GAME_CONFIG } from './configs';
import { createBoard, isOutOfBoundaries, getInitialSnakePosition, getCellPosition, isBodyCollision } from './utils/boardUtils';
import { getKeyDirection, isOppositeDirection, getCoordinatesByDirection, getCoordinatesByValue, getBoundaryCoordinatesByDirection, OPPOSITE_DIRECTION } from './utils/coordinateUtils';
import { getRandomNumberExcluded } from './utils/booleanUtils'

import './App.css';


function getSnake(position) {
  return { head: position, tail: position, cells: [position.cell] };
}
const board = createBoard(GAME_CONFIG.boardRowSize, GAME_CONFIG.boardColSize);
const initialSnake = getSnake(getInitialSnakePosition(board, GAME_CONFIG));
const STORAGE_STATS_KEY = 'highest-stats';


function App() {
  const [ snakeSpeed, setSnakeSpeed ] = useState(GAME_CONFIG.snakeSpeed);
  const [ snake, setSnake ] = useState(initialSnake);
  const foodCell = getRandomNumberExcluded(snake.head.cell, GAME_CONFIG.boardEndCellId, [snake.head.cell])
  const [ foodCells, setFoodCells ] = useState([foodCell]);
  const [ wallCells, setWallCells ] = useState([]);
  const [ direction, setDirection ] = useState(null);
  const [ highestStats, saveHighestStats ] = useLocalStorage(STORAGE_STATS_KEY, { highestScore: 0, highestSpeed: GAME_CONFIG.snakeSpeed });
  const [ score, setScore ] = useState(0);
  const [ isGameOver, setIsGameOver ] = useState(false);
  const [ invisibleWalls, setInsivibleWalls ] = useState(GAME_CONFIG.invisibleWalls);
  const [ reverseControl, setReverseControl ] = useState(GAME_CONFIG.reverseControl);
  const [ enabledSound, setEnabledSound ] = useState(false);
  const { loading, play, sounds } = useAudio(enabledSound);

  const effect = useBoardEffects({
    score,
    snake,
    snakeSpeed,
    setSnakeSpeed,
    foodCells,
    setFoodCells,
    wallCells,
    setWallCells,
    setInsivibleWalls,
    setReverseControl
  });

  const updateHighestState = useCallback(() => {
    const isNewHighestScore = score > highestStats.highestScore;
    const isNewHighestSpeed = snakeSpeed < highestStats.highestSpeed;
    let updatedStats = {};
      
    if (isNewHighestScore) {
      updatedStats.highestScore = score;
    }

    if (isNewHighestSpeed) {
      updatedStats.highestSpeed = snakeSpeed;
    }

    saveHighestStats(stats => ({ ...stats, ...updatedStats }));
  }, [score, snakeSpeed, highestStats, saveHighestStats]);

  const onGameStart = useCallback(() => {
    const initialSnake = getSnake(getInitialSnakePosition(board, GAME_CONFIG));
    const foodCell = getRandomNumberExcluded(initialSnake.head.cell, GAME_CONFIG.boardEndCellId, [initialSnake.head.cell]);

    updateHighestState();

    setIsGameOver(false)
    setSnake(initialSnake);
    setFoodCells([foodCell]);
    setWallCells([]);
    setDirection(null);
    setScore(0);
    setSnakeSpeed(GAME_CONFIG.snakeSpeed);
  }, [updateHighestState]);

  useEffect(() => {
    play(sounds.MainTheme);
  }, [play, sounds]);

  useEffect(() => {
    isGameOver && play(sounds.GameOver);
  }, [isGameOver, play, sounds]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);

    function handleKeyDown(event) {
      if (isGameOver) return;

      let direction = getKeyDirection(event.code);
      const isValidDirection = direction !== '';

      if (reverseControl) {
        direction = OPPOSITE_DIRECTION[direction];
      }

      isValidDirection && setDirection(lastDirection => {
        return isOppositeDirection(lastDirection, direction) ? lastDirection : direction;
      });
    }

    return function() {
      window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isGameOver, reverseControl])

  useInterval(() => {
    if (!direction) return;

    let nextHeadPosition = getCoordinatesByDirection(snake.head, direction); 
  
    // Out of board size - end the game
    if (isOutOfBoundaries(nextHeadPosition, board)) {
      if (invisibleWalls) {
        nextHeadPosition = getBoundaryCoordinatesByDirection(nextHeadPosition, board, direction)
      } else {
        return setIsGameOver(true);
      }
    }

    const nextHeadCellPosition = getCellPosition(board, nextHeadPosition.row, nextHeadPosition.col);
    const newHead = {...nextHeadPosition, cell: nextHeadCellPosition};
    let updatedSnakeCells = [];

    // First guard: when you hit head into snake body
    // Second guard: when you hit head into wall cells
    if (isBodyCollision(snake.cells, newHead.cell) || isBodyCollision(wallCells, newHead.cell)) {
      return setIsGameOver(true);
    }

    if (foodCells.includes(nextHeadCellPosition)) {
      updatedSnakeCells = [...snake.cells, nextHeadCellPosition];

      generateFoodCells(updatedSnakeCells);
      increaseSnakeSpeed();
      increaseScore();
      play(sounds.Food);
    } else {  // no food consumption, just regular moving
      updatedSnakeCells = [...snake.cells];

      updatedSnakeCells.shift();
      updatedSnakeCells.push(newHead.cell);
    }

    const newTail = getCoordinatesByValue(board, updatedSnakeCells[0]);

    setSnake({ head: newHead, tail: newTail, cells: updatedSnakeCells })
  }, snakeSpeed);

  function generateFoodCells(snakeCells) {
    const foodPosition = getRandomNumberExcluded(GAME_CONFIG.boardStartCellId, GAME_CONFIG.boardEndCellId, snakeCells);
    const newFoodCells = foodCells.filter(cell => !snakeCells.includes(cell));

    setFoodCells([...newFoodCells, foodPosition]);
  }

  function increaseSnakeSpeed() {
    setSnakeSpeed(speed => speed - GAME_CONFIG.speedGap);
  }

  function increaseScore() {
    setScore(score => score + 1);
  }

  function onToggleAudio() {
    setEnabledSound(sound => !sound);
  }

  function getScoreCountUntilNextEffect() {
    const rest = score % EFFECT_UPDATE_COUNT;
    console.log(rest, "REST")
    console.log(EFFECT_UPDATE_COUNT - rest, "ASFGASF ")

    return EFFECT_UPDATE_COUNT - rest;
  }


  return (
    <div className="game-wrapper">
      {loading
        ? <div className="loading-spinner"></div>
        : <div className={`sound-control ${enabledSound ? 'on' : ''}`} title="audio toggle" onClick={onToggleAudio}>♬</div>
      }
      <EffectNotification effect={effect} delay={5000} />
      <div className="board-wrapper">
        <GameBoard
          board={board}
          foodCells={foodCells}
          wallCells={wallCells}
          snake={snake}
          direction={direction}
          invisibleWalls={invisibleWalls}
        />
        {isGameOver && <GameOver score={score} speed={snakeSpeed} onGameStart={onGameStart} />}
      </div>
      <div className="information-wrapper">
        <div className="information-board stats-board">
          <h4 className="information-header">Statistics:</h4>
          <p className="information-text">Curent score: {score}</p>
          <p className="information-text">Current speed: {snakeSpeed}</p>
          <hr/>
          <p className="information-text">Hightest score: {highestStats.highestScore}</p>
          <p className="information-text">Hightest speed: {highestStats.highestSpeed}</p>
          <hr/>
          <p>You need to get <span className="information-note">{getScoreCountUntilNextEffect()}</span> points to generate next effect.</p>
        </div>
        <div className="information-board controls-board">
          <h4 className="information-header">Controls:</h4>
          <p className="information-text"><span className="information-note">↑</span> - to move up</p>
          <p className="information-text"><span className="information-note">→</span> - to move right</p>
          <p className="information-text"><span className="information-note">↓</span> - to move down</p>
          <p className="information-text"><span className="information-note">←</span> - to move left</p>
          <hr/>
        </div>
        <div className="information-board effects-board">
          <h4 className="information-header">Board effects:</h4>
          {BOARD_EFFECTS.map(({ id, quality, icon, description}) => (
            <p key={id} className="information-text">
              <span className={`information-note ${quality}`}>{icon}</span>  - {description}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;
