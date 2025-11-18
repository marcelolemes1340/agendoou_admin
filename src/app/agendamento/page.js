'use client';

import { useEffect, useState } from 'react';
import { api, logout } from '../../../services/api';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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

const SortableHeader = ({ field, label, sortField, sortDirection, onSort }) => (
  <th
    style={{
      padding: '14px 12px',
      textAlign: 'left',
      color: '#000',
      fontWeight: 'bold',
      fontSize: '12px',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      background: sortField === field ? 'rgba(0,0,0,0.1)' : 'transparent'
    }}
    onClick={() => onSort(field)}
    onMouseEnter={(e) => {
      e.currentTarget.style.background = 'rgba(0,0,0,0.1)';
    }}
    onMouseLeave={(e) => {
      if (sortField !== field) {
        e.currentTarget.style.background = 'transparent';
      }
    }}
  >
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
      {label}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        fontSize: '9px',
        opacity: sortField === field ? 1 : 0.3
      }}>
        <span style={{
          color: sortField === field && sortDirection === 'asc' ? '#000' : '#666',
          lineHeight: '0.8'
        }}>
          ↑
        </span>
        <span style={{
          color: sortField === field && sortDirection === 'desc' ? '#000' : '#666',
          lineHeight: '0.8'
        }}>
          ↓
        </span>
      </div>
    </div>
  </th>
);

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

