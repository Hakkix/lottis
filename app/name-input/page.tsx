'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';

function NameInputContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const score = parseInt(searchParams.get('score') || '0', 10);
  const [playerName, setPlayerName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Trigger confetti effect on page load
  useEffect(() => {
    // Initial confetti burst
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });

    // Continuous confetti for 3 seconds
    const duration = 3000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 2,
        angle: 60,
        spread: 55,
        origin: { x: 0 }
      });
      confetti({
        particleCount: 2,
        angle: 120,
        spread: 55,
        origin: { x: 1 }
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };

    frame();
  }, []);

  const handleNameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!playerName.trim() || playerName.includes(' ')) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Submit score to leaderboard
      const response = await fetch('/api/leaderboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: playerName.trim(), score }),
      });

      const data = await response.json();

      if (data.success) {
        // Redirect to leaderboard with rank info
        router.push(`/leaderboard?name=${encodeURIComponent(playerName.trim())}&score=${score}&rank=${data.rank}`);
      } else {
        // Even if there's an error, go to leaderboard
        router.push('/leaderboard');
      }
    } catch (error) {
      console.error('Error submitting score:', error);
      // On error, still go to leaderboard
      router.push('/leaderboard');
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white flex flex-col items-center justify-center p-6 text-center">
      <motion.h2
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200 }}
        className="text-4xl md:text-5xl font-bold mb-4 text-red-400"
      >
        Peli päättyi! 🎮
      </motion.h2>

      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <p className="text-2xl md:text-3xl mb-3">
          Lotta nappasi <span className="text-green-400 font-bold text-4xl">{score}</span> tonttua!
        </p>
      </motion.div>

      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.3 }}
        className="text-8xl mb-8"
      >
        {score > 10 ? '🏆' : score > 5 ? '🎖️' : '🦴'}
      </motion.div>

      <motion.form
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        onSubmit={handleNameSubmit}
        className="w-full max-w-md"
      >
        <p className="text-lg mb-4 text-slate-300">Anna nimesi (yksi sana):</p>
        <input
          type="text"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value.replace(/\s/g, ''))}
          placeholder="Nimi"
          maxLength={20}
          className="w-full px-6 py-3 text-xl text-center bg-slate-800 border-2 border-slate-600 rounded-full text-white placeholder-slate-400 focus:outline-none focus:border-green-400 mb-4"
          autoFocus
          disabled={isSubmitting}
        />
        <motion.button
          type="submit"
          disabled={!playerName.trim() || isSubmitting}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="w-full px-8 py-4 bg-gradient-to-r from-green-600 to-green-500 rounded-full text-xl md:text-2xl font-bold shadow-2xl border-4 border-green-400/50 disabled:opacity-50 disabled:cursor-not-allowed hover:from-green-500 hover:to-green-400 transition"
        >
          {isSubmitting ? '⏳ Tallennetaan...' : '📊 Näytä Leaderboard'}
        </motion.button>
      </motion.form>
    </div>
  );
}

export default function NameInputPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen w-full bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white flex items-center justify-center">
        <div className="text-2xl">Ladataan...</div>
      </div>
    }>
      <NameInputContent />
    </Suspense>
  );
}
