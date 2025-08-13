import { supabase } from './supabaseClient';
import toast from 'react-hot-toast';
import bcrypt from 'bcryptjs';

// Password hashing configuration
const SALT_ROUNDS = 12;

// Hash a password
async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

// Compare password with hash
async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// Check if user exists by username
export async function checkUserExists(username: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id')
      .eq('username', username)
      .maybeSingle();

    if (error) {
      return false;
    }

    return !!data;
  } catch (error) {
    return false;
  }
}

// Register a new user
export async function registerUser(username: string, password: string): Promise<boolean> {
  try {
    // Check if user already exists
    const userExists = await checkUserExists(username);
    
    if (userExists) {
      toast.error('Tên đăng nhập đã tồn tại.');
      return false;
    }

    // Hash the password
    const passwordHash = await hashPassword(password);

    // Create user
    const { error } = await supabase
      .from('users')
      .insert([{ 
        username, 
        password_hash: passwordHash 
      }]);

    if (error) {
      toast.error('Không thể tạo tài khoản. Vui lòng thử lại.');
      return false;
    }

    toast.success('Tài khoản đã được tạo thành công!');
    return true;
  } catch (error) {
    toast.error('Có lỗi xảy ra khi tạo tài khoản.');
    return false;
  }
}

// Login user
export async function loginUser(username: string, password: string): Promise<boolean> {
  try {
    console.log('Attempting to login user:', username);
    
    // Get user by username
    const { data: user, error } = await supabase
      .from('users')
      .select('id, username, password_hash')
      .eq('username', username)
      .single();

    if (error || !user) {
      console.log('User not found or error:', error);
      toast.error('Tên đăng nhập hoặc mật khẩu không đúng.');
      return false;
    }

    console.log('User found, verifying password...');

    // Verify password
    const isValidPassword = await comparePassword(password, user.password_hash);
    
    if (!isValidPassword) {
      console.log('Invalid password for user:', username);
      toast.error('Tên đăng nhập hoặc mật khẩu không đúng.');
      return false;
    }

    console.log('Password verified, creating session...');

    // Create session with expiration (1 minute for testing)
    const session = {
      userId: user.id,
      username: user.username,
      loggedInAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    };

    console.log('Session created:', session);

    // Store session in localStorage
    localStorage.setItem('auth_session', JSON.stringify(session));
    console.log('Session stored in localStorage');

    toast.success('Đăng nhập thành công!');
    return true;
  } catch (error) {
    console.error('Error during login:', error);
    toast.error('Có lỗi xảy ra khi đăng nhập.');
    return false;
  }
}

// Check if user is logged in
export function isLoggedIn(): boolean {
  try {
    console.log('Checking if user is logged in...');
    const session = localStorage.getItem('auth_session');
    console.log('Raw session from localStorage:', session);
    
    if (!session) {
      console.log('No session found in localStorage');
      return false;
    }
    
    const parsedSession = JSON.parse(session);
    console.log('Parsed session:', parsedSession);
    
    if (!parsedSession || !parsedSession.userId || !parsedSession.username) {
      console.log('Invalid session data structure');
      return false;
    }

    // Check if session has expired
    if (parsedSession.expiresAt) {
      const expiresAt = new Date(parsedSession.expiresAt);
      const now = new Date();
      const timeRemaining = expiresAt.getTime() - now.getTime();
      console.log('Session expires at:', expiresAt.toLocaleString());
      console.log('Time remaining:', timeRemaining, 'ms');
      
      if (now > expiresAt) {
        // Session expired, remove it
        console.log('Session expired, removing from localStorage');
        localStorage.removeItem('auth_session');
        return false;
      }
    }

    console.log('User is logged in');
    return true;
  } catch (error) {
    console.error('Error checking login status:', error);
    // If there's an error parsing the session, remove it and return false
    localStorage.removeItem('auth_session');
    return false;
  }
}

// Get current user session
export function getCurrentUser(): any {
  try {
    console.log('Getting current user...');
    const session = localStorage.getItem('auth_session');
    if (!session) {
      console.log('No session found');
      return null;
    }
    
    const parsedSession = JSON.parse(session);
    console.log('Current user session:', parsedSession);
    
    const isValid = parsedSession && parsedSession.userId && parsedSession.username;
    console.log('Session valid:', isValid);
    
    return isValid ? parsedSession : null;
  } catch (error) {
    console.error('Error getting current user:', error);
    // If there's an error parsing the session, remove it and return null
    localStorage.removeItem('auth_session');
    return null;
  }
}

