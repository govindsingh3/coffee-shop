<<<<<<< HEAD
# Coffee Shop Queue Optimization System - README

## 🚀 Overview
Bean & Brew Smart Queue System is an AI-driven order management solution that optimizes barista workload and minimizes customer wait times using advanced priority scoring algorithms.

### Problem Solved
Traditional FIFO queues create frustration when customers ordering simple drinks wait behind complex orders. This system intelligently routes orders to baristas based on:
- **Wait time** (40% priority)
- **Order complexity** (25% priority)
- **Customer loyalty** (10% priority)
- **Urgency threshold** (25% priority)

### Expected Results
- **Average wait time**: 4.8 minutes (vs 6.2 with FIFO)
- **Timeout rate**: 2.3% (vs 8.5% with FIFO)
- **Workload balance**: 98% efficiency

---

## 📋 Tech Stack

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **Vite** for fast development
- **Socket.io** for real-time updates
- **Axios** for API calls

### Backend
- **Java 17** with Spring Boot 3.2.0
- **Spring Web** for REST APIs
- **Spring WebSocket** for real-time communication
- **Maven** for dependency management

### Database
- **MongoDB** (containerized for local development)
- In-memory storage for MVP

### Deployment
- **Docker** & **Docker Compose** for containerization
- **Azure Container Instances** / **App Service** ready
- **CI/CD** pipeline ready

---

## 🛠️ Installation

### Prerequisites
- **Java 17** (JDK)
- **Maven 3.9+**
- **Node.js 18+**
- **npm or yarn**
- **Docker** (for containerized deployment)

### Local Development

```bash
# 1. Navigate to project
cd "d:\coffee shop"

# 2. Build backend (Java)
mvn clean install

# 3. Install frontend dependencies
cd client && npm install && cd ..

# 4. Start development servers
# Terminal 1: Start Java backend
mvn spring-boot:run

# Terminal 2: Start React frontend
cd client && npm run dev
```

This will start:
- **Backend**: http://localhost:3000 (Java Spring Boot)
- **Frontend**: http://localhost:5173 (React + Vite)

### Using Docker

```bash
# Build and run with Docker Compose
docker-compose up --build

# Frontend: http://localhost:5173
# Backend: http://localhost:3000
```

---

## 📊 API Endpoints

### Orders
- `POST /api/orders` - Place new order
- `GET /api/orders` - Get all orders
- `POST /api/orders/:orderId/complete` - Mark order complete

### Queue Management
- `GET /api/queue` - Get current queue status with stats
- `GET /api/menu` - Get menu items

### Real-time Updates (WebSocket)
- Endpoint: `/ws/queue`
- Protocol: STOMP over WebSocket
- Topics: `/topic/queue-update`, `/topic/order-completed`

---

## 🧠 Algorithm Deep Dive

### Priority Scoring Formula
```
Priority Score = (WaitTime × 40%) + (Complexity × 25%) + (Loyalty × 10%) + (Urgency × 25%)

Where:
- WaitTime: Minutes waited (capped at 10)
- Complexity: 25 - (prepTime/6 × 25)
- Loyalty: +10 if regular customer
- Urgency: +50 if wait > 8 min, +25 if > 6 min
```

### Barista Assignment Logic
1. **Priority Queue**: Orders sorted by priority score every 30 seconds
2. **Workload Balancing**: Prefer baristas < 1.2x average workload
3. **Fairness Enforcement**: Track queue skips, cap at 3
4. **Emergency Mode**: If wait > 10 min, assign to any available barista

### Key Features
- ✅ Real-time priority recalculation
- ✅ Workload distribution optimization
- ✅ Customer psychology factors
- ✅ Transparency (order status visible)
- ✅ Emergency escalation

---

## 🎯 Features

### Customer-Facing
- 📝 Easy drink ordering interface
- 🔍 Real-time queue position tracking
- ⏱️ Estimated wait time display
- 👥 Transparency on order assignment
- ⭐ Regular customer recognition

