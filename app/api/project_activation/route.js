import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';
import { createInternalLog } from '@/app/actions/project';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

/**
 * Helper function to normalize IP addresses
 * Converts IPv4-mapped IPv6 addresses to standard IPv4 format
 * @param {string} ip - The IP address to normalize
 * @returns {string} - The normalized IP address
 */
function normalizeIpAddress(ip) {
  // Check if it's an IPv4-mapped IPv6 address (e.g., ::ffff:192.168.0.42)
  if (ip.startsWith('::ffff:')) {
    // Extract the IPv4 part
    return ip.substring(7); // Remove '::ffff:' prefix
  }

  // For other IPv6 addresses, return as is
  // For IPv4 addresses, return as is
  return ip;
}

/**
 * Helper function to parse secure token
 * Handles both IPv4 and IPv6 addresses correctly by parsing from right to left
 * @param {string} secureToken - The base64 encoded secure token
 * @param {string} clientIp - The client IP for validation
 * @returns {object|null} - Object containing parsed components or null if invalid
 */
function parseSecureToken(secureToken, clientIp) {
  try {
    // Decode the base64 token
    const decodedToken = Buffer.from(secureToken, 'base64').toString('utf-8');
    console.log('Decoded token:', decodedToken);

    // Extract IP address from the end of the token
    // Handle both IPv4 (x.x.x.x) and IPv6-mapped IPv4 (::ffff:x.x.x.x) formats
    let ip = '';
    let ipStartIndex = -1;

    // Look for IPv4 pattern at the end (most common case)
    const ipv4Pattern = /\d+\.\d+\.\d+\.\d+$/;
    const ipv4Match = decodedToken.match(ipv4Pattern);

    if (ipv4Match) {
      ip = ipv4Match[0];
      ipStartIndex = decodedToken.lastIndexOf(ip);
    }

    if (!ip || ipStartIndex === -1) {
      console.error('Could not extract IP address from token');
      return null;
    }

    // Find the IP part with the colon prefix
    const ipPart = ':' + ip;
    const ipPartStartIndex = decodedToken.lastIndexOf(ipPart);

    if (ipPartStartIndex === -1) {
      console.error('Could not find IP part in token');
      return null;
    }

    // Extract everything before the IP part
    const prefix = decodedToken.substring(0, ipPartStartIndex);

    // The token structure is: activationKey:secret:ip
    // So we need to find the first colon (separates activationKey from secret)

    // Find the first colon (between activationKey and secret)
    const firstColonIndex = prefix.indexOf(':');

    if (firstColonIndex === -1) {
      console.error('Could not find first colon separator');
      return null;
    }

    // Extract components
    const activationKey = prefix.substring(0, firstColonIndex);
    let secret = prefix.substring(firstColonIndex + 1);

    // For IPv6-mapped IPv4 addresses, we need to remove the :::ffff: part from the secret
    // The secret ends with :::ffff: for IPv6-mapped addresses
    if (clientIp.startsWith('::ffff:')) {
      // Check if the secret ends with :::ffff: and remove it
      if (secret.endsWith(':::ffff:')) {
        secret = secret.substring(0, secret.length - 7); // Remove :::ffff:
      }
      // Check if the secret ends with :::ffff (without trailing colon) and remove it
      else if (secret.endsWith(':::ffff')) {
        secret = secret.substring(0, secret.length - 7); // Remove :::ffff
      }
    }

    // ip is already extracted

    return {
      activationKey,
      secret,
      ip
    };
  } catch (error) {
    console.error('Error parsing secure token:', error);
    return null;
  }
}

/**
 * Helper function to calculate project end date
 * Based on the project start date and package duration
 * @param {Date} startDate - The project start date
 * @param {object} pkg - The package object from the database
 * @returns {Date} - The calculated end date
 */
function calculateProjectEndDate(startDate, pkg) {
  // Duration is in days (based on the schema)
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + Math.floor(pkg.duration));
  return endDate;
}

