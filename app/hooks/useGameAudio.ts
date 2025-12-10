import { useEffect, useRef, useCallback } from 'react';

type SoundType = 'success' | 'miss' | 'timeout' | 'gameStart' | 'gameOver' | 'highScore' | 'elfAppear';

export function useGameAudio() {
  const audioContextRef = useRef<AudioContext | null>(null);
  const enabledRef = useRef(true);

  useEffect(() => {
    // Initialize AudioContext on first user interaction
    const initAudio = () => {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
    };

    // Initialize on first interaction
    window.addEventListener('touchstart', initAudio, { once: true });
    window.addEventListener('click', initAudio, { once: true });

    return () => {
      window.removeEventListener('touchstart', initAudio);
      window.removeEventListener('click', initAudio);
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  const playTone = useCallback((frequency: number, duration: number, type: OscillatorType = 'sine', volume: number = 0.3) => {
    if (!enabledRef.current || !audioContextRef.current) return;

    try {
      const ctx = audioContextRef.current;
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.frequency.value = frequency;
      oscillator.type = type;

      gainNode.gain.setValueAtTime(volume, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + duration);
    } catch (error) {
      console.warn('Audio playback failed:', error);
    }
  }, []);

  const playSequence = useCallback((notes: Array<{ freq: number; duration: number; type?: OscillatorType; volume?: number }>) => {
    if (!enabledRef.current || !audioContextRef.current) return;

    let currentTime = 0;
    notes.forEach(note => {
      setTimeout(() => {
        playTone(note.freq, note.duration, note.type, note.volume);
      }, currentTime * 1000);
      currentTime += note.duration;
    });
  }, [playTone]);

  const playSound = useCallback((soundType: SoundType) => {
    if (!enabledRef.current) return;

    switch (soundType) {
      case 'success':
        // Cheerful ascending tones
        playSequence([
          { freq: 523.25, duration: 0.1, type: 'sine', volume: 0.25 }, // C5
          { freq: 659.25, duration: 0.1, type: 'sine', volume: 0.25 }, // E5
          { freq: 783.99, duration: 0.15, type: 'sine', volume: 0.3 }, // G5
        ]);
        break;

      case 'miss':
        // Descending "wrong" sound
        playSequence([
          { freq: 415.30, duration: 0.1, type: 'square', volume: 0.2 }, // G#4
          { freq: 369.99, duration: 0.15, type: 'square', volume: 0.15 }, // F#4
        ]);
        break;

      case 'timeout':
        // Similar to miss but slightly different
        playSequence([
          { freq: 392.00, duration: 0.1, type: 'square', volume: 0.2 }, // G4
          { freq: 349.23, duration: 0.15, type: 'square', volume: 0.15 }, // F4
        ]);
        break;

      case 'gameStart':
        // Upbeat start jingle
        playSequence([
          { freq: 523.25, duration: 0.1, type: 'triangle', volume: 0.3 }, // C5
          { freq: 659.25, duration: 0.1, type: 'triangle', volume: 0.3 }, // E5
          { freq: 783.99, duration: 0.2, type: 'triangle', volume: 0.35 }, // G5
        ]);
        break;

      case 'gameOver':
        // Descending game over sequence
        playSequence([
          { freq: 523.25, duration: 0.15, type: 'sine', volume: 0.25 }, // C5
          { freq: 392.00, duration: 0.15, type: 'sine', volume: 0.25 }, // G4
          { freq: 329.63, duration: 0.15, type: 'sine', volume: 0.25 }, // E4
          { freq: 261.63, duration: 0.3, type: 'sine', volume: 0.3 },   // C4
        ]);
        break;

      case 'highScore':
        // Triumphant fanfare
        playSequence([
          { freq: 523.25, duration: 0.1, type: 'triangle', volume: 0.3 }, // C5
          { freq: 659.25, duration: 0.1, type: 'triangle', volume: 0.3 }, // E5
          { freq: 783.99, duration: 0.1, type: 'triangle', volume: 0.3 }, // G5
          { freq: 1046.5, duration: 0.25, type: 'triangle', volume: 0.35 }, // C6
        ]);
        break;

      case 'elfAppear':
        // Quick pop sound
        playTone(800, 0.05, 'sine', 0.2);
        break;
    }
  }, [playSequence, playTone]);

  const toggleSound = useCallback(() => {
    enabledRef.current = !enabledRef.current;
    return enabledRef.current;
  }, []);

  const isSoundEnabled = useCallback(() => {
    return enabledRef.current;
  }, []);

  return {
    playSound,
    toggleSound,
    isSoundEnabled,
  };
}
