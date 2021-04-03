import { useEffect, useState } from 'react';

import { InformationTypography } from './common/InformationBoard';

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
      <InformationTypography type="text">
        <InformationTypography type="meta" sign={effect.quality}>
          {effect.icon}
        </InformationTypography>  - {effect.description}
      </InformationTypography>
    </div>) : null
}

EffectNotification.defaultProps = {
  delay: 2000,
  effect: null
}
