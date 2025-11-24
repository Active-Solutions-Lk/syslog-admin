import { getCurrentUser } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';
import { redirect } from 'next/navigation';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

export async function getCurrentUserData() {
  console.log('Getting current user data...');
  const { user, error } = await getCurrentUser();

  console.log('User data:', user);
  console.log('User error:', error);
  
  if (error || !user) {
    // If it's a session-related error, redirect to login
    if (error === 'Session not found' || error === 'Session expired') {
      redirect('/auth/login');
    }
    
    // Return default user data if not logged in for other reasons
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