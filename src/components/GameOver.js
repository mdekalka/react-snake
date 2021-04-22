import { useEffect } from 'react';

import './GameOver.css';


export const GameOver = ({ score, speed, onGameStart }) => {
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);

    function handleKeyDown(event) {
      const isEnter = event.code === 'Enter';

      isEnter && onGameStart();
    }

    return function() {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [onGameStart]);

  return (
    <div className="game-over" onClick={onGameStart}>
      <h4 className="header">You died...</h4>
      <p className="text">Current score: {score}</p>
      <p className="text">Current speed: {speed}</p>
      <p className="text">Press <span className="highlight">Enter</span> or click <span className="highlight">overlay</span> to start new game.</p>
    </div>
  )
}

GameOver.defaultProps = {
  score: null,
  speed: null,
  onGameStart: () => {}
}
