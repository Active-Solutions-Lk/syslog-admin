import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

function normalizeIpAddress(ip) {
  if (ip && ip.startsWith('::ffff:')) return ip.substring(7);
  return ip;
}

function parseSecureToken(secureToken, clientIp) {
  try {
    const decodedToken = Buffer.from(secureToken, 'base64').toString('utf-8');
    const ipv4Pattern = /\d+\.\d+\.\d+\.\d+$/;
    const ipv4Match = decodedToken.match(ipv4Pattern);
    if (!ipv4Match) return null;
    const ip = ipv4Match[0];
    const firstColonIndex = decodedToken.indexOf(':');
    if (firstColonIndex === -1) return null;
    const activationKey = decodedToken.substring(0, firstColonIndex);
    const parts = decodedToken.split(':');
    const secret = parts[1];
    return { activationKey, secret, ip };
  } catch (e) { return null; }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { activation_key, host_ip, client_ip, secure_token } = body;
    const ip_address = normalizeIpAddress(host_ip || client_ip);

    if (!activation_key || !ip_address || !secure_token) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    const tokenData = parseSecureToken(secure_token, ip_address);
    if (!tokenData || tokenData.activationKey !== activation_key) {
      return NextResponse.json({ success: false, error: 'Invalid token or activation key' }, { status: 401 });
    }

    const expectedSecret = process.env.PROJECT_VALIDATION_SECRET || 'I3UYA2HSQPB86XpsdVUb9szDu5tn2W3fOpg8';
    if (tokenData.secret !== expectedSecret) {
      return NextResponse.json({ success: false, error: 'Invalid secret' }, { status: 401 });
    }

    const project = await prisma.projects.findFirst({
      where: { activation_key },
      include: {
        end_customer: true,
        reseller: true,
        collectors: true,
        project_types: true,
        port: true
      }
    });

    if (!project) {
      return NextResponse.json({ success: false, error: 'Project not found' }, { status: 404 });
    }

    // Check if analyzer already exists for this IP
    let analyzer = await prisma.analyzers.findFirst({ where: { ip: ip_address } });
    if (!analyzer) {
      analyzer = await prisma.analyzers.create({
        data: {
          name: `Analyzer ${ip_address}`,
          ip: ip_address,
          status: true
        }
      });
    }

    // Update project with analyzer_id if not set
    if (!project.analyzer_id) {
      await prisma.projects.update({
        where: { id: project.id },
        data: { analyzer_id: analyzer.id }
      });
    }

    const companyName = project.end_customer?.company || project.reseller?.company || 'N/A';

    return NextResponse.json({
      success: true,
      message: 'Project activated successfully',
      data: {
        company_name: companyName,
        collector_ip: project.collectors?.ip || null,
        collector_secret: project.collectors?.secret_key || null,
        port: project.port?.port || null,
        device_count: project.device_count,
        project_type: project.project_types?.type || 'Cloud'
      }
    });

  } catch (error) {
    console.error('Activation error:', error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function GET() {
  return NextResponse.json({ message: 'Project activation endpoint' });
}