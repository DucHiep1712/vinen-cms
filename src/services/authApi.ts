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
    // Get user by username
    const { data: user, error } = await supabase
      .from('users')
      .select('id, username, password_hash')
      .eq('username', username)
      .single();

    if (error || !user) {
      toast.error('Tên đăng nhập hoặc mật khẩu không đúng.');
      return false;
    }

    // Verify password
    const isValidPassword = await comparePassword(password, user.password_hash);
    
    if (!isValidPassword) {
      toast.error('Tên đăng nhập hoặc mật khẩu không đúng.');
      return false;
    }

    // Create session
    const session = {
      userId: user.id,
      username: user.username,
      loggedInAt: new Date().toISOString()
    };

    // Store session in localStorage
    localStorage.setItem('auth_session', JSON.stringify(session));

    toast.success('Đăng nhập thành công!');
    return true;
  } catch (error) {
    toast.error('Có lỗi xảy ra khi đăng nhập.');
    return false;
  }
}

// Check if user is logged in
export function isLoggedIn(): boolean {
  const session = localStorage.getItem('auth_session');
  return !!session;
}

// Get current user session
export function getCurrentUser(): any {
  const session = localStorage.getItem('auth_session');
  return session ? JSON.parse(session) : null;
}

// Logout user
export function logout(): void {
  localStorage.removeItem('auth_session');
  toast.success('Đã đăng xuất.');
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