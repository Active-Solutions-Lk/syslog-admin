"use server";

import bcrypt from 'bcrypt';

export async function Login({ userName, password }) {
  try {
    // Call the API endpoint to validate credentials
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: userName,
        password: password,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      // For 401 errors (authentication failures), show the specific error message
      if (response.status === 401) {
        return {
          success: false,
          error: data.error || 'Invalid username or password',
        };
      }
      
      // For other errors, provide a generic message
      return {
        success: false,
        error: data.error || 'Login failed. Please try again.',
      };
    }

    // In a real application, you would set a session cookie here
    // For now, we'll just return the success response
    return {
      success: true,
      message: data.message,
      admin: data.admin,
    };
  } catch (error) {
    console.error('Login action error:', error);
    return {
      success: false,
      error: 'Invalid username or password',
    };
  }
}

export async function Register({ data }) {
  // Implementation for registration
  return {
    success: false,
    error: 'Registration not implemented',
  };
}

export async function Session() {
  // Implementation for session management
  return {
    success: false,
    error: 'Session management not implemented',
  };
}