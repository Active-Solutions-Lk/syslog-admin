import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');

  // 1. Project Types
  const projectTypes = [];
  const typeNames = ['Cloud', 'On-Premise', 'Hybrid'];
  for (const name of typeNames) {
    const type = await prisma.project_types.upsert({
      where: { id: typeNames.indexOf(name) + 1 },
      update: {},
      create: { type: name, description: `${name} connectivity type` }
    });
    projectTypes.push(type);
  }

  // 2. Admins - Find existing or create new
  const hashedPassword = await bcrypt.hash('admin123', 10);

  // Try to find existing admin
  let admin = await prisma.admins.findFirst({
    where: {
      username: 'admin'
    }
  });

  if (admin) {
    // Update existing admin
    admin = await prisma.admins.update({
      where: { id: admin.id },
      data: {
        password: hashedPassword,
        email: 'admin@synalyzer.com',
        role: 'superadmin'
      }
    });
    console.log('Updated existing admin user:', { id: admin.id, username: admin.username, email: admin.email });
  } else {
    // Create new admin
    admin = await prisma.admins.create({
      data: {
        username: 'admin',
        email: 'admin@synalyzer.com',
        password: hashedPassword,
        role: 'superadmin'
      }
    });
    console.log('Created new admin user:', { id: admin.id, username: admin.username, email: admin.email });
  }

  // 3. Collectors
  const collector = await prisma.collectors.upsert({
    where: { id: 1 },
    update: {},
    create: {
      name: 'Default Collector',
      ip: '127.0.0.1',
      secret_key: 'default-secret-key',
      is_active: true
    }
  });

  // 4. Analyzers
  const analyzer = await prisma.analyzers.upsert({
    where: { id: 1 },
    update: {},
    create: {
      name: 'Primary Analyzer',
      ip: '127.0.0.1',
      domain: 'analyzer.local',
      status: true
    }
  });

  // 5. Ports
  const port = await prisma.ports.upsert({
    where: { id: 1 },
    update: {},
    create: {
      port: 514,
      description: 'Default Syslog Port'
    }
  });

  // 6. Resellers
  const reseller = await prisma.reseller.upsert({
    where: { id: 1 },
    update: {},
    create: {
      company: 'Global Reseller Ltd',
      email: 'sales@globalreseller.com',
      contact_person: 'John Doe',
      tel: '1234567890',
      status: true
    }
  });

  // 7. Projects
  try {
    await prisma.projects.upsert({
      where: { id: 1 },
      update: {},
      create: {
        activation_key: 'DEMO-PROJ-001',
        project_type_id: projectTypes[0].id,
        admin_id: admin.id,
        collector_id: collector.id,
        analyzer_id: analyzer.id,
        port_id: port.id,
        reseller_id: reseller.id,
        device_count: 5
      }
    });
  } catch (e) {
    console.log('Project seeding skipped or failed (likely unique constraint on activation_key). Continuing...');
  }

  // 8. Health Data (24 hours history)
  console.log('Seeding health data...');

  // Clear existing health data to avoid duplicates/messy graphs on re-seed
  await prisma.collector_health.deleteMany();
  await prisma.analyzer_health.deleteMany();

  const now = new Date();

  for (let i = 23; i >= 0; i--) {
    const time = new Date(now);
    time.setHours(now.getHours() - i);

    // Random load values with some trend
    // Base load + random flux + time of day factor (higher during day)
    const hourFactor = (time.getHours() >= 9 && time.getHours() <= 17) ? 20 : 0;

    // Collector Heavy Load Simulation
    await prisma.collector_health.create({
      data: {
        collector_id: collector.id,
        cpu_load: Math.min(100, Math.max(10, 30 + hourFactor + (Math.random() * 20))),
        ram_load: Math.min(100, Math.max(20, 40 + (Math.random() * 10))),
        disk_capacity: 45 + (i * 0.1), // Slowly filling disk
        created_at: time,
        updated_at: time
      }
    });

    // Analyzer Stable Load Simulation
    await prisma.analyzer_health.create({
      data: {
        analyzer_id: analyzer.id,
        cpu_load: Math.min(100, Math.max(5, 15 + (Math.random() * 15))),
        ram_load: Math.min(100, Math.max(30, 50 + (Math.random() * 5))),
        disk_capacity: 60, // Stable disk
        created_at: time,
        updated_at: time
      }
    });
  }

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });