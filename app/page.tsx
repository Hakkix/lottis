'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useSwipeable } from 'react-swipeable';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import Image from 'next/image';
import { useGameAudio } from './hooks/useGameAudio';

// Game states
const GAME_STATE = {
  MENU: 'MENU',
  PLAYING: 'PLAYING',
} as const;

type GameState = typeof GAME_STATE[keyof typeof GAME_STATE];
type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
type LottaAction = Direction | 'IDLE' | 'CONFUSED' | 'HAPPY';

// Positions where elves can appear
const POSITIONS: Record<Direction, { label: string; icon: string; style: string }> = {
  UP: { label: 'Kuusi', icon: '🎄', style: 'top-8 left-1/2 -translate-x-1/2' },
  DOWN: { label: 'Lahjat', icon: '🎁', style: 'bottom-8 left-1/2 -translate-x-1/2' },
  LEFT: { label: 'Takka', icon: '🔥', style: 'left-8 top-1/2 -translate-y-1/2' },
  RIGHT: { label: 'Ruoka', icon: '🥣', style: 'right-8 top-1/2 -translate-y-1/2' },
};

// Snowfall component
const Snowfall = () => {
  const snowflakes = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    animationDuration: `${Math.random() * 10 + 10}s`,
    animationDelay: `${Math.random() * 10}s`,
    fontSize: `${Math.random() * 10 + 10}px`,
    opacity: Math.random() * 0.6 + 0.4,
  }));

  return (
    <>
      {snowflakes.map((flake) => (
        <div
          key={flake.id}
          className="snowflake"
          style={{
            left: flake.left,
            animationDuration: flake.animationDuration,
            animationDelay: flake.animationDelay,
            fontSize: flake.fontSize,
            opacity: flake.opacity,
          }}
        >
          ❄
        </div>
      ))}
    </>
  );
};

