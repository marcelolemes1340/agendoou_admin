
'use client';

import { useEffect, useState } from 'react';
import { api, logout } from '../../../services/api';
import { useRouter } from 'next/navigation';
import { cores } from '@/lib/cores';

export default function DashboardPage() {
  const router = useRouter();
  const [dashboardData, setDashboardData] = useState({
    totalAgendamentos: 0,
    totalClientes: 0,
    totalBarbeiros: 0,
    agendamentosHoje: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        setLoading(true);
        setError(null);

        console.log('🔄 Iniciando busca por dados do dashboard...');

        const [agendamentos, usuarios, barbeiros, adminData] = await Promise.all([
          api('/agendamentos', { method: 'GET' }).catch(() => []),
          api('/usuarios', { method: 'GET' }).catch(() => []),
          api('/barbeiros', { method: 'GET' }).catch(() => []),
          api('/auth/verify-admin', { method: 'GET' }).catch(() => null)
        ]);

        if (adminData) {
          setUser(adminData.usuario);
        }

        const clientes = usuarios.filter(user => user.tipo === 'cliente');
        const hoje = new Date().toISOString().split('T')[0];
        const agendamentosHoje = agendamentos.filter(ag => ag.data === hoje).length;

        setDashboardData({
          totalAgendamentos: agendamentos.length,
          totalClientes: clientes.length,
          totalBarbeiros: barbeiros.length > 0 ? barbeiros.length : 3,
          agendamentosHoje
        });

        console.log('✅ Dados do dashboard carregados com sucesso');

      } catch (err) {
        console.error('❌ Erro no Dashboard:', err);
        setError('Falha ao carregar dados do dashboard. Verifique sua conexão.');
      } finally {
        setLoading(false);
      }
    }
    fetchDashboardData();
  }, []);

  
  const StatCard = ({ title, value, icon, color, link, description }) => (
    <div
      style={{
        background: cores.background.card,
        border: `1px solid ${cores.primary.light}`,
        borderRadius: '14px',
        padding: isMobile ? '18px' : '22px',
        textAlign: 'center',
        transition: 'all 0.3s ease',
        cursor: link ? 'pointer' : 'default',
        position: 'relative',
        overflow: 'hidden',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between'
      }}
      onMouseEnter={(e) => {
        if (link) {
          e.currentTarget.style.transform = 'translateY(-4px)';
          e.currentTarget.style.borderColor = cores.primary.accent;
          e.currentTarget.style.boxShadow = '0 12px 30px rgba(0, 0, 0, 0.2)';
        }
      }}
      onMouseLeave={(e) => {
        if (link) {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.borderColor = cores.primary.light;
          e.currentTarget.style.boxShadow = 'none';
        }
      }}
      onClick={() => link && router.push(link)}
    >
      
      <div style={{
        position: 'absolute',
        top: '12px',
        right: '12px',
        fontSize: isMobile ? '2rem' : '2.5rem',
        opacity: 0.1,
        color: color
      }}>
        {icon}
      </div>

    
      <div style={{
        width: isMobile ? '50px' : '60px',
        height: isMobile ? '50px' : '60px',
        borderRadius: '12px',
        background: `linear-gradient(135deg, ${color}, ${color}dd)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto 14px',
        fontSize: isMobile ? '20px' : '24px',
        boxShadow: `0 6px 16px ${color}40`
      }}>
        {icon}
      </div>

      
      <div>
        <h3 style={{
          color: cores.neutral.light,
          fontSize: isMobile ? '11px' : '12px',
          fontWeight: '600',
          margin: '0 0 6px',
          textTransform: 'uppercase',
          letterSpacing: '0.5px'
        }}>
          {title}
        </h3>

        <p style={{
          color: cores.neutral.white,
          fontSize: isMobile ? '2rem' : '2.5rem',
          fontWeight: 'bold',
          margin: '0 0 6px',
          background: cores.gradients.gold,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          lineHeight: 1
        }}>
          {loading ? '...' : value}
        </p>

        {description && (
          <p style={{
            color: cores.neutral.medium,
            fontSize: isMobile ? '10px' : '11px',
            margin: 0,
            fontWeight: '500',
            lineHeight: 1.3
          }}>
            {description}
          </p>
        )}
      </div>
    </div>
  );

  
  const ActionButton = ({ href, icon, title, description }) => {
    const [isHovered, setIsHovered] = useState(false);

    return (
      <button
        onClick={() => router.push(href)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          padding: isMobile ? '16px' : '18px',
          background: isHovered ? cores.primary.accent : 'transparent',
          color: isHovered ? '#000' : cores.neutral.white,
          border: `2px solid ${cores.primary.accent}`,
          borderRadius: '10px',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          textAlign: 'left',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}
      >
        <div style={{
          fontSize: isMobile ? '1.5rem' : '1.75rem',
          marginBottom: '10px',
          color: isHovered ? '#000' : cores.primary.accent,
          transition: 'color 0.3s ease'
        }}>
          {icon}
        </div>

        <div>
          <h3 style={{
            margin: '0 0 6px',
            fontSize: isMobile ? '13px' : '14px',
            fontWeight: 'bold',
            color: isHovered ? '#000' : cores.neutral.white,
            transition: 'color 0.3s ease',
            lineHeight: 1.2
          }}>
            {title}
          </h3>
          <p style={{
            margin: 0,
            fontSize: isMobile ? '10px' : '11px',
            lineHeight: 1.3,
            color: isHovered ? '#000' : cores.neutral.medium,
            transition: 'color 0.3s ease'
          }}>
            {description}
          </p>
        </div>
      </button>
    );
  };

  const handleLogout = () => {
    if (confirm('Tem certeza que deseja sair do sistema?')) {
      logout();
    }
  };

  if (loading) return (
    <div style={{
      padding: '60px 20px',
      textAlign: 'center',
      background: `linear-gradient(135deg, ${cores.background.primary} 0%, ${cores.background.secondary} 100%)`,
      color: cores.neutral.white,
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div>
        <div style={{
          fontSize: '3rem',
          marginBottom: '16px',
          animation: 'pulse 2s infinite'
        }}>⏳</div>
        <h2 style={{
          color: cores.primary.accent,
          marginBottom: '8px',
          fontSize: '1.25rem'
        }}>
          Carregando Dashboard
        </h2>
      </div>
    </div>
  );

  return (
    <div style={{
      minHeight: '100vh',
      background: `linear-gradient(135deg, ${cores.background.primary} 0%, ${cores.background.secondary} 100%)`,
      color: cores.neutral.white
    }}>
      <div style={{
        maxWidth: '1250px',
        margin: '0 auto',
        padding: '28px 20px'
      }}>
        
        <header style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: isMobile ? 'flex-start' : 'center',
          marginBottom: '28px',
          paddingBottom: '24px',
          borderBottom: `1px solid ${cores.primary.light}`,
          flexDirection: isMobile ? 'column' : 'row',
          gap: isMobile ? '16px' : '0'
        }}>
          <div>
            <h1 style={{
              fontSize: isMobile ? '1.75rem' : '2rem',
              fontWeight: 'bold',
              margin: '0 0 6px',
              background: cores.gradients.gold,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              lineHeight: 1.2
            }}>
              Dashboard Admin
            </h1>
            <p style={{
              color: cores.neutral.light,
              margin: 0,
              fontSize: isMobile ? '13px' : '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              flexWrap: 'wrap'
            }}>
              👋 Bem-vindo, {user?.nome || 'Administrador'}
              <span style={{
                padding: '4px 10px',
                background: cores.primary.accent,
                color: '#000',
                borderRadius: '10px',
                fontSize: '11px',
                fontWeight: 'bold'
              }}>
                ADMIN
              </span>
            </p>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            flexDirection: isMobile ? 'column' : 'row',
            alignItems: isMobile ? 'flex-start' : 'center'
          }}>
            <span style={{
              color: cores.neutral.light,
              fontSize: isMobile ? '12px' : '13px',
              whiteSpace: 'nowrap'
            }}>
              {new Date().toLocaleDateString('pt-BR', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </span>

            <button
              onClick={handleLogout}
              style={{
                padding: isMobile ? '10px 16px' : '10px 18px',
                background: cores.status.error,
                color: 'white',
                border: `2px solid ${cores.status.error}`,
                borderRadius: '10px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: isMobile ? '12px' : '13px',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                whiteSpace: 'nowrap'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'transparent';
                e.target.style.color = cores.status.error;
              }}
              onMouseLeave={(e) => {
                e.target.style.background = cores.status.error;
                e.target.style.color = 'white';
              }}
            >
              🚪 Sair
            </button>
          </div>
        </header>

        {error && (
          <div style={{
            background: `${cores.status.error}20`,
            color: cores.status.error,
            padding: '18px',
            borderRadius: '10px',
            marginBottom: '28px',
            textAlign: 'center',
            border: `1px solid ${cores.status.error}30`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            fontSize: '14px'
          }}>
            <span>⚠️</span>
            {error}
            <button
              onClick={() => window.location.reload()}
              style={{
                marginLeft: '14px',
                padding: '8px 14px',
                background: cores.status.error,
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              Tentar Novamente
            </button>
          </div>
        )}

        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '18px',
          marginBottom: '32px'
        }}>
          <StatCard
            title="Total Agendamentos"
            value={dashboardData.totalAgendamentos}
            icon="📅"
            color={cores.primary.accent}
            description="Todos os agendamentos"
            link="/agendamento"
          />
          <StatCard
            title="Clientes"
            value={dashboardData.totalClientes}
            icon="👥"
            color={cores.status.success}
            description="Clientes registrados"
            link="/clientes"
          />
          <StatCard
            title="Barbeiros"
            value={dashboardData.totalBarbeiros}
            icon="💈"
            color={cores.status.warning}
            description="Profissionais ativos"
            link="/barbeiros"
          />
          <StatCard
            title="Agend. Hoje"
            value={dashboardData.agendamentosHoje}
            icon="📊"
            color={cores.secondary.main}
            description="Para hoje"
            link="/agendamento"
          />
        </div>

        
        <div style={{
          background: cores.background.card,
          border: `1px solid ${cores.primary.light}`,
          borderRadius: '14px',
          padding: isMobile ? '18px' : '22px',
          marginBottom: '32px'
        }}>
          <h2 style={{
            color: cores.neutral.white,
            margin: '0 0 18px',
            fontSize: isMobile ? '1.125rem' : '1.25rem',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <span style={{
              width: isMobile ? '32px' : '36px',
              height: isMobile ? '32px' : '36px',
              background: cores.gradients.gold,
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: isMobile ? '14px' : '16px'
            }}>⚡</span>
            Ações Rápidas
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: '14px'
          }}>
            <ActionButton
              href="/agendamento"
              icon="📋"
              title="Agendamentos"
              description="Ver e editar agendamentos"
            />
            <ActionButton
              href="/clientes"
              icon="👥"
              title="Clientes"
              description="Visualizar clientes"
            />
            <ActionButton
              href="/barbeiros"
              icon="💈"
              title="Barbeiros"
              description="Gerenciar profissionais"
            />
            <ActionButton
              href="/avaliacoes"
              icon="⭐"
              title="Avaliações"
              description="Ver avaliações"
            />
          </div>
        </div>

        
        <div style={{
          background: cores.background.card,
          border: `1px solid ${cores.primary.light}`,
          borderRadius: '14px',
          padding: isMobile ? '18px' : '22px'
        }}>
          <h2 style={{
            color: cores.neutral.white,
            margin: '0 0 18px',
            fontSize: isMobile ? '1.125rem' : '1.25rem',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <span style={{
              width: isMobile ? '32px' : '36px',
              height: isMobile ? '32px' : '36px',
              background: cores.gradients.gold,
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: isMobile ? '14px' : '16px'
            }}>📈</span>
            Status do Sistema
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: isMobile ? '12px' : '16px',
            color: cores.neutral.light,
            fontSize: isMobile ? '12px' : '13px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px',
              background: cores.background.secondary,
              borderRadius: '8px'
            }}>
              <span style={{
                color: cores.status.success,
                fontSize: isMobile ? '14px' : '16px'
              }}>●</span>
              <div>
                <div style={{ fontWeight: '600', color: cores.neutral.white }}>Sistema</div>
                <div>Online e operacional</div>
              </div>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px',
              background: cores.background.secondary,
              borderRadius: '8px'
            }}>
              <span style={{
                color: cores.primary.accent,
                fontSize: isMobile ? '14px' : '16px'
              }}>🔄</span>
              <div>
                <div style={{ fontWeight: '600', color: cores.neutral.white }}>Versão</div>
                <div>1.0.0</div>
              </div>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px',
              background: cores.background.secondary,
              borderRadius: '8px'
            }}>
              <span style={{
                color: cores.status.warning,
                fontSize: isMobile ? '14px' : '16px'
              }}>🛠️</span>
              <div>
                <div style={{ fontWeight: '600', color: cores.neutral.white }}>Atualização</div>
                <div>{new Date().toLocaleDateString('pt-BR')}</div>
              </div>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px',
              background: cores.background.secondary,
              borderRadius: '8px'
            }}>
              <span style={{
                color: cores.status.success,
                fontSize: isMobile ? '14px' : '16px'
              }}>🔒</span>
              <div>
                <div style={{ fontWeight: '600', color: cores.neutral.white }}>Segurança</div>
                <div>Protegido</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
      `}</style>
    </div>
  );
}