# CivicSim — Policy Simulation Platform

CivicSim is an agent-based economic policy simulator that allows users to model the impact of government policies (taxes, wages, welfare) on a synthetic population of 1,000 AI citizens over a 10-year period.



## 🚀 Key Features

- **Agent-Based Simulation**: Thousands of independent AI entities responding to economic incentives.
- **Monte Carlo Modeling**: Probabilistic projections with confidence interval visualization.
- **Policy Optimizer**: AI-driven grid-search to find "optimal" policy sets for GDP, employment, or inequality.
- **Scenario Comparison**: Side-by-side analysis of policy deltas.
- **Simulation History**: Deep storage of past runs with Firestore persistence.
- **Modern UI**: Sleek dark mode, interactive charts (Recharts), and responsive design.

## 🛠 Tech Stack

- **Frontend**: React, Vite, TailwindCSS, Recharts, Lucide, Zustand.
- **Backend**: Fastify, Firebase Admin SDK, TypeScript.
- **Engine**: Pure TypeScript agent-based modeling.
- **Database/Auth**: Firebase & Firestore.

## 📦 Project Structure

```text
CivicSim/
├── backend/            # Fastify API (Routes, Controllers, Services)
├── frontend/           # React SPA
├── simulation-engine/  # Core logic, Monte Carlo, and Optimizer
└── package.json        # Workspace configuration
```

## 🏁 Getting Started

### 1. Prerequisites
- Node.js (v18+)
- Firebase Project (for Auth and Firestore)

### 2. Installation
```bash
npm install
```

### 3. Environment Setup
Create `.env` files based on the `.env.example` in both `backend/` and `frontend/` directories.

### 4. Running the App
```bash
# Start backend
npm run dev -w backend

# Start frontend
npm run dev -w frontend
```

## 🧠 Architecture Notes

- **Simulation Engine**: Designed as a standalone package to be utilized by any interface. It uses a "Marketplace" model where businesses produce and citizens consume based on their individual micro-states.
- **Backend**: Implements a clean layered architecture separating HTTP concerns from business logic.
- **Frontend**: Uses Zustand for centralized state management, enabling complex baseline comparisons without prop-drilling.


