# دليل استكشاف الأخطاء | Troubleshooting Guide

## خطأ 404: NOT_FOUND | 404: NOT_FOUND Error

### الأسباب المحتملة | Possible Causes

#### 1. مشاكل النشر | Deployment Issues
```bash
# Check if the application is running
ps aux | grep node

# Check port availability
netstat -tlnp | grep :5000

# Check application logs
tail -f server/logs/all.log
```

#### 2. مشاكل التوجيه | Routing Issues
```javascript
// Ensure all routes are properly defined in server/src/index.js
app.use('/api/auth', authRoutes);
app.use('/api/accounts', authMiddleware, accountRoutes);
app.use('/api/transactions', authMiddleware, transactionRoutes);
```

#### 3. مشاكل CORS | CORS Issues
```javascript
// Check CORS configuration in server/src/index.js
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
  optionsSuccessStatus: 200
}));
```

### الحلول السريعة | Quick Fixes

#### 1. إعادة تشغيل الخادم | Restart Server
```bash
# Kill any existing processes
pkill -f "node.*server"

# Start the server
cd server
npm start
```

#### 2. التحقق من متغيرات البيئة | Check Environment Variables
```bash
# Verify .env file exists and is properly configured
cat server/.env

# Check required variables
echo $PORT
echo $NODE_ENV
```

#### 3. التحقق من قواعد البيانات | Database Connectivity
```bash
# Test PostgreSQL connection
psql -h localhost -U postal_bank_user -d tunisian_postal_bank -c "SELECT 1;"

# Test Redis connection
redis-cli ping

# Test MongoDB connection
mongo tunisian_postal_bank_logs --eval "db.stats()"
```

## مشاكل الاتصال | Connection Issues

### خطأ الاتصال بقاعدة البيانات | Database Connection Error
```bash
# Error: ECONNREFUSED
# Solution: Ensure database services are running

sudo systemctl status postgresql
sudo systemctl start postgresql

sudo systemctl status redis
sudo systemctl start redis

sudo systemctl status mongod
sudo systemctl start mongod
```

### خطأ المصادقة | Authentication Error
```bash
# Error: password authentication failed
# Solution: Check database credentials

# Reset PostgreSQL password
sudo -u postgres psql
ALTER USER postal_bank_user PASSWORD 'new_secure_password';
```

## مشاكل الأداء | Performance Issues

### بطء الاستجابة | Slow Response Times
```bash
# Monitor server resources
htop
iotop

# Check database performance
EXPLAIN ANALYZE SELECT * FROM users LIMIT 10;

# Monitor Redis memory
redis-cli info memory
```

### استهلاك الذاكرة العالي | High Memory Usage
```bash
# Check Node.js memory usage
node --max-old-space-size=4096 src/index.js

# Monitor process memory
ps aux --sort=-%mem | head
```

## مشاكل الأمان | Security Issues

### رفض الطلبات | Request Blocked
```bash
# Check rate limiting
redis-cli keys "rate_limit:*"

# Check IP blocking
redis-cli keys "blocked_ip:*"

# Review security logs
tail -f server/logs/security.log
```

### مشاكل JWT | JWT Issues
```bash
# Check JWT configuration
echo $JWT_SECRET
echo $JWT_EXPIRY

# Verify token format
# Should be: Bearer <token>
```

## مشاكل الواجهة الأمامية | Frontend Issues

### مشاكل البناء | Build Issues
```bash
# Clear node_modules and reinstall
cd client
rm -rf node_modules package-lock.json
npm install

# Clear build cache
npm run build -- --reset-cache
```

### مشاكل الشبكة | Network Issues
```bash
# Check API endpoint configuration
echo $REACT_APP_API_URL
echo $REACT_APP_SOCKET_URL

# Test API connectivity
curl -X GET http://localhost:5000/health
```

## خطوات التشخيص | Diagnostic Steps

### 1. فحص الحالة العامة | General Health Check
```bash
#!/bin/bash
# health_check.sh

echo "=== Tunisian Postal Bank Health Check ==="

# Check Node.js version
echo "Node.js version: $(node --version)"

# Check npm version
echo "npm version: $(npm --version)"

# Check if ports are available
echo "Checking ports..."
netstat -tlnp | grep :3000 && echo "Port 3000: In use" || echo "Port 3000: Available"
netstat -tlnp | grep :5000 && echo "Port 5000: In use" || echo "Port 5000: Available"

# Check database services
echo "Checking services..."
systemctl is-active postgresql && echo "PostgreSQL: Active" || echo "PostgreSQL: Inactive"
systemctl is-active redis && echo "Redis: Active" || echo "Redis: Inactive"
systemctl is-active mongod && echo "MongoDB: Active" || echo "MongoDB: Inactive"

# Check disk space
echo "Disk usage:"
df -h | grep -E "(/$|/var|/tmp)"

# Check memory usage
echo "Memory usage:"
free -h
```

