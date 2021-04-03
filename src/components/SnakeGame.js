import { useState, useEffect, useCallback, useRef } from 'react';

import { Spinner } from '../components/common/Spinner'; 
import { GameBoard } from '../components/GameBoard';
import { GameOver } from '../components/GameOver';
import { GameStatistics } from '../components/GameStatistics'; 
import { EffectNotification } from '../components/EffectNotification'
 
import { GAME_CONFIG } from '../configs'

import { useInterval, useAudio, useBoardEffects, useLocalStorage } from '../hooks';
import { createBoard, createSnake, isOutOfBoundaries, getCellPosition, isBodyCollision } from '../utils/boardUtils';
import { getKeyDirection, isOppositeDirection, getCoordinatesByDirection, getCoordinatesByValue, getBoundaryCoordinatesByDirection, getOppositeDirection } from '../utils/coordinateUtils';
import { getRandomNumberExcluded } from '../utils/common/booleanUtils'

import './SnakeGame.css';


const board = createBoard(GAME_CONFIG.boardRowSize, GAME_CONFIG.boardColSize);
const initialSnake = createSnake(board, GAME_CONFIG.snakeHeadPositionFactor);
const initialFoodCell = getRandomNumberExcluded(initialSnake.head.cell, GAME_CONFIG.boardEndCellId, [initialSnake.head.cell]);
const STORAGE_STATS_KEY = 'highest-stats';


export const SnakeGame = () => {
  const [ snake, setSnake ] = useState(initialSnake);
  const [ snakeSpeed, setSnakeSpeed ] = useState(GAME_CONFIG.snakeSpeed);
  const [ foodCells, setFoodCells ] = useState([initialFoodCell]);
  const [ direction, setDirection ] = useState(null);
  const fututeDirection = useRef(direction);

  const [ highestStats, saveHighestStats ] = useLocalStorage(STORAGE_STATS_KEY, { highestScore: 0, highestSpeed: GAME_CONFIG.snakeSpeed });
  const [ score, setScore ] = useState(0);
  const [ isGameOver, setIsGameOver ] = useState(false);

  const [ enabledSound, setEnabledSound ] = useState(false);
  const { loading, play, sounds } = useAudio(enabledSound);

  const [ wallCells, setWallCells ] = useState(GAME_CONFIG.deathWalls);
  const [ invisibleWalls, setInsivibleWalls ] = useState(GAME_CONFIG.invisibleWalls);
  const [ reverseControl, setReverseControl ] = useState(GAME_CONFIG.reverseControl);
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
    let updatedStats = {
      ...(isNewHighestScore && { highestScore: score }),
      ...(isNewHighestSpeed && { highestSpeed: snakeSpeed }),
    };

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
    setWallCells(GAME_CONFIG.deathWalls);
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

      if (isValidDirection) {
        if (reverseControl) {
          direction = getOppositeDirection(direction);
        }

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
        nextHeadPosition = getBoundaryCoordinatesByDirection(nextHeadPosition, board, newDirection);
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
      setSnakeSpeed(speed => speed - GAME_CONFIG.speedGap);
      setScore(score => score + 1);

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
    const foodCell = getRandomNumberExcluded(GAME_CONFIG.boardStartCellId, GAME_CONFIG.boardEndCellId, snakeCells);
    const newFoodCells = foodCells.filter(cell => !snakeCells.includes(cell));

    setFoodCells([...newFoodCells, foodCell]);
  }

  function onToggleAudio() {
    setEnabledSound(sound => !sound);
  }

  return (
    <div className="game-wrapper">
      {loading
        ? <Spinner position={{ top: 25, right: 25 }} />
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
      <GameStatistics score={score} snakeSpeed={snakeSpeed} stats={highestStats} />
    </div>
  )
}
