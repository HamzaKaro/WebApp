# Scrabble Multiplayer

Real-time multiplayer Scrabble with an Angular client and a Node/Express server,
synchronised over WebSockets.

## Features
- Real-time multiplayer matches with live board and rack synchronisation
- Server-side turn management and move validation
- Persistent game and player state in MongoDB
- [add: lobby / matchmaking / chat / solo mode — delete what doesn't apply]

## Stack
| Layer | Technology |
|---|---|
| Client | Angular, TypeScript |
| Server | Node.js, Express, TypeScript |
| Database | MongoDB |
| Transport | WebSockets (Socket.IO) |

## Architecture

The server owns all game state and is the single source of truth. Clients emit
intents — place tile, exchange, pass — and the server validates them against
Scrabble rules, applies the move, and broadcasts the resulting state to both
players. This keeps clients thin and makes move tampering impossible.

## Running locally

```bash
# server
cd server && npm install && npm start

# client
cd client && npm install && npm start
```

## Context
Built at Polytechnique Montréal.
