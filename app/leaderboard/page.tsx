'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';

interface LeaderboardEntry {
  name: string;
  score: number;
  timestamp: number;
}

// Snowfall component
function Snowfall() {
  const snowflakes = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    animationDuration: `${Math.random() * 3 + 2}s`,
    animationDelay: `${Math.random() * 5}s`,
    fontSize: `${Math.random() * 10 + 10}px`,
    opacity: Math.random() * 0.6 + 0.4,
  }));

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {snowflakes.map((flake) => (
        <div
          key={flake.id}
          className="snowflake absolute animate-fall"
          style={{
            left: flake.left,
            animationDuration: flake.animationDuration,
            animationDelay: flake.animationDelay,
            fontSize: flake.fontSize,
            opacity: flake.opacity,
          }}
        >
          ❄️
        </div>
      ))}
      <style jsx>{`
        @keyframes fall {
          0% {
            transform: translateY(-10vh) rotate(0deg);
          }
          100% {
            transform: translateY(110vh) rotate(360deg);
          }
        }
        .animate-fall {
          animation: fall linear infinite;
        }
      `}</style>
    </div>
  );
}

function LeaderboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const playerName = searchParams.get('name');
  const playerScore = parseInt(searchParams.get('score') || '0', 10);
  const playerRank = parseInt(searchParams.get('rank') || '0', 10);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch leaderboard
  useEffect(() => {
    fetch('/api/leaderboard')
      .then(res => res.json())
      .then(data => {
        setLeaderboard(data);
        setIsLoading(false);
      })
      .catch(err => {
        console.error('Error fetching leaderboard:', err);
        setIsLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white flex flex-col items-center justify-center p-6 text-center overflow-hidden relative">
      <Snowfall />

      <div className="relative z-10 w-full max-w-4xl">
        <motion.h2
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
          className="text-4xl md:text-5xl font-bold mb-2 text-yellow-400"
        >
          🏆 Leaderboard 🏆
        </motion.h2>

        {playerRank > 0 && playerRank <= 10 && (
          <motion.p
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="text-xl text-green-400 mb-4 font-bold"
          >
            Sijoitus: #{playerRank}
          </motion.p>
        )}

        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="w-full max-w-2xl mx-auto bg-slate-800/80 backdrop-blur-sm border-2 border-slate-600 rounded-2xl p-6 mb-6"
        >
          <div className="space-y-2">
            {isLoading ? (
              <p className="text-slate-400 py-8">Ladataan...</p>
            ) : leaderboard.length === 0 ? (
              <p className="text-slate-400 py-8">Ei vielä tuloksia...</p>
            ) : (
              leaderboard.map((entry, index) => (
                <motion.div
                  key={`${entry.name}-${entry.timestamp}`}
                  initial={{ x: -50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.4 + index * 0.05 }}
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    entry.name === playerName && entry.score === playerScore
                      ? 'bg-green-600/30 border-2 border-green-400'
                      : 'bg-slate-700/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-bold w-8">
                      {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`}
                    </span>
                    <span className="text-lg font-bold">{entry.name}</span>
                  </div>
                  <span className="text-xl font-bold text-green-400">{entry.score}</span>
                </motion.div>
              ))
            )}
          </div>
        </motion.div>

        <motion.button
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          onClick={() => router.push('/')}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-500 rounded-full text-xl md:text-2xl font-bold shadow-2xl border-4 border-blue-400/50"
        >
          🎮 Aloita Uusi Peli
        </motion.button>
      </div>
    </div>
  );
}

export default function LeaderboardPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen w-full bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white flex items-center justify-center">
        <div className="text-2xl">Ladataan...</div>
      </div>
    }>
      <LeaderboardContent />
    </Suspense>
  );
}
