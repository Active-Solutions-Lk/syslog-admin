import { getCurrentUser } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function getCurrentUserData() {
  const { user, error } = await getCurrentUser();
  
  if (error || !user) {
    // Return default user data if not logged in
    return {
      name: 'Guest',
      email: 'guest@example.com',
      avatar: '/avatars/guest.jpg',
    };
  }
  
  // Fetch full user data from database
  try {
    const dbUser = await prisma.admins.findUnique({
      where: {
        id: parseInt(user.id),
      },
      select: {
        name: true,
        email: true,
      },
    });
    
    // Return actual user data
    return {
      name: dbUser?.name || 'User',
      email: dbUser?.email || user.email,
      avatar: '/avatars/admin.jpg', // You can customize this based on user data
    };
  } catch (error) {
    console.error('Error fetching user data:', error);
    // Fallback to data from JWT token
    return {
      name: 'User',
      email: user.email,
      avatar: '/avatars/admin.jpg',
    };
  }
}