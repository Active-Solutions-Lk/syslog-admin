# Database Seeding

This directory contains scripts to seed the database with sample data for development and testing purposes.

## Seeding Script

The `seed.js` script populates the database with sample data for all models defined in the Prisma schema:

- Admin users with hashed passwords
- Packages with different configurations
- Resellers with company information
- Projects with activation keys
- Network ports
- User sessions

## Usage

To run the seeding script, use the following command from the project root:

```bash
npm run seed
```

Or directly:

```bash
node prisma/seed.js
```

## Database Reset

To clear all data from the database, you can use the reset script:

```bash
npm run reset-db
```

Or directly:

```bash
node prisma/reset.js
```

This will delete all records from all tables in the correct order to avoid foreign key constraint issues.

## What the Script Does

1. Creates 3 sample admin users with different roles and permissions
2. Creates 3 different packages (Basic, Standard, Premium) with varying limits
3. Creates 2 sample resellers with company information
4. Creates 3 projects associated with admins, resellers, and packages
5. Creates sample network ports associated with projects
6. Creates sample user sessions

## Sample Data

The script creates realistic sample data that can be used for:
- Testing the application UI
- Verifying API endpoints
- Demonstrating features
- Development purposes

All passwords are hashed using bcrypt before being stored in the database.

## Customization

You can modify the `seed.js` file to:
- Change the sample data values
- Add more records
- Modify relationships between entities
- Add new models (if you extend the schema)

## Prerequisites

Before running the seed script, ensure that:

1. The database is properly configured and accessible
2. Prisma client is generated (`npx prisma generate`)
3. Database migrations are applied (`npx prisma migrate dev`)