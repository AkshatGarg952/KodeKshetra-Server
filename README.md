# KodeKshetra (Server)

> Backend microservice for real-time DSA & CP battles — powered by **Node.js**, **FastAPI**, **MongoDB**, **Redis**, and **Judge0**.

[![Node.js](https://img.shields.io/badge/Backend-Node.js-green?style=flat-square)](https://nodejs.org/)
[![FastAPI](https://img.shields.io/badge/Microservice-FastAPI-teal?style=flat-square)](https://fastapi.tiangolo.com/)
[![MongoDB](https://img.shields.io/badge/Database-MongoDB-brightgreen?style=flat-square)](https://www.mongodb.com/)
[![Redis](https://img.shields.io/badge/Cache-Redis-red?style=flat-square)](https://redis.io/)
[![Judge0](https://img.shields.io/badge/Code%20Execution-Judge0-orange?style=flat-square)](https://judge0.com/)
[![LangChain](https://img.shields.io/badge/AI-LangChain-blue?style=flat-square)](https://www.langchain.com/)

---

## Overview

**KodeKshetra** is a **real-time coding battle platform** where users face off in DSA and CP matches.  
The **server** handles authentication, matchmaking, AI-based test generation, and leaderboard ranking — all built on a **microservice architecture** for scalability and modularity.

### Microservices Architecture

- **Main Backend (Node.js + Express + Socket.io)** — Authentication, matchmaking, battles, XP, badges, and leaderboards  
- **Hidden Forces (FastAPI + LangChain + Gemini)** — AI-based hidden test case generator for Codeforces & LeetCode  
- **Code Runner (Node.js + Judge0)** — Executes code safely against sample & hidden tests

---

## Project Structure

```
KodeKshetra-Server/
│
├── src/
│   ├── controllers/
│   │   ├── admin.controller.js    # Admin operations (add problems/solutions)
│   │   └── user.controller.js     # User operations (register, login, profile)
│   │
│   ├── database/
│   │   └── mongoose.js            # MongoDB connection
│   │
│   ├── helper/
│   │   ├── Questions/             # Problem fetching logic
│   │   │   └── fetchQuestion.js
│   │   ├── XP/                    # XP calculation and updates
│   │   │   ├── XPCalculator.js
│   │   │   └── UpdateXP.js
│   │   ├── badges/                # Badge earning logic
│   │   │   └── Badges.js
│   │   ├── fetchProfile/          # User profile fetching
│   │   ├── leaderboard/           # Leaderboard management
│   │   │   ├── getLeaderboard.js
│   │   │   └── scoreCalculation.js
│   │   ├── updation/              # Battle and streak updates
│   │   │   ├── battleUpdate.js
│   │   │   └── setStreaks.js
│   │   └── winner/                # Winner determination
│   │       └── decideWinner.js
│   │
│   ├── middlewares/
│   │   ├── auth.middleware.js     # JWT authentication
│   │   └── multer.middleware.js   # File upload handling
│   │
│   ├── models/
│   │   ├── user.model.js          # User schema
│   │   ├── battle.model.js        # Battle schema
│   │   ├── leetcode_questions.model.js
│   │   ├── leetcode_solutions.model.js
│   │   ├── codeforces_questions.model.js
│   │   └── codeforces_solutions.model.js
│   │
│   ├── redis/
│   │   ├── matchmakingController.js  # Add users to queue
│   │   ├── matchmaker.js             # Match users based on rating
│   │   ├── cancelMatchmaking.js      # Remove from queue
│   │   └── (leaderboard operations)
│   │
│   └── routes/
│       ├── user.routes.js         # User API routes
│       └── admin.routes.js        # Admin API routes
│
├── index.js                       # Main server file with Socket.io
├── package.json
├── .env                           # Environment variables (create from .env.example)
├── .env.example                   # Environment template
└── README.md
```

---

## Features

- **User Auth & Profiles** — Register/login with LeetCode & Codeforces usernames  
- **Real-time Battles** — Fight friends or random rivals in live DSA/CP duels  
- **Smart Problem Selection** — Fetches unsolved problems for fairness  
- **AI Hidden Tests** — Generated via the "Hidden Forces" service using FastAPI + LangChain + Gemini  
- **Badges & XP System** — Gamified progress tracking  
- **Leaderboards** — Rankings for last 24 hours & 7 days  
- **90-Day Heatmap** — Visual consistency tracker  
- **Redis Matchmaking** — Optimized for real-time responsiveness  
- **Judge0 Integration** — Secure sandboxed code execution via Code Runner
- **Socket.io Real-time** — Live battle updates and matchmaking

---

## API Reference

### User Routes

| Method | Endpoint | Description |
|:------:|:---------|:------------|
| `POST` | `/api/users/register` | Register new user |
| `POST` | `/api/users/login` | Login existing user |
| `PUT` | `/api/users/update/:id` | Update user data |
| `GET` | `/getUserDetails/:id` | Fetch badges, streaks, heatmap, stats |
| `POST` | `/api/users/logout` | Logout user |

### Code Execution Routes (Proxy to Code Runner)

| Method | Endpoint | Description |
|:------:|:---------|:------------|
| `POST` | `/run` | Execute code (sample tests only) |
| `POST` | `/submit` | Execute code (sample + hidden tests) |

### Leaderboard Routes

| Method | Endpoint | Description |
|:------:|:---------|:------------|
| `GET` | `/leaderboard/:period/:page` | Paginated leaderboard data (period: 1 or 7 days) |

### Admin Routes

| Method | Endpoint | Description |
|:------:|:---------|:------------|
| `POST` | `/api/admin/addCFProblem` | Add Codeforces problem metadata |
| `POST` | `/api/admin/addLCProblem` | Add LeetCode problem metadata |
| `POST` | `/api/admin/addCFSolution` | Add Codeforces solution |
| `POST` | `/api/admin/addLCSolution` | Add LeetCode solution |

### Health Check

| Method | Endpoint | Description |
|:------:|:---------|:------------|
| `GET` | `/` | Welcome message |
| `GET` | `/api/health` | Service health status |

---

## Socket.io Events

### Client → Server Events

| Event | Payload | Description |
|-------|---------|-------------|
| `joinQueue` | `{ userId, mode, topic }` | Join matchmaking queue |
| `cancelMatchmaking` | `{ userId, mode, topic }` | Cancel matchmaking |
| `joinBattleRoom` | `{ battle, userId, roomId }` | Join battle room |
| `battleEnded` | `{ battleDetails, userId, code, roomId, lost }` | Submit battle result |

### Server → Client Events

| Event | Payload | Description |
|-------|---------|-------------|
| `matchFound` | `{ opponent, roomId, battle }` | Match found, navigate to battle |
| `cancelMatchmakingResponse` | `{ success, message }` | Matchmaking cancellation result |
| `battleStart` | `{ question, battleId }` | Battle started with problem |
| `battleResult` | `"won" \| "loss" \| "draw"` | Battle result |
| `battleJoinError` | `{ message }` | Error joining battle room |

---

## Battle Lifecycle

```
┌─────────────────────────────────────────────────────────────────┐
│                      Battle Lifecycle                            │
└─────────────────────────────────────────────────────────────────┘

1. User joins queue
   ├─ Client: socket.emit('joinQueue', { userId, mode, topic })
   └─ Server: Add to Redis queue with rating

2. Matchmaking
   ├─ Server: tryToMatch() finds opponent with similar rating
   └─ Server: Emit 'matchFound' to both users

3. Join Battle Room
   ├─ Client: socket.emit('joinBattleRoom', { battle, userId, roomId })
   ├─ Server: Wait for both users to join
   └─ Server: Fetch problem via getQuestionForBattle()

4. Battle Start
   ├─ Server: Create Battle document in MongoDB
   ├─ Server: Emit 'battleStart' with problem to both users
   └─ Client: Display problem and start timer

5. Code Submission
   ├─ Client: socket.emit('battleEnded', { battleDetails, code, ... })
   ├─ Server: Store first submission, wait for second
   └─ Server: When both submitted, calculate winner

6. Winner Determination
   ├─ Server: Execute code via Code Runner (/run-all endpoint)
   ├─ Server: Compare test cases passed
   ├─ Server: If tied, compare time remaining
   └─ Server: Determine winner/loser/draw

7. Update Stats
   ├─ Server: Calculate XP (calculateXP)
   ├─ Server: Update user XP (updateXP)
   ├─ Server: Update battle count (battleUpdate)
   ├─ Server: Update streaks (setStreaks)
   ├─ Server: Update solved questions
   └─ Server: Update leaderboards (Redis)

8. Battle Result
   ├─ Server: Emit 'battleResult' to both users
   └─ Client: Display win/loss/draw screen
```

---

## Gamification System

### XP Calculation

XP is calculated based on:
- **Win/Loss**: Winners gain XP, losers lose XP
- **Opponent Strength**: Beating higher-rated opponents gives more XP
- **Win Streak**: Bonus XP for consecutive wins

Formula (simplified):
```javascript
baseXP = status === 'won' ? 50 : -20;
streakBonus = currWinStreak * 5;
totalXP = baseXP + streakBonus;
```

### Badges

Badges are earned based on:
- Total battles fought
- Win streaks
- Problems solved
- XP milestones

### Streaks

- **Win Streak**: Consecutive wins (resets on loss)
- **Current Streak**: Active win streak
- **Best Streak**: Highest win streak achieved

### Heatmap

90-day activity visualization showing:
- Days with battles fought
- Intensity based on number of battles per day

---

## Installation

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- Redis (local or cloud)
- Code Runner service running
- Hidden Forces service running

### Steps

```bash
# Clone repository
git clone https://github.com/AkshatGarg952/KodeKshetra-Server.git
cd KodeKshetra-Server

# Install dependencies
npm install

# Create .env file from template
cp .env.example .env

# Edit .env with your configuration
# (See Configuration section below)

# Start server
npm run dev
```

The server will run on `http://localhost:5000`

---

## Configuration

### Environment Variables

Create a `.env` file based on `.env.example`:

```env
# MongoDB Connection
MONGO_URI=mongodb://localhost:27017/kodeKshetra
# Or use MongoDB Atlas:
# MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/kodeKshetra

# JWT Secret Key (use a strong random string)
JWT_SECRET=your_super_secret_jwt_key_here

# Redis Connection
REDIS_URL=redis://localhost:6379
# Or use Redis Cloud:
# REDIS_URL=redis://username:password@host:port

# Server Port
PORT_NO=5000

# Cloudinary Configuration (for profile picture uploads)
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Node Environment
NODE_ENV=development

# Microservices URLs
HIDDEN_FORCES_URL=http://127.0.0.1:8000
CODE_RUNNER_URL=http://127.0.0.1:9000
```

### Required Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `MONGO_URI` | MongoDB connection string | **Yes** |
| `JWT_SECRET` | Secret key for JWT tokens | **Yes** |
| `REDIS_URL` | Redis connection URL | **Yes** |
| `CODE_RUNNER_URL` | Code Runner service URL | **Yes** |
| `HIDDEN_FORCES_URL` | Hidden Forces service URL | **Yes** |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | **Yes** |
| `CLOUDINARY_API_KEY` | Cloudinary API key | **Yes** |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | **Yes** |
| `PORT_NO` | Server port | No (default: 5000) |
| `NODE_ENV` | Environment mode | No (default: development) |

---

## Tech Stack

| Component | Technology |
|-----------|------------|
| **Backend** | Node.js, Express.js |
| **Real-time** | Socket.io 4.8.1 |
| **Database** | MongoDB (Mongoose 8.16.1) |
| **Cache** | Redis 5.5.6 |
| **Auth** | JWT (jsonwebtoken 9.0.2) |
| **Password Hashing** | bcrypt 6.0.0 |
| **File Upload** | Multer 2.0.1, Cloudinary 2.7.0 |
| **Web Scraping** | Puppeteer 24.22.0, Cheerio 1.1.2 |
| **LeetCode API** | leetcode-query 2.0.1 |
| **HTTP Client** | Axios 1.12.2 (with axios-retry 4.5.0) |
| **Scheduling** | node-cron 4.2.1 |
| **AI** | @google/generative-ai 0.24.1 |

---

## Microservices Integration

### Code Runner Integration

The server proxies code execution requests to the Code Runner service:

```javascript
// /run endpoint - sample tests only
app.post('/run', async (req, res) => {
  const { code, language, problem } = req.body;
  
  // Fetch full problem from database
  const fullProblem = await fetchProblemFromDB(problem);
  
  // Forward to Code Runner
  const response = await axios.post(`${CODE_RUNNER_URL}/run`, {
    code,
    language,
    problem: fullProblem
  });
  
  res.json(response.data);
});
```

### Hidden Forces Integration

Admin endpoints use Hidden Forces to generate test cases:

```javascript
// Generate hidden tests for Codeforces problem
const response = await axios.post(`${HIDDEN_FORCES_URL}/generate-codeforces-tests`, {
  problem: problemMetadata
});

const hiddenTestCases = response.data.hiddenTestCases;
```

---

## Redis Matchmaking System

### Queue Structure

```
Redis Key: queue:{mode}:{topic}
Format: Sorted Set (ZSET)
Score: User rating
Member: userId
```

### Matchmaking Algorithm

1. User joins queue with rating
2. Server searches for opponent within ±200 rating range
3. If found, create battle and remove both from queue
4. If not found, user waits in queue
5. Repeat every few seconds until match found

```javascript
// Add user to queue
await redis.zadd(`queue:${mode}:${topic}`, rating, userId);

// Find opponent
const candidates = await redis.zrangebyscore(
  `queue:${mode}:${topic}`,
  rating - 200,
  rating + 200
);
```

---

## Troubleshooting

### Common Issues

**1. MongoDB Connection Failed**
```
Error: MongooseServerSelectionError
```
**Solution**: 
- Check MongoDB is running: `mongod --version`
- Verify `MONGO_URI` in `.env`
- Ensure network access if using MongoDB Atlas

**2. Redis Connection Failed**
```
Error: Redis connection refused
```
**Solution**:
- Check Redis is running: `redis-cli ping` (should return PONG)
- Verify `REDIS_URL` in `.env`
- Start Redis: `redis-server`

**3. Code Runner Not Responding**
```
Error: connect ECONNREFUSED 127.0.0.1:9000
```
**Solution**:
- Ensure Code Runner service is running
- Check `CODE_RUNNER_URL` in `.env`
- Verify Code Runner is on correct port

**4. Hidden Forces Not Responding**
```
Error: connect ECONNREFUSED 127.0.0.1:8000
```
**Solution**:
- Ensure Hidden Forces service is running
- Check `HIDDEN_FORCES_URL` in `.env`
- Start Hidden Forces: `uvicorn app.main:app --reload`

**5. JWT Token Invalid**
```
Error: JsonWebTokenError
```
**Solution**:
- Ensure `JWT_SECRET` is set in `.env`
- Check token is being sent in Authorization header
- Verify token hasn't expired

**6. Socket.io Connection Failed**
```
Client: WebSocket connection failed
```
**Solution**:
- Check CORS settings in `index.js`
- Verify client is using correct server URL
- Ensure server is running and accessible

---

## Development

### Available Scripts

```bash
# Start development server with auto-reload
npm run dev

# Run tests
npm test
```

### Adding New Problems

Use admin endpoints to add problems:

```bash
# Add Codeforces problem
POST /api/admin/addCFProblem
{
  "problemId": "1A",
  "name": "Theatre Square",
  "difficulty": "800",
  ...
}

# Add LeetCode problem
POST /api/admin/addLCProblem
{
  "problemId": "two-sum",
  "title": "Two Sum",
  "difficulty": "Easy",
  ...
}
```

---

## Architecture Diagram

```
┌──────────────┐         ┌──────────────────────────────┐
│   Client     │◄───────►│   KodeKshetra Server         │
│  (React +    │  Socket │   (Node.js + Express +       │
│  Socket.io)  │   .io   │    Socket.io)                │
└──────────────┘         └──────────┬───────────────────┘
                                    │
                         ┌──────────┼──────────┐
                         │          │          │
                    ┌────▼───┐ ┌───▼────┐ ┌──▼─────┐
                    │MongoDB │ │ Redis  │ │Cloudinary│
                    │        │ │        │ │        │
                    └────────┘ └────────┘ └────────┘
                         │
              ┌──────────┼──────────┐
              │                     │
         ┌────▼─────┐        ┌─────▼──────┐
         │Code      │        │Hidden      │
         │Runner    │        │Forces      │
         │(Judge0)  │        │(Gemini AI) │
         └──────────┘        └────────────┘
```

---

## License

Licensed under the **MIT License**.

---

## Acknowledgements

- [Judge0](https://judge0.com/) - Code execution engine
- [FastAPI](https://fastapi.tiangolo.com/) - Python web framework
- [LangChain](https://www.langchain.com/) - AI framework
- [MongoDB](https://www.mongodb.com/) - Database
- [Redis](https://redis.io/) - Cache and queue
- [Socket.io](https://socket.io/) - Real-time communication
- [Cloudinary](https://cloudinary.com/) - Image hosting

---

## Author

**Akshat Garg**
- GitHub: [@AkshatGarg952](https://github.com/AkshatGarg952)

---

Star this repository if you find it helpful!
