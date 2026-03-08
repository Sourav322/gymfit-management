import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const adminLinks = [
  { path: '/admin/dashboard', icon: '📊', label: 'Dashboard' },
  { path: '/admin/members', icon: '👥', label: 'All Members' },
  { path: '/admin/pending', icon: '⏳', label: 'Pending Approvals' },
  { path: '/admin/attendance', icon: '📋', label: 'Attendance' },
  { path: '/admin/qr-code', icon: '📱', label: 'QR Code' },
  { path: '/admin/payments', icon: '💰', label: 'Payments' },
];

const memberLinks = [
  { path: '/member/dashboard', icon: '🏠', label: 'Dashboard' },
  { path: '/member/scan', icon: '📷', label: 'Scan QR' },
  { path: '/member/attendance', icon: '📋', label: 'My Attendance' },
  { path: '/member/profile', icon: '👤', label: 'My Profile' },
];

export default function Sidebar({ collapsed, onToggle }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const isAdmin = user?.role === "admin";
  const links = isAdmin ? adminLinks : memberLinks;

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className={}>
      <div className="flex items-center gap-3 p-4 border-b border-dark-border">
        <div className="w-10 h-10 gym-gradient rounded-xl flex items-center justify-center flex-shrink-0">
          <span className="text-white font-bold text-lg">G</span>
        </div>
        {!collapsed && (
          <div>
            <div className="font-bold text-white text-xl leading-tight">GYMFIT</div>
            <div className="text-xs text-orange-400">{isAdmin ? "Admin Portal" : "Member Portal"}</div>
          </div>
        )}
        <button onClick={onToggle} className="ml-auto text-gray-400 hover:text-white transition-colors text-sm">
          {collapsed ? "▶" : "◀"}
        </button>
      </div>

      {!collapsed && (
        <div className="p-4 border-b border-dark-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-500/20 rounded-full flex items-center justify-center text-orange-400 font-bold flex-shrink-0 text-lg">
              {user?.name?.charAt(0)?.toUpperCase() || "U"}
            </div>
            <div className="min-w-0">
              <div className="text-white text-sm font-medium truncate">{user?.name}</div>
              <div className="text-gray-500 text-xs truncate">{user?.email}</div>
            </div>
          </div>
        </div>
      )}

      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {links.map((link) => {
          const active = location.pathname === link.path;
          return (
            <Link key={link.path} to={link.path} className={}>
              <span className="text-xl flex-shrink-0">{link.icon}</span>
              {!collapsed && <span className="font-medium text-sm">{link.label}</span>}
              {active && !collapsed && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-orange-400" />}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-dark-border">
        <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-400 hover:bg-red-500/10 hover:text-red-400 transition-all">
          <span className="text-xl flex-shrink-0">🚪</span>
          {!collapsed && <span className="font-medium text-sm">Sign Out</span>}
        </button>
      </div>
    </div>
  );
}
