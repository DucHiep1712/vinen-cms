-- Create users table for OTP authentication
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone TEXT UNIQUE NOT NULL,
    otp_token TEXT,
    otp_expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create index on phone for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);

-- Insert some test users (you can remove these later)
INSERT INTO users (phone) VALUES 
    ('0123456789'),
    ('0987654321'),
    ('0369852147')
ON CONFLICT (phone) DO NOTHING; 