export default function AgendamentoPage() {
  const router = useRouter();
  const [agendamentos, setAgendamentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [sortField, setSortField] = useState('id');
  const [sortDirection, setSortDirection] = useState('asc');
  const [isMobile, setIsMobile] = useState(false);
  const itemsPerPage = 10;

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    async function fetchAgendamentos() {
      try {
        const data = await api('/agendamentos', { method: 'GET' });
        setAgendamentos(data);
      } catch (err) {
        setError('Não foi possível carregar os agendamentos. Verifique a sessão.');
      } finally {
        setLoading(false);
      }
    }
    fetchAgendamentos();
  }, []);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const filteredAgendamentos = agendamentos.filter(agendamento => {
    const matchesSearch = agendamento.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agendamento.servico?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agendamento.profissional?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agendamento.id?.toString().includes(searchTerm);

    const matchesStatus = statusFilter === 'todos' || agendamento.status?.toLowerCase() === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const sortedAgendamentos = [...filteredAgendamentos].sort((a, b) => {
    let aValue = a[sortField];
    let bValue = b[sortField];

    if (sortField === 'data') {
      aValue = a.data || a.criadoEm;
      bValue = b.data || b.criadoEm;
    }

    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const totalPages = Math.ceil(sortedAgendamentos.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentAgendamentos = sortedAgendamentos.slice(startIndex, startIndex + itemsPerPage);

  const formatData = (isoString) => {
    if (!isoString) return 'N/A';
    const date = new Date(isoString);
    return date.toLocaleDateString('pt-BR');
  };

  const handleLogout = () => {
    if (confirm('Tem certeza que deseja sair do sistema?')) {
      logout();
    }
  };

  const estatisticas = {
    total: agendamentos.length,
    pendentes: agendamentos.filter(a => a.status === 'pendente').length,
    confirmados: agendamentos.filter(a => a.status === 'confirmado').length,
    concluidos: agendamentos.filter(a => a.status === 'concluido').length,
    cancelados: agendamentos.filter(a => a.status === 'cancelado').length
  };

  const Pagination = () => (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      gap: '10px',
      marginTop: '24px'
    }}>
      <button
        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
        disabled={currentPage === 1}
        style={{
          padding: '8px 14px',
          background: currentPage === 1 ? cores.primary.light : 'transparent',
          color: currentPage === 1 ? cores.neutral.medium : cores.primary.accent,
          border: `1px solid ${currentPage === 1 ? cores.primary.light : cores.primary.accent}`,
          borderRadius: '6px',
          cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
          fontWeight: '600',
          fontSize: '12px',
          transition: 'all 0.3s ease',
          opacity: currentPage === 1 ? 0.5 : 1
        }}
      >
        ← Anterior
      </button>

      <span style={{
        color: cores.neutral.light,
        padding: '0 16px',
        fontWeight: '600',
        fontSize: '12px'
      }}>
        Página {currentPage} de {totalPages}
      </span>

      <button
        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
        disabled={currentPage === totalPages}
        style={{
          padding: '8px 14px',
          background: currentPage === totalPages ? cores.primary.light : 'transparent',
          color: currentPage === totalPages ? cores.neutral.medium : cores.primary.accent,
          border: `1px solid ${currentPage === totalPages ? cores.primary.light : cores.primary.accent}`,
          borderRadius: '6px',
          cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
          fontWeight: '600',
          fontSize: '12px',
          transition: 'all 0.3s ease',
          opacity: currentPage === totalPages ? 0.5 : 1
        }}
      >
        Próxima →
      </button>
    </div>
  );

  if (loading) {
    return (
      <div style={{
        padding: '60px 20px',
        textAlign: 'center',
        color: cores.neutral.white,
        background: `linear-gradient(135deg, ${cores.background.primary} 0%, ${cores.background.secondary} 100%)`,
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
            Carregando Agendamentos
          </h2>
          <p style={{ color: cores.neutral.light, fontSize: '14px' }}>
            Buscando informações no sistema...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        padding: '60px 20px',
        textAlign: 'center',
        color: cores.status.error,
        background: `linear-gradient(135deg, ${cores.background.primary} 0%, ${cores.background.secondary} 100%)`,
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
          <button
            onClick={() => window.location.reload()}
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
            🔄 Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

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
          alignItems: 'center',
          marginBottom: '24px',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <div>
            <Link href="/dashboard" style={{
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
            }}>
              📋 Agendamentos
            </h1>
          </div>

          <div style={{
            display: 'flex',
            gap: '12px',
            alignItems: 'center'
          }}>
            <div style={{
              padding: '12px 16px',
              background: cores.background.card,
              borderRadius: '8px',
              border: `1px solid ${cores.primary.light}`,
              textAlign: 'center',
              minWidth: '80px'
            }}>
              <div style={{
                fontSize: '1.125rem',
                fontWeight: 'bold',
                color: cores.primary.accent,
                marginBottom: '2px'
              }}>
                {sortedAgendamentos.length}
              </div>
              <div style={{
                fontSize: '10px',
                color: cores.neutral.light,
                fontWeight: '600'
              }}>
                TOTAL
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <button
                onClick={handleLogout}
                style={{
                  padding: '10px 16px',
                  background: cores.status.error,
                  color: 'white',
                  border: `1px solid ${cores.status.error}`,
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '12px',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
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
          </div>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '16px',
          marginBottom: '24px'
        }}>
          <StatCard
            title="Total"
            value={estatisticas.total}
            icon="📋"
            color={cores.primary.accent}
          />
          <StatCard
            title="Pendentes"
            value={estatisticas.pendentes}
            icon="⏳"
            color={cores.status.warning}
          />
          <StatCard
            title="Confirmados"
            value={estatisticas.confirmados}
            icon="✅"
            color={cores.status.success}
          />
          <StatCard
            title="Concluídos"
            value={estatisticas.concluidos}
            icon="🎉"
            color={cores.primary.accent}
          />
        </div>

        <div style={{
          background: cores.background.card,
          border: `1px solid ${cores.primary.light}`,
          borderRadius: '10px',
          padding: '20px',
          marginBottom: '24px',
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : '2fr 1fr auto',
            gap: '16px',
            alignItems: 'end'
          }}>
            <div>
              <label style={{
                display: 'block',
                color: cores.neutral.light,
                fontSize: '12px',
                fontWeight: '600',
                marginBottom: '6px'
              }}>
                🔍 Pesquisa Geral
              </label>
              <input
                type="text"
                placeholder="Buscar em ID, cliente, serviço, profissional..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: `1px solid ${cores.primary.light}`,
                  fontSize: '13px',
                  background: cores.background.secondary,
                  color: cores.neutral.white,
                  transition: 'all 0.3s ease'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = cores.primary.accent;
                  e.target.style.boxShadow = `0 0 0 2px ${cores.primary.accent}20`;
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = cores.primary.light;
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>

            <div>
              <label style={{
                display: 'block',
                color: cores.neutral.light,
                fontSize: '12px',
                fontWeight: '600',
                marginBottom: '6px'
              }}>
                📊 Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: `1px solid ${cores.primary.light}`,
                  fontSize: '13px',
                  background: cores.background.secondary,
                  color: cores.neutral.white,
                  cursor: 'pointer'
                }}
              >
                <option value="todos">Todos os Status</option>
                <option value="pendente">⏳ Pendente</option>
                <option value="confirmado">✅ Confirmado</option>
                <option value="concluido">🎉 Concluído</option>
                <option value="cancelado">❌ Cancelado</option>
              </select>
            </div>

            <div style={{
              display: 'flex',
              gap: '8px',
              alignItems: 'center',
              justifyContent: isMobile ? 'flex-start' : 'flex-end'
            }}>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('todos');
                  setSortField('id');
                  setSortDirection('asc');
                  setCurrentPage(1);
                }}
                style={{
                  padding: '8px 12px',
                  background: 'transparent',
                  color: cores.secondary.main,
                  border: `1px solid ${cores.secondary.main}`,
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '11px',
                  transition: 'all 0.3s ease',
                  whiteSpace: 'nowrap'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = cores.secondary.main;
                  e.target.style.color = '#000';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'transparent';
                  e.target.style.color = cores.secondary.main;
                }}
              >
                🗑️ Limpar Filtros
              </button>
            </div>
          </div>
        </div>

        {sortedAgendamentos.length === 0 ? (
          <div style={{
            background: cores.background.card,
            border: `1px solid ${cores.primary.light}`,
            borderRadius: '10px',
            padding: '40px 20px',
            textAlign: 'center',
            color: cores.neutral.light
          }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '12px', opacity: 0.5 }}>
              {agendamentos.length === 0 ? '📭' : '🔍'}
            </div>
            <h3 style={{
              color: cores.neutral.white,
              marginBottom: '8px',
              fontSize: '1rem'
            }}>
              {agendamentos.length === 0 ? 'Nenhum agendamento encontrado' : 'Nenhum agendamento corresponde aos filtros'}
            </h3>
          </div>
        ) : (
          <>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '16px',
              padding: '12px 16px',
              background: cores.background.card,
              border: `1px solid ${cores.primary.light}`,
              borderRadius: '8px',
              fontSize: '12px',
              color: cores.neutral.light,
              flexWrap: 'wrap',
              gap: '8px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>Ordenado por:</span>
                <span style={{
                  background: cores.primary.accent,
                  color: '#000',
                  padding: '4px 8px',
                  borderRadius: '6px',
                  fontWeight: 'bold',
                  fontSize: '11px'
                }}>
                  {sortField === 'id' && 'ID'}
                  {sortField === 'nome' && 'Cliente'}
                  {sortField === 'servico' && 'Serviço'}
                  {sortField === 'profissional' && 'Profissional'}
                  {sortField === 'data' && 'Data'}
                  {sortDirection === 'asc' ? ' ↑' : ' ↓'}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>Mostrando</span>
                <span style={{
                  background: cores.primary.accent,
                  color: '#000',
                  padding: '4px 6px',
                  borderRadius: '4px',
                  fontWeight: 'bold',
                  fontSize: '11px'
                }}>
                  {startIndex + 1}-{Math.min(startIndex + itemsPerPage, sortedAgendamentos.length)}
                </span>
                <span>de</span>
                <span style={{ fontWeight: 'bold', color: cores.neutral.white }}>
                  {sortedAgendamentos.length}
                </span>
              </div>
            </div>

            {!isMobile ? (
              <div style={{
                background: cores.background.card,
                border: `1px solid ${cores.primary.light}`,
                borderRadius: '10px',
                overflow: 'hidden',
                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)'
              }}>
                <div style={{
                  overflowX: 'auto'
                }}>
                  <table style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    minWidth: '800px'
                  }}>
                    <thead>
                      <tr style={{
                        background: cores.gradients.gold
                      }}>
                        <SortableHeader
                          field="id"
                          label="ID"
                          sortField={sortField}
                          sortDirection={sortDirection}
                          onSort={handleSort}
                        />
                        <SortableHeader
                          field="nome"
                          label="Cliente"
                          sortField={sortField}
                          sortDirection={sortDirection}
                          onSort={handleSort}
                        />
                        <SortableHeader
                          field="servico"
                          label="Serviço"
                          sortField={sortField}
                          sortDirection={sortDirection}
                          onSort={handleSort}
                        />
                        <SortableHeader
                          field="profissional"
                          label="Profissional"
                          sortField={sortField}
                          sortDirection={sortDirection}
                          onSort={handleSort}
                        />
                        <SortableHeader
                          field="data"
                          label="Data"
                          sortField={sortField}
                          sortDirection={sortDirection}
                          onSort={handleSort}
                        />
                        <th style={{
                          padding: '14px 12px',
                          textAlign: 'left',
                          color: '#000',
                          fontWeight: 'bold',
                          fontSize: '12px',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px'
                        }}>
                          Horário
                        </th>
                        <th style={{
                          padding: '14px 12px',
                          textAlign: 'left',
                          color: '#000',
                          fontWeight: 'bold',
                          fontSize: '12px',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px'
                        }}>
                          Status
                        </th>
                        <th style={{
                          padding: '14px 12px',
                          textAlign: 'left',
                          color: '#000',
                          fontWeight: 'bold',
                          fontSize: '12px',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px'
                        }}>
                          Ações
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentAgendamentos.map((agendamento, index) => (
                        <tr key={agendamento.id} style={{
                          borderBottom: index < currentAgendamentos.length - 1 ? `1px solid ${cores.primary.light}` : 'none',
                          transition: 'all 0.3s ease',
                          background: 'transparent'
                        }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = cores.primary.light;
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'transparent';
                          }}
                        >
                          <td style={{
                            padding: '14px 12px',
                            color: cores.neutral.white,
                            fontWeight: '600',
                            fontSize: '12px'
                          }}>
                            <span style={{
                              background: cores.primary.accent,
                              color: '#000',
                              padding: '4px 8px',
                              borderRadius: '6px',
                              fontSize: '11px',
                              fontWeight: 'bold'
                            }}>
                              #{agendamento.id}
                            </span>
                          </td>
                          <td style={{
                            padding: '14px 12px',
                            color: cores.neutral.white,
                            fontWeight: '500',
                            fontSize: '13px'
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <div style={{
                                width: '32px',
                                height: '32px',
                                background: cores.gradients.gold,
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '12px',
                                fontWeight: 'bold',
                                color: '#000'
                              }}>
                                {agendamento.nome?.charAt(0)?.toUpperCase() || 'C'}
                              </div>
                              {agendamento.nome}
                            </div>
                          </td>
                          <td style={{
                            padding: '14px 12px',
                            color: cores.neutral.white,
                            fontWeight: '500',
                            fontSize: '13px'
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span style={{ fontSize: '14px' }}>
                                {agendamento.servico?.includes('Corte') ? '✂️' :
                                  agendamento.servico?.includes('Barba') ? '🧔' :
                                    agendamento.servico?.includes('Relaxamento') ? '💆' : '✨'}
                              </span>
                              {agendamento.servico}
                            </div>
                          </td>
                          <td style={{
                            padding: '14px 12px',
                            color: cores.neutral.white,
                            fontWeight: '500',
                            fontSize: '13px'
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span style={{ fontSize: '14px' }}>👨‍💼</span>
                              {agendamento.profissional}
                            </div>
                          </td>
                          <td style={{
                            padding: '14px 12px',
                            color: cores.neutral.white,
                            fontWeight: '500',
                            fontSize: '13px'
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span style={{ fontSize: '14px' }}>📅</span>
                              {agendamento.data || formatData(agendamento.criadoEm)}
                            </div>
                          </td>
                          <td style={{
                            padding: '14px 12px',
                            color: cores.neutral.white,
                            fontWeight: '500',
                            fontSize: '13px'
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span style={{ fontSize: '14px' }}>⏰</span>
                              {agendamento.horario}
                            </div>
                          </td>
                          <td style={{ padding: '14px 12px' }}>
                            <span style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              padding: '6px 10px',
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
                          </td>
                          <td style={{ padding: '14px 12px' }}>
                            <Link
                              href={`/agendamento/${agendamento.id}`}
                              style={{
                                padding: '6px 10px',
                                background: cores.primary.accent,
                                color: '#000',
                                textDecoration: 'none',
                                borderRadius: '6px',
                                fontSize: '11px',
                                fontWeight: 'bold',
                                transition: 'all 0.3s ease',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}
                              onMouseEnter={(e) => {
                                e.target.style.background = '#F7EF8A';
                              }}
                              onMouseLeave={(e) => {
                                e.target.style.background = cores.primary.accent;
                              }}
                            >
                              👁️ Detalhes
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                marginBottom: '24px'
              }}>
                {currentAgendamentos.map((agendamento) => (
                  <div
                    key={agendamento.id}
                    style={{
                      background: cores.background.card,
                      border: `2px solid ${getStatusColor(agendamento.status)}`,
                      borderRadius: '10px',
                      padding: '16px',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = cores.primary.accent;
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = getStatusColor(agendamento.status);
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: '12px'
                    }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                          <div style={{
                            width: '32px',
                            height: '32px',
                            background: cores.gradients.gold,
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '12px',
                            fontWeight: 'bold',
                            color: '#000'
                          }}>
                            {agendamento.nome?.charAt(0)?.toUpperCase() || 'C'}
                          </div>
                          <div style={{ fontWeight: 'bold', fontSize: '14px', color: cores.neutral.white }}>
                            {agendamento.nome}
                          </div>
                        </div>
                        <div style={{
                          fontSize: '11px',
                          color: cores.neutral.medium,
                        }}>
                          ID: #{agendamento.id}
                        </div>
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
                      marginBottom: '12px'
                    }}>
                      <div>
                        <div style={{
                          fontSize: '10px',
                          color: cores.neutral.light,
                          fontWeight: '600',
                          marginBottom: '2px'
                        }}>
                          SERVIÇO
                        </div>
                        <div style={{
                          fontSize: '12px',
                          color: cores.neutral.white,
                          fontWeight: '500'
                        }}>
                          {agendamento.servico}
                        </div>
                      </div>
                      <div>
                        <div style={{
                          fontSize: '10px',
                          color: cores.neutral.light,
                          fontWeight: '600',
                          marginBottom: '2px'
                        }}>
                          PROFISSIONAL
                        </div>
                        <div style={{
                          fontSize: '12px',
                          color: cores.neutral.white,
                          fontWeight: '500'
                        }}>
                          {agendamento.profissional}
                        </div>
                      </div>
                      <div>
                        <div style={{
                          fontSize: '10px',
                          color: cores.neutral.light,
                          fontWeight: '600',
                          marginBottom: '2px'
                        }}>
                          DATA
                        </div>
                        <div style={{
                          fontSize: '12px',
                          color: cores.neutral.white,
                          fontWeight: '500'
                        }}>
                          {agendamento.data || formatData(agendamento.criadoEm)}
                        </div>
                      </div>
                      <div>
                        <div style={{
                          fontSize: '10px',
                          color: cores.neutral.light,
                          fontWeight: '600',
                          marginBottom: '2px'
                        }}>
                          HORÁRIO
                        </div>
                        <div style={{
                          fontSize: '12px',
                          color: cores.neutral.white,
                          fontWeight: '500'
                        }}>
                          {agendamento.horario}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                      <Link
                        href={`/agendamento/${agendamento.id}`}
                        style={{
                          padding: '6px 10px',
                          background: cores.primary.accent,
                          color: '#000',
                          textDecoration: 'none',
                          borderRadius: '6px',
                          fontSize: '11px',
                          fontWeight: 'bold',
                          transition: 'all 0.3s ease',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          flex: 1,
                          justifyContent: 'center'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.background = '#F7EF8A';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.background = cores.primary.accent;
                        }}
                      >
                        👁️ Ver Detalhes
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <Pagination />
          </>
        )}
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