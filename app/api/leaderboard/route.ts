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
    console.log('[Leaderboard GET] Fetching leaderboard from Redis...');
    const leaderboard = await kv.get<LeaderboardEntry[]>('tonttujahti:leaderboard') || [];
    console.log(`[Leaderboard GET] Retrieved ${leaderboard.length} entries`);

    // Sort by score (descending) and return top 10
    const top10 = leaderboard
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);

    return NextResponse.json(top10);
  } catch (error) {
    console.error('[Leaderboard GET] Error fetching leaderboard:', error);
    console.error('[Leaderboard GET] Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      env: {
        hasKvUrl: !!process.env.KV_REST_API_URL,
        hasKvToken: !!process.env.KV_REST_API_TOKEN,
      }
    });
    return NextResponse.json({
      error: 'Failed to fetch leaderboard',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// POST - Add new score to leaderboard
export async function POST(request: Request) {
  try {
    console.log('[Leaderboard POST] Received score submission request');
    const { name, score } = await request.json();
    console.log(`[Leaderboard POST] Data: name="${name}", score=${score}`);

    // Validate input
    if (!name || typeof score !== 'number') {
      console.error('[Leaderboard POST] Invalid input:', { name, score });
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }

    // Only allow one word (no spaces)
    if (name.includes(' ') || name.length > 20) {
      console.error('[Leaderboard POST] Invalid name format:', name);
      return NextResponse.json({ error: 'Name must be one word, max 20 characters' }, { status: 400 });
    }

    // Get current leaderboard
    console.log('[Leaderboard POST] Fetching current leaderboard from Redis...');
    const leaderboard = await kv.get<LeaderboardEntry[]>('tonttujahti:leaderboard') || [];
    console.log(`[Leaderboard POST] Current leaderboard size: ${leaderboard.length}`);

    // Add new entry
    const newEntry: LeaderboardEntry = {
      name: name.trim(),
      score,
      timestamp: Date.now(),
    };
    console.log('[Leaderboard POST] Created new entry:', newEntry);

    leaderboard.push(newEntry);

    // Sort by score (descending) and keep top 100 to prevent unlimited growth
    const sortedLeaderboard = leaderboard
      .sort((a, b) => b.score - a.score)
      .slice(0, 100);

    // Save back to KV
    console.log('[Leaderboard POST] Saving to Redis...');
    await kv.set('tonttujahti:leaderboard', sortedLeaderboard);
    console.log('[Leaderboard POST] Successfully saved to Redis');

    // Return the updated top 10
    const top10 = sortedLeaderboard.slice(0, 10);

    // Check if player made it to top 10
    const rank = sortedLeaderboard.findIndex(entry =>
      entry.name === newEntry.name &&
      entry.score === newEntry.score &&
      entry.timestamp === newEntry.timestamp
    ) + 1;
    console.log(`[Leaderboard POST] Player rank: ${rank}`);

    return NextResponse.json({
      success: true,
      rank,
      top10
    });
  } catch (error) {
    console.error('[Leaderboard POST] Error saving score:', error);
    console.error('[Leaderboard POST] Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      env: {
        hasKvUrl: !!process.env.KV_REST_API_URL,
        hasKvToken: !!process.env.KV_REST_API_TOKEN,
      }
    });
    return NextResponse.json({
      error: 'Failed to save score',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
