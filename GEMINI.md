# Tonttujahti - Lotan Joulupeli

## Project Overview

**Tonttujahti** (Elf Hunt) is an interactive Christmas-themed web game featuring "Lotta", a black Labrador. The objective is to swipe in the direction of appearing elves to catch them. The game features increasing difficulty, a global leaderboard, and PWA support.

## Key Technologies

*   **Framework:** Next.js 15 (App Router)
*   **Language:** TypeScript
*   **Styling:** Tailwind CSS
*   **Animations:** Framer Motion, canvas-confetti
*   **Interactions:** react-swipeable
*   **Database:** Vercel KV (Redis) for the global leaderboard
*   **Hosting:** Vercel (optimized for)

## Directory Structure

*   `app/`: Application source code (Next.js App Router).
    *   `page.tsx`: Main game interface.
    *   `api/leaderboard/`: API route for handling leaderboard scores.
    *   `hooks/`: Custom hooks (e.g., `useGameAudio.ts`).
    *   `leaderboard/`: Leaderboard view.
    *   `name-input/`: Player name entry view.
*   `public/`: Static assets (game images, audio files, PWA manifest).
*   `.env.local`: Local environment variables for Vercel KV connection.

## Building and Running

### Prerequisites

*   Node.js
*   npm

### Commands

*   **Install Dependencies:**
    ```bash
    npm install
    ```
*   **Run Development Server:**
    ```bash
    npm run dev
    ```
    Access at `http://localhost:3000`
*   **Build for Production:**
    ```bash
    npm run build
    ```
*   **Start Production Server:**
    ```bash
    npm start
    ```
*   **Linting:**
    ```bash
    npm run lint
    ```

## Configuration

### Environment Variables (`.env.local`)

Required for the leaderboard functionality (Vercel KV):

```bash
KV_REST_API_URL=your_kv_rest_api_url
KV_REST_API_TOKEN=your_kv_rest_api_token
KV_REST_API_READ_ONLY_TOKEN=your_kv_rest_api_read_only_token
```

### Assets

Game sprites are located in `public/` and follow the naming convention `lotta-<action>.webp` (e.g., `lotta-idle.webp`, `lotta-happy.webp`).

## Development Conventions

*   **Language:** Finnish is used for the game text and README, but code comments and structure follow standard English conventions where applicable (though some variable names might be context-specific).
*   **Styling:** Utility-first CSS using Tailwind.
*   **State Management:** React hooks and local state for game logic; Server Actions or API routes for backend interactions.
