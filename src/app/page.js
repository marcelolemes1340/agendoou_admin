
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { verifyAdmin } from '../../services/api';
import { cores } from '@/lib/cores';

export default function HomePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAuthAndRedirect() {
      try {
        console.log('🔍 Verificando autenticação...');
        await verifyAdmin();
        console.log('✅ Usuário autenticado, redirecionando para dashboard...');
        router.push('/dashboard');
      } catch (error) {
        console.log('❌ Usuário não autenticado, redirecionando para login...');
        router.push('/login');
      } finally {
        setLoading(false);
      }
    }

    checkAuthAndRedirect();
  }, [router]);

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: `radial-gradient(circle at center, ${cores.primary.main} 0%, ${cores.background.primary} 100%)`,
        color: cores.neutral.white
      }}>
        <div style={{
          textAlign: 'center',
          padding: '40px'
        }}>
          <div style={{
            fontSize: '4rem',
            marginBottom: '20px',
            animation: 'pulse 2s infinite'
          }}>
            ✂️
          </div>
          <h1 style={{
            fontSize: '2.5rem',
            fontWeight: 'bold',
            background: cores.gradients.gold,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '16px'
          }}>
            AGENDOU ADMIN
          </h1>
          <p style={{
            fontSize: '1.1rem',
            color: cores.neutral.light,
            marginBottom: '32px'
          }}>
            Carregando sistema administrativo...
          </p>
          <div style={{
            width: '60px',
            height: '4px',
            background: cores.gradients.gold,
            borderRadius: '2px',
            margin: '0 auto',
            animation: 'loading 1.5s infinite'
          }}></div>
        </div>

        <style jsx>{`
          @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.1); }
          }
          @keyframes loading {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
          }
        `}</style>
      </div>
    );
  }

  return null;
}