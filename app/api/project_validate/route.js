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
    return { activationKey, secret: parts[1], ip };
  } catch (e) { return null; }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { activation_key, secure_token, client_ip, port } = body;
    const normalizedClientIp = normalizeIpAddress(client_ip);

    if (!activation_key || !secure_token || !normalizedClientIp) {
      return NextResponse.json({ success: false, error: 'Missing fields' }, { status: 400 });
    }

    const tokenData = parseSecureToken(secure_token, normalizedClientIp);
    if (!tokenData || tokenData.activationKey !== activation_key) {
      return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 401 });
    }

    const expectedSecret = process.env.PROJECT_VALIDATION_SECRET || 'I3UYA2HSQPB86XpsdVUb9szDu5tn2W3fOpg8';
    if (tokenData.secret !== expectedSecret) {
      return NextResponse.json({ success: false, error: 'Invalid secret' }, { status: 401 });
    }

    const project = await prisma.projects.findFirst({
      where: { activation_key },
      include: {
        port: true,
        end_customer: true,
        project_types: true
      }
    });

    if (!project) {
      return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
    }

    if (port && project.port && project.port.port !== parseInt(port)) {
      return NextResponse.json({ success: false, error: 'Port mismatch' }, { status: 400 });
    }

    // Check analyzer
    const analyzer = await prisma.analyzers.findFirst({ where: { ip: normalizedClientIp } });
    if (analyzer && !project.analyzer_id) {
      await prisma.projects.update({
        where: { id: project.id },
        data: { analyzer_id: analyzer.id }
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Validated',
      data: {
        projectId: project.id,
        port: project.port?.port || null,
        device_count: project.device_count,
        company_name: project.end_customer?.company || 'N/A'
      }
    });

  } catch (error) {
    console.error('Validation error:', error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function GET() {
  return NextResponse.json({ message: 'Project validation endpoint' });
}