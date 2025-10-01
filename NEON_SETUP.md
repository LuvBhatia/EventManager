# 🚀 Neon Database Deployment Guide

## 📋 Prerequisites
- Neon account at [neon.tech](https://neon.tech)
- Your Spring Boot project ready

## 🗄️ Step 1: Create Neon Project

1. **Sign up/Login** to [neon.tech](https://neon.tech)
2. **Create New Project**:
   - Project name: `eventinclubs` (or your preferred name)
   - Region: Choose closest to your users
   - Click "Create Project"

## 🔑 Step 2: Get Connection Details

After project creation, you'll see:
```
Host: ep-abc123-def456.region.aws.neon.tech
Database: neondb
User: your-username
Password: auto-generated-password
```

## ⚙️ Step 3: Update Application Properties

Replace the placeholder values in `EventInClubs/src/main/resources/application.properties`:

```properties
# Replace these with your actual Neon credentials
spring.datasource.url=jdbc:postgresql://ep-abc123-def456.region.aws.neon.tech/neondb?sslmode=require
spring.datasource.username=your-actual-username
spring.datasource.password=your-actual-password
```

## 🧪 Step 4: Test Connection

1. **Start your Spring Boot application**:
   ```bash
   cd EventInClubs
   ./mvnw spring-boot:run
   ```

2. **Check logs** for successful database connection
3. **Verify tables are created** (Hibernate will auto-create them)

## 🔒 Step 5: Security Best Practices

### Environment Variables (Recommended)
Create a `.env` file in your project root:
```bash
NEON_DB_URL=jdbc:postgresql://ep-abc123-def456.region.aws.neon.tech/neondb?sslmode=require
NEON_DB_USERNAME=your-username
NEON_DB_PASSWORD=your-password
```

Then update `application.properties`:
```properties
spring.datasource.url=${NEON_DB_URL}
spring.datasource.username=${NEON_DB_USERNAME}
spring.datasource.password=${NEON_DB_PASSWORD}
```

### Alternative: Profile-based Configuration
Create `application-prod.properties`:
```properties
spring.datasource.url=jdbc:postgresql://ep-abc123-def456.region.aws.neon.tech/neondb?sslmode=require
spring.datasource.username=your-username
spring.datasource.password=your-password
```

## 🌐 Step 6: Neon Dashboard Features

### Monitor Your Database
- **Connection Pool**: View active connections
- **Query Performance**: Monitor slow queries
- **Storage Usage**: Track database size
- **Logs**: View connection logs

### Scaling Options
- **Auto-scaling**: Neon automatically scales based on usage
- **Branching**: Create database branches for testing
- **Point-in-time recovery**: Restore to any previous state

## 🚨 Troubleshooting

### Common Issues:

1. **SSL Connection Error**:
   - Ensure `?sslmode=require` is in your connection URL
   - Check if your network allows SSL connections

2. **Connection Timeout**:
   - Verify your Neon project is active
   - Check if you're within Neon's free tier limits

3. **Authentication Failed**:
   - Double-check username/password
   - Ensure credentials are copied correctly

4. **Network Issues**:
   - Check if your region choice is optimal
   - Verify firewall settings

### Connection Test
Test your connection string:
```bash
# Using psql (if you have PostgreSQL client)
psql "postgresql://username:password@ep-abc123-def456.region.aws.neon.tech/neondb?sslmode=require"
```

## 💰 Neon Pricing (Free Tier)

- **Storage**: 3GB included
- **Compute**: 0.5 vCPU included
- **Connections**: Unlimited
- **Branches**: 1 included
- **Backups**: 7-day retention

## 🔄 Migration from Local Database

If you have existing data:

1. **Export local data**:
   ```bash
   pg_dump -U luvbhatia -d ClubEvents > backup.sql
   ```

2. **Import to Neon**:
   ```bash
   psql "postgresql://username:password@ep-abc123-def456.region.aws.neon.tech/neondb?sslmode=require" < backup.sql
   ```

## ✅ Success Checklist

- [ ] Neon project created
- [ ] Connection details obtained
- [ ] `application.properties` updated
- [ ] Environment variables set (if using)
- [ ] Application starts successfully
- [ ] Database tables created
- [ ] Connection tested
- [ ] Local database backed up (if needed)

## 🆘 Need Help?

- **Neon Documentation**: [docs.neon.tech](https://docs.neon.tech)
- **Neon Discord**: [discord.gg/neondatabase](https://discord.gg/neondatabase)
- **Neon Support**: Available in dashboard

---

**Next Steps**: After setting up Neon, test your application and verify all database operations work correctly!
