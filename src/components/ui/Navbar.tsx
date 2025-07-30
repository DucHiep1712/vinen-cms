import { Link, useLocation } from 'react-router-dom';
import logo from '../../assets/logo.jpg';

const navItems = [
  // { name: 'Dashboard', path: '/dashboard' },
  { name: 'Events', path: '/events' },
  { name: 'News', path: '/news' },
  { name: 'Products', path: '/products' },
];

export default function Navbar() {
  const location = useLocation();
  return (
    <nav className="w-full flex items-center justify-between h-20 border-b border-gray-100 bg-white/80 backdrop-blur-md sticky top-0 z-20 shadow-sm">
      <div className="flex items-center gap-2 pl-6 select-none">
        <img src={logo} alt="logo" className="w-12 h-12" />
        <span className="text-xs text-gray-400 font-mono mt-2">™</span>
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
      <div>
        {/* Placeholder for user avatar */}
      </div>
    </nav>
  );
} 