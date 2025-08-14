import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import logo from '../../assets/logo.jpg';
import { Button } from './button';

const navItems = [
  // { name: 'Dashboard', path: '/dashboard' },
  { name: 'Sự kiện', path: '/events' },
  { name: 'Tin tức', path: '/news' },
  { name: 'Sản phẩm', path: '/products' },
  { name: 'Người dùng', path: '/members' },
  { name: 'Yêu cầu tư vấn', path: '/product-requests' },
];

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  return (
    <nav className="w-full flex items-center justify-between h-20 border-b border-muted-foreground/10 bg-white/80 backdrop-blur-md sticky top-0 z-20 shadow-sm">
      <div className="flex items-center gap-2 pl-6 select-none">
        <img src={logo} alt="logo" className="w-12 h-12" />
      </div>
      <div className="flex gap-8">
        {navItems.map(item => (
          <Link
            key={item.path}
            to={item.path}
            className={`text-xs font-medium uppercase px-4 py-1 rounded-full transition-colors duration-150 ${location.pathname === item.path ? 'text-primary bg-muted' : 'text-muted-foreground hover:text-primary hover:bg-muted'}`}
          >
            {item.name}
          </Link>
        ))}
      </div>
      <div className="flex items-center gap-4 mr-6">
        <Button
          variant="ghost"
          onClick={handleLogout}
          className="cursor-pointer hover:bg-destructive hover:text-background"
        >
          Đăng xuất
        </Button>
      </div>
    </nav>
  );
} 