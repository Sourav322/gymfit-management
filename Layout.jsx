import React, { useState } from 'react';
import Sidebar from './Sidebar';

export default function Layout({ children }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen bg-dark">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      <main
        className="flex-1 transition-all duration-300 overflow-auto"
        style={{ marginLeft: collapsed ? '64px' : '256px' }}
      >
        {children}
      </main>
    </div>
  );
}
