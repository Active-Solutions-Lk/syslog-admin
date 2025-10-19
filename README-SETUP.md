# Syslog Admin - Automated Setup Guide for Ubuntu Linux

This guide explains how to use the automated setup script to install and configure the Syslog Admin application on Ubuntu Linux.

## Prerequisites

Before running the setup script, ensure you have:

1. Ubuntu Linux (tested on Ubuntu 20.04 LTS or later)
2. Sudo privileges
3. Internet connection

## What the Setup Script Does

The `setup.sh` script automates the following tasks:

1. Updates system packages
2. Installs Node.js and npm (if not already installed)
3. Installs MySQL (if not already installed)
4. Installs project dependencies via npm
5. Creates a MySQL database and user for the application
6. Generates a `.env` file with database credentials
7. Runs Prisma migrations to set up the database schema
8. Creates a production build of the application
9. Installs and configures PM2 for process management
10. Configures UFW firewall to allow API requests

## Running the Setup Script

1. Make the script executable:
   ```bash
   chmod +x setup.sh
   ```

2. Run the setup script:
   ```bash
   ./setup.sh
   ```

If you encounter Prisma issues after running the setup, you can also use the fix script:

1. Make the fix script executable: `chmod +x fix-prisma.sh`
2. Run the fix script: `./fix-prisma.sh`

Additional utility scripts are available:

- `test-prisma-connection.js` - Test Prisma connection
- `test-database-connection.js` - Test raw database connection

## Manual Configuration Steps

### MySQL Root Password

The script generates random passwords for security. However, you'll need to update the MySQL root password in the script to match your actual MySQL root password:

1. Open `setup.sh` in a text editor
2. Find the line with `DB_ROOT_PASSWORD=$(openssl rand -base64 12)`
3. Replace with your actual MySQL root password:
   ```bash
   DB_ROOT_PASSWORD="your_actual_mysql_root_password"
   ```

Alternatively, you can run MySQL commands manually:
```sql
CREATE DATABASE IF NOT EXISTS syslog_admin;
CREATE USER 'syslog_admin_user'@'localhost' IDENTIFIED BY 'your_secure_password';
GRANT ALL PRIVILEGES ON syslog_admin.* TO 'syslog_admin_user'@'localhost';
FLUSH PRIVILEGES;
```

Then update the `.env` file with the correct credentials.

## Starting the Application

After setup is complete, start the application using PM2:

```bash
pm2 start ecosystem.config.js
```

You can monitor the application with:
```bash
pm2 logs syslog-admin
```

## Stopping the Application

To stop the application:
```bash
pm2 stop syslog-admin
```

## Troubleshooting

### Common Issues

1. **MySQL Service Not Starting**: Ensure MySQL is properly installed and the service is configured to start automatically.

2. **Firewall Issues**: If you cannot access the application, check UFW settings to ensure port 3000 is open.

3. **Database Connection Issues**: Verify the credentials in the `.env` file match your MySQL configuration.

4. **Prisma Migration Failures**: Ensure the database is accessible and the user has proper permissions.

5. **Prisma Client Generation Failures**: This is a known issue on some Linux systems where the WASM-based query engine doesn't work properly. The setup script now includes fallback mechanisms:
   - First tries normal generation
   - If that fails, removes node_modules and reinstalls
   - If that still fails, tries using the binary engine instead of WASM
   
   If you still encounter issues, you can manually set the engine type:
   ```bash
   export PRISMA_CLIENT_ENGINE_TYPE="binary"
   npx prisma generate
   ```

### Manual Installation

If the automated script fails, you can follow the manual installation steps:

1. Install Node.js and npm manually
2. Install MySQL manually
3. Run `npm install` in the project directory
4. Create a MySQL database and user
5. Create a `.env` file with your database credentials
6. Run `npx prisma migrate dev` or `npx prisma db push`
7. Run `npx prisma generate` (if this fails due to WASM issues, try:
   ```bash
   export PRISMA_CLIENT_ENGINE_TYPE="binary"
   npm install @prisma/client --save
   npx prisma generate
   ```)
8. Run `npm run build` to create a production build
9. Install PM2 globally: `npm install -g pm2`
10. Configure firewall rules for required ports

## Security Notes

- The script generates random passwords for the database user for security
- In production, always use strong, unique passwords
- Never commit the `.env` file to version control
- Regularly update dependencies to patch security vulnerabilities

## Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [PM2 Documentation](https://pm2.keymetrics.io/docs/usage/quick-start/)
- [MySQL Documentation](https://dev.mysql.com/doc/)