// Logout user
export function logout(): void {
  localStorage.removeItem('auth_session');
  toast('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.', {
    duration: 5000,
    position: 'top-center',
    icon: 'ℹ️',
  });
}

// Add a new user to the database (for testing)
export async function addUser(username: string, password: string): Promise<boolean> {
  try {
    const passwordHash = await hashPassword(password);
    
    const { error } = await supabase
      .from('users')
      .insert([{ 
        username, 
        password_hash: passwordHash 
      }])
      .select()
      .single();

    if (error) {
      return false;
    }

    return true;
  } catch (error) {
    return false;
  }
}

// Validate username format
export function validateUsername(username: string): boolean {
  // Username should be 3-20 characters, alphanumeric and underscore only
  const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
  return usernameRegex.test(username);
}



// Validate password strength
export function validatePassword(password: string): boolean {
  // Password should be at least 6 characters
  return password.length >= 6;
} 

// Refresh/extend session
export function refreshSession(): boolean {
  try {
    const session = localStorage.getItem('auth_session');
    if (!session) return false;
    
    const parsedSession = JSON.parse(session);
    if (!parsedSession || !parsedSession.userId || !parsedSession.username) {
      return false;
    }

    // Check if session has expired
    if (parsedSession.expiresAt) {
      const expiresAt = new Date(parsedSession.expiresAt);
      const now = new Date();
      if (now > expiresAt) {
        // Session expired, remove it
        localStorage.removeItem('auth_session');
        return false;
      }
    }

    // Extend session by another 1 minute (for testing)
    const extendedSession = {
      ...parsedSession,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 1 minute from now
    };

    localStorage.setItem('auth_session', JSON.stringify(extendedSession));
    return true;
  } catch (error) {
    // If there's an error, remove the session and return false
    localStorage.removeItem('auth_session');
    return false;
  }
}

// Get session expiration time
export function getSessionExpirationTime(): Date | null {
  try {
    const session = localStorage.getItem('auth_session');
    if (!session) return null;
    
    const parsedSession = JSON.parse(session);
    if (!parsedSession || !parsedSession.expiresAt) {
      return null;
    }

    return new Date(parsedSession.expiresAt);
  } catch (error) {
    return null;
  }
}

// Get time remaining until session expires (in milliseconds)
export function getSessionTimeRemaining(): number | null {
  try {
    const expirationTime = getSessionExpirationTime();
    if (!expirationTime) return null;
    
    const now = new Date();
    const timeRemaining = expirationTime.getTime() - now.getTime();
    
    return timeRemaining > 0 ? timeRemaining : null;
  } catch (error) {
    return null;
  }
}

// Check if session is about to expire (within specified minutes)
export function isSessionExpiringSoon(minutes: number = 5): boolean {
  try {
    const timeRemaining = getSessionTimeRemaining();
    if (timeRemaining === null) return true;
    
    return timeRemaining <= minutes * 60 * 1000;
  } catch (error) {
    return true;
  }
} 

// Force clear all sessions (for testing)
export function forceClearAllSessions(): void {
  localStorage.removeItem('auth_session');
  console.log('All sessions cleared');
}

// Debug function to show current session details
export function debugSession(): void {
  try {
    const session = localStorage.getItem('auth_session');
    if (!session) {
      console.log('No session found');
      return;
    }
    
    const parsedSession = JSON.parse(session);
    console.log('Current session:', parsedSession);
    
    if (parsedSession.expiresAt) {
      const expiresAt = new Date(parsedSession.expiresAt);
      const now = new Date();
      const timeRemaining = expiresAt.getTime() - now.getTime();
      const minutes = Math.floor(timeRemaining / (1000 * 60));
      const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);
      
      console.log(`Session expires at: ${expiresAt.toLocaleString()}`);
      console.log(`Time remaining: ${minutes}:${seconds.toString().padStart(2, '0')}`);
      console.log(`Total milliseconds: ${timeRemaining}`);
    }
  } catch (error) {
    console.error('Error debugging session:', error);
  }
} 