export default function Tonttujahti() {
  const router = useRouter();
  const [gameState, setGameState] = useState<GameState>(GAME_STATE.MENU);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [elfPosition, setElfPosition] = useState<Direction | null>(null);
  const [lottaAction, setLottaAction] = useState<LottaAction>('IDLE');
  const [timeRemaining, setTimeRemaining] = useState(150); // 2:30 max time
  const [showFeedback, setShowFeedback] = useState<string | null>(null);
  const [isPaused, setIsPaused] = useState(false);

  // Audio hook
  const { playSound, toggleSound, isSoundEnabled, setMusic, getCurrentMusic } = useGameAudio();
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showMusicMenu, setShowMusicMenu] = useState(false);

  // Load high score from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('tonttujahti-highscore');
    if (saved) setHighScore(parseInt(saved, 10));
  }, []);

  // Handle sound toggle
  const handleToggleSound = () => {
    const newState = toggleSound();
    setSoundEnabled(newState);
  };

  // Game loop: Timer and elf spawning
  useEffect(() => {
    if (gameState !== GAME_STATE.PLAYING || isPaused) return;

    let timer: NodeJS.Timeout;
    let missTimer: NodeJS.Timeout;

    // Game timer - counts down from 2:30
    timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          // Update high score if needed
          if (score > highScore) {
            setHighScore(score);
            localStorage.setItem('tonttujahti-highscore', score.toString());
          }
          // Redirect to name input page
          router.push(`/name-input?score=${score}`);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Elf spawning logic
    const spawnElf = () => {
      const dirs: Direction[] = ['UP', 'DOWN', 'LEFT', 'RIGHT'];
      const randomDir = dirs[Math.floor(Math.random() * dirs.length)];
      setElfPosition(randomDir);
      setLottaAction('IDLE');
      playSound('elfAppear');

      // Difficulty increases with score
      const difficulty = Math.max(800, 2000 - score * 40);

      missTimer = setTimeout(() => {
        setElfPosition(null);
        setShowFeedback('Huti! 😢');
        playSound('timeout');
        setTimeout(() => setShowFeedback(null), 500);
        setTimeout(spawnElf, Math.random() * 300 + 200);
      }, difficulty);
    };

    spawnElf();

    return () => {
      clearInterval(timer);
      clearTimeout(missTimer);
    };
  }, [gameState, score, isPaused]);

  // Handle swipe
  const handleSwipe = useCallback((dir: Direction) => {
    if (gameState !== GAME_STATE.PLAYING || isPaused) return;

    if (dir === elfPosition) {
      // Success!
      const newScore = score + 1;
      setScore(newScore);
      setLottaAction('HAPPY');
      setElfPosition(null);
      setShowFeedback('Hau! +1 🎉');
      playSound('success');

      // Confetti on milestones
      if (newScore % 5 === 0) {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 }
        });
      }

      setTimeout(() => {
        setShowFeedback(null);
        setLottaAction('IDLE');
      }, 600);

    } else {
      // Miss!
      setLottaAction('CONFUSED');
      setShowFeedback('Väärä suunta! 🤔');
      playSound('miss');
      setTimeout(() => {
        setShowFeedback(null);
        setLottaAction('IDLE');
      }, 500);
    }
  }, [gameState, elfPosition, score, playSound, isPaused]);

  // Swipe handlers
  const handlers = useSwipeable({
    onSwipedUp: () => handleSwipe('UP'),
    onSwipedDown: () => handleSwipe('DOWN'),
    onSwipedLeft: () => handleSwipe('LEFT'),
    onSwipedRight: () => handleSwipe('RIGHT'),
    preventScrollOnSwipe: true,
    trackMouse: true,
    delta: 10,
  });

  // Start game
  const startGame = () => {
    setScore(0);
    setTimeRemaining(150);
    setLottaAction('IDLE');
    setElfPosition(null);
    setShowFeedback(null);
    setGameState(GAME_STATE.PLAYING);
    playSound('gameStart');
  };

  // Get Lotta image
  const getLottaImage = () => {
    switch (lottaAction) {
      case 'UP': return '/lotta-up.webp';
      case 'DOWN': return '/lotta-down.webp';
      case 'LEFT': return '/lotta-left.webp';
      case 'RIGHT': return '/lotta-right.webp';
      case 'HAPPY': return '/lotta-happy.webp';
      case 'CONFUSED': return '/lotta-confused.webp';
      default: return '/lotta-idle.webp';
    }
  };

  return (
    <div
      {...handlers}
      className="h-screen w-full bg-black text-white overflow-hidden flex flex-col items-center justify-center relative touch-none select-none"
    >

      {/* Control buttons - top right */}
      <div className="absolute top-4 right-4 z-50 flex flex-col gap-3">
        {/* Sound toggle button */}
        <motion.button
          onClick={handleToggleSound}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          transition={{ duration: 0.3 }}
          className="bg-slate-800/80 backdrop-blur-sm border border-slate-600 rounded-full p-3 md:p-4 text-2xl md:text-3xl hover:bg-slate-700/80 transition-colors"
          aria-label={soundEnabled ? 'Mute sound' : 'Unmute sound'}
        >
          {soundEnabled ? '🔊' : '🔇'}
        </motion.button>

        {/* Music control button */}
        <div className="relative">
          <motion.button
            onClick={() => setShowMusicMenu(!showMusicMenu)}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            transition={{ duration: 0.3 }}
            className="bg-slate-800/80 backdrop-blur-sm border border-slate-600 rounded-full p-3 md:p-4 text-2xl md:text-3xl hover:bg-slate-700/80 transition-colors"
            aria-label="Music control"
          >
            🎵
          </motion.button>

          {/* Music dropdown menu */}
          <AnimatePresence>
            {showMusicMenu && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8, x: 10 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.8, x: 10 }}
                transition={{ duration: 0.2 }}
                className="absolute right-full mr-3 top-0 bg-slate-800/95 backdrop-blur-sm border border-slate-600 rounded-lg overflow-hidden whitespace-nowrap"
              >
                <button
                  onClick={() => {
                    setMusic('none');
                    setShowMusicMenu(false);
                  }}
                  className={`block w-full px-4 py-3 text-left text-base hover:bg-slate-700/80 transition-colors ${
                    getCurrentMusic() === 'none' ? 'bg-slate-700/60 text-green-400' : 'text-white'
                  }`}
                >
                  {getCurrentMusic() === 'none' && '✓ '}Ei musiikkia
                </button>
                <button
                  onClick={() => {
                    setMusic('lotan_joululaulu');
                    setShowMusicMenu(false);
                  }}
                  className={`block w-full px-4 py-3 text-left text-base hover:bg-slate-700/80 transition-colors ${
                    getCurrentMusic() === 'lotan_joululaulu' ? 'bg-slate-700/60 text-green-400' : 'text-white'
                  }`}
                >
                  {getCurrentMusic() === 'lotan_joululaulu' && '✓ '}Lotan joululaulu
                </button>
                <button
                  onClick={() => {
                    setMusic('ambient');
                    setShowMusicMenu(false);
                  }}
                  className={`block w-full px-4 py-3 text-left text-base hover:bg-slate-700/80 transition-colors ${
                    getCurrentMusic() === 'ambient' ? 'bg-slate-700/60 text-green-400' : 'text-white'
                  }`}
                >
                  {getCurrentMusic() === 'ambient' && '✓ '}Ambient
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Pause button - only shown during gameplay */}
        {gameState === GAME_STATE.PLAYING && (
          <motion.button
            onClick={() => setIsPaused(!isPaused)}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            transition={{ duration: 0.3 }}
            className="bg-slate-800/80 backdrop-blur-sm border border-slate-600 rounded-full p-3 md:p-4 text-2xl md:text-3xl hover:bg-slate-700/80 transition-colors"
            aria-label={isPaused ? 'Resume game' : 'Pause game'}
          >
            {isPaused ? '▶️' : '⏸️'}
          </motion.button>
        )}

        {/* Stop button - only shown during gameplay */}
        {gameState === GAME_STATE.PLAYING && (
          <motion.button
            onClick={() => setTimeRemaining(0)}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            transition={{ duration: 0.3 }}
            className="bg-red-900/80 backdrop-blur-sm border border-red-600 rounded-full p-3 md:p-4 text-2xl md:text-3xl hover:bg-red-800/80 transition-colors"
            aria-label="Stop game"
          >
            ⏹️
          </motion.button>
        )}
      </div>

      {/* Background decorations */}
      {Object.entries(POSITIONS).map(([key, data]) => (
        <motion.div
          key={key}
          className={`absolute ${data.style} flex flex-col items-center z-0`}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 0.6, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <span className="text-7xl md:text-8xl filter drop-shadow-lg">{data.icon}</span>
          <span className="text-xs md:text-sm mt-2 font-bold uppercase tracking-wider text-slate-300">
            {data.label}
          </span>
        </motion.div>
      ))}

      {/* Elf appears */}
      <AnimatePresence>
        {elfPosition && (
          <motion.div
            initial={{ scale: 0, opacity: 0, rotate: -180 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            exit={{ scale: 0, opacity: 0, rotate: 180 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className={`absolute z-10 ${POSITIONS[elfPosition].style}`}
          >
            <Image
              src="/elf.svg"
              alt="Tonttu"
              width={100}
              height={100}
              className="filter drop-shadow-xl"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Game UI - Top left corner stack */}
      {gameState === GAME_STATE.PLAYING && (
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="absolute top-4 left-4 md:left-6 flex flex-col items-start gap-3 text-lg md:text-xl font-bold z-20"
        >
          {/* Score counter */}
          <div className="bg-slate-800/80 px-4 py-2 rounded-full backdrop-blur-sm border border-slate-600">
            🎯 Pisteet: <span className="text-green-400">{score}</span>
          </div>

          {/* Time counter */}
          <div className="bg-slate-800/80 px-4 py-2 rounded-full backdrop-blur-sm border border-slate-600">
            ⏱️ Aika: <span className="text-yellow-400">{Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}</span>
          </div>

          {/* Feedback messages */}
          <AnimatePresence>
            {showFeedback && (
              <motion.div
                initial={{ scale: 0, x: -20 }}
                animate={{ scale: 1, x: 0 }}
                exit={{ scale: 0, x: -20 }}
                className="bg-slate-800/90 px-6 py-3 rounded-full text-xl md:text-2xl font-bold backdrop-blur-sm border-2 border-white/20"
              >
                {showFeedback}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}

      {/* PAUSE overlay */}
      {gameState === GAME_STATE.PLAYING && isPaused && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 bg-black/70 backdrop-blur-sm z-40 flex items-center justify-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
            className="text-center"
          >
            <div className="text-6xl md:text-8xl mb-4">⏸️</div>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Peli pysäytetty</h2>
            <p className="text-xl md:text-2xl text-slate-300">Paina ▶️ jatkaaksesi</p>
          </motion.div>
        </motion.div>
      )}

      {/* MENU Screen */}
      {gameState === GAME_STATE.MENU && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 bg-black/85 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-6 text-center"
        >
          {/* Snowfall effect */}
          <Snowfall />
          <motion.div
            initial={{ scale: 0.5, y: -50 }}
            animate={{ scale: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 200 }}
          >
            <h1 className="text-5xl md:text-6xl font-bold mb-2 text-red-500 drop-shadow-lg">
              Tonttujahti 🎅
            </h1>
            <p className="text-2xl md:text-3xl mb-6 text-green-400">
              Lotan Joulupeli
            </p>
          </motion.div>

          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: 'spring' }}
            className="mb-8"
          >
            <Image
              src="/lotta-idle.webp"
              alt="Lotta"
              width={0}
              height={0}
              sizes="100vw"
              style={{ width: '150px', height: 'auto' }}
              className="filter drop-shadow-2xl"
            />
          </motion.div>

          <p className="mb-8 text-lg md:text-xl max-w-md text-slate-300 leading-relaxed">
            Tontut piileksivät joulukoristeissa! 🎄<br/>
            <span className="font-bold text-white">Swaippaa</span> Lotta tontun suuntaan napataksesi ne.
          </p>

          {highScore > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mb-6 text-xl text-yellow-400 font-bold"
            >
              🏆 Ennätys: {highScore} tonttua
            </motion.div>
          )}

          <motion.button
            onClick={startGame}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-10 py-4 bg-gradient-to-r from-green-600 to-green-500 rounded-full text-2xl md:text-3xl font-bold hover:from-green-500 hover:to-green-400 transition shadow-2xl border-4 border-green-400/50"
          >
            🎮 Aloita Peli
          </motion.button>

          <p className="mt-8 text-sm text-slate-400">
            💡 Vinkki: Peli nopeutuu pisteiden myötä!
          </p>
        </motion.div>
      )}


      {/* Lotta (center) */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center pointer-events-none z-20"
        animate={
          lottaAction === 'UP' ? { y: -60 } :
          lottaAction === 'DOWN' ? { y: 60 } :
          lottaAction === 'LEFT' ? { x: -60 } :
          lottaAction === 'RIGHT' ? { x: 60 } :
          lottaAction === 'CONFUSED' ? { rotate: [0, -15, 15, -15, 0] } :
          lottaAction === 'HAPPY' ? { scale: [1, 1.2, 1.2, 1], rotate: [0, -10, 10, 0] } :
          { x: 0, y: 0 }
        }
        transition={{
          type: lottaAction === 'CONFUSED' ? 'spring' : 'tween',
          duration: 0.3,
          stiffness: 300
        }}
      >
        <Image
          src={getLottaImage()}
          alt="Lotta"
          width={0}
          height={0}
          sizes="100vw"
          style={{ width: '200px', height: 'auto' }}
          className="filter drop-shadow-2xl"
          priority
        />
      </motion.div>

      {/* Tutorial hint */}
      {gameState === GAME_STATE.PLAYING && score === 0 && timeRemaining > 147 && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="absolute bottom-20 text-white/70 text-lg md:text-xl animate-pulse bg-slate-800/50 px-6 py-3 rounded-full backdrop-blur-sm"
        >
          👆 Swaippaa tontun suuntaan!
        </motion.div>
      )}
    </div>
  );
}