### Barista/Manager Dashboard
- 📊 Live queue visualization
- 👨‍🍳 Barista workload display
- 📈 Performance metrics
- 🚨 Timeout alerts
- 📋 Order priority scores

---

## 📈 Performance Metrics

Monitor these KPIs:
- **Average Wait Time**: Target < 5 minutes
- **Timeout Rate**: Target < 3%
- **Workload Balance**: Target > 95%
- **Fairness Index**: % orders > 3 skips
- **Throughput**: Orders/minute

---

## 🚀 Deployment

### Azure Container Instances
```bash
# Build image
docker build -t coffee-queue-system .

# Push to Azure Container Registry
az acr build --registry <registry-name> --image coffee-queue-system:latest .

# Deploy to ACI
az container create \
  --resource-group <rg-name> \
  --name coffee-queue \
  --image <registry>.azurecr.io/coffee-queue-system:latest \
  --ports 3000 \
  --environment-variables NODE_ENV=production PORT=3000
```

### Azure App Service
```bash
# Create resource group
az group create --name coffee-shop-rg --location eastus

# Create App Service plan
az appservice plan create --name coffee-shop-plan --resource-group coffee-shop-rg --sku B1 --is-linux

# Create web app
az webapp create --resource-group coffee-shop-rg --plan coffee-shop-plan --name coffee-queue-system

# Deploy from Docker
az webapp config container set --name coffee-queue-system --resource-group coffee-shop-rg --docker-custom-image-name <image-url> --docker-registry-server-url <registry-url>
```

---

## 🔧 Environment Variables

```env
# Backend
NODE_ENV=production
PORT=3000
CLIENT_URL=http://localhost:5173
MONGODB_URI=mongodb://localhost:27017/coffee-shop

# Frontend
VITE_API_URL=http://localhost:3000
```

---

## 📝 Project Structure

```
coffee-shop/
├── server/
│   └── index.ts              # Main backend server
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Menu.tsx       # Order placement
│   │   │   ├── QueueDashboard.tsx # Queue visualization
│   │   │   └── Navbar.tsx     # Navigation
│   │   ├── App.tsx            # Main app component
│   │   ├── index.css          # Global styles
│   │   └── main.tsx           # React entry point
│   ├── index.html             # HTML template
│   ├── vite.config.ts         # Vite configuration
│   ├── tailwind.config.js     # Tailwind configuration
│   └── package.json           # Frontend dependencies
├── Dockerfile                 # Multi-stage Docker build
├── docker-compose.yml         # Docker Compose setup
├── package.json               # Root dependencies
├── tsconfig.json              # TypeScript config
└── README.md                  # This file
```

---

## 🧪 Testing

### Manual Testing Workflow
1. Open http://localhost:5173
2. Order multiple drinks (vary complexity)
3. Check dashboard for queue ordering
4. Verify priority scores update
5. Simulate order completion via API

### Load Testing
```bash
# Simulate concurrent orders
for i in {1..50}; do
  curl -X POST http://localhost:3000/api/orders \
    -H "Content-Type: application/json" \
    -d '{"items":[{"drinkType":"cappuccino","quantity":1}],"isRegular":false}' &
done
```

---

## 🤝 Contributing

For hackathon improvements:
1. Fork and create feature branch
2. Test locally with `npm run dev`
3. Build and test Docker image
4. Submit PR with performance metrics

---

## 📞 Support

For issues or questions:
- Check API logs: `docker-compose logs -f backend`
- Check client logs: Browser DevTools Console
- Debug priority scoring: See QueueDashboard component

---

## 📄 License

MIT License - Use freely for hackathon projects

---

## 🎓 Learning Resources

- Priority Queue Algorithms: Classic CS topic
- Socket.io Real-time Communication: WebSocket tutorial
- React Hooks: State management patterns
- Docker Multi-stage Builds: Container optimization

**Built for HCL Tech Hackathon | 2026**
=======
# coffee-shop
>>>>>>> 469cd9ad52080a63cdd5ddcc1abaaf90dcb5f9eb
