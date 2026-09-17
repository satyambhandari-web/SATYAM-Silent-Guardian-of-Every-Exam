import { Link, useLocation } from 'react-router-dom';
import { Shield } from 'lucide-react';

export function Navbar() {
  const location = useLocation();

  const navItemClass = (path: string) => `
    px-3 py-2 rounded-md text-sm font-medium transition-colors
    ${location.pathname === path 
      ? 'bg-slate-800 text-white' 
      : 'text-slate-300 hover:bg-slate-800 hover:text-white'}
  `;

  return (
    <nav className="bg-slate-900 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <Shield className="h-8 w-8 text-blue-400" />
            <span className="font-bold text-xl tracking-tight">SATYAM</span>
          </Link>
          <div className="flex gap-4">
            <Link to="/" className={navItemClass('/')}>Dashboard</Link>
            <Link to="/issue" className={navItemClass('/issue')}>Issue Credential</Link>
            <Link to="/verify" className={navItemClass('/verify')}>Verify Credential</Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
