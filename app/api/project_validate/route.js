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
 * Helper function to extract IP from token
 * Handles both IPv4 and IPv6 addresses correctly
 * @param {string} decodedToken - The decoded token string
 * @param {string} clientIp - The client IP for validation
 * @returns {object} - Object containing extracted IP and the rest of the token
 */
function extractIpFromToken(decodedToken, clientIp) {
  // Normalize the client IP for comparison
  const normalizedClientIp = normalizeIpAddress(clientIp);
  
  // Try different IP formats that might be in the token
  const possibleIpFormats = [
    `:${clientIp}`,           // Exact match
    `:${normalizedClientIp}`, // Normalized match
    `:ffff:${clientIp}`,      // IPv4-mapped format
    `:ffff:${normalizedClientIp}` // Normalized IPv4-mapped format
  ];
  
  // Try to find any of these formats in the token
  for (const ipFormat of possibleIpFormats) {
    const index = decodedToken.lastIndexOf(ipFormat);
    if (index !== -1) {
      const extractedIp = decodedToken.substring(index + 1); // +1 to skip the leading colon
      const restOfToken = decodedToken.substring(0, index);
      return { extractedIp, restOfToken, ipFormatFound: ipFormat };
    }
  }
  
  // Fallback: try to extract IP from the end of the token
  const lastColonIndex = decodedToken.lastIndexOf(':');
  if (lastColonIndex !== -1 && lastColonIndex < decodedToken.length - 1) {
    const extractedIp = decodedToken.substring(lastColonIndex + 1);
    const restOfToken = decodedToken.substring(0, lastColonIndex);
    return { extractedIp, restOfToken, ipFormatFound: 'fallback' };
  }
  
  // If we can't extract IP, return null
  return null;
}

/**
 * Helper function to calculate package end date
 * Based on the package duration and project creation date
 * @param {object} pkg - The package object from the database
 * @returns {string} - The calculated end date in ISO format
 */
function calculatePackageEndDate(pkg) {
  // If the package has an explicit end_date field, use it
  if (pkg.end_date) {
    return pkg.end_date;
  }
  
  // Otherwise, calculate based on duration and created_at
  // Duration is in days (based on the schema)
  const createdDate = new Date(pkg.created_at);
  const endDate = new Date(createdDate);
  endDate.setDate(endDate.getDate() + pkg.duration);
  
  return endDate.toISOString();
}

