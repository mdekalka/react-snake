import { useState, useEffect, useCallback } from 'react';

import { audioWorkflow } from '../../workflow/audioWorkflow';


export const useAudio = (enabled) => {
  const [ loadingAudio, setLoadingAudio ] = useState(null);
  const [ enabledAudio, setEnabledAudio ] = useState(false);

  useEffect(() => {
    audioWorkflow.onStateUpdate(loading => {
      setLoadingAudio(loading);
    });
  }, []);

  useEffect(() => {
    setEnabledAudio(enabled);

    if (!enabled) {
      audioWorkflow.stop();
    }
  }, [enabled]);

  const play = useCallback((soundType) => {
    if (enabledAudio) {
      audioWorkflow.play(soundType);
    }
  }, [enabledAudio]);

  return {
    loading: loadingAudio,
    sounds: audioWorkflow.sounds,
    play
  }
}
