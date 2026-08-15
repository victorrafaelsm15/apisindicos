import { Outlet, Link, useNavigate } from 'react-router-dom';
import { Button } from '@mantine/core';
import { LogOut, ShieldCheck } from 'lucide-react';
import { logout } from '../lib/authService';

export default function AdminLayout() {
  const navigate = useNavigate();
  const handleLogout = () => { logout(); navigate('/admin/login'); };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-soft)' }}>
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 28px', background: '#fff', borderBottom: '1px solid var(--border)' }}>
        <Link to="/admin" style={{ display: 'flex', alignItems: 'center', gap: 10, fontWeight: 800, fontSize: 17, color: 'var(--blue-deep)' }}>
          <ShieldCheck size={22} color="var(--blue)" /> APIS — Painel
        </Link>
        <Button variant="subtle" color="gray" size="xs" leftSection={<LogOut size={14} />} onClick={handleLogout}>Sair</Button>
      </header>
      <main style={{ padding: 28, maxWidth: 1100, margin: '0 auto' }}>
        <Outlet />
      </main>
    </div>
  );
}
