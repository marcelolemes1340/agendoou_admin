
'use client';

import { useEffect, useState } from 'react';
import { api } from '../../../../services/api';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { cores } from '@/lib/cores';

const getStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case 'confirmado': return cores.status.success;
    case 'cancelado': return cores.status.error;
    case 'concluido': return cores.primary.accent;
    case 'pendente': default: return cores.status.warning;
  }
};

const getStatusIcon = (status) => {
  switch (status?.toLowerCase()) {
    case 'confirmado': return '✅';
    case 'cancelado': return '❌';
    case 'concluido': return '🎉';
    case 'pendente': default: return '⏳';
  }
};


const StatCard = ({ title, value, icon, color }) => (
  <div style={{
    padding: '16px',
    background: cores.background.card,
    border: `1px solid ${cores.primary.light}`,
    borderRadius: '10px',
    textAlign: 'center',
    transition: 'all 0.3s ease',
    minWidth: '120px'
  }}
    onMouseEnter={(e) => {
      e.currentTarget.style.background = cores.primary.light;
      e.currentTarget.style.borderColor = color;
      e.currentTarget.style.transform = 'translateY(-2px)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.background = cores.background.card;
      e.currentTarget.style.borderColor = cores.primary.light;
      e.currentTarget.style.transform = 'translateY(0)';
    }}
  >
    <div style={{
      fontSize: '1.5rem',
      marginBottom: '8px',
      color: color
    }}>
      {icon}
    </div>
    <div style={{
      fontSize: '1.25rem',
      fontWeight: 'bold',
      color: cores.neutral.white,
      marginBottom: '6px'
    }}>
      {value}
    </div>
    <div style={{
      fontSize: '11px',
      color: cores.neutral.light,
      fontWeight: '600'
    }}>
      {title}
    </div>
  </div>
);


const DetailItem = ({ title, value, icon, valueColor }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '16px',
        background: isHovered ? cores.primary.light : cores.background.secondary,
        borderRadius: '8px',
        transition: 'all 0.3s ease',
        border: `1px solid ${isHovered ? cores.primary.accent : cores.primary.light}`,
        cursor: 'pointer'
      }}
    >
      <span style={{
        fontSize: '18px',
        width: '32px',
        height: '32px',
        background: isHovered ? cores.primary.accent : cores.background.primary,
        borderRadius: '6px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: isHovered ? '#000' : cores.primary.accent,
        transition: 'all 0.3s ease'
      }}>
        {icon}
      </span>
      <div style={{ flex: 1 }}>
        <div style={{
          fontSize: '11px',
          color: isHovered ? cores.neutral.white : cores.neutral.light,
          fontWeight: '600',
          marginBottom: '4px',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          transition: 'color 0.3s ease'
        }}>
          {title}
        </div>
        <div style={{
          fontSize: '14px',
          color: isHovered ? cores.neutral.white : (valueColor || cores.neutral.white),
          fontWeight: 'bold',
          transition: 'color 0.3s ease'
        }}>
          {value}
        </div>
      </div>
    </div>
  );
};

const ActionButton = ({ icon, title, onClick, disabled = false }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        padding: '12px 14px',
        background: isHovered ? cores.primary.accent : 'transparent',
        color: isHovered ? '#000' : (disabled ? cores.neutral.medium : cores.neutral.white),
        border: `1px solid ${disabled ? cores.neutral.medium : cores.primary.accent}`,
        borderRadius: '8px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        textAlign: 'left',
        fontSize: '12px',
        transition: 'all 0.3s ease',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        width: '100%',
        opacity: disabled ? 0.5 : 1
      }}
    >
      <span style={{
        fontSize: '16px',
        color: isHovered ? '#000' : (disabled ? cores.neutral.medium : cores.primary.accent),
        transition: 'color 0.3s ease'
      }}>
        {icon}
      </span>
      <span style={{
        color: isHovered ? '#000' : (disabled ? cores.neutral.medium : cores.neutral.white),
        transition: 'color 0.3s ease',
        fontWeight: '600'
      }}>
        {title}
      </span>
    </button>
  );
};


