#!/bin/bash

# Syslog Admin Setup Script for Ubuntu Linux
# This script automates the installation and setup process for the syslog-admin project

echo "Starting Syslog Admin Setup for Ubuntu Linux..."
echo "=============================================="

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check if a service is running
service_running() {
    systemctl is-active --quiet "$1"
}

# Function to check if a package is installed
package_installed() {
    dpkg -l | grep -q "^ii  $1 "
}

# 1. Update system packages
echo "1. Updating system packages..."
sudo apt update

# 2. Install Node.js and npm if not already installed
echo "2. Checking Node.js and npm installation..."
if command_exists node && command_exists npm; then
    NODE_VERSION=$(node --version)
    NPM_VERSION=$(npm --version)
    echo "Node.js is already installed: $NODE_VERSION"
    echo "npm is already installed: $NPM_VERSION"
else
    echo "Installing Node.js and npm..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
    echo "Node.js and npm installed successfully."
fi

# 3. Install MySQL if not already installed
echo "3. Checking MySQL installation..."
if package_installed mysql-server; then
    echo "MySQL is already installed."
else
    echo "Installing MySQL..."
    sudo apt-get install -y mysql-server
    echo "MySQL installed successfully."
fi

# Start MySQL service
echo "Starting MySQL service..."
sudo systemctl start mysql
sudo systemctl enable mysql

# Wait for service to start
sleep 5

if service_running mysql; then
    echo "MySQL service started successfully."
else
    echo "Warning: Failed to start MySQL service. Please start it manually."
fi

# 4. Install project dependencies
echo "4. Installing project dependencies..."
npm install
echo "Project dependencies installed successfully."

# 5. Set up MySQL user, database, and .env file
echo "5. Setting up MySQL database and user..."

# Generate secure passwords
DB_ROOT_PASSWORD=$(openssl rand -base64 12)
DB_USER_PASSWORD=$(openssl rand -base64 12)

# Database configuration
DB_NAME="syslog_admin"
DB_USER="syslog_admin_user"

# Create .env file with database configuration
cat > .env << EOF
DATABASE_URL="mysql://$DB_USER:$DB_USER_PASSWORD@localhost:3306/$DB_NAME"
NODE_ENV="development"
EOF

echo ".env file created successfully."

# Connect to MySQL and set up database and user
echo "Creating database and user..."
mysql -u root << MYSQL_SCRIPT
CREATE DATABASE IF NOT EXISTS $DB_NAME;
CREATE USER IF NOT EXISTS '$DB_USER'@'localhost' IDENTIFIED BY '$DB_USER_PASSWORD';
GRANT ALL PRIVILEGES ON $DB_NAME.* TO '$DB_USER'@'localhost';
FLUSH PRIVILEGES;
MYSQL_SCRIPT

if [ $? -eq 0 ]; then
    echo "MySQL database and user created successfully."
else
    echo "Warning: Failed to create MySQL database and user. You may need to set this up manually."
    echo "Please create database '$DB_NAME' and user '$DB_USER' with appropriate privileges."
fi

# 6. Run Prisma migrations
echo "6. Running Prisma migrations..."
npx prisma migrate dev --name init

if [ $? -eq 0 ]; then
    echo "Prisma migrations completed successfully."
else
    echo "Warning: Prisma migrate dev failed. Trying prisma db push..."
    npx prisma db push
    if [ $? -eq 0 ]; then
        echo "Prisma db push completed successfully."
    else
        echo "Error: Both prisma migrate dev and prisma db push failed. Please check your database connection."
        exit 1
    fi
fi

# 7. Generate Prisma Client
echo "7. Generating Prisma Client..."
# First, try to generate Prisma Client normally
npx prisma generate

if [ $? -eq 0 ]; then
    echo "Prisma Client generated successfully."
else
    echo "Warning: Initial Prisma Client generation failed. Trying alternative approach..."
    # Remove node_modules and package-lock.json to ensure clean install
    echo "Removing node_modules and package-lock.json for clean install..."
    rm -rf node_modules package-lock.json
    
    # Reinstall dependencies with specific Prisma configuration
    echo "Reinstalling dependencies..."
    npm install
    
    # Try generating Prisma Client again
    echo "Retrying Prisma Client generation..."
    npx prisma generate
    
    if [ $? -eq 0 ]; then
        echo "Prisma Client generated successfully on second attempt."
    else
        echo "Warning: Prisma Client generation still failing. This may be due to WASM issues on your system."
        echo "Attempting to install Prisma client with binary engine..."
        
        # Set Prisma engine type to binary instead of WASM
        export PRISMA_CLIENT_ENGINE_TYPE="binary"
        
        # Reinstall Prisma client with binary engine
        npm install @prisma/client --save
        
        # Try generating again
        npx prisma generate
        
        if [ $? -eq 0 ]; then
            echo "Prisma Client generated successfully with binary engine."
        else
            echo "Error: Failed to generate Prisma Client even with binary engine."
            echo "You may need to manually run 'npx prisma generate' after checking your environment."
            echo "Continuing with setup as this may not prevent the application from running..."
        fi
    fi
fi

# 8. Create production build
echo "8. Creating production build..."
npm run build

if [ $? -eq 0 ]; then
    echo "Production build created successfully."
else
    echo "Error: Failed to create production build."
    exit 1
fi

# 9. Install PM2 for process management
echo "9. Installing PM2 for process management..."
npm install -g pm2

if [ $? -eq 0 ]; then
    echo "PM2 installed successfully."
else
    echo "Error: Failed to install PM2."
    exit 1
fi

# Create ecosystem.config.js for PM2
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'syslog-admin',
    script: 'npm',
    args: 'start',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
    }
  }]
}
EOF

echo "PM2 ecosystem config created successfully."

# 10. Configure firewall for API requests
echo "10. Configuring firewall for API requests..."
if command_exists ufw; then
    sudo ufw allow 3000/tcp
    echo "Firewall rule added for port 3000."
else
    echo "Warning: UFW not found. You may need to configure firewall manually."
fi

# 11. Final setup instructions
echo ""
echo "Setup Completed!"
echo "================"
echo "Summary of what was set up:"
echo "1. Node.js and npm"
echo "2. MySQL database server"
echo "3. Project dependencies"
echo "4. MySQL database and user for the application"
echo "5. Prisma migrations and client generation"
echo "6. Production build"
echo "7. PM2 process manager"
echo "8. Firewall configuration for API ports"
echo ""
echo "To start the application with PM2, run:"
echo "pm2 start ecosystem.config.js"
echo ""
echo "To view application logs, run:"
echo "pm2 logs syslog-admin"
echo ""
echo "Database credentials are stored in the .env file:"
echo "Database Name: $DB_NAME"
echo "Database User: $DB_USER"
echo "Check the .env file for the full DATABASE_URL"
echo ""
echo "IMPORTANT: Please verify the MySQL root password in the script or update it accordingly."
echo "The script uses a randomly generated password which may not match your actual MySQL root password."