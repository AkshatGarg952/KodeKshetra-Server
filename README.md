# ⚔️ KodeKshetra (Server)

> 🧠 Backend microservice for real-time DSA & CP battles — powered by **Node.js**, **FastAPI**, **MongoDB**, **Redis**, and **Judge0**.

[![Node.js](https://img.shields.io/badge/Backend-Node.js-green?style=flat-square)](https://nodejs.org/)
[![FastAPI](https://img.shields.io/badge/Microservice-FastAPI-teal?style=flat-square)](https://fastapi.tiangolo.com/)
[![MongoDB](https://img.shields.io/badge/Database-MongoDB-brightgreen?style=flat-square)](https://www.mongodb.com/)
[![Redis](https://img.shields.io/badge/Cache-Redis-red?style=flat-square)](https://redis.io/)
[![Judge0](https://img.shields.io/badge/Code%20Execution-Judge0-orange?style=flat-square)](https://judge0.com/)
[![LangChain](https://img.shields.io/badge/AI-LangChain-blue?style=flat-square)](https://www.langchain.com/)

---

## 🚀 Overview

**KodeKshetra** is a **real-time coding battle platform** where users face off in DSA and CP matches.  
The **server** handles authentication, matchmaking, AI-based test generation, and leaderboard ranking — all built on a **microservice architecture** for scalability and modularity.

### 🧩 Microservices

- 🧠 **Main Backend (Node.js + Express)** — Authentication, matchmaking, battles, XP, badges, and leaderboards  
- ⚙️ **Hidden Forces (FastAPI + LangChain + Gemini)** — AI-based hidden test case generator for Codeforces & LeetCode  
- ⚡ **Code Runner (Node.js + Judge0)** — Executes code safely against sample & hidden tests

---

## 🏗️ Folder Structure

```
KodeKshetra-Server/
│
├── src/
│   ├── controllers/
│   │   ├── admin.controller.js
│   │   └── user.controller.js
│   ├── database/
│   │   └── mongoose.js
│   ├── helper/
│   │   ├── Questions/
│   │   ├── XP/
│   │   ├── badges/
│   │   ├── fetchProfile/
│   │   ├── leaderboard/
│   │   ├── updation/
│   │   └── winner/
│   ├── middlewares/
│   ├── models/
│   ├── redis/
│   └── routes/
│
├── index.js
├── package.json
└── README.md
```

---

## ⚙️ Features

- 👥 **User Auth & Profiles** — Register/login with LeetCode & Codeforces usernames  
- ⚔️ **Real-time Battles** — Fight friends or random rivals in live DSA/CP duels  
- 🧩 **Smart Problem Selection** — Fetches unsolved problems for fairness  
- 🧠 **AI Hidden Tests** — Generated via the "Hidden Forces" service using FastAPI + LangChain + Gemini  
- 🏅 **Badges & XP System** — Gamified progress tracking  
- 📊 **Leaderboards** — Rankings for last 24 hours & 7 days  
- 🔥 **90-Day Heatmap** — Visual consistency tracker  
- ⚡ **Redis Matchmaking** — Optimized for real-time responsiveness  
- 🧮 **Judge0 Integration** — Secure sandboxed code execution  

---

## 🧾 API Reference

### 👤 User Routes

| Method | Endpoint | Description |
|:------:|:---------|:------------|
| `POST` | `/api/users/register` | Register new user |
| `POST` | `/api/users/login` | Login existing user |
| `PUT` | `/api/users/update/:id` | Update user data |
| `GET` | `/getUserDetails/:id` | Fetch badges, streaks, heatmap, stats |
| `POST` | `/api/users/logout` | Logout user |
| `POST` | `/run` | Execute code (sample tests only) |
| `POST` | `/submit` | Execute code (sample + hidden tests) |
| `GET` | `/leaderboard/:period/:page` | Paginated leaderboard data |

### 🧑‍💻 Admin Routes

| Method | Endpoint | Description |
|:------:|:---------|:------------|
| `POST` | `/api/admin/addCFProblem` | Add Codeforces problem metadata |
| `POST` | `/api/admin/addLCProblem` | Add LeetCode problem metadata |
| `POST` | `/api/admin/addCFSolution` | Add Codeforces solution |
| `POST` | `/api/admin/addLCSolution` | Add LeetCode solution |

---

## 🏅 Gamification System

| Feature | Description |
|---------|-------------|
| 🏆 **Badges** | Earned after battles based on conditions |
| 🔥 **Streaks** | Track consecutive wins |
| 📈 **Heatmap** | Visual representation of user activity |
| ⚙️ **XP Calculator** | Dynamically computes XP based on opponent strength |

---

## ⚙️ Installation

```bash
# Clone repository
git clone https://github.com/AkshatGarg952/KodeKshetra-Server.git
cd KodeKshetra-Server

# Install dependencies
npm install

# Create .env file with the following variables
MONGO_URI=your_mongo_uri
JWT_SECRET=your_jwt_secret
REDIS_URL=redis://your_redis_host:6379
PORT_NO=5000
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
NODE_ENV=development

# Start server
npm run dev
```

---

## 🧱 Tech Stack

| Component | Technology |
|-----------|------------|
| **Backend** | Node.js, Express.js, FastAPI |
| **AI** | LangChain, Gemini, LangGraph |
| **Database** | MongoDB (Mongoose) |
| **Cache** | Redis |
| **Execution** | Judge0 API |
| **Auth** | JWT |

---

## 🏛️ Architecture

```
User
 ↓
KodeKshetra Server (Node.js)
 ├── Matchmaking (Redis)
 ├── Code Runner (Judge0)
 └── Hidden Forces (FastAPI + LangChain)
```

---

## 📜 License

Licensed under the **MIT License**.

---

## 💡 Acknowledgements

- [Judge0](https://judge0.com/)
- [FastAPI](https://fastapi.tiangolo.com/)
- [LangChain](https://www.langchain.com/)
- [MongoDB](https://www.mongodb.com/)
- [Redis](https://redis.io/)
