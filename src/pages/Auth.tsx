import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { loginUser, registerUser, validateUsername, validatePassword } from '../services/authApi';
import { useAuth } from '../contexts/AuthContext';
import toast, { Toaster } from 'react-hot-toast';
import { Lock, User } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import logo from '../assets/logo.jpg';

const Auth: React.FC = () => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim()) {
      toast.error('Vui lòng nhập tên đăng nhập.');
      return;
    }

    if (!password.trim()) {
      toast.error('Vui lòng nhập mật khẩu.');
      return;
    }

    setLoading(true);
    const success = await loginUser(username, password);
    setLoading(false);

    if (success) {
      // Get the actual session data from localStorage that was created by loginUser
      const sessionData = localStorage.getItem('auth_session');
      if (sessionData) {
        try {
          const user = JSON.parse(sessionData);
          console.log('Setting user from session data:', user);
          setUser(user);
          // Navigate after setting the user
          navigate('/events');
        } catch (error) {
          console.error('Error parsing session data:', error);
          toast.error('Có lỗi xảy ra khi xử lý phiên đăng nhập.');
        }
      } else {
        console.error('No session data found after login');
        toast.error('Có lỗi xảy ra khi tạo phiên đăng nhập.');
      }
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim()) {
      toast.error('Vui lòng nhập tên đăng nhập.');
      return;
    }

    if (!validateUsername(username)) {
      toast.error('Tên đăng nhập phải có 3-20 ký tự, chỉ bao gồm chữ cái, số và dấu gạch dưới.');
      return;
    }

    if (!password.trim()) {
      toast.error('Vui lòng nhập mật khẩu.');
      return;
    }

    if (!validatePassword(password)) {
      toast.error('Mật khẩu phải có ít nhất 6 ký tự.');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Mật khẩu xác nhận không khớp.');
      return;
    }

    setLoading(true);
    const success = await registerUser(username, password);
    setLoading(false);

    if (success) {
      setMode('login');
      setUsername('');
      setPassword('');
      setConfirmPassword('');
    }
  };



  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-primary/10 flex items-center justify-center p-4">
      <Toaster position="top-center" />

      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <img src={logo} alt="logo" className="w-24 h-24 mx-auto" />
          <CardTitle className="text-4xl font-bold">
            {mode === 'login' ? 'Đăng nhập' : 'Đăng ký'}
          </CardTitle>
          <CardDescription>
            {mode === 'login' 
              ? 'Nhập thông tin đăng nhập của bạn'
              : 'Tạo tài khoản mới'
            }
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <form onSubmit={mode === 'login' ? handleLogin : handleRegister} className="space-y-4">
            {mode === 'register' && (
              <div className="space-y-2">
                <Label htmlFor="username">Tên đăng nhập</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    id="username"
                    type="text"
                    placeholder="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="pl-10"
                    maxLength={20}
                  />
                </div>
                <p className="text-xs text-gray-500">
                  3-20 ký tự, chỉ bao gồm chữ cái, số và dấu gạch dưới
                </p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="username">Tên đăng nhập</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  id="username"
                  type="text"
                  placeholder="Tên đăng nhập"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="pl-10"
                  maxLength={20}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Mật khẩu</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  id="password"
                  type="password"
                  placeholder="•••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                />
              </div>
              {mode === 'register' && (
                <p className="text-xs text-gray-500">
                  Ít nhất 6 ký tự
                </p>
              )}
            </div>

            {mode === 'register' && (
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Xác nhận mật khẩu</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full cursor-pointer"
            >
              {loading 
                ? (mode === 'login' ? 'Đang đăng nhập...' : 'Đang đăng ký...')
                : (mode === 'login' ? 'Đăng nhập' : 'Đăng ký')
              }
            </Button>
          </form>

        </CardContent>
      </Card>
    </div>
  );
};

export default Auth; 