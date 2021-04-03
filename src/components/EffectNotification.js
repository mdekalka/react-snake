import { useEffect, useState } from 'react';

import './EffectNotification.css';


export const EffectNotification = ({ effect, delay }) => {
  const [ visible, setVisible ] = useState(true);

  useEffect(() => {
    let timeoutId = null;
    setVisible(true)

    if (effect) {
      timeoutId = setTimeout(() => {
        setVisible(false);
        clearInterval();
      }, delay);
    }

    function clearInterval() {
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
    }

    return function() {
      clearInterval();
    }
  }, [effect, delay]);

  return (visible && effect) ? (
    <div className="notification">
      <p className="notification-text">
        <span className={`notification-note ${effect.quality}`}>{effect.icon}</span>  - {effect.description}
      </p>
    </div>) : null
}

EffectNotification.defaultProps = {
  delay: 2000,
  effect: null
}
