# Prisma Troubleshooting Guide for Ubuntu Linux

This guide addresses common Prisma issues encountered when running the syslog-admin application on Ubuntu Linux systems.

## Common Prisma Error

```
Cannot find module '/path/to/node_modules/@prisma/client/runtime/query_engine_bg.mysql.wasm-base64.js'
```

This error occurs when Prisma tries to use the WASM-based query engine but fails to locate or execute it properly on certain Linux distributions.

## Solutions

### Solution 1: Use Binary Engine (Recommended)

Set the Prisma client engine type to binary instead of WASM:

```bash
export PRISMA_CLIENT_ENGINE_TYPE="binary"
npm install @prisma/client --save
npx prisma generate
```

### Solution 2: Clean Installation

If the binary engine approach doesn't work, try a clean installation:

```bash
# Remove node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Clear npm cache
npm cache clean --force

# Reinstall dependencies
npm install

# Generate Prisma Client
npx prisma generate
```

### Solution 3: Install Missing Dependencies

Some systems may be missing required dependencies for Prisma:

```bash
# Install build essentials
sudo apt-get update
sudo apt-get install -y build-essential

# Install additional dependencies
sudo apt-get install -y libssl-dev libffi-dev python3-dev

# Reinstall node modules
rm -rf node_modules
npm install
```

### Solution 4: Manual Prisma Client Generation

If automated generation continues to fail:

1. Check your Prisma schema file:
   ```bash
   npx prisma validate
   ```

2. Manually generate with verbose output:
   ```bash
   npx prisma generate --verbose
   ```

3. Check the generated client:
   ```bash
   ls node_modules/.prisma/client/
   ```

## Environment Variables

Ensure these environment variables are set correctly in your `.env` file:

```env
DATABASE_URL="mysql://username:password@localhost:3306/database_name"
NODE_ENV="development"
```

For binary engine specifically:
```bash
export PRISMA_CLIENT_ENGINE_TYPE="binary"
```

## Verifying the Fix

After applying any of the above solutions, verify that Prisma is working:

```bash
# Test database connection
npx prisma studio

# Or run a simple query test
node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.\$connect()
  .then(() => console.log('Prisma connected successfully'))
  .catch(e => console.error('Prisma connection failed:', e))
  .finally(() => prisma.\$disconnect());
"
```

## Additional Notes

1. The updated setup.sh script includes these fixes and will automatically attempt multiple approaches if the initial Prisma Client generation fails.

2. If you're still experiencing issues, consider upgrading to a newer version of Node.js (18.x or later) as older versions may have compatibility issues with Prisma's WASM engine.

3. Some Ubuntu installations may require additional configuration for Prisma to work properly. Check the [Prisma documentation](https://www.prisma.io/docs/reference/api-reference/prisma-client-reference) for distribution-specific instructions.

## Getting Help

If none of these solutions work:

1. Check the [Prisma GitHub issues](https://github.com/prisma/prisma/issues) for similar problems
2. Review the [Prisma documentation](https://www.prisma.io/docs/)
3. Consider reaching out to the Prisma community on their [Slack workspace](https://slack.prisma.io/)