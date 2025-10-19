import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request) {

  try {
    // Parse the request body
    const body = await request.json();
    const { activationKey, secretKey, collectorIp, loggerIp } = body;

    // Validate the secret key
    const expectedSecretKey = process.env.PROJECT_VALIDATION_SECRET;
    if (!secretKey || secretKey !== expectedSecretKey) {
      return new Response(
        JSON.stringify({ 
          error: 'Invalid secret key',
          success: false 
        }),
        { 
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Validate the activation key
    const project = await prisma.projects.findFirst({
      where: {
        activation_key: activationKey
      },
      include: {
        ports: true
      }
    });

    // Add these lines at the beginning of the POST function for debugging
console.log('Debug - PROJECT_VALIDATION_SECRET from env:', process.env.PROJECT_VALIDATION_SECRET);
console.log('Debug - Expected secret key length:', process.env.PROJECT_VALIDATION_SECRET?.length);
console.log('Debug - Received secret key:', secretKey);
console.log('Debug - Received secret key length:', secretKey?.length);
console.log('Debug - Keys match:', secretKey === process.env.PROJECT_VALIDATION_SECRET);

    if (!project) {
      return new Response(
        JSON.stringify({ 
          error: 'Invalid activation key',
          success: false 
        }),
        { 
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Prepare update data
    const updateData = {};
    if (collectorIp) {
      updateData.collector_ip = collectorIp;
    }
    if (loggerIp) {
      updateData.loggert_ip = loggerIp;
    }

    // Update the project with collector_ip or logger_ip if provided
    if (Object.keys(updateData).length > 0) {
      await prisma.projects.update({
        where: {
          id: project.id
        },
        data: updateData
      });
    }

    // Return success response with ports data
    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Project validated successfully',
        projectId: project.id,
        ports: project.ports.map(port => ({
          id: port.id,
          port: port.port
        }))
      }),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Error validating project:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        success: false 
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } finally {
    await prisma.$disconnect();
  }
}