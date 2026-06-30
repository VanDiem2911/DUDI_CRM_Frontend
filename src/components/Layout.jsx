import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Logo from './Logo';
import { 
  LayoutDashboard, 
  Database, 
  Users, 
  LogOut, 
  Menu, 
  X, 
  User as UserIcon, 
  Briefcase
} from 'lucide-react';

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isAdmin = user?.role === 'ROLE_ADMIN';

  const adminMenu = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Quản lý dữ liệu', path: '/admin/data', icon: Database },
    { name: 'Quản lý nhân viên', path: '/admin/employees', icon: Users },
  ];

  const employeeMenu = [
    { name: 'Data được giao', path: '/employee', icon: Briefcase },
  ];

  const menuItems = isAdmin ? adminMenu : employeeMenu;

  const NavLinks = ({ onClick }) => (
    <nav className="flex-1 px-4 py-6 space-y-1">
      {menuItems.map((item) => {
        const isActive = location.pathname === item.path;
        const Icon = item.icon;
        return (
          <Link
            key={item.path}
            to={item.path}
            onClick={onClick}
            className={`flex items-center px-4 py-3 text-sm font-semibold rounded-xl transition duration-200 ${
              isActive
                ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/30'
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Icon className="w-5 h-5 mr-3" />
            {item.name}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-[#F8FAFC]">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:flex-shrink-0 w-52 bg-slate-900 flex-col border-r border-slate-800">
        <div className="flex items-center justify-start h-16 border-b border-slate-800 px-6">
          <Link to="/">
            <Logo className="w-8 h-8" />
          </Link>
        </div>
        <NavLinks />
        <div className="p-4 border-t border-slate-800">
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-3 text-sm font-semibold text-slate-400 rounded-xl hover:bg-red-500/10 hover:text-red-500 transition duration-200"
          >
            <LogOut className="w-5 h-5 mr-3" />
            Đăng xuất
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar */}
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-40 md:hidden flex">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsMobileSidebarOpen(false)} />
          <aside className="relative flex-1 flex flex-col max-w-xs w-full bg-slate-900 animate-in slide-in-from-left duration-200">
            <div className="flex items-center justify-between h-16 px-6 border-b border-slate-800">
              <Logo className="w-8 h-8" />
              <button
                onClick={() => setIsMobileSidebarOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <NavLinks onClick={() => setIsMobileSidebarOpen(false)} />
            <div className="p-4 border-t border-slate-800">
              <button
                onClick={() => {
                  setIsMobileSidebarOpen(false);
                  handleLogout();
                }}
                className="flex items-center w-full px-4 py-3 text-sm font-semibold text-slate-400 rounded-xl hover:bg-red-500/10 hover:text-red-500 transition duration-200"
              >
                <LogOut className="w-5 h-5 mr-3" />
                Đăng xuất
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="flex-shrink-0 h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between">
          <button
            onClick={() => setIsMobileSidebarOpen(true)}
            className="md:hidden p-1 rounded-lg text-slate-600 hover:bg-slate-100"
          >
            <Menu className="w-6 h-6" />
          </button>

          <div className="hidden md:flex items-center text-slate-500 text-sm font-medium">
            Hệ thống quản lý & chia data khách hàng
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex flex-col text-right">
              <span className="text-sm font-bold text-slate-800">{user?.fullName}</span>
              <span className="text-xs font-semibold text-primary-600">
                {isAdmin ? 'Quản trị viên (Admin)' : 'Nhân viên'}
              </span>
            </div>
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 border border-slate-200">
              <UserIcon className="w-5 h-5" />
            </div>
          </div>
        </header>

        {/* Workspace Body */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
