import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');

  // Create sample admins
  const adminData = [
    {
      name: 'John Admin',
      email: 'admin@example.com',
      password: 'admin123',
      role: 'Admin',
      status: 1,
    },
    {
      name: 'Jane Manager',
      email: 'manager@example.com',
      password: 'manager123',
      role: 'Manager',
      status: 1,
    },
    {
      name: 'Bob User',
      email: 'user@example.com',
      password: 'user123',
      role: 'User',
      status: 1,
    },
  ];

  const admins = [];
  for (const admin of adminData) {
    const hashedPassword = await bcrypt.hash(admin.password, 10);
    const createdAdmin = await prisma.admins.create({
      data: {
        name: admin.name,
        email: admin.email,
        passwordHash: hashedPassword,
        role: admin.role,
        status: admin.status,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
    admins.push(createdAdmin);
    console.log(`Created admin: ${createdAdmin.email}`);
  }

  // Create sample packages
  const packageData = [
    {
      name: 'Basic Package',
      log_count: 1000,
      duration: 30,
      device_count: 5,
      log_analyce: 1,
    },
    {
      name: 'Standard Package',
      log_count: 5000,
      duration: 90,
      device_count: 20,
      log_analyce: 1,
    },
    {
      name: 'Premium Package',
      log_count: 10000,
      duration: 365,
      device_count: 100,
      log_analyce: 1,
    },
  ];

  const packages = [];
  for (const pkg of packageData) {
    const createdPackage = await prisma.packages.create({
      data: {
        name: pkg.name,
        log_count: pkg.log_count,
        duration: pkg.duration,
        device_count: pkg.device_count,
        log_analyce: pkg.log_analyce,
        created_at: new Date(),
        updated_at: new Date(),
      },
    });
    packages.push(createdPackage);
    console.log(`Created package: ${createdPackage.name}`);
  }

  // Create sample resellers
  const resellerData = [
    {
      company_name: 'Tech Solutions Inc',
      address: '123 Main St, New York, NY',
      type: 'Premium',
      credit_limit: '10000',
      payment_terms: 'Net 30',
      note: 'Long-term partner',
      vat: 'VAT123456',
      city: 10001,
    },
    {
      company_name: 'Network Providers Ltd',
      address: '456 Oak Ave, Los Angeles, CA',
      type: 'Standard',
      credit_limit: '5000',
      payment_terms: 'Net 15',
      note: 'Growing business',
      vat: 'VAT789012',
      city: 90001,
    },
  ];

  const resellers = [];
  for (const reseller of resellerData) {
    const createdReseller = await prisma.reseller.create({
      data: {
        company_name: reseller.company_name,
        address: reseller.address,
        type: reseller.type,
        credit_limit: reseller.credit_limit,
        payment_terms: reseller.payment_terms,
        note: reseller.note,
        vat: reseller.vat,
        city: reseller.city,
        created_at: new Date(),
        updated_at: new Date(),
      },
    });
    resellers.push(createdReseller);
    console.log(`Created reseller: ${createdReseller.company_name}`);
  }

  // Create sample projects
  const projectData = [
    {
      activation_key: 'ACT-KEY-001',
      collector_ip: '192.168.1.10',
      logger_ip: '192.168.1.11',
      pkg_id: packages[0].id,
      admin_id: admins[0].id,
      reseller_id: resellers[0].customer_id,
    },
    {
      activation_key: 'ACT-KEY-002',
      collector_ip: '192.168.2.10',
      logger_ip: '192.168.2.11',
      pkg_id: packages[1].id,
      admin_id: admins[1].id,
      reseller_id: resellers[1].customer_id,
    },
    {
      activation_key: 'ACT-KEY-003',
      collector_ip: '192.168.3.10',
      logger_ip: '192.168.3.11',
      pkg_id: packages[2].id,
      admin_id: admins[2].id,
    },
  ];

  const projects = [];
  for (const project of projectData) {
    const createdProject = await prisma.projects.create({
      data: {
        activation_key: project.activation_key,
        collector_ip: project.collector_ip,
        logger_ip: project.logger_ip,
        pkg_id: project.pkg_id,
        admin_id: project.admin_id,
        reseller_id: project.reseller_id,
        created_at: new Date(),
        updated_at: new Date(),
      },
    });
    projects.push(createdProject);
    console.log(`Created project: ${createdProject.activation_key}`);
  }

  // Create sample ports (one per project due to unique constraint)
  const portData = [
    {
      port: 8080,
      project_id: projects[0].id,
    },
    {
      port: 5432,
      project_id: projects[1].id,
    },
    {
      port: 27017,
      project_id: projects[2].id,
    },
  ];

  for (const port of portData) {
    const createdPort = await prisma.ports.create({
      data: {
        port: port.port,
        project_id: port.project_id,
        created_at: new Date(),
        updated_at: new Date(),
      },
    });
    console.log(`Created port: ${createdPort.port} for project ${port.project_id}`);
  }

  // Create sample sessions (optional)
  const sessionData = [
    {
      id: 'session-1',
      userId: admins[0].id.toString(),
      sessionToken: 'token-123',
    },
    {
      id: 'session-2',
      userId: admins[1].id.toString(),
      sessionToken: 'token-456',
    },
  ];

  for (const session of sessionData) {
    const createdSession = await prisma.session.create({
      data: {
        id: session.id,
        userId: session.userId,
        sessionToken: session.sessionToken,
        createdAt: new Date(),
        updatedAt: new Date(),
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
      },
    });
    console.log(`Created session: ${createdSession.id}`);
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