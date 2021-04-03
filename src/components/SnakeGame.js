import { useState, useEffect, useCallback, useRef } from 'react';

import { GameBoard } from '../components/GameBoard';
import { GameOver } from '../components/GameOver';
import { EffectNotification } from '../components/EffectNotification'

import { BOARD_EFFECTS } from '../constants/boardEffectsConstants'; 
import { GAME_CONFIG } from '../configs'

import { useInterval, useAudio, useBoardEffects, getScoreUntilNextEffect, useLocalStorage } from '../hooks';
import { createBoard, createSnake, isOutOfBoundaries, getCellPosition, isBodyCollision } from '../utils/boardUtils';
import { getKeyDirection, isOppositeDirection, getCoordinatesByDirection, getCoordinatesByValue, getBoundaryCoordinatesByDirection, getOppositeDirection } from '../utils/coordinateUtils';
import { getRandomNumberExcluded } from '../utils/booleanUtils'

import './SnakeGame.css';


const board = createBoard(GAME_CONFIG.boardRowSize, GAME_CONFIG.boardColSize);
const initialSnake = createSnake(board, GAME_CONFIG.snakeHeadPositionFactor);
const STORAGE_STATS_KEY = 'highest-stats';


export const SnakeGame = () => {
  const [ snakeSpeed, setSnakeSpeed ] = useState(GAME_CONFIG.snakeSpeed);
  const [ snake, setSnake ] = useState(initialSnake);
  const initialFoodCell = getRandomNumberExcluded(snake.head.cell, GAME_CONFIG.boardEndCellId, [snake.head.cell])
  const [ foodCells, setFoodCells ] = useState([initialFoodCell]);
  const [ wallCells, setWallCells ] = useState([]);
  const [ direction, setDirection ] = useState(null);
  const fututeDirection = useRef(direction)
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
    const initialSnake = createSnake(board, GAME_CONFIG.snakeHeadPositionFactor);;
    const initialFoodCell = getRandomNumberExcluded(initialSnake.head.cell, GAME_CONFIG.boardEndCellId, [initialSnake.head.cell]);

    updateHighestState();
    fututeDirection.current = null;

    setInsivibleWalls(GAME_CONFIG.invisibleWalls);
    setReverseControl(GAME_CONFIG.reverseControl);
    setIsGameOver(false);
    setSnake(initialSnake);
    setFoodCells([initialFoodCell]);
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
        direction = getOppositeDirection[direction];
      }

      if (isValidDirection) {
        // Since keydown logic happens outside on tick interval, we can't update direction state here.
        // Instead we're saving only ref with future direction and save it inside interval tick update
        fututeDirection.current = direction;
      }
    }

    return function() {
      window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isGameOver, reverseControl])

  useInterval(() => {
    if (!fututeDirection.current) return;

    const newDirection = isOppositeDirection(direction, fututeDirection.current) ? direction : fututeDirection.current;
    let nextHeadPosition = getCoordinatesByDirection(snake.head, newDirection); 

    // Out of board size - end the game
    if (isOutOfBoundaries(nextHeadPosition, board)) {
      if (invisibleWalls) {
        nextHeadPosition = getBoundaryCoordinatesByDirection(nextHeadPosition, board, newDirection)
      } else {
        return setIsGameOver(true);
      }
    }

    const nextHeadCellPosition = getCellPosition(board, nextHeadPosition.row, nextHeadPosition.col);
    const newHead = {...nextHeadPosition, cell: nextHeadCellPosition};
    let updatedSnakeCells = [];

    // Checking snake body collision with new snake head 
    if (isBodyCollision(snake.cells, newHead.cell)) {
      return setIsGameOver(true);
    }

    // Checking wall cells collision with new snake head
    if (isBodyCollision(wallCells, newHead.cell)) {
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

    setDirection(newDirection);
    setSnake({ head: newHead, tail: newTail, cells: updatedSnakeCells });
  }, !isGameOver ? snakeSpeed : null); // stop interval on game over

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
          <p>You need to get <span className="information-note">{getScoreUntilNextEffect(score)}</span> points to generate next effect.</p>
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
  )
}
