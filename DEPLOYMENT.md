# 🚀 Coffee Shop Queue System - Complete Setup & Deployment Guide

## Quick Start (5 minutes)

### Prerequisites
- Node.js 18+ installed
- npm or yarn
- Git

### 1. Local Development Setup

```bash
# Navigate to project
cd "d:\coffee shop"

# Install all dependencies
npm run install:all

# Start development servers
npm run dev
```

**Output:**
```
✓ Server running on port 3000
✓ Client running on port 5173
```

**Access:**
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000/api/health
- Dashboard: http://localhost:5173 (click "Queue Status")

---

## Docker Deployment (10 minutes)

### Option 1: Docker Compose (Recommended for local testing)

```bash
# Build and start all services
docker-compose up --build

# Services will be available:
# - Frontend: http://localhost:5173
# - Backend: http://localhost:3000
# - MongoDB: localhost:27017
```

Stop services:
```bash
docker-compose down
```

### Option 2: Manual Docker Build

```bash
# Build image
docker build -t coffee-queue-system .

# Run container
docker run -p 3000:3000 -e NODE_ENV=production coffee-queue-system

# Access at http://localhost:3000
```

---

## Azure Deployment (Cloud)

### Option 1: Azure Container Instances (Easiest)

**Prerequisites:**
- Azure CLI installed
- Azure subscription

```bash
# 1. Create resource group
az group create --name coffee-shop-rg --location eastus

# 2. Create container registry
az acr create --resource-group coffee-shop-rg \
  --name coffeequeueregistry \
  --sku Basic

# 3. Build and push image
az acr build --registry coffeequeueregistry \
  --image coffee-queue:latest .

# 4. Get registry credentials
az acr credential show --name coffeequeueregistry

# 5. Deploy to ACI
az container create \
  --resource-group coffee-shop-rg \
  --name coffee-queue-prod \
  --image coffeequeueregistry.azurecr.io/coffee-queue:latest \
  --registry-login-server coffeequeueregistry.azurecr.io \
  --registry-username <USERNAME> \
  --registry-password <PASSWORD> \
  --ports 3000 \
  --cpu 1 \
  --memory 1 \
  --environment-variables \
    NODE_ENV=production \
    PORT=3000

# 6. Get public IP
az container show --resource-group coffee-shop-rg \
  --name coffee-queue-prod \
  --query ipAddress.ip
```

**Access deployed app:**
```
http://<PUBLIC_IP>:3000
```

### Option 2: Azure App Service (Scalable)

```bash
# 1. Create App Service plan
az appservice plan create \
  --name coffee-queue-plan \
  --resource-group coffee-shop-rg \
  --sku B1 \
  --is-linux

# 2. Create web app
az webapp create \
  --name coffee-queue-app \
  --resource-group coffee-shop-rg \
  --plan coffee-queue-plan \
  --deployment-container-image-name-user <USERNAME> \
  --deployment-container-image-name coffeequeueregistry.azurecr.io/coffee-queue:latest

# 3. Configure app settings
az webapp config appsettings set \
  --name coffee-queue-app \
  --resource-group coffee-shop-rg \
  --settings \
    NODE_ENV=production \
    PORT=3000 \
    WEBSITES_PORT=3000

# 4. Access app
# https://coffee-queue-app.azurewebsites.net
```

### Option 3: GitHub Actions CI/CD

1. **Set up Azure credentials:**
```bash
az ad sp create-for-rbac --name "coffee-queue-sp" --role contributor
```

2. **Add GitHub secrets:**
   - `AZURE_CREDENTIALS` (from above)
   - `REGISTRY_LOGIN_SERVER`
   - `REGISTRY_USERNAME`
   - `REGISTRY_PASSWORD`
   - `RESOURCE_GROUP`

3. **Push to main branch:**
```bash
git push origin main
```

GitHub Actions will automatically:
- ✅ Build project
- ✅ Run tests
- ✅ Build Docker image
- ✅ Push to Azure Container Registry
- ✅ Deploy to Azure

---

## Environment Variables

**Development (.env)**
```env
NODE_ENV=development
PORT=3000
CLIENT_URL=http://localhost:5173
VITE_API_URL=http://localhost:3000
MONGODB_URI=mongodb://admin:password@localhost:27017/coffee-shop
```