### 2. فحص التطبيق | Application Check
```bash
#!/bin/bash
# app_check.sh

echo "=== Application Status Check ==="

# Check if server is responding
curl -s http://localhost:5000/health && echo "Server: Healthy" || echo "Server: Not responding"

# Check database connectivity
cd server
node -e "
const connectDB = require('./src/config/database');
connectDB().then(() => {
  console.log('Database: Connected');
  process.exit(0);
}).catch(err => {
  console.log('Database: Connection failed -', err.message);
  process.exit(1);
});
"

# Check Redis connectivity
redis-cli ping && echo "Redis: Connected" || echo "Redis: Connection failed"
```

### 3. فحص السجلات | Log Analysis
```bash
# Check for errors in the last 100 lines
tail -n 100 server/logs/error.log

# Check for security issues
tail -n 50 server/logs/security.log

# Monitor real-time logs
tail -f server/logs/all.log | grep -E "(ERROR|WARN|SECURITY)"
```

## الحلول المتقدمة | Advanced Solutions

### إعادة تهيئة قاعدة البيانات | Database Reset
```bash
# Backup existing data
pg_dump -h localhost -U postal_bank_user tunisian_postal_bank > backup_$(date +%Y%m%d).sql

# Drop and recreate database
sudo -u postgres psql
DROP DATABASE tunisian_postal_bank;
CREATE DATABASE tunisian_postal_bank;
GRANT ALL PRIVILEGES ON DATABASE tunisian_postal_bank TO postal_bank_user;
\q

# Restore from backup
psql -h localhost -U postal_bank_user tunisian_postal_bank < backup_$(date +%Y%m%d).sql
```

### إعادة بناء التطبيق | Application Rebuild
```bash
# Complete rebuild
cd tunisian-postal-bank

# Clean everything
rm -rf node_modules
rm -rf client/node_modules client/build
rm -rf server/node_modules

# Reinstall dependencies
npm install
cd client && npm install
cd ../server && npm install

# Build production version
cd ../client && npm run build
```

### Docker التشخيص | Docker Diagnostics
```bash
# If using Docker
docker ps -a
docker logs <container_id>
docker exec -it <container_id> /bin/bash
```

## أرقام الدعم | Support Contacts

### الدعم الفني الفوري | Immediate Technical Support
- **Hot Line**: +216 71 000 000
- **Email**: urgent-support@poste.tn
- **WhatsApp**: +216 XX XXX XXX

### دعم المطورين | Developer Support
- **Email**: dev-support@poste.tn
- **Slack**: #postal-bank-dev
- **GitHub Issues**: Report bugs and feature requests

## أدوات المراقبة | Monitoring Tools

### مراقبة الخادم | Server Monitoring
```bash
# Install monitoring tools
npm install -g pm2
pm2 start server/src/index.js --name "postal-bank-api"
pm2 monit

# Setup log rotation
pm2 install pm2-logrotate
```

### مراقبة قاعدة البيانات | Database Monitoring
```sql
-- Monitor PostgreSQL connections
SELECT * FROM pg_stat_activity;

-- Check database size
SELECT pg_size_pretty(pg_database_size('tunisian_postal_bank'));

-- Monitor slow queries
SELECT query, mean_time, calls 
FROM pg_stat_statements 
ORDER BY mean_time DESC 
LIMIT 10;
```

## الوقاية | Prevention

### نسخ احتياطية منتظمة | Regular Backups
```bash
#!/bin/bash
# backup.sh - Run daily via cron

DATE=$(date +%Y%m%d_%H%M%S)

# Database backup
pg_dump -h localhost -U postal_bank_user tunisian_postal_bank > "/backup/db_$DATE.sql"

# Application backup
tar -czf "/backup/app_$DATE.tar.gz" /path/to/tunisian-postal-bank

# Cleanup old backups (keep last 7 days)
find /backup -name "*.sql" -mtime +7 -delete
find /backup -name "*.tar.gz" -mtime +7 -delete
```

### مراقبة النظام | System Monitoring
```bash
# Add to crontab
# */5 * * * * /path/to/health_check.sh >> /var/log/postal-bank-health.log 2>&1
```

---

## للمساعدة الفورية | For Immediate Help

إذا كنت تواجه مشكلة عاجلة، يرجى:

1. **تشغيل فحص الحالة**: `bash health_check.sh`
2. **مراجعة السجلات**: `tail -f server/logs/all.log`
3. **إعادة تشغيل الخدمات**: `sudo systemctl restart postgresql redis mongod`
4. **الاتصال بالدعم**: +216 71 000 000

If you're facing an urgent issue, please:

1. **Run health check**: `bash health_check.sh`
2. **Review logs**: `tail -f server/logs/all.log`
3. **Restart services**: `sudo systemctl restart postgresql redis mongod`
4. **Contact support**: +216 71 000 000