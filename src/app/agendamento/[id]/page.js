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

export default function DetalheAgendamentoPage() {
  const { id } = useParams();
  const router = useRouter();
  const [agendamento, setAgendamento] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusNovo, setStatusNovo] = useState('');
  const [updateLoading, setUpdateLoading] = useState(false);
  const [error, setError] = useState(null);
  const [updateError, setUpdateError] = useState(null);
  const [activeTab, setActiveTab] = useState('agendamento');
  const [agendamentos, setAgendamentos] = useState([]);
  const [isMobile, setIsMobile] = useState(false);

  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  async function fetchAgendamento() {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      console.log('🔄 Buscando detalhes do agendamento...');
      
      const [agendamentoData, allAgendamentos] = await Promise.all([
        api(`/agendamentos/${id}`, { method: 'GET' }),
        api('/agendamentos', { method: 'GET' }).catch(() => [])
      ]);

      setAgendamento(agendamentoData);
      setStatusNovo(agendamentoData.status);
      setAgendamentos(allAgendamentos);

      console.log('✅ Detalhes do agendamento carregados com sucesso');

    } catch (err) {
      console.error('❌ Erro ao buscar agendamento:', err);
      setError('Não foi possível carregar os detalhes do agendamento. Verifique sua conexão.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchAgendamento();
  }, [id]);

  async function handleUpdateStatus(e) {
    e.preventDefault();
    setUpdateLoading(true);
    setUpdateError(null);
    try {
      console.log('🔄 Atualizando status para:', statusNovo);
      
      const response = await api(`/agendamentos/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: statusNovo }),
      });

      console.log('✅ Resposta da atualização:', response);

     
      if (response && response.agendamento) {
        setAgendamento(response.agendamento);
        
        
        showNotification(`Status atualizado para: ${response.agendamento.status.toUpperCase()}`, getStatusColor(statusNovo), getStatusIcon(statusNovo));
      } else {
        
        console.log('🔄 Estrutura de resposta diferente do esperado, recarregando dados...');
        await fetchAgendamento();
        showNotification('Status atualizado com sucesso!', getStatusColor(statusNovo), getStatusIcon(statusNovo));
      }

    } catch (err) {
      console.error('❌ Erro ao atualizar status:', err);
      setUpdateError('Falha ao atualizar o status. Tente novamente.');
      showNotification('Erro ao atualizar status', cores.status.error, '⚠️');
    } finally {
      setUpdateLoading(false);
    }
  }

  
  const showNotification = (message, color, icon) => {
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 24px;
      right: 24px;
      padding: 16px 20px;
      background: ${color};
      color: ${color === cores.status.error ? 'white' : '#000'};
      border-radius: 10px;
      font-weight: bold;
      z-index: 1000;
      animation: slideIn 0.4s ease;
      box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
      border: 2px solid ${color}80;
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;
      max-width: 300px;
    `;
    notification.innerHTML = `
      <span style="font-size: 16px;">${icon}</span>
      ${message}
    `;
    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.animation = 'slideOut 0.4s ease';
      setTimeout(() => notification.remove(), 400);
    }, 3000);
  };

  const formatData = (data) => {
    if (!data) return 'N/A';
    if (data.includes('/')) return data;
    return new Date(data + 'T00:00:00').toLocaleDateString('pt-BR');
  };

  const formatHorario = (hora) => hora || 'N/A';
  
  const formatDateTime = (isoString) => {
    if (!isoString) return 'N/A';
    return new Date(isoString).toLocaleString('pt-BR');
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
          Carregando Agendamento
        </h2>
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
        maxWidth: '1250px',
        margin: '0 auto',
        padding: '28px 20px'
      }}>
        {}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: isMobile ? 'flex-start' : 'center',
          marginBottom: '28px',
          flexDirection: isMobile ? 'column' : 'row',
          gap: isMobile ? '16px' : '0'
        }}>
          <div>
            <Link href="/agendamento" style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              color: cores.neutral.white,
              textDecoration: 'none',
              marginBottom: '10px',
              fontSize: '14px',
              fontWeight: '600',
              transition: 'all 0.3s ease',
              padding: '10px 16px',
              borderRadius: '10px',
              background: cores.primary.accent,
              color: '#000',
              border: `2px solid ${cores.primary.accent}`,
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
              fontSize: isMobile ? '1.5rem' : '1.875rem',
              fontWeight: 'bold',
              background: cores.gradients.gold,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              marginBottom: '6px',
              lineHeight: 1.2
            }}>
              Detalhes do Agendamento
            </h1>
            <p style={{
              margin: 0,
              color: cores.neutral.light,
              fontSize: isMobile ? '13px' : '14px'
            }}>
              ID: <strong>#{id}</strong> • Cliente: <strong>{agendamento?.nome}</strong>
            </p>
          </div>

          {}
          {agendamento && (
            <div style={{
              padding: isMobile ? '10px 16px' : '12px 20px',
              background: getStatusColor(agendamento.status) + '20',
              color: getStatusColor(agendamento.status),
              border: `2px solid ${getStatusColor(agendamento.status)}`,
              borderRadius: '12px',
              fontWeight: 'bold',
              fontSize: isMobile ? '12px' : '13px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              whiteSpace: 'nowrap'
            }}>
              <span style={{ fontSize: '16px' }}>
                {getStatusIcon(agendamento.status)}
              </span>
              {agendamento.status}
            </div>
          )}
        </div>

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
              onClick={fetchAgendamento}
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

        {}
        <div style={{
          display: 'flex',
          gap: '10px',
          marginBottom: '28px',
          borderBottom: `1px solid ${cores.primary.light}`,
          paddingBottom: '18px',
          flexWrap: isMobile ? 'wrap' : 'nowrap'
        }}>
          <button
            onClick={() => setActiveTab('agendamento')}
            style={{
              padding: isMobile ? '12px 16px' : '14px 20px',
              background: activeTab === 'agendamento' ? cores.primary.accent : 'transparent',
              color: activeTab === 'agendamento' ? '#000' : cores.neutral.light,
              border: `2px solid ${activeTab === 'agendamento' ? cores.primary.accent : cores.primary.light}`,
              borderRadius: '10px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: isMobile ? '13px' : '14px',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              flex: isMobile ? 1 : 'none'
            }}
            onMouseEnter={(e) => {
              if (activeTab !== 'agendamento') {
                e.target.style.background = cores.primary.light;
                e.target.style.color = cores.neutral.white;
              }
            }}
            onMouseLeave={(e) => {
              if (activeTab !== 'agendamento') {
                e.target.style.background = 'transparent';
                e.target.style.color = cores.neutral.light;
              }
            }}
          >
            <span style={{ fontSize: '16px' }}>📋</span>
            {isMobile ? 'Agendamento' : 'Informações'}
          </button>
          <button
            onClick={() => setActiveTab('cliente')}
            style={{
              padding: isMobile ? '12px 16px' : '14px 20px',
              background: activeTab === 'cliente' ? cores.primary.accent : 'transparent',
              color: activeTab === 'cliente' ? '#000' : cores.neutral.light,
              border: `2px solid ${activeTab === 'cliente' ? cores.primary.accent : cores.primary.light}`,
              borderRadius: '10px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: isMobile ? '13px' : '14px',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              flex: isMobile ? 1 : 'none'
            }}
            onMouseEnter={(e) => {
              if (activeTab !== 'cliente') {
                e.target.style.background = cores.primary.light;
                e.target.style.color = cores.neutral.white;
              }
            }}
            onMouseLeave={(e) => {
              if (activeTab !== 'cliente') {
                e.target.style.background = 'transparent';
                e.target.style.color = cores.neutral.light;
              }
            }}
          >
            <span style={{ fontSize: '16px' }}>👤</span>
            {isMobile ? 'Cliente' : 'Dados do Cliente'}
          </button>
        </div>

        {agendamento && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : '2fr 1fr',
            gap: '28px',
            alignItems: 'start'
          }}>
            <div>
              {activeTab === 'agendamento' && (
                <div style={cardStyle}>
                  <h2 style={{
                    color: cores.neutral.white,
                    margin: '0 0 22px',
                    fontSize: isMobile ? '1.25rem' : '1.5rem',
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                  }}>
                    <span style={{
                      width: isMobile ? '40px' : '44px',
                      height: isMobile ? '40px' : '44px',
                      background: cores.gradients.gold,
                      borderRadius: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: isMobile ? '16px' : '18px'
                    }}>📋</span>
                    Detalhes do Serviço
                  </h2>

                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
                    gap: '16px',
                    marginBottom: '24px'
                  }}>
                    <DetailItem
                      title="Serviço Solicitado"
                      value={agendamento.servico}
                      icon="✂️"
                      isMobile={isMobile}
                    />
                    <DetailItem
                      title="Profissional"
                      value={agendamento.profissional}
                      icon="👨‍💼"
                      isMobile={isMobile}
                    />
                    <DetailItem
                      title="Data do Agendamento"
                      value={formatData(agendamento.data)}
                      icon="📅"
                      isMobile={isMobile}
                    />
                    <DetailItem
                      title="Horário"
                      value={formatHorario(agendamento.horario)}
                      icon="⏰"
                      isMobile={isMobile}
                    />
                    <DetailItem
                      title="Data de Criação"
                      value={formatDateTime(agendamento.criadoEm)}
                      icon="🕒"
                      isMobile={isMobile}
                    />
                    {agendamento.atualizadoEm && (
                      <DetailItem
                        title="Última Atualização"
                        value={formatDateTime(agendamento.atualizadoEm)}
                        icon="🔄"
                        isMobile={isMobile}
                      />
                    )}
                  </div>

                  {agendamento.observacoes && (
                    <div style={{
                      marginTop: '20px',
                      padding: '18px',
                      background: cores.primary.light,
                      borderRadius: '10px',
                      borderLeft: `4px solid ${cores.primary.accent}`
                    }}>
                      <h4 style={{
                        color: cores.neutral.white,
                        margin: '0 0 10px',
                        fontSize: isMobile ? '14px' : '15px',
                        fontWeight: 'bold',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}>
                        <span style={{ fontSize: '16px' }}>📝</span>
                        Observações:
                      </h4>
                      <p style={{
                        color: cores.neutral.light,
                        margin: 0,
                        fontSize: isMobile ? '13px' : '14px',
                        lineHeight: '1.5'
                      }}>
                        {agendamento.observacoes}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'cliente' && (
                <div style={cardStyle}>
                  <h2 style={{
                    color: cores.neutral.white,
                    margin: '0 0 22px',
                    fontSize: isMobile ? '1.25rem' : '1.5rem',
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                  }}>
                    <span style={{
                      width: isMobile ? '40px' : '44px',
                      height: isMobile ? '40px' : '44px',
                      background: cores.status.success,
                      borderRadius: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: isMobile ? '16px' : '18px'
                    }}>👤</span>
                    Informações do Cliente
                  </h2>

                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
                    gap: '16px',
                    marginBottom: '24px'
                  }}>
                    <DetailItem
                      title="Nome do Cliente"
                      value={agendamento.nome}
                      icon="👤"
                      isMobile={isMobile}
                    />
                    <DetailItem
                      title="E-mail"
                      value={agendamento.email || "Não informado"}
                      icon="📧"
                      isMobile={isMobile}
                    />
                    <DetailItem
                      title="Telefone"
                      value={agendamento.telefone || "Não informado"}
                      icon="📞"
                      isMobile={isMobile}
                    />
                    <DetailItem
                      title="Status do Cliente"
                      value="Ativo"
                      icon="✅"
                      valueColor={cores.status.success}
                      isMobile={isMobile}
                    />
                  </div>

                  <div style={{
                    marginTop: '20px',
                    padding: '18px',
                    background: `linear-gradient(135deg, ${cores.primary.light} 0%, ${cores.background.secondary} 100%)`,
                    borderRadius: '10px',
                    border: `2px solid ${cores.primary.accent}30`
                  }}>
                    <h4 style={{
                      color: cores.neutral.white,
                      margin: '0 0 10px',
                      fontSize: isMobile ? '14px' : '15px',
                      fontWeight: 'bold',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      <span style={{ fontSize: '16px' }}>📊</span>
                      Histórico Rápido:
                    </h4>
                    <p style={{
                      color: cores.neutral.light,
                      margin: 0,
                      fontSize: isMobile ? '13px' : '14px'
                    }}>
                      Este cliente possui <strong style={{ color: cores.primary.accent }}>
                        {agendamentos.filter(a => a.email === agendamento.email).length}
                      </strong> agendamento(s) no sistema.
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div>
              <div style={cardStyle}>
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
                  Atualizar Status
                </h2>

                <form onSubmit={handleUpdateStatus}>
                  <label style={{ display: 'grid', gap: '10px', marginBottom: '18px' }}>
                    <div style={{
                      fontWeight: 'bold',
                      color: cores.neutral.light,
                      fontSize: isMobile ? '13px' : '14px'
                    }}>
                      Novo Status:
                    </div>
                    <select
                      value={statusNovo}
                      onChange={(e) => setStatusNovo(e.target.value)}
                      style={selectStyle}
                      disabled={updateLoading}
                    >
                      <option value="pendente">⏳ Pendente</option>
                      <option value="confirmado">✅ Confirmado</option>
                      <option value="concluido">🎉 Concluído</option>
                      <option value="cancelado">❌ Cancelado</option>
                    </select>
                  </label>

                  {updateError && (
                    <div style={{
                      color: cores.status.error,
                      fontSize: isMobile ? '12px' : '13px',
                      marginBottom: '16px',
                      padding: '14px',
                      background: `${cores.status.error}20`,
                      borderRadius: '8px',
                      border: `2px solid ${cores.status.error}`,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      <span style={{ fontSize: '16px' }}>⚠️</span>
                      {updateError}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={updateLoading || agendamento.status === statusNovo}
                    style={updateButtonStyle(updateLoading, agendamento.status === statusNovo, isMobile)}
                  >
                    {updateLoading ? (
                      <>
                        <span style={{
                          animation: 'spin 1s linear infinite',
                          display: 'inline-block',
                          fontSize: '14px'
                        }}>⏳</span>
                        Atualizando...
                      </>
                    ) : agendamento.status === statusNovo ? (
                      '✅ Status Atual'
                    ) : (
                      '💾 Salvar Alteração'
                    )}
                  </button>
                </form>
              </div>

              <div style={cardStyle}>
                <h3 style={{
                  color: cores.neutral.white,
                  margin: '0 0 16px',
                  fontSize: isMobile ? '1rem' : '1.125rem',
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <span style={{ fontSize: '18px' }}>🎯</span>
                  Ações Rápidas
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <ActionButton
                    icon="🖨️"
                    title="Imprimir Detalhes"
                    onClick={() => window.print()}
                    isMobile={isMobile}
                  />
                  <ActionButton
                    icon="📋"
                    title="Copiar Link"
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.href);
                      showNotification('Link copiado!', cores.primary.accent, '📋');
                    }}
                    isMobile={isMobile}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
          from { transform: translateX(0); opacity: 1; }
          to { transform: translateX(100%); opacity: 0; }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
      `}</style>
    </div>
  );
}

const DetailItem = ({ title, value, icon, valueColor, isMobile }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: isMobile ? '12px' : '14px',
        padding: isMobile ? '16px' : '18px',
        background: isHovered ? cores.primary.light : cores.background.secondary,
        borderRadius: '10px',
        transition: 'all 0.3s ease',
        border: `2px solid ${isHovered ? cores.primary.accent : cores.primary.light}`,
        cursor: 'pointer'
      }}
    >
      <span style={{
        fontSize: isMobile ? '20px' : '22px',
        width: isMobile ? '36px' : '40px',
        height: isMobile ? '36px' : '40px',
        background: isHovered ? cores.primary.accent : cores.background.primary,
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: isHovered ? '#000' : cores.primary.accent,
        transition: 'all 0.3s ease',
        flexShrink: 0
      }}>
        {icon}
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: isMobile ? '11px' : '12px',
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
          fontSize: isMobile ? '14px' : '15px',
          color: isHovered ? cores.neutral.white : (valueColor || cores.neutral.white),
          fontWeight: 'bold',
          transition: 'color 0.3s ease',
          wordBreak: 'break-word'
        }}>
          {value}
        </div>
      </div>
    </div>
  );
};

const ActionButton = ({ icon, title, onClick, isMobile }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        padding: isMobile ? '14px 16px' : '14px 18px',
        background: isHovered ? cores.primary.accent : 'transparent',
        color: isHovered ? '#000' : cores.neutral.white,
        border: `2px solid ${cores.primary.accent}`,
        borderRadius: '8px',
        cursor: 'pointer',
        textAlign: 'left',
        fontSize: isMobile ? '13px' : '14px',
        transition: 'all 0.3s ease',
        display: 'flex',
        alignItems: 'center',
        gap: isMobile ? '10px' : '12px',
        width: '100%'
      }}
    >
      <span style={{
        fontSize: isMobile ? '18px' : '20px',
        color: isHovered ? '#000' : cores.primary.accent,
        transition: 'color 0.3s ease'
      }}>
        {icon}
      </span>
      <span style={{
        color: isHovered ? '#000' : cores.neutral.white,
        transition: 'color 0.3s ease',
        fontWeight: '600'
      }}>
        {title}
      </span>
    </button>
  );
};

const cardStyle = {
  padding: '22px',
  borderRadius: '14px',
  background: cores.background.card,
  border: `1px solid ${cores.primary.light}`,
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
};

const selectStyle = {
  padding: '14px',
  borderRadius: '8px',
  border: `1px solid ${cores.primary.light}`,
  fontSize: '14px',
  boxSizing: 'border-box',
  width: '100%',
  background: cores.background.secondary,
  color: cores.neutral.white,
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  fontWeight: '500'
};

const updateButtonStyle = (loading, unchanged, isMobile) => ({
  padding: isMobile ? '14px 16px' : '16px 20px',
  background: unchanged ? `${cores.primary.accent}40` : cores.primary.accent,
  color: unchanged ? cores.primary.accent : '#000',
  border: unchanged ? `2px solid ${cores.primary.accent}` : 'none',
  borderRadius: '10px',
  cursor: loading || unchanged ? 'not-allowed' : 'pointer',
  fontWeight: 'bold',
  width: '100%',
  fontSize: isMobile ? '13px' : '14px',
  transition: 'all 0.3s ease',
  opacity: loading ? 0.7 : 1,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px'
});