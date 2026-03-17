# Production Scaling Guide 🏗️

This guide provides recommendations for scaling the JobGenesis backend to handle 10,000+ concurrent users.

## 1. Process Management with PM2
While we have implemented native Node.js clustering, using **PM2** is highly recommended for production environments to handle process monitoring, auto-restart on crashes, and zero-downtime reloads.

### Installation
```bash
npm install -g pm2
```

### Running with PM2
To launch the backend in cluster mode with PM2 (which will complement our native clustering):
```bash
pm2 start dist/server.js -i max --name jobgenesis-backend
```
*Note: `-i max` will spawn one process per CPU core.*

---

## 2. Infrastructure Requirements
For 10,000 users, the following infrastructure is recommended:

### Redis (Mandatory)
- **Role**: Distributed rate limiting, session management, and BullMQ task queue.
- **Recommendation**: Managed Redis (e.g., AWS ElastiCache, Upstash, or Redis Cloud).
- **Env**: `REDIS_URI` must be set.

### MongoDB Optimization
- **Role**: Primary data store.
- **Recommendation**: MongoDB Atlas (M30 tier or higher) with a connection pool sized for the number of clustered workers.
- **Current Config**: `maxPoolSize: 100`, `minPoolSize: 10`.

---

## 3. Environment Variables
Ensure these are tuned for production:
```env
NODE_ENV=production        # Enforces Redis requirement for rate limiting
PORT=4000
MONGO_URI=mongodb+srv://...
REDIS_URI=redis://...
JWT_SECRET=supersecret
```

---

## 4. Horizontal Scaling
If a single server (even with clustering) reaches its limit, scale horizontally:
- **Load Balancer**: Use AWS ALB or Nginx to distribute traffic across multiple backend instances.
- **Sticky Sessions**: Required if using Socket.io without a Redis adapter (though we recommend the Redis adapter for reliability).
