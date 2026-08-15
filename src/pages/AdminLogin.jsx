import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Button, TextInput, PasswordInput, Paper, Text } from '@mantine/core';
import { ShieldCheck } from 'lucide-react';
import { login } from '../lib/authService';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const { register, handleSubmit, formState: { isSubmitting } } = useForm();

  const onSubmit = async ({ email, password }) => {
    setError('');
    await new Promise((r) => setTimeout(r, 300));
    if (login(email, password)) navigate('/admin');
    else setError('E-mail ou senha incorretos.');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-soft)', padding: 20 }}>
      <Paper withBorder radius="lg" p="xl" style={{ width: '100%', maxWidth: 380, textAlign: 'center' }}>
        <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(25,88,201,0.1)', color: 'var(--blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
          <ShieldCheck size={22} />
        </div>
        <Text fw={800} size="lg">APIS</Text>
        <Text size="sm" c="dimmed" mb="lg">Painel administrativo</Text>
        <form onSubmit={handleSubmit(onSubmit)}>
          <TextInput label="E-mail" {...register('email', { required: true })} />
          <PasswordInput label="Senha" mt="md" {...register('password', { required: true })} />
          {error && <Text c="red" size="sm" mt="sm">{error}</Text>}
          <Button type="submit" fullWidth mt="lg" radius="xl" color="blue.7" loading={isSubmitting}>Entrar</Button>
        </form>
      </Paper>
    </div>
  );
}
