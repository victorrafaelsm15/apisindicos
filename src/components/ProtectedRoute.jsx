import { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { Group, Loader } from '@mantine/core';
import { isAdmin } from '../lib/authService';
import { supabase } from '../lib/supabaseClient';

export default function ProtectedRoute() {
  const [status, setStatus] = useState('checking'); // 'checking' | 'allowed' | 'denied'

  useEffect(() => {
    let active = true;
    isAdmin().then((ok) => { if (active) setStatus(ok ? 'allowed' : 'denied'); });
    // Sessão encerrada (Sair, expiração) -> volta para o login.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT' && active) setStatus('denied');
    });
    return () => { active = false; subscription.unsubscribe(); };
  }, []);

  if (status === 'checking') return <Group justify="center" py={100}><Loader color="blue" /></Group>;
  return status === 'allowed' ? <Outlet /> : <Navigate to="/admin/login" replace />;
}
