import React, { useState } from 'react';
import { Input } from '../components/ui/input';

const phoneRegex = /^\+?\d{10,15}$/;
const MOCK_OTP = '123456';

const Auth: React.FC = () => {
  const [phone, setPhone] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [otpSuccess, setOtpSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);

  const handlePhoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneRegex.test(phone)) {
      setError('Please enter a valid phone number (10-15 digits, with optional +).');
      return;
    }
    setError('');
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 1200);
  };

  const handleOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setOtpLoading(true);
    setTimeout(() => {
      setOtpLoading(false);
      if (otp !== MOCK_OTP) {
        setOtpError('Invalid OTP. Please try 123456 for demo.');
        setOtpSuccess(false);
        return;
      }
      setOtpError('');
      setOtpSuccess(true);
    }, 1200);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-3xl font-bold mb-4">Login / Register</h1>
      {!submitted ? (
        <form onSubmit={handlePhoneSubmit} className="flex flex-col gap-4 w-80">
          <Input
            type="tel"
            placeholder="Enter your phone number"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            required
            disabled={loading}
          />
          {error && <span className="text-destructive text-sm">{error}</span>}
          <button
            type="submit"
            className="bg-orange-600 text-white py-2 rounded hover:bg-orange-700 transition-colors disabled:opacity-60"
            disabled={loading}
          >
            {loading ? 'Sending OTP...' : 'Send OTP'}
          </button>
        </form>
      ) : (
        <form onSubmit={handleOtpSubmit} className="flex flex-col gap-4 w-80">
          <Input
            type="text"
            placeholder="Enter OTP (try 123456)"
            value={otp}
            onChange={e => setOtp(e.target.value)}
            maxLength={6}
            required
            disabled={otpLoading || otpSuccess}
          />
          {otpError && <span className="text-destructive text-sm">{otpError}</span>}
          {otpSuccess && <span className="text-green-600 text-sm">OTP verified! Success.</span>}
          <button
            type="submit"
            className="bg-orange-600 text-white py-2 rounded hover:bg-orange-700 transition-colors disabled:opacity-60"
            disabled={otpLoading || otpSuccess}
          >
            {otpLoading ? 'Verifying...' : 'Verify OTP'}
          </button>
        </form>
      )}
    </div>
  );
};

export default Auth; 