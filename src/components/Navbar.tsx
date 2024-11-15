import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Users, Calendar, BarChart2, Megaphone, ShoppingBag, HelpCircle } from 'lucide-react';

export default function Navbar() {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-white shadow-lg fixed w-full top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link to="/" className="flex items-center">
              <Calendar className="h-8 w-8 text-indigo-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">EventPro</span>
            </Link>

            <div className="hidden sm:ml-6 sm:flex sm:space-x-4">
              <NavLink to="/" icon={Home} text="Home" isActive={isActive('/')} />
              <NavLink to="/about" icon={HelpCircle} text="Quem Somos" isActive={isActive('/about')} />
              <NavLink to="/marketing" icon={ShoppingBag} text="Marketing e Vendas" isActive={isActive('/marketing')} />
              <NavLink to="/promotion" icon={Megaphone} text="Divulgação" isActive={isActive('/promotion')} />
              <NavLink to="/app/events" icon={Calendar} text="Eventos" isActive={isActive('/app/events')} />
              <NavLink to="/app/users" icon={Users} text="Usuários" isActive={isActive('/app/users')} />
              <NavLink to="/app/dashboard" icon={BarChart2} text="Dashboard" isActive={isActive('/app/dashboard')} />
            </div>
          </div>

          <div className="hidden sm:flex sm:items-center">
            <Link
              to="/login"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Login
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center sm:hidden">
            <button
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
              aria-controls="mobile-menu"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              <svg
                className="block h-6 w-6"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className="sm:hidden" id="mobile-menu">
        <div className="px-2 pt-2 pb-3 space-y-1">
          <MobileNavLink to="/" text="Home" isActive={isActive('/')} />
          <MobileNavLink to="/about" text="Quem Somos" isActive={isActive('/about')} />
          <MobileNavLink to="/marketing" text="Marketing e Vendas" isActive={isActive('/marketing')} />
          <MobileNavLink to="/promotion" text="Divulgação" isActive={isActive('/promotion')} />
          <MobileNavLink to="/app/events" text="Eventos" isActive={isActive('/app/events')} />
          <MobileNavLink to="/app/users" text="Usuários" isActive={isActive('/app/users')} />
          <MobileNavLink to="/app/dashboard" text="Dashboard" isActive={isActive('/app/dashboard')} />
        </div>
      </div>
    </nav>
  );
}

interface NavLinkProps {
  to: string;
  icon: React.FC<{ className?: string }>;
  text: string;
  isActive: boolean;
}

function NavLink({ to, icon: Icon, text, isActive }: NavLinkProps) {
  return (
    <Link
      to={to}
      className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-md ${
        isActive
          ? 'text-indigo-600 bg-indigo-50'
          : 'text-gray-700 hover:text-indigo-600 hover:bg-indigo-50'
      }`}
    >
      <Icon className={`h-5 w-5 mr-1.5 ${isActive ? 'text-indigo-600' : 'text-gray-400'}`} />
      {text}
    </Link>
  );
}

interface MobileNavLinkProps {
  to: string;
  text: string;
  isActive: boolean;
}

function MobileNavLink({ to, text, isActive }: MobileNavLinkProps) {
  return (
    <Link
      to={to}
      className={`block px-3 py-2 rounded-md text-base font-medium ${
        isActive
          ? 'text-indigo-600 bg-indigo-50'
          : 'text-gray-700 hover:text-indigo-600 hover:bg-indigo-50'
      }`}
    >
      {text}
    </Link>
  );
}