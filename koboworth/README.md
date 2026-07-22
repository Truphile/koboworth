# Koboworth Financial Systems

Koboworth is a modular monolithic platform designed to provide informal workers with a verifiable trust passport, enabling access to micro-credit, and giving lenders a secure way to verify worker credibility.

## 🌐 Portal Links & Credentials

The system is split across three independent React frontend applications, which run on different ports locally.

### 1. Worker Portal (Port 3000)
**Link:** [http://localhost:3000/user-login](http://localhost:3000/user-login)  
**Purpose:** For informal workers to sign up, manage their trust score, and view their dashboard.
- **Directory:** `/frontend`
- **Backend API:** Port 8001 (`api_worker`)

### 2. Collector Portal (Port 3001)
**Link:** [http://localhost:3001/collector-login](http://localhost:3001/collector-login)  
**Purpose:** For field agents (collectors) to onboard workers and collect physical data.
- **Directory:** `/frontend-collector`
- **Backend API:** Port 8002 (`api_collector`)

### 3. Lender Portal (Port 3002)
**Link:** [http://localhost:3002/login](http://localhost:3002/login)  
**Purpose:** For banks and MFIs to verify trust passports, report loan defaults, and track API usage.
- **API Key:** `demo-123`
- **Directory:** `/frontend-lender`
- **Backend API:** Port 8000 (`api`)

### 4. IT Specialist / Admin Portal (Port 3002)
**Link:** [http://localhost:3002/admin/login](http://localhost:3002/admin/login)  
**Purpose:** For internal IT staff to monitor system health, audit logs, and resolve user disputes.
- **Password:** `admin123`
- **Directory:** `/frontend-lender` (Runs on the same frontend app as the Lender Portal, but under the `/admin/*` routes)
- **Backend API:** Port 8000 (`api`)

---

## 🏗 Backend Architecture (Docker)

The backend is a monolithic FastAPI application separated into three different entry points to simulate microservices, running alongside PostgreSQL and Redis.

- **Lender/Admin API:** `http://localhost:8000` (Container: `api`)
- **Worker API:** `http://localhost:8001` (Container: `api_worker`)
- **Collector API:** `http://localhost:8002` (Container: `api_collector`)

To restart the backend services, run:
```bash
docker compose restart
```