export async function POST(request) {
  // console.log('Project activation request received');

  // Log the incoming request
  await createInternalLog({
    message: 'Project activation request received',
    action: 'project_activation_request',
    severity: 1,
    status_code: 200,
    additional_data: {
      method: request.method,
      url: request.url,
      client_ip: request.headers.get('x-forwarded-for') || 'unknown'
    }
  });

  try {
    // Parse the request body
    const body = await request.json();
    // Accept both host_ip and client_ip for compatibility
    const { activation_key, host_ip, client_ip, secure_token } = body;

    // Use host_ip if provided, otherwise fallback to client_ip
    const ip_address = host_ip || client_ip;

    // console.log('Activation request received:', {
    //   activation_key,
    //   host_ip,
    //   client_ip,
    //   ip_address,
    //   secure_token: secure_token ? `${secure_token.substring(0, 20)}...` : null
    // });

    // Validate required fields
    if (!activation_key || !ip_address || !secure_token) {
      console.log('Missing required fields:', {
        activation_key: !!activation_key,
        ip_address: !!ip_address,
        secure_token: !!secure_token
      });

      const errorResponse = {
        success: false,
        error: 'Missing required fields: activation_key, host_ip/client_ip, secure_token'
      };

      await createInternalLog({
        message: 'Missing required fields',
        action: 'project_activation_error',
        severity: 3,
        status_code: 400,
        additional_data: {
          missing_fields: {
            activation_key: !!activation_key,
            ip_address: !!ip_address,
            secure_token: !!secure_token
          }
        }
      });

      return NextResponse.json(errorResponse, { status: 400 });
    }

    // Parse and validate the secure token
    const tokenData = parseSecureToken(secure_token, ip_address);

    if (!tokenData) {
      console.error('Invalid secure token format');

      const errorResponse = {
        success: false,
        error: 'Invalid secure token format'
      };

      await createInternalLog({
        message: 'Invalid secure token format',
        action: 'project_activation_error',
        severity: 3,
        status_code: 400
      });

      return NextResponse.json(errorResponse, { status: 400 });
    }

    const { activationKey, secret, ip } = tokenData;

    // Normalize IPs for comparison
    const normalizedTokenIp = normalizeIpAddress(ip);
    const normalizedClientIp = normalizeIpAddress(ip_address);

    // console.log('Parsed token components:', {
    //   activationKey,
    //   secret,
    //   tokenIp: ip,
    //   normalizedTokenIp,
    //   clientIp: ip_address,
    //   normalizedClientIp
    // });

    // Verify the activation key matches
    if (activationKey !== activation_key) {
      console.error('Activation key mismatch:', {
        provided: activation_key,
        extracted: activationKey
      });

      const errorResponse = {
        success: false,
        error: 'Activation key mismatch'
      };

      await createInternalLog({
        message: 'Activation key mismatch',
        action: 'project_activation_error',
        severity: 3,
        status_code: 401,
        additional_data: {
          provided: activation_key,
          extracted: activationKey
        }
      });

      return NextResponse.json(errorResponse, { status: 401 });
    }

    // Verify the secret (should match your PROJECT_VALIDATION_SECRET)
    const expectedSecret = process.env.PROJECT_VALIDATION_SECRET || 'I3UYA2HSQPB86XpsdVUb9szDu5tn2W3fOpg8';
    if (secret !== expectedSecret) {
      console.error('Secret mismatch');

      const errorResponse = {
        success: false,
        error: 'Invalid validation secret'
      };

      await createInternalLog({
        message: 'Invalid validation secret',
        action: 'project_activation_error',
        severity: 3,
        status_code: 401
      });

      return NextResponse.json(errorResponse, { status: 401 });
    }

    // Verify the IP matches
    if (normalizedTokenIp !== normalizedClientIp) {
      console.warn('IP mismatch:', {
        provided: ip_address,
        normalizedProvided: normalizedClientIp,
        tokenIp: ip,
        normalizedTokenIp: normalizedTokenIp
      });

      // Log IP mismatch but don't reject the request for now
      await createInternalLog({
        message: 'IP mismatch warning',
        action: 'project_activation_warning',
        severity: 2,
        status_code: 200,
        additional_data: {
          provided: ip_address,
          normalizedProvided: normalizedClientIp,
          tokenIp: ip,
          normalizedTokenIp: normalizedTokenIp
        }
      });
    }

    // Find the project by activation key
    const project = await prisma.projects.findFirst({
      where: {
        activation_key: activation_key
      },
      include: {
        packages: true,
        end_customer: true,
        reseller: true,
        collector: true, // Include collector relation
        port: true // Include port relation to get the actual port value
      }
    });

    if (!project) {
      console.log('Project not found for activation key:', activation_key);

      const errorResponse = {
        success: false,
        error: 'Invalid activation key - project not found'
      };

      await createInternalLog({
        message: 'Invalid activation key - project not found',
        action: 'project_activation_error',
        severity: 3,
        status_code: 404,
        additional_data: {
          activation_key: activation_key
        }
      });

      return NextResponse.json(errorResponse, { status: 404 });
    }

    // console.log('Found project:', {
    //   id: project.id,
    //   activation_key: project.activation_key,
    //   status: project.status,
    //   logger_ip: project.logger_ip,
    //   collector_ip: project.collector_ip,
    //   type: project.type,
    //   hasPackage: !!project.packages,
    //   hasEndCustomer: !!project.end_customer,
    //   hasReseller: !!project.reseller
    // });

    // Check if project is already registered (has logger_ip)
    if (project.logger_ip) {
      console.log('Project already registered:', project.id);

      const successResponse = {
        success: true,
        message: 'Activation key already registered',
        data: {
          project_id: project.id,
          activation_key: project.activation_key
        }
      };

      await createInternalLog({
        message: 'Project already registered',
        action: 'project_activation_success',
        severity: 1,
        status_code: 200,
        related_table_id: project.id,
        additional_data: {
          project_id: project.id,
          activation_key: project.activation_key
        }
      });

      return NextResponse.json(successResponse, { status: 200 });
    }

    // Check if project is enabled
    if (!project.status) {
      console.log('Project is disabled:', project.id);

      const errorResponse = {
        success: false,
        error: 'Project is disabled'
      };

      await createInternalLog({
        message: 'Project is disabled',
        action: 'project_activation_error',
        severity: 3,
        status_code: 403,
        related_table_id: project.id,
        additional_data: {
          project_id: project.id
        }
      });

      return NextResponse.json(errorResponse, { status: 403 });
    }

    // Check if project has valid package
    if (!project.packages) {
      console.log('Project has no assigned package:', project.id);

      const errorResponse = {
        success: false,
        error: 'Project has no assigned package'
      };

      await createInternalLog({
        message: 'Project has no assigned package',
        action: 'project_activation_error',
        severity: 3,
        status_code: 400,
        related_table_id: project.id,
        additional_data: {
          project_id: project.id
        }
      });

      return NextResponse.json(errorResponse, { status: 400 });
    }

    // Get company name (either end_customer or reseller)
    let companyName = null;
    if (project.end_customer) {
      companyName = project.end_customer.company;
    } else if (project.reseller) {
      companyName = project.reseller.company_name;
    }

    // Normalize the client IP
    const normalizedHostIp = normalizeIpAddress(ip_address);

    // Handle based on project type
    if (project.type === 1) {
      // Cloud project type
      console.log('Processing cloud project:', project.id);

      // Look up analyzer ID based on IP
      let analyzer = await prisma.analyzers.findFirst({
        where: { ip: normalizedHostIp }
      });

      // If analyzer not found, create it
      if (!analyzer) {
        console.log('Analyzer not found, creating new analyzer for IP:', normalizedHostIp);
        try {
          analyzer = await prisma.analyzers.create({
            data: {
              name: `Analyzer ${normalizedHostIp}`,
              ip: normalizedHostIp,
              status: 1, // Active by default
              created_at: new Date(),
              updated_at: new Date()
            }
          });

          await createInternalLog({
            message: 'New analyzer auto-registered during activation',
            action: 'analyzer_auto_creation',
            severity: 1,
            status_code: 201,
            additional_data: {
              ip: normalizedHostIp,
              analyzer_id: analyzer.id,
              project_id: project.id
            }
          });
        } catch (analyzerError) {
          console.error('Failed to create analyzer:', analyzerError);
          // Fallback to warning if creation fails
          await createInternalLog({
            message: 'Failed to auto-register analyzer',
            action: 'project_activation_error',
            severity: 3,
            status_code: 500,
            additional_data: {
              ip: normalizedHostIp,
              error: analyzerError.message
            }
          });
        }
      }

      if (analyzer) {
        // Update the logger_ip with the analyzer ID
        await prisma.projects.update({
          where: { id: project.id },
          data: {
            logger_ip: analyzer.id,
            updated_at: new Date()
          }
        });
      }

      // Calculate project end date
      const projectEndDate = calculateProjectEndDate(project.created_at, project.packages);

      // Prepare response data
      const responseData = {
        success: true,
        message: 'Project activated successfully',
        data: {
          company_name: companyName,
          collector_ip: project.collector ? project.collector.ip : null,
          collector_ip_address: project.collector ? project.collector.ip : null,
          collector_secret: project.collector ? project.collector.secret_key : null,
          port: project.port ? project.port.port : null,
          package_name: project.packages.name,
          log_quota: project.packages.log_count,
          device_count: project.packages.device_count,
          project_end_date: projectEndDate.toISOString()
        }
      };

      await createInternalLog({
        message: 'Cloud project activated successfully',
        action: 'project_activation_success',
        severity: 1,
        status_code: 200,
        related_table_id: project.id,
        additional_data: {
          project_id: project.id,
          logger_ip: normalizedHostIp
        }
      });

      return NextResponse.json(responseData, { status: 200 });
    } else if (project.type === 2) {
      // On-prem project type
      console.log('Processing on-prem project:', project.id);

      // Look up analyzer ID based on IP
      let analyzer = await prisma.analyzers.findFirst({
        where: { ip: normalizedHostIp }
      });

      // If analyzer not found, create it
      if (!analyzer) {
        console.log('Analyzer not found (on-prem), creating new analyzer for IP:', normalizedHostIp);
        try {
          analyzer = await prisma.analyzers.create({
            data: {
              name: `Analyzer ${normalizedHostIp}`,
              ip: normalizedHostIp,
              status: 1, // Active by default
              created_at: new Date(),
              updated_at: new Date()
            }
          });

          await createInternalLog({
            message: 'New analyzer auto-registered during activation (on-prem)',
            action: 'analyzer_auto_creation',
            severity: 1,
            status_code: 201,
            additional_data: {
              ip: normalizedHostIp,
              analyzer_id: analyzer.id,
              project_id: project.id
            }
          });
        } catch (analyzerError) {
          console.error('Failed to create analyzer:', analyzerError);
          await createInternalLog({
            message: 'Failed to auto-register analyzer (on-prem)',
            action: 'project_activation_error',
            severity: 3,
            status_code: 500,
            additional_data: {
              ip: normalizedHostIp,
              error: analyzerError.message
            }
          });
        }
      }

      if (analyzer) {
        // Update the logger_ip with the received IP
        await prisma.projects.update({
          where: { id: project.id },
          data: {
            logger_ip: analyzer.id,
            updated_at: new Date()
            // Note: collector_ip remains null for on-prem projects
          }
        });
      }

      // Calculate project end date
      const projectEndDate = calculateProjectEndDate(project.created_at, project.packages);

      // Prepare response data
      const responseData = {
        success: true,
        message: 'Project activated successfully',
        data: {
          company_name: companyName,
          collector_ip: null, // No collector for on-prem
          collector_ip_address: null, // No collector for on-prem
          port: project.port ? project.port.port : null, // Return actual port value instead of ID
          package_name: project.packages.name,
          log_quota: project.packages.log_count,
          device_count: project.packages.device_count,
          project_end_date: projectEndDate.toISOString()
        }
      };

      console.log('On-prem project data:', responseData);

      await createInternalLog({
        message: 'On-prem project activated successfully',
        action: 'project_activation_success',
        severity: 1,
        status_code: 200,
        related_table_id: project.id,
        additional_data: {
          project_id: project.id,
          logger_ip: normalizedHostIp
        }
      });

      return NextResponse.json(responseData, { status: 200 });
    } else {
      // Unknown project type
      console.log('Unknown project type:', project.type);

      const errorResponse = {
        success: false,
        error: 'Unknown project type'
      };

      await createInternalLog({
        message: 'Unknown project type',
        action: 'project_activation_error',
        severity: 3,
        status_code: 400,
        related_table_id: project.id,
        additional_data: {
          project_id: project.id,
          project_type: project.type
        }
      });

      return NextResponse.json(errorResponse, { status: 400 });
    }
  } catch (error) {
    console.error('Error activating project:', error);

    await createInternalLog({
      message: 'Internal server error during project activation',
      action: 'project_activation_error',
      severity: 4,
      status_code: 500,
      additional_data: {
        error: error.message,
        stack: error.stack
      }
    });

    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Project activation endpoint is running',
    usage: {
      method: 'POST',
      body: {
        activation_key: 'string',
        host_ip: 'string',
        secure_token: 'base64-encoded-string'
      }
    }
  });
}