const cardStyle = {
  padding: '20px',
  borderRadius: '12px',
  background: cores.background.card,
  border: `1px solid ${cores.primary.light}`,
  boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)'
};

export default function DetalheClientePage() {
  const { id } = useParams();
  const router = useRouter();
  const [cliente, setCliente] = useState(null);
  const [agendamentos, setAgendamentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('perfil');

  async function fetchData() {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const [clienteData, agendamentosData] = await Promise.all([
        api(`/usuarios/${id}`, { method: 'GET' }),
        api('/agendamentos', { method: 'GET' }).catch(() => [])
      ]);

      setCliente(clienteData);

      
      const agendamentosCliente = agendamentosData.filter(ag =>
        ag.email === clienteData.email || ag.telefone === clienteData.telefone
      );
      setAgendamentos(agendamentosCliente);
    } catch (err) {
      setError('Não foi possível carregar os detalhes do cliente.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, [id]);

  const formatData = (isoString) => {
    if (!isoString) return 'N/A';
    const date = new Date(isoString);
    return date.toLocaleDateString('pt-BR');
  };

  const formatDateTime = (isoString) => {
    if (!isoString) return 'N/A';
    const date = new Date(isoString);
    return date.toLocaleString('pt-BR');
  };

  
  const estatisticas = {
    totalAgendamentos: agendamentos.length,
    agendamentosConfirmados: agendamentos.filter(a => a.status === 'confirmado').length,
    agendamentosConcluidos: agendamentos.filter(a => a.status === 'concluido').length,
    agendamentosCancelados: agendamentos.filter(a => a.status === 'cancelado').length,
    agendamentosPendentes: agendamentos.filter(a => a.status === 'pendente').length,
    valorTotal: agendamentos.filter(a => a.status === 'concluido').length * 35 
  };


  
const DetailItemAmarelo = ({ title, value, icon }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '16px',
        background: isHovered ? cores.primary.light : cores.background.secondary,
        borderRadius: '8px',
        transition: 'all 0.3s ease',
        border: `2px solid ${isHovered ? cores.secondary.main : cores.primary.accent}`,
        cursor: 'pointer'
      }}
    >
      <span style={{
        fontSize: '18px',
        width: '32px',
        height: '32px',
        background: isHovered ? cores.secondary.main : cores.background.primary,
        borderRadius: '6px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: isHovered ? '#000' : cores.primary.accent,
        transition: 'all 0.3s ease'
      }}>
        {icon}
      </span>
      <div style={{ flex: 1 }}>
        <div style={{
          fontSize: '11px',
          color: isHovered ? cores.neutral.white : cores.neutral.light,
          fontWeight: '600',
          marginBottom: '4px',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          transition: 'color 0.3s ease'
        }}>
          {title}
        </div>
        <div style={{
          fontSize: '14px',
          color: isHovered ? cores.neutral.white : cores.neutral.white,
          fontWeight: 'bold',
          transition: 'color 0.3s ease'
        }}>
          {value}
        </div>
      </div>
    </div>
  );
};


 const StatCardAmarelo = ({ title, value, icon }) => (
  <div style={{
    padding: '16px',
    background: cores.background.card,
    border: `2px solid ${cores.primary.accent}`,
    borderRadius: '10px',
    textAlign: 'center',
    transition: 'all 0.3s ease'
  }}
    onMouseEnter={(e) => {
      e.currentTarget.style.background = cores.primary.light;
      e.currentTarget.style.borderColor = cores.secondary.main;
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.background = cores.background.card;
      e.currentTarget.style.borderColor = cores.primary.accent;
    }}
  >
    <div style={{
      fontSize: '1.5rem',
      marginBottom: '8px',
      color: cores.primary.accent
    }}>
      {icon}
    </div>
    <div style={{
      fontSize: '1.25rem',
      fontWeight: 'bold',
      color: cores.neutral.white,
      marginBottom: '6px'
    }}>
      {value}
    </div>
    <div style={{
      fontSize: '11px',
      color: cores.neutral.light,
      fontWeight: '600'
    }}>
      {title}
    </div>
  </div>
);

const StatCardVerde = ({ title, value, icon }) => (
  <div style={{
    padding: '16px',
    background: cores.background.card,
    border: `2px solid ${cores.status.success}`,
    borderRadius: '10px',
    textAlign: 'center',
    transition: 'all 0.3s ease'
  }}
    onMouseEnter={(e) => {
      e.currentTarget.style.background = cores.primary.light;
      e.currentTarget.style.borderColor = cores.primary.accent;
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.background = cores.background.card;
      e.currentTarget.style.borderColor = cores.status.success;
    }}
  >
    <div style={{
      fontSize: '1.5rem',
      marginBottom: '8px',
      color: cores.status.success
    }}>
      {icon}
    </div>
    <div style={{
      fontSize: '1.25rem',
      fontWeight: 'bold',
      color: cores.neutral.white,
      marginBottom: '6px'
    }}>
      {value}
    </div>
    <div style={{
      fontSize: '11px',
      color: cores.neutral.light,
      fontWeight: '600'
    }}>
      {title}
    </div>
  </div>
);

const StatCardLaranja = ({ title, value, icon }) => (
  <div style={{
    padding: '16px',
    background: cores.background.card,
    border: `2px solid ${cores.status.warning}`,
    borderRadius: '10px',
    textAlign: 'center',
    transition: 'all 0.3s ease'
  }}
    onMouseEnter={(e) => {
      e.currentTarget.style.background = cores.primary.light;
      e.currentTarget.style.borderColor = cores.primary.accent;
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.background = cores.background.card;
      e.currentTarget.style.borderColor = cores.status.warning;
    }}
  >
    <div style={{
      fontSize: '1.5rem',
      marginBottom: '8px',
      color: cores.status.warning
    }}>
      {icon}
    </div>
    <div style={{
      fontSize: '1.25rem',
      fontWeight: 'bold',
      color: cores.neutral.white,
      marginBottom: '6px'
    }}>
      {value}
    </div>
    <div style={{
      fontSize: '11px',
      color: cores.neutral.light,
      fontWeight: '600'
    }}>
      {title}
    </div>
  </div>
);

const StatCardVermelho = ({ title, value, icon }) => (
  <div style={{
    padding: '16px',
    background: cores.background.card,
    border: `2px solid ${cores.status.error}`,
    borderRadius: '10px',
    textAlign: 'center',
    transition: 'all 0.3s ease'
  }}
    onMouseEnter={(e) => {
      e.currentTarget.style.background = cores.primary.light;
      e.currentTarget.style.borderColor = cores.primary.accent;
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.background = cores.background.card;
      e.currentTarget.style.borderColor = cores.status.error;
    }}
  >
    <div style={{
      fontSize: '1.5rem',
      marginBottom: '8px',
      color: cores.status.error
    }}>
      {icon}
    </div>
    <div style={{
      fontSize: '1.25rem',
      fontWeight: 'bold',
      color: cores.neutral.white,
      marginBottom: '6px'
    }}>
      {value}
    </div>
    <div style={{
      fontSize: '11px',
      color: cores.neutral.light,
      fontWeight: '600'
    }}>
      {title}
    </div>
  </div>
);
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
          Carregando Detalhes
        </h2>
        <p style={{ color: cores.neutral.light, fontSize: '14px' }}>
          Buscando informações do cliente #{id}...
        </p>
      </div>
    </div>
  );

  if (error) return (
    <div style={{
      padding: '60px 20px',
      textAlign: 'center',
      background: `linear-gradient(135deg, ${cores.background.primary} 0%, ${cores.background.secondary} 100%)`,
      color: cores.status.error,
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div>
        <div style={{ fontSize: '3rem', marginBottom: '16px' }}>❌</div>
        <h2 style={{ marginBottom: '12px', fontSize: '1.25rem' }}>
          Erro ao Carregar
        </h2>
        <p style={{
          color: cores.neutral.light,
          marginBottom: '24px',
          maxWidth: '400px',
          fontSize: '14px'
        }}>
          {error}
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <button
            onClick={() => router.push('/clientes')}
            style={{
              padding: '10px 20px',
              background: 'transparent',
              color: cores.neutral.white,
              border: `1px solid ${cores.primary.light}`,
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '14px',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = cores.primary.light;
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'transparent';
            }}
          >
            ← Voltar
          </button>
          <button
            onClick={fetchData}
            style={{
              padding: '10px 20px',
              background: 'transparent',
              color: cores.primary.accent,
              border: `1px solid ${cores.primary.accent}`,
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '14px',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = cores.primary.accent;
              e.target.style.color = '#000';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'transparent';
              e.target.style.color = cores.primary.accent;
            }}
          >
            🔄 Tentar Novamente
          </button>
        </div>
      </div>
    </div>
  );

  if (!cliente) return (
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
        <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🔍</div>
        <h2 style={{ marginBottom: '12px', fontSize: '1.25rem' }}>
          Cliente Não Encontrado
        </h2>
        <p style={{
          color: cores.neutral.light,
          marginBottom: '24px',
          fontSize: '14px'
        }}>
          O cliente #{id} não foi encontrado no sistema.
        </p>
        <button
          onClick={() => router.push('/clientes')}
          style={{
            padding: '10px 20px',
            background: cores.primary.accent,
            color: '#000',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '14px',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = '0 4px 12px rgba(212, 175, 55, 0.3)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = 'none';
          }}
        >
          ← Voltar para Lista
        </button>
      </div>
    </div>
  );

return (
    <div style={{
      background: `linear-gradient(135deg, ${cores.background.primary} 0%, ${cores.background.secondary} 100%)`,
      minHeight: '100vh',
      color: cores.neutral.white
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '20px 16px'
      }}>
      
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '24px',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <div>
            <Link href="/clientes" style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              color: cores.neutral.white,
              textDecoration: 'none',
              marginBottom: '8px',
              fontSize: '12px',
              fontWeight: '600',
              transition: 'all 0.3s ease',
              padding: '8px 12px',
              borderRadius: '6px',
              background: cores.primary.accent,
              color: '#000',
              border: `1px solid ${cores.primary.accent}`,
            }}
              onMouseEnter={(e) => {
                e.target.style.background = 'transparent';
                e.target.style.color = cores.primary.accent;
              }}
              onMouseLeave={(e) => {
                e.target.style.background = cores.primary.accent;
                e.target.style.color = '#000';
              }}
            >
              ← Voltar
            </Link>
            <h1 style={{
              margin: 0,
              fontSize: '1.5rem',
              fontWeight: 'bold',
              background: cores.gradients.gold,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              marginBottom: '4px'
            }}>
              Perfil do Cliente
            </h1>
            <p style={{
              margin: 0,
              color: cores.neutral.light,
              fontSize: '13px'
            }}>
              ID: <strong>#{id}</strong> • {cliente.tipo === 'admin' ? 'Administrador' : 'Cliente'}
            </p>
          </div>

          
          <div style={{
            padding: '10px 16px',
            background: cliente.isAdmin ? cores.primary.accent + '20' : cores.status.success + '20',
            color: cliente.isAdmin ? cores.primary.accent : cores.status.success,
            border: `2px solid ${cliente.isAdmin ? cores.primary.accent : cores.status.success}`,
            borderRadius: '12px',
            fontWeight: 'bold',
            fontSize: '12px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <span style={{ fontSize: '14px' }}>
              {cliente.isAdmin ? '👨‍💼' : '👤'}
            </span>
            {cliente.isAdmin ? 'Admin' : 'Cliente Ativo'}
          </div>
        </div>

        
        <div style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '24px',
          borderBottom: `1px solid ${cores.primary.light}`,
          paddingBottom: '16px'
        }}>
          <button
            onClick={() => setActiveTab('perfil')}
            style={{
              padding: '12px 20px',
              background: activeTab === 'perfil' ? cores.primary.accent : 'transparent',
              color: activeTab === 'perfil' ? '#000' : cores.neutral.light,
              border: `1px solid ${activeTab === 'perfil' ? cores.primary.accent : cores.primary.light}`,
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '13px',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <span style={{ fontSize: '16px' }}>👤</span>
            Perfil
          </button>
          <button
            onClick={() => setActiveTab('agendamentos')}
            style={{
              padding: '12px 20px',
              background: activeTab === 'agendamentos' ? cores.primary.accent : 'transparent',
              color: activeTab === 'agendamentos' ? '#000' : cores.neutral.light,
              border: `1px solid ${activeTab === 'agendamentos' ? cores.primary.accent : cores.primary.light}`,
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '13px',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <span style={{ fontSize: '16px' }}>📅</span>
            Agendamentos ({agendamentos.length})
          </button>
          <button
            onClick={() => setActiveTab('estatisticas')}
            style={{
              padding: '12px 20px',
              background: activeTab === 'estatisticas' ? cores.primary.accent : 'transparent',
              color: activeTab === 'estatisticas' ? '#000' : cores.neutral.light,
              border: `1px solid ${activeTab === 'estatisticas' ? cores.primary.accent : cores.primary.light}`,
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '13px',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <span style={{ fontSize: '16px' }}>📊</span>
            Estatísticas
          </button>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: activeTab === 'agendamentos' ? '1fr' : '2fr 1fr',
          gap: '24px',
          alignItems: 'start'
        }}>
          
          <div>
            {activeTab === 'perfil' && (
              <div style={{
                padding: '20px',
                borderRadius: '12px',
                background: cores.background.card,
                border: `2px solid ${cores.primary.accent}`,
                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)'
              }}>
                <h2 style={{
                  color: cores.neutral.white,
                  margin: '0 0 20px',
                  fontSize: '1.25rem',
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}>
                  <span style={{
                    width: '40px',
                    height: '40px',
                    background: cores.gradients.gold,
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '16px'
                  }}>👤</span>
                  Informações do {cliente.tipo === 'admin' ? 'Administrador' : 'Cliente'}
                </h2>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '16px',
                  marginBottom: '24px'
                }}>
                  <DetailItemAmarelo
                    title="Nome Completo"
                    value={cliente.nome}
                    icon="👤"
                  />
                  <DetailItemAmarelo
                    title="Email"
                    value={cliente.email}
                    icon="📧"
                  />
                  <DetailItemAmarelo
                    title="Telefone"
                    value={cliente.telefone || "Não informado"}
                    icon="📞"
                  />
                  <DetailItemAmarelo
                    title="CPF"
                    value={cliente.cpf || "Não informado"}
                    icon="🔐"
                  />
                  <DetailItemAmarelo
                    title="Tipo de Usuário"
                    value={cliente.tipo === 'admin' ? 'Administrador' : 'Cliente'}
                    icon={cliente.tipo === 'admin' ? '👨‍💼' : '👥'}
                  />
                  <DetailItemAmarelo
                    title="Data de Cadastro"
                    value={formatDateTime(cliente.criadoEm)}
                    icon="📅"
                  />
                </div>

                
                <div style={{
                  marginTop: '16px',
                  padding: '16px',
                  background: cores.background.secondary,
                  borderRadius: '8px',
                  border: `1px solid ${cores.primary.light}`
                }}>
                  <h4 style={{
                    color: cores.neutral.white,
                    margin: '0 0 8px',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    <span style={{ fontSize: '16px' }}>📊</span>
                    Resumo de Agendamentos:
                  </h4>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: '8px',
                    color: cores.neutral.light,
                    fontSize: '12px'
                  }}>
                    <div>Total: <strong style={{ color: cores.primary.accent }}>{estatisticas.totalAgendamentos}</strong></div>
                    <div>Confirmados: <strong style={{ color: cores.status.success }}>{estatisticas.agendamentosConfirmados}</strong></div>
                    <div>Concluídos: <strong style={{ color: cores.primary.accent }}>{estatisticas.agendamentosConcluidos}</strong></div>
                    <div>Pendentes: <strong style={{ color: cores.status.warning }}>{estatisticas.agendamentosPendentes}</strong></div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'agendamentos' && (
              <div style={{
                padding: '20px',
                borderRadius: '12px',
                background: cores.background.card,
                border: `2px solid ${cores.primary.accent}`,
                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)'
              }}>
                <h2 style={{
                  color: cores.neutral.white,
                  margin: '0 0 20px',
                  fontSize: '1.25rem',
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}>
                  <span style={{
                    width: '40px',
                    height: '40px',
                    background: cores.gradients.gold,
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '16px'
                  }}>📅</span>
                  Histórico de Agendamentos
                </h2>

                {agendamentos.length === 0 ? (
                  <div style={{
                    textAlign: 'center',
                    padding: '40px 20px',
                    color: cores.neutral.light
                  }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: '12px', opacity: 0.5 }}>📭</div>
                    <h3 style={{ color: cores.neutral.white, marginBottom: '6px', fontSize: '1rem' }}>
                      Nenhum agendamento
                    </h3>
                    <p style={{ fontSize: '13px' }}>Este cliente ainda não realizou nenhum agendamento.</p>
                  </div>
                ) : (
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px'
                  }}>
                    {agendamentos.map((agendamento) => (
                      <div
                        key={agendamento.id}
                        style={{
                          padding: '16px',
                          background: cores.background.secondary,
                          borderRadius: '8px',
                          border: `2px solid ${getStatusColor(agendamento.status)}`,
                          transition: 'all 0.3s ease',
                          cursor: 'pointer'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = cores.primary.light;
                          e.currentTarget.style.borderColor = cores.primary.accent;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = cores.background.secondary;
                          e.currentTarget.style.borderColor = getStatusColor(agendamento.status);
                        }}
                        onClick={() => router.push(`/agendamento/${agendamento.id}`)}
                      >
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                          marginBottom: '8px'
                        }}>
                          <div>
                            <h4 style={{
                              color: cores.neutral.white,
                              margin: '0 0 4px',
                              fontSize: '14px',
                              fontWeight: 'bold'
                            }}>
                              {agendamento.servico}
                            </h4>
                            <p style={{
                              color: cores.neutral.light,
                              margin: 0,
                              fontSize: '12px'
                            }}>
                              com {agendamento.profissional}
                            </p>
                          </div>
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '4px 8px',
                            borderRadius: '12px',
                            background: getStatusColor(agendamento.status) + '20',
                            color: getStatusColor(agendamento.status),
                            border: `1px solid ${getStatusColor(agendamento.status)}`,
                            fontSize: '10px',
                            fontWeight: 'bold',
                            textTransform: 'uppercase'
                          }}>
                            {getStatusIcon(agendamento.status)}
                            {agendamento.status}
                          </span>
                        </div>
                        
                        <div style={{
                          display: 'grid',
                          gridTemplateColumns: '1fr 1fr',
                          gap: '8px',
                          fontSize: '11px',
                          color: cores.neutral.light,
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <span>📅</span>
                            {formatData(agendamento.data)}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <span>⏰</span>
                            {agendamento.horario}
                          </div>
                        </div>

                        {agendamento.observacoes && (
                          <div style={{
                            marginTop: '8px',
                            padding: '8px',
                            background: cores.background.primary,
                            borderRadius: '6px',
                            borderLeft: `3px solid ${cores.primary.accent}`
                          }}>
                            <p style={{
                              margin: 0,
                              fontSize: '11px',
                              color: cores.neutral.light,
                              fontStyle: 'italic'
                            }}>
                              {agendamento.observacoes}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'estatisticas' && (
              <div style={{
                padding: '20px',
                borderRadius: '12px',
                background: cores.background.card,
                border: `2px solid ${cores.primary.accent}`,
                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)'
              }}>
                <h2 style={{
                  color: cores.neutral.white,
                  margin: '0 0 20px',
                  fontSize: '1.25rem',
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}>
                  <span style={{
                    width: '40px',
                    height: '40px',
                    background: cores.gradients.gold,
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '16px'
                  }}>📊</span>
                  Estatísticas do Cliente
                </h2>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '16px',
                  marginBottom: '24px'
                }}>
                  <StatCardAmarelo
                    title="Total de Agendamentos"
                    value={estatisticas.totalAgendamentos}
                    icon="📅"
                  />
                  <StatCardVerde
                    title="Agendamentos Concluídos"
                    value={estatisticas.agendamentosConcluidos}
                    icon="✅"
                  />
                  <StatCardLaranja
                    title="Agendamentos Pendentes"
                    value={estatisticas.agendamentosPendentes}
                    icon="⏳"
                  />
                  <StatCardVermelho
                    title="Agendamentos Cancelados"
                    value={estatisticas.agendamentosCancelados}
                    icon="❌"
                  />
                </div>

                
                <div style={{
                  padding: '16px',
                  background: cores.background.secondary,
                  borderRadius: '8px',
                  border: `1px solid ${cores.primary.light}`
                }}>
                  <h4 style={{
                    color: cores.neutral.white,
                    margin: '0 0 12px',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    <span style={{ fontSize: '16px' }}>ℹ️</span>
                    Informações Adicionais
                  </h4>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '8px',
                    fontSize: '12px',
                    color: cores.neutral.light
                  }}>
                    <div>
                      <strong>Taxa de Conclusão:</strong>{' '}
                      {estatisticas.totalAgendamentos > 0 
                        ? `${Math.round((estatisticas.agendamentosConcluidos / estatisticas.totalAgendamentos) * 100)}%`
                        : '0%'
                      }
                    </div>
                    <div>
                      <strong>Cliente desde:</strong> {formatData(cliente.criadoEm)}
                    </div>
                    <div>
                      <strong>Valor Estimado:</strong> R$ {estatisticas.valorTotal},00
                    </div>
                    <div>
                      <strong>Status:</strong> {cliente.isAdmin ? 'Admin' : 'Ativo'}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          
          {activeTab !== 'agendamentos' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
              <div style={{
                padding: '20px',
                borderRadius: '12px',
                background: cores.background.card,
                border: `2px solid ${cores.primary.accent}`,
                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)'
              }}>
                <h3 style={{
                  color: cores.neutral.white,
                  margin: '0 0 16px',
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <span style={{ fontSize: '16px' }}>👤</span>
                  Resumo do {cliente.tipo === 'admin' ? 'Admin' : 'Cliente'}
                </h3>

                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '12px',
                    background: cores.background.secondary,
                    borderRadius: '8px',
                    border: `2px solid ${cores.primary.accent}`
                  }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      background: cores.gradients.gold,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '16px',
                      fontWeight: 'bold',
                      color: '#000'
                    }}>
                      {cliente.nome?.charAt(0)?.toUpperCase() || 'C'}
                    </div>
                    <div>
                      <div style={{ fontWeight: 'bold', color: cores.neutral.white, fontSize: '14px' }}>
                        {cliente.nome}
                      </div>
                      <div style={{ fontSize: '11px', color: cores.neutral.light }}>
                        {cliente.tipo === 'admin' ? 'Administrador' : 'Cliente'}
                      </div>
                    </div>
                  </div>

                  <div style={{
                    padding: '12px',
                    background: cores.background.secondary,
                    borderRadius: '8px',
                    border: `2px solid ${cores.primary.accent}`
                  }}>
                    <div style={{
                      fontSize: '11px',
                      color: cores.neutral.light,
                      marginBottom: '6px',
                      fontWeight: '600'
                    }}>
                      📅 AGENDAMENTOS
                    </div>
                    <div style={{
                      fontSize: '20px',
                      fontWeight: 'bold',
                      color: cores.primary.accent,
                      textAlign: 'center'
                    }}>
                      {estatisticas.totalAgendamentos}
                    </div>
                  </div>
                </div>
              </div>

              
              <div style={{ 
                padding: '20px',
                borderRadius: '12px',
                background: cores.background.card,
                border: `2px solid ${cores.primary.accent}`,
                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
                marginTop: '2px'
              }}>
                <h3 style={{
                  color: cores.neutral.white,
                  margin: '0 0 16px',
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <span style={{ fontSize: '16px' }}>🎯</span>
                  Ações Rápidas
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <ActionButton
                    icon="📧"
                    title="Enviar Email"
                    onClick={() => window.open(`mailto:${cliente.email}`, '_blank')}
                  />
                  <ActionButton
                    icon="📞"
                    title="Ligar"
                    onClick={() => cliente.telefone && window.open(`tel:${cliente.telefone}`, '_blank')}
                    disabled={!cliente.telefone}
                  />
                  <ActionButton
                    icon="📋"
                    title="Ver Agendamentos"
                    onClick={() => setActiveTab('agendamentos')}
                  />
                </div>
              </div>
            </div>
          )}
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