**Production (.env.production)**
```env
NODE_ENV=production
PORT=3000
CLIENT_URL=https://your-domain.com
VITE_API_URL=https://api.your-domain.com
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/coffee-shop
```

---

## Monitoring & Logs

### Local Development
```bash
# Backend logs
npm run dev:server

# Client logs (browser console)
# Or check terminal output

# Real-time queue monitoring
# Visit http://localhost:5173/dashboard
```

### Docker
```bash
# View container logs
docker-compose logs -f backend
docker-compose logs -f

# Real-time metrics
docker stats
```

### Azure Container Instances
```bash
# View logs
az container logs --resource-group coffee-shop-rg \
  --name coffee-queue-prod

# Real-time logs
az container logs --resource-group coffee-shop-rg \
  --name coffee-queue-prod --follow
```

### Azure App Service
```bash
# Stream logs
az webapp log tail --name coffee-queue-app \
  --resource-group coffee-shop-rg
```

---

## Testing

### 1. Functional Testing

**Place an order:**
```bash
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      {"drinkType": "cappuccino", "quantity": 1},
      {"drinkType": "cold-brew", "quantity": 2}
    ],
    "isRegular": true
  }'
```

**Check queue:**
```bash
curl http://localhost:3000/api/queue
```

**Complete order:**
```bash
curl -X POST http://localhost:3000/api/orders/{orderId}/complete
```

### 2. Load Testing

```bash
# Simulate 50 concurrent orders
for i in {1..50}; do
  curl -X POST http://localhost:3000/api/orders \
    -H "Content-Type: application/json" \
    -d '{"items":[{"drinkType":"cappuccino","quantity":1}],"isRegular":false}' &
done
wait
```

### 3. Performance Metrics

Visit dashboard to check:
- ✅ Average wait time
- ✅ Timeout rate
- ✅ Barista workload balance
- ✅ Queue length

---

## Production Checklist

Before deploying to production:

- [ ] Environment variables configured
- [ ] Database connection tested
- [ ] Build succeeds without errors
- [ ] Docker image builds successfully
- [ ] All tests pass
- [ ] Azure resources created
- [ ] Monitoring/logging configured
- [ ] SSL/TLS configured
- [ ] Domain configured
- [ ] Load testing completed
- [ ] Backup strategy in place
- [ ] Disaster recovery plan documented

---

## Troubleshooting

### Issue: Port 3000 already in use
```bash
# Find process using port 3000
lsof -i :3000

# Kill process
kill -9 <PID>
```

### Issue: Module not found
```bash
# Clear node_modules and reinstall
rm -rf node_modules frontend/node_modules
npm install --prefix frontend
```

### Issue: Docker build fails
```bash
# Clear Docker cache
docker system prune -a

# Rebuild
docker-compose up --build
```

### Issue: Azure deployment timeout
```bash
# Check container logs
az container logs --resource-group coffee-shop-rg \
  --name coffee-queue-prod

# Increase timeout or check resource limits
```

---

## Performance Optimization

### Frontend
- ✅ Lazy load components
- ✅ Memoize expensive calculations
- ✅ Use production Vite build

### Backend
- ✅ Implement caching
- ✅ Use connection pooling for DB
- ✅ Enable compression

### Infrastructure
- ✅ Use CDN for static assets
- ✅ Enable horizontal scaling
- ✅ Set up auto-scaling rules

---

## Security Best Practices

- ✅ Use environment variables for secrets
- ✅ Enable HTTPS in production
- ✅ Validate all inputs
- ✅ Use CORS appropriately
- ✅ Implement rate limiting
- ✅ Regular security audits

---

## Support & Resources

- **Documentation**: See README.md
- **API Docs**: http://localhost:3000/api/health
- **Issues**: Check application logs
- **Azure Support**: https://azure.microsoft.com/support

---

## Next Steps

1. ✅ Complete local setup
2. ✅ Test functionality
3. ✅ Configure Azure resources
4. ✅ Deploy to cloud
5. ✅ Monitor performance
6. ✅ Scale as needed

---

**Deployment completed! 🎉 Your Coffee Shop Queue System is ready for the hackathon!**
