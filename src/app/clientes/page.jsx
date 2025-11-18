
'use client';

import { useEffect, useState } from 'react';
import { api, logout } from '../../../services/api';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { cores } from '@/lib/cores';

const getStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case 'ativo': return cores.status.success;
    case 'inativo': return cores.status.error;
    case 'pendente': return cores.status.warning;
    default: return cores.primary.accent;
  }
};

const getStatusIcon = (status) => {
  switch (status?.toLowerCase()) {
    case 'ativo': return '✅';
    case 'inativo': return '❌';
    case 'pendente': return '⏳';
    default: return '👤';
  }
};

export default function ClientesPage() {
  const router = useRouter();
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [tipoFilter, setTipoFilter] = useState('todos');
  const [sortField, setSortField] = useState('id');
  const [sortDirection, setSortDirection] = useState('asc');
  const [agendamentos, setAgendamentos] = useState([]);
  const [isMobile, setIsMobile] = useState(false);
  const itemsPerPage = 8;

  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);

        console.log('🔄 Iniciando busca por clientes...');

        const [usuariosData, agendamentosData] = await Promise.all([
          api('/usuarios', { method: 'GET' }),
          api('/agendamentos', { method: 'GET' }).catch(() => [])
        ]);
        
        setClientes(usuariosData);
        setAgendamentos(agendamentosData);

        console.log(`✅ ${usuariosData.length} clientes carregados com sucesso`);

      } catch (err) {
        console.error('❌ Erro crítico ao buscar clientes:', err);
        setError('Não foi possível carregar os clientes. Verifique sua conexão e tente novamente.');
        setClientes([]);
        setAgendamentos([]);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  
  const getAgendamentosCount = (cliente) => {
    return agendamentos.filter(ag => 
      ag.email === cliente.email || ag.telefone === cliente.telefone
    ).length;
  };

  
  const getUltimoAgendamento = (cliente) => {
    const ags = agendamentos.filter(ag => 
      ag.email === cliente.email || ag.telefone === cliente.telefone
    ).sort((a, b) => new Date(b.criadoEm) - new Date(a.criadoEm));
    
    return ags.length > 0 ? ags[0] : null;
  };


  const filteredClientes = clientes.filter(cliente => {
    const matchesSearch = cliente.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cliente.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cliente.telefone?.includes(searchTerm) ||
      cliente.id?.toString().includes(searchTerm);

    const matchesTipo = tipoFilter === 'todos' || cliente.tipo === tipoFilter;

    return matchesSearch && matchesTipo;
  });

  
  const sortedClientes = [...filteredClientes].sort((a, b) => {
    let aValue = a[sortField];
    let bValue = b[sortField];

    if (sortField === 'agendamentos') {
      aValue = getAgendamentosCount(a);
      bValue = getAgendamentosCount(b);
    } else if (sortField === 'ultimoAgendamento') {
      const ultimoA = getUltimoAgendamento(a);
      const ultimoB = getUltimoAgendamento(b);
      aValue = ultimoA ? new Date(ultimoA.criadoEm) : new Date(0);
      bValue = ultimoB ? new Date(ultimoB.criadoEm) : new Date(0);
    }

    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  
  const totalPages = Math.ceil(sortedClientes.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentClientes = sortedClientes.slice(startIndex, startIndex + itemsPerPage);

  const formatData = (isoString) => {
    if (!isoString) return 'N/A';
    const date = new Date(isoString);
    return date.toLocaleDateString('pt-BR');
  };

  const formatDataCompleta = (dataString) => {
    try {
      return new Date(dataString).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Data inválida';
    }
  };

  const handleLogout = () => {
    if (confirm('Tem certeza que deseja sair do sistema?')) {
      logout();
    }
  };

  
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, tipoFilter, sortField, sortDirection]);

  
  const limparTodosFiltros = () => {
    setSearchTerm('');
    setTipoFilter('todos');
    setSortField('id');
    setSortDirection('asc');
  };

  
  const filtrosAtivos = searchTerm !== '' || tipoFilter !== 'todos' || sortField !== 'id';


  const Pagination = () => (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      gap: '10px',
      marginTop: '28px'
    }}>
      <button
        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
        disabled={currentPage === 1}
        style={{
          padding: '8px 14px',
          background: currentPage === 1 ? cores.background.secondary : 'transparent',
          color: currentPage === 1 ? cores.neutral.light : cores.primary.accent,
          border: `1px solid ${currentPage === 1 ? cores.primary.light : cores.primary.accent}`,
          borderRadius: '8px',
          cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
          fontSize: '13px',
          opacity: currentPage === 1 ? 0.5 : 1,
          transition: 'all 0.3s ease'
        }}
        onMouseEnter={(e) => {
          if (currentPage !== 1) {
            e.target.style.background = cores.primary.accent;
            e.target.style.color = '#000';
          }
        }}
        onMouseLeave={(e) => {
          if (currentPage !== 1) {
            e.target.style.background = 'transparent';
            e.target.style.color = cores.primary.accent;
          }
        }}
      >
        ← Anterior
      </button>

      
      {Array.from({ length: totalPages }, (_, i) => i + 1)
        .filter(numero =>
          numero === 1 ||
          numero === totalPages ||
          (numero >= currentPage - 1 && numero <= currentPage + 1)
        )
        .map((numero, index, array) => {
          const showEllipsis = index > 0 && numero - array[index - 1] > 1;
          return (
            <div key={numero} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              {showEllipsis && (
                <span style={{ color: cores.neutral.light, fontSize: '13px' }}>
                  ...
                </span>
              )}
              <button
                onClick={() => setCurrentPage(numero)}
                style={{
                  padding: '8px 12px',
                  background: currentPage === numero ? cores.primary.accent : 'transparent',
                  color: currentPage === numero ? '#000' : cores.neutral.white,
                  border: `1px solid ${currentPage === numero ? cores.primary.accent : cores.primary.light}`,
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: currentPage === numero ? 'bold' : 'normal',
                  minWidth: '36px',
                  transition: 'all 0.3s ease'
                }}
              >
                {numero}
              </button>
            </div>
          );
        })}

      <button
        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
        disabled={currentPage === totalPages}
        style={{
          padding: '8px 14px',
          background: currentPage === totalPages ? cores.background.secondary : 'transparent',
          color: currentPage === totalPages ? cores.neutral.light : cores.primary.accent,
          border: `1px solid ${currentPage === totalPages ? cores.primary.light : cores.primary.accent}`,
          borderRadius: '8px',
          cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
          fontSize: '13px',
          opacity: currentPage === totalPages ? 0.5 : 1,
          transition: 'all 0.3s ease'
        }}
        onMouseEnter={(e) => {
          if (currentPage !== totalPages) {
            e.target.style.background = cores.primary.accent;
            e.target.style.color = '#000';
          }
        }}
        onMouseLeave={(e) => {
          if (currentPage !== totalPages) {
            e.target.style.background = 'transparent';
            e.target.style.color = cores.primary.accent;
          }
        }}
      >
        Próxima →
      </button>
    </div>
  );

  
  const ClienteMobileCard = ({ cliente }) => {
    const agendamentosCount = getAgendamentosCount(cliente);
    const ultimoAgendamento = getUltimoAgendamento(cliente);
    
    return (
      <div style={{
        background: cores.background.card,
        border: `1px solid ${cores.primary.light}`,
        borderRadius: '14px',
        padding: '18px',
        transition: 'all 0.3s ease',
        marginBottom: '14px'
      }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = cores.primary.accent;
          e.currentTarget.style.transform = 'translateY(-2px)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = cores.primary.light;
          e.currentTarget.style.transform = 'translateY(0)';
        }}
      >
      
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '14px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '44px',
              height: '44px',
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
              <div style={{
                fontSize: '16px',
                fontWeight: 'bold',
                color: cores.neutral.white,
                marginBottom: '4px'
              }}>
                {cliente.nome}
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <span style={{
                  padding: '4px 8px',
                  background: cliente.tipo === 'admin' ? cores.primary.accent + '20' : cores.secondary.main + '20',
                  color: cliente.tipo === 'admin' ? cores.primary.accent : cores.secondary.main,
                  border: `1px solid ${cliente.tipo === 'admin' ? cores.primary.accent : cores.secondary.main}`,
                  borderRadius: '12px',
                  fontSize: '10px',
                  fontWeight: 'bold'
                }}>
                  {cliente.tipo === 'admin' ? '👨‍💼 ADMIN' : '👥 CLIENTE'}
                </span>
                <span style={{
                  padding: '4px 8px',
                  background: getStatusColor('ativo') + '20',
                  color: getStatusColor('ativo'),
                  border: `1px solid ${getStatusColor('ativo')}`,
                  borderRadius: '12px',
                  fontSize: '10px',
                  fontWeight: 'bold'
                }}>
                  {getStatusIcon('ativo')} ATIVO
                </span>
              </div>
            </div>
          </div>
          <span style={{
            background: cores.primary.accent,
            color: '#000',
            padding: '6px 10px',
            borderRadius: '8px',
            fontSize: '12px',
            fontWeight: 'bold'
          }}>
            #{cliente.id}
          </span>
        </div>

        
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '12px',
          marginBottom: '14px'
        }}>
          <div>
            <div style={{
              fontSize: '11px',
              color: cores.neutral.light,
              fontWeight: '600',
              marginBottom: '4px'
            }}>
              📧 EMAIL
            </div>
            <div style={{
              fontSize: '13px',
              color: cores.neutral.white,
              fontWeight: '500',
              wordBreak: 'break-all'
            }}>
              {cliente.email}
            </div>
          </div>
          <div>
            <div style={{
              fontSize: '11px',
              color: cores.neutral.light,
              fontWeight: '600',
              marginBottom: '4px'
            }}>
              📞 TELEFONE
            </div>
            <div style={{
              fontSize: '13px',
              color: cores.neutral.white,
              fontWeight: '500'
            }}>
              {cliente.telefone || 'N/A'}
            </div>
          </div>
        </div>

        
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '12px',
          marginBottom: '14px'
        }}>
          <div>
            <div style={{
              fontSize: '11px',
              color: cores.neutral.light,
              fontWeight: '600',
              marginBottom: '4px'
            }}>
              📅 AGENDAMENTOS
            </div>
            <div style={{
              fontSize: '13px',
              color: cores.neutral.white,
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <span style={{
                background: agendamentosCount > 0 ? cores.status.success : cores.neutral.medium,
                color: 'white',
                padding: '2px 6px',
                borderRadius: '6px',
                fontSize: '11px',
                fontWeight: 'bold'
              }}>
                {agendamentosCount}
              </span>
              total
            </div>
          </div>
          <div>
            <div style={{
              fontSize: '11px',
              color: cores.neutral.light,
              fontWeight: '600',
              marginBottom: '4px'
            }}>
              ⏰ ÚLTIMO
            </div>
            <div style={{
              fontSize: '13px',
              color: cores.neutral.white,
              fontWeight: '500'
            }}>
              {ultimoAgendamento ? formatData(ultimoAgendamento.data) : 'N/A'}
            </div>
          </div>
        </div>

        
        {cliente.cpf && (
          <div style={{
            padding: '10px',
            background: cores.background.secondary,
            borderRadius: '8px',
            marginBottom: '14px'
          }}>
            <div style={{
              fontSize: '11px',
              color: cores.neutral.light,
              fontWeight: '600',
              marginBottom: '4px'
            }}>
              🆔 CPF:
            </div>
            <div style={{
              fontSize: '12px',
              color: cores.neutral.white,
              fontWeight: '500'
            }}>
              {cliente.cpf}
            </div>
          </div>
        )}

        
        <div style={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '10px'
        }}>
          <Link
            href={`/clientes/${cliente.id}`}
            style={{
              padding: '8px 14px',
              background: cores.primary.accent,
              color: '#000',
              textDecoration: 'none',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: 'bold',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = '#F7EF8A';
              e.target.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = cores.primary.accent;
              e.target.style.transform = 'translateY(0)';
            }}
          >
            👁️ Detalhes
          </Link>
        </div>
      </div>
    );
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
          Carregando Clientes
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
        
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '28px',
          flexWrap: 'wrap',
          gap: '18px'
        }}>
          <div>
            <Link href="/dashboard" style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              color: cores.neutral.white,
              textDecoration: 'none',
              marginBottom: '10px',
              fontSize: '15px',
              fontWeight: '600',
              transition: 'all 0.3s ease',
              padding: '10px 18px',
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
              fontSize: '1.875rem',
              fontWeight: 'bold',
              background: cores.gradients.gold,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              👥 Clientes
            </h1>
          </div>

          
          <div style={{
            display: 'flex',
            gap: '14px',
            alignItems: 'center'
          }}>
            <div style={{
              padding: '14px 18px',
              background: cores.background.card,
              borderRadius: '10px',
              border: `1px solid ${cores.primary.light}`,
              textAlign: 'center',
              minWidth: '90px'
            }}>
              <div style={{
                fontSize: '1.375rem',
                fontWeight: 'bold',
                color: cores.primary.accent,
                marginBottom: '4px'
              }}>
                {clientes.length}
              </div>
              <div style={{
                fontSize: '11px',
                color: cores.neutral.light,
                fontWeight: '600'
              }}>
                TOTAL
              </div>
            </div>
            <div style={{
              padding: '14px 18px',
              background: cores.background.card,
              borderRadius: '10px',
              border: `1px solid ${cores.primary.light}`,
              textAlign: 'center',
              minWidth: '90px'
            }}>
              <div style={{
                fontSize: '1.375rem',
                fontWeight: 'bold',
                color: cores.status.success,
                marginBottom: '4px'
              }}>
                {filteredClientes.length}
              </div>
              <div style={{
                fontSize: '11px',
                color: cores.neutral.light,
                fontWeight: '600'
              }}>
                FILTRADOS
              </div>
            </div>
          </div>
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
            gap: '10px'
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
          background: cores.background.card,
          border: `1px solid ${cores.primary.light}`,
          borderRadius: '14px',
          padding: '22px',
          marginBottom: '28px',
        }}>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : '2fr 1fr auto',
            gap: '18px',
            alignItems: 'end'
          }}>
            
            <div>
              <label style={{
                display: 'block',
                color: cores.neutral.light,
                fontSize: '13px',
                fontWeight: '600',
                marginBottom: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                🔍 Pesquisa Geral
              </label>
              <input
                type="text"
                placeholder="Buscar em ID, nome, email, telefone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: `1px solid ${cores.primary.light}`,
                  fontSize: '14px',
                  background: cores.background.secondary,
                  color: cores.neutral.white,
                  transition: 'all 0.3s ease'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = cores.primary.accent;
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = cores.primary.light;
                }}
              />
            </div>

            
            <div>
              <label style={{
                display: 'block',
                color: cores.neutral.light,
                fontSize: '13px',
                fontWeight: '600',
                marginBottom: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                📊 Tipo
              </label>
              <select
                value={tipoFilter}
                onChange={(e) => setTipoFilter(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: `1px solid ${cores.primary.light}`,
                  fontSize: '14px',
                  background: cores.background.secondary,
                  color: cores.neutral.white,
                  cursor: 'pointer'
                }}
              >
                <option value="todos">Todos os Tipos</option>
                <option value="cliente">👥 Clientes</option>
                <option value="admin">👨‍💼 Administradores</option>
              </select>
            </div>

            
            <div style={{
              display: 'flex',
              gap: '10px',
              alignItems: 'center',
              justifyContent: isMobile ? 'stretch' : 'flex-end'
            }}>
              {filtrosAtivos && (
                <button
                  onClick={limparTodosFiltros}
                  style={{
                    padding: '10px 14px',
                    background: 'transparent',
                    color: cores.secondary.main,
                    border: `1px solid ${cores.secondary.main}`,
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: '12px',
                    transition: 'all 0.3s ease',
                    whiteSpace: 'nowrap',
                    height: 'fit-content',
                    flex: isMobile ? 1 : 'none'
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
                  🗑️ Limpar Tudo
                </button>
              )}

              <button
                onClick={() => window.location.reload()}
                style={{
                  padding: '10px 14px',
                  background: 'transparent',
                  color: cores.primary.accent,
                  border: `1px solid ${cores.primary.accent}`,
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '12px',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  whiteSpace: 'nowrap',
                  height: 'fit-content',
                  flex: isMobile ? 1 : 'none'
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
                🔄 Atualizar
              </button>
            </div>
          </div>

          
          <div style={{
            marginTop: '18px',
            paddingTop: '18px',
            borderTop: `1px solid ${cores.primary.light}20`
          }}>
            <div style={{
              display: 'flex',
              gap: '10px',
              flexWrap: 'wrap',
              alignItems: 'center'
            }}>
              <span style={{
                fontSize: '12px',
                color: cores.neutral.light,
                fontWeight: '600'
              }}>
                Ordenar por:
              </span>
              {[
                { field: 'id', label: 'ID' },
                { field: 'nome', label: 'Nome' },
                { field: 'email', label: 'Email' },
                { field: 'tipo', label: 'Tipo' },
                { field: 'agendamentos', label: 'Agendamentos' },
                { field: 'ultimoAgendamento', label: 'Último Agendamento' }
              ].map(({ field, label }) => (
                <div
                  key={field}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 10px',
                    background: sortField === field ? cores.primary.accent : cores.background.secondary,
                    borderRadius: '14px',
                    border: `1px solid ${cores.primary.light}`,
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    color: sortField === field ? '#000' : cores.neutral.white
                  }}
                  onClick={() => handleSort(field)}
                >
                  <span style={{
                    fontSize: '11px',
                    fontWeight: 'bold'
                  }}>
                    {label}
                  </span>
                  {sortField === field && (
                    <span style={{ fontSize: '10px' }}>
                      {sortDirection === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '18px'
          }}>
            <h2 style={{
              color: cores.neutral.white,
              margin: 0,
              fontSize: '1.25rem',
              fontWeight: 'bold'
            }}>
              {sortedClientes.length === clientes.length
                ? `Clientes (${sortedClientes.length})`
                : `Filtrados (${sortedClientes.length})`
              }
            </h2>

            
            {totalPages > 1 && (
              <div style={{
                fontSize: '13px',
                color: cores.neutral.light
              }}>
                Página {currentPage} de {totalPages}
              </div>
            )}
          </div>

          {sortedClientes.length === 0 ? (
            <div style={{
              background: cores.background.card,
              border: `1px solid ${cores.primary.light}`,
              borderRadius: '14px',
              padding: '44px 22px',
              textAlign: 'center',
              color: cores.neutral.light
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '14px', opacity: 0.5 }}>
                {clientes.length === 0 ? '👥' : '🔍'}
              </div>
              <h3 style={{
                color: cores.neutral.white,
                marginBottom: '10px',
                fontSize: '1.125rem'
              }}>
                {clientes.length === 0 ? 'Nenhum cliente encontrado' : 'Nenhum cliente corresponde aos filtros'}
              </h3>
              {clientes.length === 0 && (
                <button
                  onClick={() => window.location.reload()}
                  style={{
                    padding: '10px 18px',
                    background: cores.primary.accent,
                    color: '#000',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: '13px'
                  }}
                >
                  🔄 Recarregar
                </button>
              )}
            </div>
          ) : (
            <>
            
              {isMobile ? (
                <div style={{
                  marginBottom: '28px'
                }}>
                  {currentClientes.map((cliente) => (
                    <ClienteMobileCard key={cliente.id} cliente={cliente} />
                  ))}
                </div>
              ) : (
                
                <div style={{
                  background: cores.background.card,
                  border: `1px solid ${cores.primary.light}`,
                  borderRadius: '14px',
                  overflow: 'hidden',
                  marginBottom: '28px'
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
                          <th style={{
                            padding: '16px 12px',
                            textAlign: 'left',
                            color: '#000',
                            fontWeight: 'bold',
                            fontSize: '12px',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px'
                          }}>
                            ID
                          </th>
                          <th style={{
                            padding: '16px 12px',
                            textAlign: 'left',
                            color: '#000',
                            fontWeight: 'bold',
                            fontSize: '12px',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px'
                          }}>
                            Cliente
                          </th>
                          <th style={{
                            padding: '16px 12px',
                            textAlign: 'left',
                            color: '#000',
                            fontWeight: 'bold',
                            fontSize: '12px',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px'
                          }}>
                            Contato
                          </th>
                          <th style={{
                            padding: '16px 12px',
                            textAlign: 'left',
                            color: '#000',
                            fontWeight: 'bold',
                            fontSize: '12px',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px'
                          }}>
                                Tipo
                          </th>
                          <th style={{
                            padding: '16px 12px',
                            textAlign: 'center',
                            color: '#000',
                            fontWeight: 'bold',
                            fontSize: '12px',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px'
                          }}>
                            Agend.
                          </th>
                          <th style={{
                            padding: '16px 12px',
                            textAlign: 'left',
                            color: '#000',
                            fontWeight: 'bold',
                            fontSize: '12px',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px'
                          }}>
                            Último
                          </th>
                          <th style={{
                            padding: '16px 12px',
                            textAlign: 'center',
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
                        {currentClientes.map((cliente, index) => {
                          const agendamentosCount = getAgendamentosCount(cliente);
                          const ultimoAgendamento = getUltimoAgendamento(cliente);
                          
                          return (
                            <tr key={cliente.id} style={{
                              borderBottom: index < currentClientes.length - 1 ? `1px solid ${cores.primary.light}` : 'none',
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
                                padding: '16px 12px',
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
                                  #{cliente.id}
                                </span>
                              </td>
                              <td style={{
                                padding: '16px 12px',
                                color: cores.neutral.white,
                                fontWeight: '500'
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
                                    {cliente.nome?.charAt(0)?.toUpperCase() || 'C'}
                                  </div>
                                  <div>
                                    <div style={{ 
                                      fontSize: '13px', 
                                      fontWeight: 'bold',
                                      maxWidth: '150px',
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                      whiteSpace: 'nowrap'
                                    }}>
                                      {cliente.nome}
                                    </div>
                                    {cliente.cpf && (
                                      <div style={{ 
                                        fontSize: '10px', 
                                        color: cores.neutral.medium,
                                        maxWidth: '150px',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap'
                                      }}>
                                        CPF: {cliente.cpf}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </td>
                              <td style={{
                                padding: '16px 12px',
                                color: cores.neutral.white,
                                fontWeight: '500'
                              }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                  <div style={{ 
                                    fontSize: '12px',
                                    maxWidth: '180px',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap'
                                  }}>
                                    {cliente.email}
                                  </div>
                                  {cliente.telefone && (
                                    <div style={{ 
                                      fontSize: '11px', 
                                      color: cores.neutral.medium,
                                      maxWidth: '180px',
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                      whiteSpace: 'nowrap'
                                    }}>
                                      {cliente.telefone}
                                    </div>
                                  )}
                                </div>
                              </td>
                              <td style={{
                                padding: '16px 12px',
                                color: cores.neutral.white,
                                fontWeight: '500'
                              }}>
                                <span style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  padding: '4px 8px',
                                  borderRadius: '12px',
                                  background: cliente.tipo === 'admin' ? cores.primary.accent + '20' : cores.secondary.main + '20',
                                  color: cliente.tipo === 'admin' ? cores.primary.accent : cores.secondary.main,
                                  border: `1px solid ${cliente.tipo === 'admin' ? cores.primary.accent : cores.secondary.main}`,
                                  fontSize: '10px',
                                  fontWeight: 'bold',
                                  textTransform: 'uppercase'
                                }}>
                                  {cliente.tipo === 'admin' ? '👨‍💼' : '👥'}
                                  {cliente.tipo}
                                </span>
                              </td>
                              <td style={{
                                padding: '16px 12px',
                                color: cores.neutral.white,
                                fontWeight: '500',
                                textAlign: 'center'
                              }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                                  <span style={{ fontSize: '12px' }}>📅</span>
                                  <span style={{
                                    background: agendamentosCount > 0 ? cores.status.success : cores.neutral.medium,
                                    color: 'white',
                                    padding: '2px 6px',
                                    borderRadius: '6px',
                                    fontSize: '11px',
                                    fontWeight: 'bold'
                                  }}>
                                    {agendamentosCount}
                                  </span>
                                </div>
                              </td>
                              <td style={{
                                padding: '16px 12px',
                                color: cores.neutral.white,
                                fontWeight: '500'
                              }}>
                                {ultimoAgendamento ? (
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <div>
                                      <div style={{ fontSize: '12px', fontWeight: 'bold' }}>
                                        {formatData(ultimoAgendamento.data)}
                                      </div>
                                      <div style={{ fontSize: '10px', color: cores.neutral.medium }}>
                                        {ultimoAgendamento.horario}
                                      </div>
                                    </div>
                                  </div>
                                ) : (
                                  <span style={{ color: cores.neutral.medium, fontSize: '11px' }}>
                                    Nenhum
                                  </span>
                                )}
                              </td>
                              <td style={{ padding: '16px 12px' }}>
                                <Link
                                  href={`/clientes/${cliente.id}`}
                                  style={{
                                    padding: '6px 12px',
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
                                    e.target.style.transform = 'translateY(-1px)';
                                  }}
                                  onMouseLeave={(e) => {
                                    e.target.style.background = cores.primary.accent;
                                    e.target.style.transform = 'translateY(0)';
                                  }}
                                >
                                  👁️ Detalhes
                                </Link>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              <Pagination />
            </>
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