import { kv } from '@vercel/kv';
import { NextResponse } from 'next/server';

export const runtime = 'edge';

interface LeaderboardEntry {
  name: string;
  score: number;
  timestamp: number;
}

// GET - Fetch top 10 leaderboard entries
export async function GET() {
  try {
    const leaderboard = await kv.get<LeaderboardEntry[]>('tonttujahti:leaderboard') || [];

    // Sort by score (descending) and return top 10
    const top10 = leaderboard
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);

    return NextResponse.json(top10);
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return NextResponse.json({ error: 'Failed to fetch leaderboard' }, { status: 500 });
  }
}

// POST - Add new score to leaderboard
export async function POST(request: Request) {
  try {
    const { name, score } = await request.json();

    // Validate input
    if (!name || typeof score !== 'number') {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }

    // Only allow one word (no spaces)
    if (name.includes(' ') || name.length > 20) {
      return NextResponse.json({ error: 'Name must be one word, max 20 characters' }, { status: 400 });
    }

    // Get current leaderboard
    const leaderboard = await kv.get<LeaderboardEntry[]>('tonttujahti:leaderboard') || [];

    // Add new entry
    const newEntry: LeaderboardEntry = {
      name: name.trim(),
      score,
      timestamp: Date.now(),
    };

    leaderboard.push(newEntry);

    // Sort by score (descending) and keep top 100 to prevent unlimited growth
    const sortedLeaderboard = leaderboard
      .sort((a, b) => b.score - a.score)
      .slice(0, 100);

    // Save back to KV
    await kv.set('tonttujahti:leaderboard', sortedLeaderboard);

    // Return the updated top 10
    const top10 = sortedLeaderboard.slice(0, 10);

    // Check if player made it to top 10
    const rank = sortedLeaderboard.findIndex(entry =>
      entry.name === newEntry.name &&
      entry.score === newEntry.score &&
      entry.timestamp === newEntry.timestamp
    ) + 1;

    return NextResponse.json({
      success: true,
      rank,
      top10
    });
  } catch (error) {
    console.error('Error saving score:', error);
    return NextResponse.json({ error: 'Failed to save score' }, { status: 500 });
  }
}
