# ⚙️ KodeKshetra (Server)

The core backend orchestrator for **KodeKshetra**, a real-time DSA & CP 1v1 coding battle platform. Powered by **Node.js/Express**, **Socket.io**, **MongoDB**, and **Redis**, this service handles user authentication, matchmaking queues, leaderboards, and gamification logic, while coordinating execution and test generation microservices.

[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Redis](https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white)](https://redis.io/)
[![Socket.io](https://img.shields.io/badge/Socket.io-010101?style=for-the-badge&logo=socketdotio&logoColor=white)](https://socket.io/)

---

## 📐 Microservices Ecosystem

KodeKshetra runs on a distributed architecture to isolate concerns:
1. **Main Server** (This repository): Coordinates user accounts, JWT login, matchmaking queues, battle state, and XP updates.
2. **[Code-Runner](file:///c:/Users/garga/OneDrive/Desktop/Kodekshetra/Code-Runner/README.md)**: Safely compiles and executes user code in sandboxed containers via Judge0.
3. **[HiddenForces](file:///c:/Users/garga/OneDrive/Desktop/Kodekshetra/HiddenForces/README.md)**: Leverages LLMs (Google Gemini) through LangGraph to dynamically generate edge-case test suites.

---

## 🌟 Key Features

- **Redis Matchmaking**: Implements a sorted-set queue to instantly pair players with similar ranks (±200 rating) for live battles.
- **Socket-Based Battles**: Real-time room events to manage problem initialization, timers, submission state, and win/loss delivery.
- **Gamification Engine**: Automatic calculation of XP modifiers, best/current win streaks, and badge unlocking milestones.
- **Admin Control**: Secure endpoints to import LeetCode or Codeforces problem structures directly into the database.

---

## 🛠️ Tech Stack

- **Runtime**: Node.js & Express.js
- **Real-Time Layer**: Socket.io
- **Databases**: MongoDB (Mongoose ODM) & Redis (ioredis client)
- **Security**: JWT & bcrypt password hashing
- **File Uploads**: Multer & Cloudinary

---

## 📂 Project Structure

```
KodeKshetra-Server/
├── src/
│   ├── controllers/      # Admin and user request handlers
│   ├── database/         # MongoDB connect config
│   ├── helper/           # XP formulas, badge checks, question loader, battle updates
│   ├── middlewares/      # JWT auth filter, file upload limits
│   ├── models/           # Mongoose schemas (User, Battle, CF/LC Problems)
│   ├── redis/            # Matchmaker interval, client configuration
│   └── routes/           # REST endpoints mapping
├── index.js              # Server entry point + Socket.io event listeners
└── package.json
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- Running local or cloud instances of **MongoDB** and **Redis**
- Active URLs for **Code-Runner** and **HiddenForces**

### Setup
1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Configure Environment Variables**:
   Create a `.env` file in the root based on `.env.example`:
   ```env
   PORT_NO=5000
   NODE_ENV=development
   JWT_SECRET=your_super_secret_jwt_key
   MONGO_URI=mongodb://localhost:27017/kodeKshetra
   REDIS_URL=redis://localhost:6379
   CLOUDINARY_CLOUD_NAME=your_cloudinary_name
   CLOUDINARY_API_KEY=your_cloudinary_key
   CLOUDINARY_API_SECRET=your_cloudinary_secret
   HIDDEN_FORCES_URL=http://localhost:8000
   CODE_RUNNER_URL=http://localhost:9000
   ```

3. **Start Development Server**:
   ```bash
   npm run dev
   ```
   *The server runs by default at `http://localhost:5000`.*

---

## 📡 API Reference Summary

### Authentication & Users
- `POST /api/users/register` - Create user profile
- `POST /api/users/login` - Authenticate user & get JWT token
- `GET /getUserDetails/:id` - Fetch user stats, streak data, heatmap, and badges

### Matchmaking & Execution (Proxy)
- `POST /run` - Submit current code to Code-Runner (sample tests only)
- `POST /submit` - Final submission to Code-Runner (runs sample + hidden tests)
- `GET /leaderboard/:period/:page` - Retrieve top rankings for 24h (`1`) or 7d (`7`)

### Admin Controls
- `POST /api/admin/addCFProblem` / `addLCProblem` - Register problems
- `POST /api/admin/addCFSolution` / `addLCSolution` - Register verification solutions

---

## 🤝 Acknowledgments

- **Akshat Garg** - [GitHub Profile](https://github.com/AkshatGarg952).