export async function POST(request) {
  console.log('Project validation request received:', request);
  
  // Log the incoming request
  await createInternalLog({
    message: 'Project validation request received',
    action: 'project_validation_request',
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
    const { activation_key, secure_token, client_ip, port } = body;

    console.log('Decode request received:', {
      activation_key,
      secure_token: secure_token ? `${secure_token.substring(0, 20)}...` : null,
      client_ip,
      port
    });

    // Validate required fields
    if (!activation_key || !secure_token || !client_ip) {
      console.log('Missing required fields:', {
        activation_key: !!activation_key,
        secure_token: !!secure_token,
        client_ip: !!client_ip
      });
      
      const errorResponse = {
        success: false,
        error: 'Missing required fields: activation_key, secure_token, client_ip'
      };
      
      await createInternalLog({
        message: 'Missing required fields',
        action: 'project_validation_error',
        severity: 3,
        status_code: 400,
        additional_data: {
          missing_fields: {
            activation_key: !!activation_key,
            secure_token: !!secure_token,
            client_ip: !!client_ip
          }
        }
      });
      
      return NextResponse.json(errorResponse, { status: 400 });
    }

    // Decode the secure token
    let decodedToken;
    try {
      decodedToken = Buffer.from(secure_token, 'base64').toString('utf-8');
      console.log('Decoded token:', decodedToken);
    } catch (decodeError) {
      console.error('Token decode error:', decodeError);
      
      const errorResponse = {
        success: false,
        error: 'Invalid secure token format'
      };
      
      await createInternalLog({
        message: 'Invalid secure token format',
        action: 'project_validation_error',
        severity: 3,
        status_code: 400,
        additional_data: {
          error: decodeError.message
        }
      });
      
      return NextResponse.json(errorResponse, { status: 400 });
    }

    // Extract components from decoded token
    // The token format is: activationKey:secret:ip
    // Handle both IPv4 and IPv6 addresses correctly
    const ipExtractionResult = extractIpFromToken(decodedToken, client_ip);
    
    if (!ipExtractionResult) {
      console.error('Could not extract IP from token');
      
      const errorResponse = {
        success: false,
        error: 'Invalid token structure - could not extract IP'
      };
      
      await createInternalLog({
        message: 'Invalid token structure - could not extract IP',
        action: 'project_validation_error',
        severity: 3,
        status_code: 400
      });
      
      return NextResponse.json(errorResponse, { status: 400 });
    }
    
    const { extractedIp, restOfToken } = ipExtractionResult;
    
    // Find the first colon to separate activation key from secret
    const firstColonIndex = restOfToken.indexOf(':');
    if (firstColonIndex === -1) {
      console.error('Invalid token structure - missing key/secret delimiter');
      
      const errorResponse = {
        success: false,
        error: 'Invalid token structure'
      };
      
      await createInternalLog({
        message: 'Invalid token structure - missing key/secret delimiter',
        action: 'project_validation_error',
        severity: 3,
        status_code: 400
      });
      
      return NextResponse.json(errorResponse, { status: 400 });
    }
    
    // Extract activation key and secret
    const extractedActivationKey = restOfToken.substring(0, firstColonIndex);
    const extractedSecret = restOfToken.substring(firstColonIndex + 1);

    // Normalize IPs for comparison
    const normalizedExtractedIp = normalizeIpAddress(extractedIp);
    const normalizedClientIp = normalizeIpAddress(client_ip);

    console.log('Extracted components:', {
      activationKey: extractedActivationKey,
      secret: extractedSecret,
      extractedIp: extractedIp,
      normalizedExtractedIp: normalizedExtractedIp,
      clientIp: client_ip,
      normalizedClientIp: normalizedClientIp
    });

    // Verify the activation key matches
    if (extractedActivationKey !== activation_key) {
      console.error('Activation key mismatch:', {
        provided: activation_key,
        extracted: extractedActivationKey
      });
      
      const errorResponse = {
        success: false,
        error: 'Activation key mismatch'
      };
      
      await createInternalLog({
        message: 'Activation key mismatch',
        action: 'project_validation_error',
        severity: 3,
        status_code: 401,
        additional_data: {
          provided: activation_key,
          extracted: extractedActivationKey
        }
      });
      
      return NextResponse.json(errorResponse, { status: 401 });
    }

    // Verify the secret (should match your PROJECT_VALIDATION_SECRET)
    const expectedSecret = process.env.PROJECT_VALIDATION_SECRET || 'I3UYA2HSQPB86XpsdVUb9szDu5tn2W3fOpg8';
    if (extractedSecret !== expectedSecret) {
      console.error('Secret mismatch');
      
      const errorResponse = {
        success: false,
        error: 'Invalid validation secret'
      };
      
      await createInternalLog({
        message: 'Invalid validation secret',
        action: 'project_validation_error',
        severity: 3,
        status_code: 401
      });
      
      return NextResponse.json(errorResponse, { status: 401 });
    }

    // Verify the IP matches (optional, for security)
    if (normalizedExtractedIp !== normalizedClientIp) {
      console.warn('IP mismatch:', {
        provided: client_ip,
        normalizedProvided: normalizedClientIp,
        extracted: extractedIp,
        normalizedExtracted: normalizedExtractedIp
      });
      
      // Log IP mismatch but don't reject the request
      await createInternalLog({
        message: 'IP mismatch warning',
        action: 'project_validation_warning',
        severity: 2,
        status_code: 200,
        additional_data: {
          provided: client_ip,
          normalizedProvided: normalizedClientIp,
          extracted: extractedIp,
          normalizedExtracted: normalizedExtractedIp
        }
      });
      
      // You might want to allow this or reject based on your security requirements
    }

    // Validate the activation key in database
    const project = await prisma.projects.findFirst({
      where: {
        activation_key: activation_key
      },
      include: {
        port: true,
        packages: true,
        end_customer: true
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
        action: 'project_validation_error',
        severity: 3,
        status_code: 404,
        additional_data: {
          activation_key: activation_key
        }
      });
      
      return NextResponse.json(errorResponse, { status: 404 });
    }

    console.log('Found project:', {
      id: project.id,
      activation_key: project.activation_key,
      status: project.status,
      hasPackage: !!project.packages,
      packageId: project.packages ? project.packages.id : null,
      hasEndCustomer: !!project.end_customer,
      endCustomerId: project.end_customer ? project.end_customer.id : null
    });

    // Check if project is active
    if (!project.status) {
      console.log('Project is deactivated:', project.id);
      
      const errorResponse = {
        success: false,
        error: 'Project is deactivated'
      };
      
      await createInternalLog({
        message: 'Project is deactivated',
        action: 'project_validation_error',
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
        action: 'project_validation_error',
        severity: 3,
        status_code: 400,
        related_table_id: project.id,
        additional_data: {
          project_id: project.id
        }
      });
      
      return NextResponse.json(errorResponse, { status: 400 });
    }

    // Check package validity period
    const currentDate = new Date();
    const packageEndDate = new Date(calculatePackageEndDate(project.packages));
    
    if (packageEndDate < currentDate) {
      console.log('Project package has expired:', {
        projectId: project.id,
        endDate: calculatePackageEndDate(project.packages),
        currentDate: currentDate
      });
      
      const errorResponse = {
        success: false,
        error: 'Project package has expired'
      };
      
      await createInternalLog({
        message: 'Project package has expired',
        action: 'project_validation_error',
        severity: 3,
        status_code: 403,
        related_table_id: project.id,
        additional_data: {
          project_id: project.id,
          end_date: calculatePackageEndDate(project.packages),
          current_date: currentDate
        }
      });
      
      return NextResponse.json(errorResponse, { status: 403 });
    }

    // If a port is provided in the request, check if it matches the project's assigned port
    if (port && project.port && project.port.port !== port) {
      console.log('Port mismatch:', {
        projectId: project.id,
        expectedPort: project.port.port,
        providedPort: port
      });
      
      const errorResponse = {
        success: false,
        error: `Port mismatch - expected ${project.port.port}, got ${port}`,
        userMessage: `The port ${port} does not match the assigned port ${project.port.port} for this activation key. Please use the correct port.`
      };
      
      await createInternalLog({
        message: 'Port mismatch',
        action: 'project_validation_error',
        severity: 3,
        status_code: 400,
        related_table_id: project.id,
        additional_data: {
          project_id: project.id,
          expected_port: project.port.port,
          provided_port: port
        }
      });
      
      return NextResponse.json(errorResponse, { status: 400 });
    }

    console.log('All validations passed, updating project:', project.id);

    // Update the project with logger_ip (using the normalized IP)
    await prisma.projects.update({
      where: {
        id: project.id
      },
      data: {
        logger_ip: normalizedClientIp,
        updated_at: new Date()
      }
    });

    console.log('Data successfully validated and inserted for project:', {
      projectId: project.id,
      activationKey: project.activation_key,
      loggerIp: normalizedClientIp,
      updatedAt: new Date()
    });

    // Log successful validation
    await createInternalLog({
      message: 'Project validated successfully',
      action: 'project_validation_success',
      severity: 1,
      status_code: 200,
      related_table_id: project.id,
      additional_data: {
        project_id: project.id,
        activation_key: project.activation_key,
        logger_ip: normalizedClientIp
      }
    });

    // Return success response with project data
    const responseData = {
      success: true,
      message: 'Project validated successfully',
      data: {
        projectId: project.id,
        port: project.port ? project.port.port : null,
        log_quota: project.packages.log_count,
        device_count: project.packages.device_count,
        pkg_ending_date: calculatePackageEndDate(project.packages),
        company_name: project.end_customer ? project.end_customer.company : null,
        ports: project.port ? [{
          id: project.port.id,
          port: project.port.port
        }] : []
      }
    };
    
    console.log('Returning response:', responseData);
    
    return NextResponse.json(responseData, { status: 200 });

  } catch (error) {
    console.error('Error validating project:', error);
    
    await createInternalLog({
      message: 'Internal server error during project validation',
      action: 'project_validation_error',
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
    message: 'Project validation endpoint is running',
    usage: {
      method: 'POST',
      body: {
        activation_key: 'string',
        secure_token: 'base64-encoded-string',
        client_ip: 'string',
        port: 'number (optional)'
      }
    }
  });
}