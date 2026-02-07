# Coffee Shop Queue System - Project Structure

Successfully reorganized and cleaned up the Smart Coffee Shop Queue System project.

## Final Directory Structure

```
coffee-shop/
├── backend/
│   ├── src/
│   │   └── main/
│   │       ├── java/com/coffeequeue/
│   │       │   ├── controller/
│   │       │   ├── service/
│   │       │   ├── model/
│   │       │   ├── dto/
│   │       │   ├── exception/
│   │       │   ├── config/
│   │       │   └── CoffeeQueueApplication.java
│   │       └── resources/
│   │           └── application.properties
│   ├── target/
│   │   └── coffee-shop-queue-1.0.0.jar
│   ├── pom.xml
│   └── README.md
│
├── frontend/
│   ├── src/
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   ├── components/
│   │   │   ├── Menu.tsx
│   │   │   ├── QueueDashboard.tsx
│   │   │   └── Navbar.tsx
│   │   ├── services/
│   │   │   └── api.ts
│   │   └── index.css
│   ├── index.html
│   ├── package.json
│   ├── vite.config.ts
│   ├── tsconfig.json
│   ├── tailwind.config.js
│   ├── postcss.config.cjs
│   ├── README.md
│   └── node_modules/ (generated)
│
├── Documentation (root)
│   ├── README.md (main project overview)
│   ├── ARCHITECTURE.md
│   ├── ALGORITHM.md
│   ├── API_REFERENCE.md
│   ├── DEPLOYMENT.md
│   ├── QUICKSTART.md
│   └── PROJECT_SUMMARY.md
│
├── Deployment
│   ├── docker-compose.yml
│   ├── Dockerfile (root-level multi-stage build)
│   ├── backend/src/main/resources/ (backend config)
│   └── frontend config files
│
├── Version Control
│   ├── .github/
│   ├── .gitignore
│   └── .vscode/
```

## What Was Done

### ✅ Cleanup Completed

1. **Removed Unnecessary Files:**
   - `node_modules/` - Backend and root level (regenerated from package.json)
   - `target/` - Old build directory at root (moved to backend/)
   - `src/` and `pom.xml` - Root level duplicates (moved to backend/)
   - Cache files: `.vite/`, `dist/`, `.gradle/`
   - Temporary files: `test-order.js/mjs`, old config files
   - Temporary documentation: `PHASE_4_5_COMPLETION.md`, `QUICKSTART_PHASE_45.md`, `JAVA_README.md`

2. **Reorganized Into Two Main Folders:**
   - `backend/` - All Java Spring Boot source code and build
   - `frontend/` - All React/TypeScript UI code and configuration

3. **Created README Files:**
   - `backend/README.md` - Build and run instructions for backend
   - `frontend/README.md` - Install and run instructions for frontend

### 📊 Storage Saved

- Removed ~300+ MB of node_modules
- Removed build artifacts and cache files
- Removed duplicate source files
- Result: Clean, organized structure with only essential files

## How to Run

### Backend (from `backend/` directory)
```bash
cd backend
mvn clean package
java -jar target/coffee-shop-queue-1.0.0.jar
```
Runs on: **http://localhost:3000/api**

### Frontend (from `frontend/` directory)
```bash
cd frontend
npm install
npm run dev
```
Runs on: **http://localhost:5173** or **http://localhost:5176**

## Technologies Used

**Backend:**
- Java 17
- Spring Boot 3.2.0
- Maven
- RESTful API with priority queue algorithm

**Frontend:**
- React 18
- TypeScript 5
- Vite 4
- Tailwind CSS 3
- Axios for API communication

## Status

✅ **All systems operational:**
- Backend: Compiles successfully, running on port 3000
- Frontend: Builds and runs successfully on Vite dev server
- Full end-to-end flow working (Menu → Order → Dashboard)
- Real-time queue updates with 5-second polling
- Priority scoring algorithm active
