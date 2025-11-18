
'use client';

import { useEffect, useState } from 'react';
import { api, logout } from '../../../services/api';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { cores } from '@/lib/cores';

const getStatusColor = (ativo) => {
  return ativo ? cores.status.success : cores.status.error;
};

const getStatusIcon = (ativo) => {
  return ativo ? '✅' : '❌';
};

const getStatusText = (ativo) => {
  return ativo ? 'Ativo' : 'Inativo';
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


const BarbeiroModal = ({ isOpen, onClose, barbeiro, onSave, loading }) => {
  const [formData, setFormData] = useState({
    nome: '',
    especialidade: '',
    foto: ''
  });

  useEffect(() => {
    if (barbeiro) {
      setFormData({
        nome: barbeiro.nome || '',
        especialidade: barbeiro.especialidade || '',
        foto: barbeiro.foto || ''
      });
    } else {
      setFormData({
        nome: '',
        especialidade: '',
        foto: ''
      });
    }
  }, [barbeiro]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '16px'
    }}>
      <div style={{
        background: cores.background.card,
        borderRadius: '12px',
        padding: '24px',
        maxWidth: '450px',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
        border: `1px solid ${cores.primary.light}`,
        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px'
        }}>
          <h2 style={{
            color: cores.neutral.white,
            margin: 0,
            fontSize: '1.25rem',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span style={{
              width: '32px',
              height: '32px',
              background: cores.gradients.gold,
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '14px'
            }}>
              {barbeiro ? '✏️' : '➕'}
            </span>
            {barbeiro ? 'Editar Barbeiro' : 'Novo Barbeiro'}
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: cores.neutral.light,
              fontSize: '20px',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '6px',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = cores.primary.light;
              e.target.style.color = cores.neutral.white;
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'none';
              e.target.style.color = cores.neutral.light;
            }}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '16px' }}>
          <div>
            <label style={{
              display: 'block',
              fontSize: '12px',
              fontWeight: '600',
              color: cores.neutral.light,
              marginBottom: '6px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              👤 Nome *
            </label>
            <input
              type="text"
              value={formData.nome}
              onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
              required
              placeholder="Nome do barbeiro"
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '8px',
                border: `1px solid ${cores.primary.light}`,
                fontSize: '14px',
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
              fontSize: '12px',
              fontWeight: '600',
              color: cores.neutral.light,
              marginBottom: '6px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              🎯 Especialidade
            </label>
            <input
              type="text"
              value={formData.especialidade}
              onChange={(e) => setFormData({ ...formData, especialidade: e.target.value })}
              placeholder="Ex: Corte social, barba, etc."
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '8px',
                border: `1px solid ${cores.primary.light}`,
                fontSize: '14px',
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
              fontSize: '12px',
              fontWeight: '600',
              color: cores.neutral.light,
              marginBottom: '6px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              📷 URL da Foto
            </label>
            <input
              type="url"
              value={formData.foto}
              onChange={(e) => setFormData({ ...formData, foto: e.target.value })}
              placeholder="https://exemplo.com/foto.jpg"
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '8px',
                border: `1px solid ${cores.primary.light}`,
                fontSize: '14px',
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

          {formData.foto && (
            <div style={{ textAlign: 'center' }}>
              <div style={{
                fontSize: '11px',
                color: cores.neutral.light,
                marginBottom: '6px'
              }}>
                Preview:
              </div>
              <img
                src={formData.foto}
                alt="Preview"
                style={{
                  maxWidth: '100%',
                  maxHeight: '120px',
                  borderRadius: '8px',
                  border: `1px solid ${cores.primary.light}`
                }}
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </div>
          )}

          <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '10px 16px',
                background: 'transparent',
                color: cores.neutral.light,
                border: `1px solid ${cores.primary.light}`,
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '12px',
                transition: 'all 0.3s ease',
                flex: 1
              }}
              onMouseEnter={(e) => {
                e.target.style.background = cores.primary.light;
                e.target.style.color = cores.neutral.white;
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'transparent';
                e.target.style.color = cores.neutral.light;
              }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '10px 16px',
                background: cores.primary.accent,
                color: '#000',
                border: `1px solid ${cores.primary.accent}`,
                borderRadius: '8px',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontWeight: '600',
                fontSize: '12px',
                transition: 'all 0.3s ease',
                flex: 1,
                opacity: loading ? 0.7 : 1
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.target.style.background = 'transparent';
                  e.target.style.color = cores.primary.accent;
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  e.target.style.background = cores.primary.accent;
                  e.target.style.color = '#000';
                }
              }}
            >
              {loading ? '⏳ Salvando...' : (barbeiro ? '💾 Atualizar' : '✨ Criar')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default function BarbeirosPage() {
  const router = useRouter();
  const [barbeiros, setBarbeiros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [sortField, setSortField] = useState('id');
  const [sortDirection, setSortDirection] = useState('asc');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBarbeiro, setEditingBarbeiro] = useState(null);
  const [saveLoading, setSaveLoading] = useState(false);
  const [estatisticas, setEstatisticas] = useState(null);
  const itemsPerPage = 8;

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const [barbeirosData, estatisticasData] = await Promise.all([
        api('/barbeiros', { method: 'GET' }),
        api('/barbeiros/admin/estatisticas', { method: 'GET' }).catch(() => null)
      ]);

      setBarbeiros(barbeirosData);
      setEstatisticas(estatisticasData);
    } catch (err) {
      setError('Não foi possível carregar os barbeiros. Verifique a sessão.');
    } finally {
      setLoading(false);
    }
  }

  
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  
  const handleSaveBarbeiro = async (formData) => {
    setSaveLoading(true);
    try {
      if (editingBarbeiro) {
        await api(`/barbeiros/${editingBarbeiro.id}`, {
          method: 'PUT',
          body: JSON.stringify(formData)
        });
      } else {
        await api('/barbeiros', {
          method: 'POST',
          body: JSON.stringify(formData)
        });
      }

      await fetchData();
      setModalOpen(false);
      setEditingBarbeiro(null);
    } catch (err) {
      setError(err.message || 'Erro ao salvar barbeiro.');
    } finally {
      setSaveLoading(false);
    }
  };

  
  const handleToggleStatus = async (barbeiro) => {
    if (!confirm(`Tem certeza que deseja ${barbeiro.ativo ? 'desativar' : 'ativar'} o barbeiro ${barbeiro.nome}?`)) {
      return;
    }

    try {
      await api(`/barbeiros/${barbeiro.id}/toggle-status`, {
        method: 'PATCH'
      });
      await fetchData();
    } catch (err) {
      setError(err.message || 'Erro ao alterar status do barbeiro.');
    }
  };

  
  const handleDeleteBarbeiro = async (barbeiro) => {
    if (!confirm(`Tem certeza que deseja excluir permanentemente o barbeiro ${barbeiro.nome}? Esta ação não pode ser desfeita.`)) {
      return;
    }

    try {
      await api(`/barbeiros/${barbeiro.id}`, {
        method: 'DELETE'
      });
      await fetchData();
    } catch (err) {
      setError(err.message || 'Erro ao excluir barbeiro.');
    }
  };

  
  const filteredBarbeiros = barbeiros.filter(barbeiro => {
    const matchesSearch = barbeiro.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      barbeiro.especialidade?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      barbeiro.id?.toString().includes(searchTerm);

    const matchesStatus = statusFilter === 'todos' ||
      (statusFilter === 'ativo' && barbeiro.ativo) ||
      (statusFilter === 'inativo' && !barbeiro.ativo);

    return matchesSearch && matchesStatus;
  });

  
  const sortedBarbeiros = [...filteredBarbeiros].sort((a, b) => {
    let aValue = a[sortField];
    let bValue = b[sortField];

    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  
  const totalPages = Math.ceil(sortedBarbeiros.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentBarbeiros = sortedBarbeiros.slice(startIndex, startIndex + itemsPerPage);

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
            Carregando Barbeiros
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
              💈 Barbeiros
            </h1>
          </div>

          
          <div style={{
            display: 'flex',
            gap: '12px',
            alignItems: 'center'
          }}>
            <div style={{
              padding: '5px 16px',
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
                {sortedBarbeiros.length}
              </div>
              <div style={{
                fontSize: '12px',
                color: cores.neutral.light,
                fontWeight: '600'
              }}>
                TOTAL
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <button
                onClick={() => {
                  setEditingBarbeiro(null);
                  setModalOpen(true);
                }}
                style={{
                  padding: '10px 16px',
                  background: cores.status.success,
                  color: 'white',
                  border: `1px solid ${cores.status.success}`,
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '13px',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'transparent';
                  e.target.style.color = cores.status.success;
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = cores.status.success;
                  e.target.style.color = 'white';
                }}
              >
                ➕ Novo
              </button>

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
                  fontSize: '13px',
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

        
        {estatisticas && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '16px',
            marginBottom: '24px'
          }}>
            <StatCard
              title="Total"
              value={estatisticas.totalBarbeiros}
              icon="💈"
              color={cores.primary.accent}
            />
            <StatCard
              title="Ativos"
              value={estatisticas.barbeirosAtivos}
              icon="✅"
              color={cores.status.success}
            />
            <StatCard
              title="Inativos"
              value={estatisticas.barbeirosInativos}
              icon="❌"
              color={cores.status.error}
            />
            <StatCard
              title="Taxa Ativos"
              value={`${estatisticas.taxaAtivos}%`}
              icon="📊"
              color={cores.secondary.main}
            />
          </div>
        )}

        
        <div style={{
          background: cores.background.card,
          border: `1px solid ${cores.primary.light}`,
          borderRadius: '10px',
          padding: '20px',
          marginBottom: '24px',
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
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
                🔍 Pesquisa:
              </label>
              <input
                type="text"
                placeholder="Buscar por nome, ID..."
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
                📊 Status:
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
                <option value="todos">Todos</option>
                <option value="ativo">✅ Ativos</option>
                <option value="inativo">❌ Inativos</option>
              </select>
            </div>

            <div style={{
              display: 'flex',
              gap: '8px',
              alignItems: 'center',
              justifyContent: 'flex-end'
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
                🗑️ Limpar
              </button>
            </div>
          </div>
        </div>

        {sortedBarbeiros.length === 0 ? (
          <div style={{
            background: cores.background.card,
            border: `1px solid ${cores.primary.light}`,
            borderRadius: '10px',
            padding: '40px 20px',
            textAlign: 'center',
            color: cores.neutral.light
          }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '12px', opacity: 0.5 }}>
              {barbeiros.length === 0 ? '💈' : '🔍'}
            </div>
            <h3 style={{
              color: cores.neutral.white,
              marginBottom: '8px',
              fontSize: '1rem'
            }}>
              {barbeiros.length === 0 ? 'Nenhum barbeiro encontrado' : 'Nenhum barbeiro corresponde aos filtros'}
            </h3>
            {barbeiros.length === 0 && (
              <button
                onClick={() => {
                  setEditingBarbeiro(null);
                  setModalOpen(true);
                }}
                style={{
                  marginTop: '16px',
                  padding: '8px 16px',
                  background: cores.primary.accent,
                  color: '#000',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '12px'
                }}
              >
                ➕ Cadastrar Primeiro Barbeiro
              </button>
            )}
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
              color: cores.neutral.light
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
                  {sortField === 'nome' && 'Nome'}
                  {sortField === 'especialidade' && 'Especialidade'}
                  {sortField === 'ativo' && 'Status'}
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
                  {startIndex + 1}-{Math.min(startIndex + itemsPerPage, sortedBarbeiros.length)}
                </span>
                <span>de</span>
                <span style={{ fontWeight: 'bold', color: cores.neutral.white }}>
                  {sortedBarbeiros.length}
                </span>
              </div>
            </div>

            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: '16px',
              marginBottom: '24px'
            }}>
              {currentBarbeiros.map((barbeiro) => (
                <div
                  key={barbeiro.id}
                  style={{
                    background: cores.background.card,
                    border: `1px solid ${cores.primary.light}`,
                    borderRadius: '10px',
                    padding: '16px',
                    transition: 'all 0.3s ease',
                    height: 'fit-content'
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
                    marginBottom: '12px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      {barbeiro.foto ? (
                        <img
                          src={barbeiro.foto}
                          alt={barbeiro.nome}
                          style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            objectFit: 'cover',
                            border: `2px solid ${cores.primary.accent}`
                          }}
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div style={{
                        width: '40px',
                        height: '40px',
                        background: cores.gradients.gold,
                        borderRadius: '50%',
                        display: barbeiro.foto ? 'none' : 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '14px',
                        fontWeight: 'bold',
                        color: '#000'
                      }}>
                        {barbeiro.nome?.charAt(0)?.toUpperCase() || 'B'}
                      </div>
                      <div>
                        <div style={{ fontWeight: 'bold', fontSize: '14px' }}>
                          {barbeiro.nome}
                        </div>
                        <div style={{
                          fontSize: '11px',
                          color: cores.neutral.medium,
                        }}>
                          ID: #{barbeiro.id}
                        </div>
                      </div>
                    </div>

                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '4px 8px',
                        borderRadius: '12px',
                        background: getStatusColor(barbeiro.ativo) + '20',
                        color: getStatusColor(barbeiro.ativo),
                        border: `1px solid ${getStatusColor(barbeiro.ativo)}`,
                        fontSize: '10px',
                        fontWeight: 'bold',
                        textTransform: 'uppercase',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease'
                      }}
                      onClick={() => handleToggleStatus(barbeiro)}
                    >
                      {getStatusIcon(barbeiro.ativo)}
                      {getStatusText(barbeiro.ativo)}
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
                        ESPECIALIDADE
                      </div>
                      <div style={{
                        fontSize: '12px',
                        color: cores.neutral.white,
                        fontWeight: '500'
                      }}>
                        {barbeiro.especialidade || 'Não especificada'}
                      </div>
                    </div>
                    <div>
                      <div style={{
                        fontSize: '10px',
                        color: cores.neutral.light,
                        fontWeight: '600',
                        marginBottom: '2px'
                      }}>
                        CADASTRO
                      </div>
                      <div style={{
                        fontSize: '12px',
                        color: cores.neutral.white,
                        fontWeight: '500'
                      }}>
                        {formatData(barbeiro.criadoEm)}
                      </div>
                    </div>
                  </div>

                  
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => {
                        setEditingBarbeiro(barbeiro);
                        setModalOpen(true);
                      }}
                      style={{
                        padding: '6px 10px',
                        background: cores.secondary.main,
                        color: 'white',
                        border: `1px solid ${cores.secondary.main}`,
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '11px',
                        fontWeight: 'bold',
                        transition: 'all 0.3s ease',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        flex: 1
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.background = 'transparent';
                        e.target.style.color = cores.secondary.main;
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = cores.secondary.main;
                        e.target.style.color = 'white';
                      }}
                    >
                      ✏️ Editar
                    </button>
                    <button
                      onClick={() => handleDeleteBarbeiro(barbeiro)}
                      style={{
                        padding: '6px 10px',
                        background: cores.status.error,
                        color: 'white',
                        border: `1px solid ${cores.status.error}`,
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '11px',
                        fontWeight: 'bold',
                        transition: 'all 0.3s ease',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        flex: 1
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
                      🗑️ Excluir
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <Pagination />
          </>
        )}
      </div>

      <BarbeiroModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingBarbeiro(null);
        }}
        barbeiro={editingBarbeiro}
        onSave={handleSaveBarbeiro}
        loading={saveLoading}
      />

      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
      `}</style>
    </div>
  );
}