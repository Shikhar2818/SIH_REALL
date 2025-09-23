# 🐳 Docker Database Management Guide

## 📊 MongoDB Container Management

### Starting the Database
```bash
# Start MongoDB container
docker-compose up -d mongo

# Check if running
docker ps | grep mongo
```

### Accessing the Database

#### Method 1: MongoDB Shell (Command Line)
```bash
# Access MongoDB shell
docker exec -it psychological-intervention-mongo mongosh

# With authentication
docker exec -it psychological-intervention-mongo mongosh -u admin -p password --authenticationDatabase admin

# Switch to application database
use psychological_intervention
```

#### Method 2: MongoDB Compass (GUI Tool)
1. Download [MongoDB Compass](https://www.mongodb.com/products/compass)
2. Connection string: `mongodb://admin:password@localhost:27017/psychological_intervention?authSource=admin`
3. Or manual connection:
   - **Hostname**: localhost
   - **Port**: 27017
   - **Authentication**: Username/Password
   - **Username**: admin
   - **Password**: password
   - **Authentication Database**: admin

#### Method 3: Docker Desktop GUI
1. Open Docker Desktop
2. Go to **Containers**
3. Find `psychological-intervention-mongo`
4. Click on container
5. Go to **Exec** tab
6. Run: `mongosh -u admin -p password --authenticationDatabase admin`

## 🔍 Database Operations

### View Collections
```javascript
// In MongoDB shell
show collections

// Expected collections:
// - users (user accounts)
// - bookings (counselling appointments)
// - screenings (mental health assessments)
// - forumposts (peer community posts)
// - resources (educational content)
// - notifications (system notifications)
// - counsellorschedules (counsellor availability)
// - sessionratings (session feedback)
```

### Sample Queries
```javascript
// View all users
db.users.find().pretty()

// View users by role
db.users.find({role: "student"}).pretty()
db.users.find({role: "counsellor"}).pretty()
db.users.find({role: "admin"}).pretty()

// View bookings
db.bookings.find().pretty()

// View bookings by status
db.bookings.find({status: "pending"}).pretty()
db.bookings.find({status: "confirmed"}).pretty()

// View forum posts
db.forumposts.find().pretty()

// View approved posts only
db.forumposts.find({isApproved: true}).pretty()

// Count documents
db.users.countDocuments()
db.bookings.countDocuments()
db.forumposts.countDocuments()
db.resources.countDocuments()
```

### Database Statistics
```javascript
// Get database stats
db.stats()

// Get collection stats
db.users.stats()
db.bookings.stats()

// View indexes
db.users.getIndexes()
db.bookings.getIndexes()
```

## 💾 Backup & Restore

### Create Backup
```bash
# Create backup directory
mkdir backup

# Create backup
docker exec psychological-intervention-mongo mongodump \
  --username admin \
  --password password \
  --authenticationDatabase admin \
  --db psychological_intervention \
  --out /backup

# Copy backup to host
docker cp psychological-intervention-mongo:/backup ./backup
```

### Restore from Backup
```bash
# Copy backup to container
docker cp ./backup psychological-intervention-mongo:/restore

# Restore database
docker exec psychological-intervention-mongo mongorestore \
  --username admin \
  --password password \
  --authenticationDatabase admin \
  --db psychological_intervention \
  /restore/psychological_intervention
```

### Export/Import Specific Collections
```bash
# Export users collection
docker exec psychological-intervention-mongo mongoexport \
  --username admin \
  --password password \
  --authenticationDatabase admin \
  --db psychological_intervention \
  --collection users \
  --out /backup/users.json

# Import users collection
docker exec psychological-intervention-mongo mongoimport \
  --username admin \
  --password password \
  --authenticationDatabase admin \
  --db psychological_intervention \
  --collection users \
  --file /backup/users.json
```

## 🔧 Database Maintenance

### Reset Database (⚠️ Deletes All Data)
```bash
# Stop and remove volumes
docker-compose down -v

# Start fresh
docker-compose up -d

# Re-seed sample data
cd backend
npm run seed
```

### Clear Specific Collections
```javascript
// In MongoDB shell - BE CAREFUL!
// Clear all bookings
db.bookings.deleteMany({})

// Clear all forum posts
db.forumposts.deleteMany({})

// Clear all resources
db.resources.deleteMany({})
```

### Update User Roles
```javascript
// Make user an admin
db.users.updateOne(
  {email: "user@example.com"}, 
  {$set: {role: "admin"}}
)

// Make user a counsellor
db.users.updateOne(
  {email: "user@example.com"}, 
  {$set: {role: "counsellor"}}
)

// Deactivate user
db.users.updateOne(
  {email: "user@example.com"}, 
  {$set: {isActive: false}}
)
```

## 📊 Monitoring & Logs

### View Container Logs
```bash
# View MongoDB logs
docker-compose logs mongo

# Follow logs in real-time
docker-compose logs -f mongo

# View last 100 lines
docker-compose logs --tail=100 mongo
```

### Container Status
```bash
# Check container status
docker ps | grep mongo

# Check container resource usage
docker stats psychological-intervention-mongo

# View container details
docker inspect psychological-intervention-mongo
```

### Database Performance
```javascript
// In MongoDB shell - check slow operations
db.currentOp()

// Check database profiler
db.getProfilingStatus()

// Enable profiling for slow operations (>100ms)
db.setProfilingLevel(1, { slowms: 100 })
```

## 🚨 Troubleshooting

### Common Issues

#### 1. Container Won't Start
```bash
# Check if port 27017 is in use
netstat -ano | findstr :27017

# Kill process using port (Windows)
taskkill /PID <process_id> /F

# Restart container
docker-compose restart mongo
```

#### 2. Connection Refused
```bash
# Check container is running
docker ps

# Check container logs
docker-compose logs mongo

# Test connection
docker exec psychological-intervention-mongo mongosh --eval "db.runCommand('ping')"
```

#### 3. Authentication Failed
```bash
# Check environment variables
docker exec psychological-intervention-mongo env | grep MONGO

# Reset with correct credentials
docker-compose down
docker-compose up -d mongo
```

#### 4. Database Corrupted
```bash
# Stop container
docker-compose stop mongo

# Remove container and volume
docker-compose rm -v mongo

# Start fresh
docker-compose up -d mongo
```

### Data Recovery
```bash
# If you have a backup
docker cp ./backup psychological-intervention-mongo:/restore
docker exec psychological-intervention-mongo mongorestore --username admin --password password --authenticationDatabase admin --db psychological_intervention /restore/psychological_intervention

# If no backup, re-seed data
cd backend
npm run seed
```

## 🔐 Security Notes

### Database Security
- Default credentials are for development only
- Change passwords in production
- Use environment variables for sensitive data
- Enable MongoDB authentication in production
- Use SSL/TLS for connections in production

### Access Control
```javascript
// Create read-only user
db.createUser({
  user: "readonly",
  pwd: "readonly_password",
  roles: [{ role: "read", db: "psychological_intervention" }]
})

// Create admin user
db.createUser({
  user: "admin_user",
  pwd: "admin_password", 
  roles: [{ role: "dbAdmin", db: "psychological_intervention" }]
})
```

---

## 📞 Need Help?

1. **Check container status**: `docker ps`
2. **View logs**: `docker-compose logs mongo`
3. **Test connection**: Access MongoDB shell
4. **Reset if needed**: `docker-compose down -v && docker-compose up -d`

**Your database is now fully managed! 🎉**

