# 🔮 HiddenForces

An AI-powered hidden test case generator for LeetCode and Codeforces problems. Built using **FastAPI**, **LangChain**, **LangGraph**, and **Google Gemini**, it generates robust and diverse test cases (including boundary conditions, edge cases, and stress tests) to thoroughly validate code submissions on the [KodeKshetra Server](file:///c:/Users/garga/OneDrive/Desktop/Kodekshetra/KodeKshetra-Server/README.md) platform.

[![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![LangChain](https://img.shields.io/badge/LangChain-1C3C3C?style=for-the-badge&logo=langchain&logoColor=white)](https://www.langchain.com/)
[![Gemini](https://img.shields.io/badge/Google%20Gemini-8E75C2?style=for-the-badge&logo=googlegemini&logoColor=white)](https://ai.google.dev/)

---

## 🌟 Key Features

- **AI-Driven Generation**: Leverages Google Gemini models to analyze problem constraints and produce high-quality test inputs.
- **Stateful Validation**: Uses a **LangGraph** workflow to orchestrate the generation and structure validation of test cases.
- **Multiple Formats**: Native support for LeetCode function signature format and Codeforces standard I/O format.
- **Comprehensive Coverage**: Targets minimal, maximal, edge, corner, and large scale stress inputs.
- **High Performance**: Asynchronous FastAPI endpoints capable of handling concurrent generation.

---

## 📐 Pipeline Architecture

```
[ FastAPI Request ] ──▶ [ LangGraph Workflow ]
                             │
                             ├─► [ Test Case Generator ] (Gemini LLM)
                             │
                             ├─► [ Test Case Validator ] (Regex & Bounds)
                             │
                             └─► [ JSON Response ]
```

---

## 🛠️ Tech Stack

- **Framework**: FastAPI (Python 3.8+)
- **AI Orchestration**: LangChain & LangGraph
- **LLM Provider**: Google Generative AI (Gemini)
- **Deployment**: Uvicorn Server

---

## 📂 Project Structure

```
HiddenForces/
├── app/
│   ├── main.py                 # FastAPI endpoints & CORS
│   ├── models.py               # Pydantic schemas
│   ├── workflow.py             # LangGraph state workflow
│   ├── codeforces_generator.py # CF generator prompt
│   ├── codeforces_validator.py # CF input constraint validator
│   ├── leetcode_generator.py   # LC generator prompt
│   └── leetcode_validator.py   # LC input constraint validator
├── requirements.txt            # Python dependencies
└── run.py                      # Port-configured startup script
```

---

## 🚀 Quick Start

### Prerequisites
- Python 3.8 or higher
- Google Gemini API key (from [Google AI Studio](https://makersuite.google.com/app/apikey))

### Setup
1. **Create Virtual Environment**:
   ```bash
   python -m venv .venv
   source .venv/bin/activate  # On Windows: .venv\Scripts\activate
   ```

2. **Install Dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Configure Environment Variables**:
   Create a `.env` file in the root:
   ```env
   GOOGLE_API_KEY=your_gemini_api_key_here
   PORT=8000
   ```

4. **Start Server**:
   ```bash
   python run.py
   ```
   *The service will start on `http://localhost:8000` (interactive API docs available at `/docs`).*

---

## 📡 API Endpoints

| Method | Endpoint | Description | Key Body Parameters |
|:---:|:---|:---|:---|
| **GET** | `/health` | Check service health | None |
| **POST** | `/generate-leetcode-tests` | Generate test cases for a LeetCode problem | `problem` (ID, constraints, examples, difficulty) |
| **POST** | `/generate-codeforces-tests` | Generate test cases for a Codeforces problem | `problem` (ID, inputFormat, constraints, examples) |

---

## 🤝 Acknowledgments

- **Google Generative AI** for the Gemini API.
- **Akshat Garg** - [GitHub Profile](https://github.com/AkshatGarg952).