import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

async function main() {
  console.log('Start seeding...');

  // Create sample project types
  const projectTypeData = [
    {
      name: 'Web App',
    },
    {
      name: 'Mobile',
    },
    {
      name: 'IoT',
    },
    {
      name: 'Server',
    },
  ];

  const projectTypes = [];
  for (const type of projectTypeData) {
    // Check if project type already exists
    const existingType = await prisma.project_types.findFirst({
      where: {
        name: type.name,
      },
    });

    if (existingType) {
      projectTypes.push(existingType);
      console.log(`Project type already exists: ${existingType.name}`);
    } else {
      const createdType = await prisma.project_types.create({
        data: {
          name: type.name,
        },
      });
      projectTypes.push(createdType);
      console.log(`Created project type: ${createdType.name}`);
    }
  }

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
    // Check if admin already exists
    const existingAdmin = await prisma.admins.findUnique({
      where: {
        email: admin.email,
      },
    });

    if (existingAdmin) {
      admins.push(existingAdmin);
      console.log(`Admin already exists: ${existingAdmin.email}`);
    } else {
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
    // Check if package already exists
    const existingPackage = await prisma.packages.findFirst({
      where: {
        name: pkg.name,
      },
    });

    if (existingPackage) {
      packages.push(existingPackage);
      console.log(`Package already exists: ${existingPackage.name}`);
    } else {
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
    // Check if reseller already exists
    const existingReseller = await prisma.reseller.findFirst({
      where: {
        company_name: reseller.company_name,
      },
    });

    if (existingReseller) {
      resellers.push(existingReseller);
      console.log(`Reseller already exists: ${existingReseller.company_name}`);
    } else {
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
  }

  // Create sample end customers
  const endCustomerData = [
    {
      company: 'Alpha Corp',
      address: '789 Broadway, New York, NY',
      contact_person: 'Alice Johnson',
      tel: 1234567890,
      email: 'alice@alphacorp.com',
      status: true,
    },
    {
      company: 'Beta LLC',
      address: '321 Elm St, San Francisco, CA',
      contact_person: 'Bob Smith',
      tel: 9876543210,
      email: 'bob@betallc.com',
      status: true,
    },
  ];

  const endCustomers = [];
  for (const customer of endCustomerData) {
    // Check if end customer already exists
    const existingCustomer = await prisma.end_customer.findFirst({
      where: {
        company: customer.company,
      },
    });

    if (existingCustomer) {
      endCustomers.push(existingCustomer);
      console.log(`End customer already exists: ${existingCustomer.company}`);
    } else {
      const createdCustomer = await prisma.end_customer.create({
        data: {
          company: customer.company,
          address: customer.address,
          contact_person: customer.contact_person,
          tel: customer.tel,
          email: customer.email,
          status: customer.status,
          created_at: new Date(),
          updated_at: new Date(),
        },
      });
      endCustomers.push(createdCustomer);
      console.log(`Created end customer: ${createdCustomer.company}`);
    }
  }

  // Create sample collectors
  const collectorData = [
    {
      name: 'Collector 1',
      ip: '192.168.1.10',
      secret_key: 'collector-secret-1',
      last_fetched_id: 0,
      is_active: true,
    },
    {
      name: 'Collector 2',
      ip: '192.168.2.10',
      secret_key: 'collector-secret-2',
      last_fetched_id: 0,
      is_active: true,
    },
    {
      name: 'Collector 3',
      ip: '192.168.3.10',
      secret_key: 'collector-secret-3',
      last_fetched_id: 0,
      is_active: true,
    },
  ];

  const collectors = [];
  for (const collector of collectorData) {
    // Check if collector already exists
    const existingCollector = await prisma.collectors.findFirst({
      where: {
        ip: collector.ip,
      },
    });

    if (existingCollector) {
      collectors.push(existingCollector);
      console.log(`Collector already exists: ${existingCollector.name}`);
    } else {
      const createdCollector = await prisma.collectors.create({
        data: {
          name: collector.name,
          ip: collector.ip,
          secret_key: collector.secret_key,
          last_fetched_id: collector.last_fetched_id,
          is_active: collector.is_active,
          created_at: new Date(),
          updated_at: new Date(),
        },
      });
      collectors.push(createdCollector);
      console.log(`Created collector: ${createdCollector.name}`);
    }
  }

  // Create sample projects
  const projectData = [
    {
      activation_key: 'ACT-KEY-001',
      secret_key: 'SECRET-KEY-001',
      // collector_ip will be set to collector ID instead of IP string
      logger_ip: '192.168.1.11',
      pkg_id: packages[0].id,
      admin_id: admins[0].id,
      reseller_id: resellers[0].customer_id,
      end_customer_id: endCustomers[0].id,
      status: true,
      type: projectTypes[0].id, // Use actual project type ID
      collector_id: collectors[0].id, // Reference to collector by ID
    },
    {
      activation_key: 'ACT-KEY-002',
      secret_key: 'SECRET-KEY-002',
      // collector_ip will be set to collector ID instead of IP string
      logger_ip: '192.168.2.11',
      pkg_id: packages[1].id,
      admin_id: admins[1].id,
      reseller_id: resellers[1].customer_id,
      end_customer_id: endCustomers[1].id,
      status: true,
      type: projectTypes[1].id, // Use actual project type ID
      collector_id: collectors[1].id, // Reference to collector by ID
    },
    {
      activation_key: 'ACT-KEY-003',
      secret_key: 'SECRET-KEY-003',
      // collector_ip will be set to collector ID instead of IP string
      logger_ip: '192.168.3.11',
      pkg_id: packages[2].id,
      admin_id: admins[2].id,
      status: true,
      type: projectTypes[2].id, // Use actual project type ID
      collector_id: collectors[2].id, // Reference to collector by ID
    },
  ];

  const projects = [];
  for (const project of projectData) {
    // Check if project already exists
    const existingProject = await prisma.projects.findUnique({
      where: {
        activation_key: project.activation_key,
      },
    });

    if (existingProject) {
      projects.push(existingProject);
      console.log(`Project already exists: ${existingProject.activation_key}`);
    } else {
      const createdProject = await prisma.projects.create({
        data: {
          activation_key: project.activation_key,
          secret_key: project.secret_key,
          collector_ip: project.collector_id, // Use collector ID instead of IP string
          logger_ip: project.logger_ip,
          pkg_id: project.pkg_id,
          admin_id: project.admin_id,
          reseller_id: project.reseller_id,
          end_customer_id: project.end_customer_id,
          type: project.type, // Use the project type directly instead of random
          status: project.status,
          created_at: new Date(),
          updated_at: new Date(),
        },
      });
      projects.push(createdProject);
      console.log(`Created project: ${createdProject.activation_key}`);
    }
  }

  // Create sample ports (one per project due to unique constraint)
  const portData = [
    {
      port: 8080,
    },
    {
      port: 5432,
    },
    {
      port: 27017,
    },
  ];

  const ports = [];
  for (let i = 0; i < portData.length; i++) {
    const port = portData[i];
    // Check if port already exists
    const existingPort = await prisma.ports.findFirst({
      where: {
        port: port.port,
      },
    });

    if (existingPort) {
      ports.push(existingPort);
      console.log(`Port already exists: ${existingPort.port}`);
    } else {
      const createdPort = await prisma.ports.create({
        data: {
          port: port.port,
          created_at: new Date(),
          updated_at: new Date(),
        },
      });
      ports.push(createdPort);
      console.log(`Created port: ${createdPort.port}`);
    }
  }

  // Update projects with port_id
  for (let i = 0; i < projects.length && i < ports.length; i++) {
    // Check if project already has a port assigned
    const project = await prisma.projects.findUnique({
      where: {
        id: projects[i].id,
      },
      select: {
        port_id: true,
      },
    });

    if (!project.port_id) {
      await prisma.projects.update({
        where: {
          id: projects[i].id,
        },
        data: {
          port_id: ports[i].id,
        },
      });
      console.log(`Updated project ${projects[i].id} with port ${ports[i].id}`);
    } else {
      console.log(`Project ${projects[i].id} already has a port assigned`);
    }
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
    // Check if session already exists
    const existingSession = await prisma.session.findUnique({
      where: {
        id: session.id,
      },
    });

    if (existingSession) {
      console.log(`Session already exists: ${existingSession.id}`);
    } else {
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