'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSwipeable } from 'react-swipeable';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import Image from 'next/image';
import { useGameAudio } from './hooks/useGameAudio';

// Game states
const GAME_STATE = {
  MENU: 'MENU',
  PLAYING: 'PLAYING',
  GAMEOVER: 'GAMEOVER',
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

export default function Tonttujahti() {
  const [gameState, setGameState] = useState<GameState>(GAME_STATE.MENU);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [elfPosition, setElfPosition] = useState<Direction | null>(null);
  const [lottaAction, setLottaAction] = useState<LottaAction>('IDLE');
  const [timeLeft, setTimeLeft] = useState(30);
  const [showFeedback, setShowFeedback] = useState<string | null>(null);

  // Audio hook
  const { playSound, toggleSound, isSoundEnabled } = useGameAudio();
  const [soundEnabled, setSoundEnabled] = useState(true);

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
    if (gameState !== GAME_STATE.PLAYING) return;

    let timer: NodeJS.Timeout;
    let missTimer: NodeJS.Timeout;

    // Game timer
    timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setGameState(GAME_STATE.GAMEOVER);
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
  }, [gameState, score]);

  // Handle swipe
  const handleSwipe = useCallback((dir: Direction) => {
    if (gameState !== GAME_STATE.PLAYING) return;

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
  }, [gameState, elfPosition, score, playSound]);

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
    setTimeLeft(30);
    setLottaAction('IDLE');
    setElfPosition(null);
    setShowFeedback(null);
    setGameState(GAME_STATE.PLAYING);
    playSound('gameStart');
  };

  // End game
  useEffect(() => {
    if (gameState === GAME_STATE.GAMEOVER) {
      if (score > highScore) {
        setHighScore(score);
        localStorage.setItem('tonttujahti-highscore', score.toString());
        playSound('highScore');
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      } else {
        playSound('gameOver');
      }
    }
  }, [gameState, score, highScore, playSound]);

  // Get Lotta image
  const getLottaImage = () => {
    switch (lottaAction) {
      case 'UP': return '/lotta-up.svg';
      case 'DOWN': return '/lotta-down.svg';
      case 'LEFT': return '/lotta-left.svg';
      case 'RIGHT': return '/lotta-right.svg';
      case 'HAPPY': return '/lotta-happy.svg';
      case 'CONFUSED': return '/lotta-confused.svg';
      default: return '/lotta-idle.svg';
    }
  };

  return (
    <div
      {...handlers}
      className="h-screen w-full bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white overflow-hidden flex flex-col items-center justify-center relative touch-none select-none"
    >

      {/* Sound toggle button */}
      <motion.button
        onClick={handleToggleSound}
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        transition={{ duration: 0.3 }}
        className="absolute top-4 right-4 z-50 bg-slate-800/80 backdrop-blur-sm border border-slate-600 rounded-full p-3 md:p-4 text-2xl md:text-3xl hover:bg-slate-700/80 transition-colors"
        aria-label={soundEnabled ? 'Mute sound' : 'Unmute sound'}
      >
        {soundEnabled ? '🔊' : '🔇'}
      </motion.button>

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

      {/* Game UI - Top bar */}
      {gameState === GAME_STATE.PLAYING && (
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="absolute top-4 w-full flex justify-between px-6 md:px-10 text-xl md:text-2xl font-bold z-20"
        >
          <div className="bg-slate-800/80 px-4 py-2 rounded-full backdrop-blur-sm border border-slate-600">
            🎯 Pisteet: <span className="text-green-400">{score}</span>
          </div>
          <div className="bg-slate-800/80 px-4 py-2 rounded-full backdrop-blur-sm border border-slate-600">
            ⏱️ Aika: <span className="text-yellow-400">{timeLeft}s</span>
          </div>
        </motion.div>
      )}

      {/* Feedback messages */}
      <AnimatePresence>
        {showFeedback && (
          <motion.div
            initial={{ scale: 0, y: -50 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0, y: 50 }}
            className="absolute top-24 z-30 bg-slate-800/90 px-6 py-3 rounded-full text-2xl font-bold backdrop-blur-sm border-2 border-white/20"
          >
            {showFeedback}
          </motion.div>
        )}
      </AnimatePresence>

      {/* MENU Screen */}
      {gameState === GAME_STATE.MENU && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 bg-black/85 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-6 text-center"
        >
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
              src="/lotta-idle.svg"
              alt="Lotta"
              width={150}
              height={150}
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

      {/* GAME OVER Screen */}
      {gameState === GAME_STATE.GAMEOVER && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 bg-black/90 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-6 text-center"
        >
          <motion.h2
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
            className="text-4xl md:text-5xl font-bold mb-4 text-red-400"
          >
            Aika loppui! ⏰
          </motion.h2>

          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <p className="text-2xl md:text-3xl mb-3">
              Lotta nappasi <span className="text-green-400 font-bold text-4xl">{score}</span> tonttua!
            </p>

            {score === highScore && score > 0 && (
              <motion.p
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.4, type: 'spring' }}
                className="text-xl text-yellow-400 mb-6 font-bold"
              >
                🎉 Uusi ennätys! 🎉
              </motion.p>
            )}
          </motion.div>

          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3 }}
            className="text-8xl mb-8"
          >
            {score > 10 ? '🏆' : score > 5 ? '🎖️' : '🦴'}
          </motion.div>

          <motion.button
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            onClick={() => setGameState(GAME_STATE.MENU)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-500 rounded-full text-xl md:text-2xl font-bold shadow-2xl border-4 border-blue-400/50"
          >
            🔄 Pelaa Uudelleen
          </motion.button>

          {highScore > 0 && (
            <p className="mt-8 text-lg text-slate-400">
              Paras tulos: {highScore} tonttua
            </p>
          )}
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
          width={200}
          height={200}
          className="filter drop-shadow-2xl"
          priority
        />
      </motion.div>

      {/* Tutorial hint */}
      {gameState === GAME_STATE.PLAYING && score === 0 && timeLeft > 27 && (
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
