
'use client';

import { useEffect, useState } from 'react';
import { api, getAvaliacoesAdmin, getEstatisticasAvaliacoes } from '../../../services/api';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { cores } from '@/lib/cores';

export default function AvaliacoesPage() {
    const router = useRouter();
    const [avaliacoes, setAvaliacoes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filtroNota, setFiltroNota] = useState('todas');
    const [filtroComentario, setFiltroComentario] = useState('todas');
    const [filtroData, setFiltroData] = useState('todas'); 
    const [dataInicio, setDataInicio] = useState('');
    const [dataFim, setDataFim] = useState('');
    const [paginaAtual, setPaginaAtual] = useState(1);
    const [avaliacoesPorPagina] = useState(8);

    const [estatisticas, setEstatisticas] = useState({
        total: 0,
        media: 0,
        comComentario: 0,
        semComentario: 0,
        distribuicaoNotas: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
    });

    useEffect(() => {
        fetchAvaliacoes();
    }, []);

    async function fetchAvaliacoes() {
        try {
            setLoading(true);
            setError(null);

            console.log('🔄 Iniciando busca por avaliações...');

            const avaliacoesData = await getAvaliacoesAdmin();
            const stats = await getEstatisticasAvaliacoes();

            setAvaliacoes(avaliacoesData);
            setEstatisticas(stats);

            console.log(`✅ ${avaliacoesData.length} avaliações carregadas com sucesso`);

        } catch (err) {
            console.error('❌ Erro crítico ao buscar avaliações:', err);
            setError('Não foi possível carregar as avaliações. Verifique sua conexão e tente novamente.');

            setAvaliacoes([]);
            setEstatisticas({
                total: 0,
                media: 0,
                comComentario: 0,
                semComentario: 0,
                distribuicaoNotas: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
            });
        } finally {
            setLoading(false);
        }
    }

  
    const dataDentroDoPeriodo = (dataAvaliacao, periodo) => {
        const hoje = new Date();
        const data = new Date(dataAvaliacao);

        switch (periodo) {
            case 'hoje':
                return data.toDateString() === hoje.toDateString();

            case 'semana':
                const umaSemanaAtras = new Date();
                umaSemanaAtras.setDate(hoje.getDate() - 7);
                return data >= umaSemanaAtras && data <= hoje;

            case 'mes':
                const umMesAtras = new Date();
                umMesAtras.setMonth(hoje.getMonth() - 1);
                return data >= umMesAtras && data <= hoje;

            case 'personalizado':
                if (!dataInicio || !dataFim) return true;
                const inicio = new Date(dataInicio);
                const fim = new Date(dataFim);
                fim.setHours(23, 59, 59, 999); 
                return data >= inicio && data <= fim;

            default:
                return true;
        }
    };

    const avaliacoesFiltradas = avaliacoes.filter(avaliacao => {
        const notaMatch = filtroNota === 'todas' || avaliacao.nota === parseInt(filtroNota);
        const comentarioMatch =
            filtroComentario === 'todas' ||
            (filtroComentario === 'com' && avaliacao.comentario && avaliacao.comentario.trim() !== '') ||
            (filtroComentario === 'sem' && (!avaliacao.comentario || avaliacao.comentario.trim() === ''));

        const dataMatch = dataDentroDoPeriodo(avaliacao.criadoEm, filtroData);

        return notaMatch && comentarioMatch && dataMatch;
    });

   
    const indexUltimaAvaliacao = paginaAtual * avaliacoesPorPagina;
    const indexPrimeiraAvaliacao = indexUltimaAvaliacao - avaliacoesPorPagina;
    const avaliacoesPaginaAtual = avaliacoesFiltradas.slice(indexPrimeiraAvaliacao, indexUltimaAvaliacao);
    const totalPaginas = Math.ceil(avaliacoesFiltradas.length / avaliacoesPorPagina);

    const mudarPagina = (numeroPagina) => {
        setPaginaAtual(numeroPagina);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const renderEstrelas = (nota, tamanho = 'sm') => {
        const tamanhos = {
            sm: 'text-base',
            md: 'text-lg',
            lg: 'text-xl'
        };

        return (
            <div className={`flex space-x-0.5 ${tamanhos[tamanho]}`}>
                {[1, 2, 3, 4, 5].map((estrela) => (
                    <span
                        key={estrela}
                        className={estrela <= nota ? 'text-yellow-400' : 'text-gray-400'}
                    >
                        {estrela <= nota ? '⭐' : '☆'}
                    </span>
                ))}
            </div>
        );
    };

    const formatarData = (dataString) => {
        try {
            return new Date(dataString).toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });
        } catch (error) {
            return 'Data inválida';
        }
    };

    const formatarDataCompleta = (dataString) => {
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

    const formatarDataAgendamento = (dataString) => {
        try {
            return new Date(dataString + 'T00:00:00').toLocaleDateString('pt-BR');
        } catch (error) {
            return dataString;
        }
    };

    const getClienteIdByEmail = async (email) => {
        if (!email) return null;

        try {
            const usuarios = await api('/usuarios');
            const cliente = usuarios.find(user => user.email === email);
            return cliente ? cliente.id : null;
        } catch (error) {
            console.error('Erro ao buscar cliente:', error);
            return null;
        }
    };

    const handleClienteClick = async (email) => {
        if (!email) {
            alert('Email do cliente não disponível.');
            return;
        }

        const clienteId = await getClienteIdByEmail(email);
        if (clienteId) {
            router.push(`/clientes/${clienteId}`);
        } else {
            alert('Cliente não encontrado no sistema. Ele pode ter feito o agendamento sem cadastro.');
        }
    };

    useEffect(() => {
        setPaginaAtual(1);
    }, [filtroNota, filtroComentario, filtroData, dataInicio, dataFim]);

    const limparTodosFiltros = () => {
        setFiltroNota('todas');
        setFiltroComentario('todas');
        setFiltroData('todas');
        setDataInicio('');
        setDataFim('');
    };

    const filtrosAtivos = filtroNota !== 'todas' || filtroComentario !== 'todas' || filtroData !== 'todas';

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
                    Carregando Avaliações
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
                            ⭐ Avaliações
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
                                {estatisticas.total}
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
                                color: estatisticas.media >= 4 ? cores.status.success :
                                    estatisticas.media >= 3 ? cores.status.warning : cores.status.error,
                                marginBottom: '4px' 
                            }}>
                                {estatisticas.media}/5
                            </div>
                            <div style={{
                                fontSize: '11px', 
                                color: cores.neutral.light,
                                fontWeight: '600'
                            }}>
                                MÉDIA
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
                            onClick={fetchAvaliacoes}
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
                        gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', 
                        gap: '18px', 
                        alignItems: 'end',
                        marginBottom: filtroData === 'personalizado' ? '18px' : '0' 
                    }}>
                        
                        <div>
                            <label style={{
                                display: 'block',
                                color: cores.neutral.light,
                                fontSize: '13px', 
                                fontWeight: '600',
                                marginBottom: '8px' 
                            }}>
                                Nota:
                            </label>
                            <select
                                value={filtroNota}
                                onChange={(e) => setFiltroNota(e.target.value)}
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
                                <option value="todas">Todas as notas</option>
                                <option value="5">⭐ 5 estrelas</option>
                                <option value="4">⭐ 4 estrelas</option>
                                <option value="3">⭐ 3 estrelas</option>
                                <option value="2">⭐ 2 estrelas</option>
                                <option value="1">⭐ 1 estrela</option>
                            </select>
                        </div>

                    
                        <div>
                            <label style={{
                                display: 'block',
                                color: cores.neutral.light,
                                fontSize: '13px',
                                fontWeight: '600',
                                marginBottom: '8px' 
                            }}>
                                Comentário:
                            </label>
                            <select
                                value={filtroComentario}
                                onChange={(e) => setFiltroComentario(e.target.value)}
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
                                <option value="todas">Todos</option>
                                <option value="com">Com comentário</option>
                                <option value="sem">Sem comentário</option>
                            </select>
                        </div>

                        
                        <div>
                            <label style={{
                                display: 'block',
                                color: cores.neutral.light,
                                fontSize: '13px',
                                fontWeight: '600',
                                marginBottom: '8px' 
                            }}>
                                Período:
                            </label>
                            <select
                                value={filtroData}
                                onChange={(e) => setFiltroData(e.target.value)}
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
                                <option value="todas">Todo período</option>
                                <option value="hoje">Hoje</option>
                                <option value="semana">Última semana</option>
                                <option value="mes">Último mês</option>
                                <option value="personalizado">Personalizado</option>
                            </select>
                        </div>

                        
                        <div style={{
                            display: 'flex',
                            gap: '10px', 
                            alignItems: 'center',
                            justifyContent: 'flex-end'
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
                                        height: 'fit-content'
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
                                onClick={fetchAvaliacoes}
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
                                    height: 'fit-content'
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

                    
                    {filtroData === 'personalizado' && (
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                            gap: '18px', 
                            alignItems: 'end',
                            paddingTop: '18px', 
                            borderTop: `1px solid ${cores.primary.light}20`,
                            marginTop: '18px' 
                        }}>
                            <div>
                                <label style={{
                                    display: 'block',
                                    color: cores.neutral.light,
                                    fontSize: '13px', 
                                    fontWeight: '600',
                                    marginBottom: '8px' 
                                }}>
                                    Data Início:
                                </label>
                                <input
                                    type="date"
                                    value={dataInicio}
                                    onChange={(e) => setDataInicio(e.target.value)}
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
                                />
                            </div>
                            <div>
                                <label style={{
                                    display: 'block',
                                    color: cores.neutral.light,
                                    fontSize: '13px', 
                                    fontWeight: '600',
                                    marginBottom: '8px' 
                                }}>
                                    Data Fim:
                                </label>
                                <input
                                    type="date"
                                    value={dataFim}
                                    onChange={(e) => setDataFim(e.target.value)}
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
                                />
                            </div>
                            
                            <div></div>
                            <div></div>
                        </div>
                    )}

                    
                    {avaliacoes.length > 0 && (
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
                                    Distribuição:
                                </span>
                                {[5, 4, 3, 2, 1].map(nota => (
                                    <div
                                        key={nota}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px', 
                                            padding: '6px 10px', 
                                            background: filtroNota === nota.toString() ? cores.primary.accent : cores.background.secondary,
                                            borderRadius: '14px', 
                                            border: `1px solid ${cores.primary.light}`,
                                            cursor: 'pointer',
                                            transition: 'all 0.3s ease',
                                            color: filtroNota === nota.toString() ? '#000' : cores.neutral.white
                                        }}
                                        onClick={() => setFiltroNota(filtroNota === nota.toString() ? 'todas' : nota.toString())}
                                    >
                                        {renderEstrelas(nota, 'sm')}
                                        <span style={{
                                            fontSize: '11px', 
                                            fontWeight: 'bold'
                                        }}>
                                            {estatisticas.distribuicaoNotas[nota]}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
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
                            {avaliacoesFiltradas.length === avaliacoes.length
                                ? `Avaliações (${avaliacoesFiltradas.length})`
                                : `Filtradas (${avaliacoesFiltradas.length})`
                            }
                        </h2>

                        
                        {totalPaginas > 1 && (
                            <div style={{
                                fontSize: '13px', 
                                color: cores.neutral.light
                            }}>
                                Página {paginaAtual} de {totalPaginas}
                            </div>
                        )}
                    </div>

                    {avaliacoesFiltradas.length === 0 ? (
                        <div style={{
                            background: cores.background.card,
                            border: `1px solid ${cores.primary.light}`,
                            borderRadius: '14px', 
                            padding: '44px 22px', 
                            textAlign: 'center',
                            color: cores.neutral.light
                        }}>
                            <div style={{ fontSize: '3rem', marginBottom: '14px', opacity: 0.5 }}> 
                                {avaliacoes.length === 0 ? '📭' : '🔍'}
                            </div>
                            <h3 style={{
                                color: cores.neutral.white,
                                marginBottom: '10px', 
                                fontSize: '1.125rem'  
                            }}>
                                {avaliacoes.length === 0 ? 'Nenhuma avaliação encontrada' : 'Nenhuma avaliação corresponde aos filtros'}
                            </h3>
                            {avaliacoes.length === 0 && (
                                <button
                                    onClick={fetchAvaliacoes}
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
                            
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', 
                                gap: '18px', 
                                marginBottom: '28px' 
                            }}>
                                {avaliacoesPaginaAtual.map((avaliacao) => (
                                    <div
                                        key={avaliacao.id}
                                        style={{
                                            background: cores.background.card,
                                            border: `1px solid ${cores.primary.light}`,
                                            borderRadius: '14px',
                                            padding: '18px', 
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
                                            marginBottom: '14px'
                                        }}>
                                            <div>
                                                <div style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '10px',
                                                    marginBottom: '6px'
                                                }}>
                                                    {renderEstrelas(avaliacao.nota, 'sm')}
                                                    <span style={{
                                                        fontSize: '15px',
                                                        fontWeight: 'bold',
                                                        color: cores.neutral.white
                                                    }}>
                                                        {avaliacao.nota}/5
                                                    </span>
                                                </div>
                                                <div style={{
                                                    fontSize: '12px',
                                                    color: cores.neutral.light
                                                }}>
                                                    {formatarDataCompleta(avaliacao.criadoEm)}
                                                </div>
                                            </div>

                                        
                                            {avaliacao.agendamento?.email && (
                                                <button
                                                    onClick={() => handleClienteClick(avaliacao.agendamento.email)}
                                                    style={{
                                                        padding: '6px 10px',
                                                        background: 'transparent',
                                                        color: cores.secondary.main,
                                                        border: `1px solid ${cores.secondary.main}`,
                                                        borderRadius: '6px',
                                                        cursor: 'pointer',
                                                        fontWeight: '600',
                                                        fontSize: '11px',
                                                        transition: 'all 0.3s ease'
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
                                                    👤 Cliente
                                                </button>
                                            )}
                                        </div>

                                        
                                        <div style={{
                                            display: 'grid',
                                            gridTemplateColumns: '1fr 1fr',
                                            gap: '10px',
                                            marginBottom: '14px'
                                        }}>
                                            <div>
                                                <div style={{
                                                    fontSize: '11px',
                                                    color: cores.neutral.light,
                                                    fontWeight: '600',
                                                    marginBottom: '4px'
                                                }}>
                                                    CLIENTE
                                                </div>
                                                <div style={{
                                                    fontSize: '13px',
                                                    color: cores.neutral.white,
                                                    fontWeight: '500'
                                                }}>
                                                    {avaliacao.agendamento?.nome || 'Cliente não identificado'}
                                                </div>
                                            </div>
                                            <div>
                                                <div style={{
                                                    fontSize: '11px',
                                                    color: cores.neutral.light,
                                                    fontWeight: '600',
                                                    marginBottom: '4px'
                                                }}>
                                                    BARBEIRO
                                                </div>
                                                <div style={{
                                                    fontSize: '13px',
                                                    color: cores.neutral.white,
                                                    fontWeight: '500'
                                                }}>
                                                    {avaliacao.agendamento?.profissional || 'N/A'}
                                                </div>
                                            </div>
                                            <div>
                                                <div style={{
                                                    fontSize: '11px',
                                                    color: cores.neutral.light,
                                                    fontWeight: '600',
                                                    marginBottom: '4px'
                                                }}>
                                                    SERVIÇO
                                                </div>
                                                <div style={{
                                                    fontSize: '13px',
                                                    color: cores.neutral.white,
                                                    fontWeight: '500'
                                                }}>
                                                    {avaliacao.agendamento?.servico || 'N/A'}
                                                </div>
                                            </div>
                                            <div>
                                                <div style={{
                                                    fontSize: '11px',
                                                    color: cores.neutral.light,
                                                    fontWeight: '600',
                                                    marginBottom: '4px'
                                                }}>
                                                    DATA SERVIÇO
                                                </div>
                                                <div style={{
                                                    fontSize: '13px',
                                                    color: cores.neutral.white,
                                                    fontWeight: '500'
                                                }}>
                                                    {avaliacao.agendamento?.data ? formatarDataAgendamento(avaliacao.agendamento.data) : 'N/A'}
                                                </div>
                                            </div>
                                        </div>

                                        
                                        {avaliacao.comentario && avaliacao.comentario.trim() !== '' && (
                                            <div style={{
                                                padding: '10px', 
                                                background: cores.background.secondary,
                                                borderRadius: '8px', 
                                                borderLeft: `3px solid ${cores.primary.accent}`
                                            }}>
                                                <div style={{
                                                    fontSize: '11px', 
                                                    color: cores.neutral.light,
                                                    fontWeight: '600',
                                                    marginBottom: '6px' 
                                                }}>
                                                    COMENTÁRIO:
                                                </div>
                                                <p style={{
                                                    margin: 0,
                                                    color: cores.neutral.white,
                                                    fontSize: '12px', 
                                                    lineHeight: '1.4', 
                                                    fontStyle: 'italic',
                                                    display: '-webkit-box',
                                                    WebkitLineClamp: 3,
                                                    WebkitBoxOrient: 'vertical',
                                                    overflow: 'hidden'
                                                }}>
                                                    "{avaliacao.comentario}"
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>

                            
                            {totalPaginas > 1 && (
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    gap: '10px', 
                                    marginTop: '28px' 
                                }}>
                                    <button
                                        onClick={() => mudarPagina(paginaAtual - 1)}
                                        disabled={paginaAtual === 1}
                                        style={{
                                            padding: '8px 14px', 
                                            background: paginaAtual === 1 ? cores.background.secondary : 'transparent',
                                            color: paginaAtual === 1 ? cores.neutral.light : cores.primary.accent,
                                            border: `1px solid ${paginaAtual === 1 ? cores.primary.light : cores.primary.accent}`,
                                            borderRadius: '8px', 
                                            cursor: paginaAtual === 1 ? 'not-allowed' : 'pointer',
                                            fontSize: '13px', 
                                            opacity: paginaAtual === 1 ? 0.5 : 1
                                        }}
                                    >
                                        ← Anterior
                                    </button>

                                    
                                    {Array.from({ length: totalPaginas }, (_, i) => i + 1)
                                        .filter(numero =>
                                            numero === 1 ||
                                            numero === totalPaginas ||
                                            (numero >= paginaAtual - 1 && numero <= paginaAtual + 1)
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
                                                        onClick={() => mudarPagina(numero)}
                                                        style={{
                                                            padding: '8px 12px', 
                                                            background: paginaAtual === numero ? cores.primary.accent : 'transparent',
                                                            color: paginaAtual === numero ? '#000' : cores.neutral.white,
                                                            border: `1px solid ${paginaAtual === numero ? cores.primary.accent : cores.primary.light}`,
                                                            borderRadius: '8px', 
                                                            cursor: 'pointer',
                                                            fontSize: '13px', 
                                                            fontWeight: paginaAtual === numero ? 'bold' : 'normal',
                                                            minWidth: '36px'
                                                        }}
                                                    >
                                                        {numero}
                                                    </button>
                                                </div>
                                            );
                                        })}

                                    <button
                                        onClick={() => mudarPagina(paginaAtual + 1)}
                                        disabled={paginaAtual === totalPaginas}
                                        style={{
                                            padding: '8px 14px', 
                                            background: paginaAtual === totalPaginas ? cores.background.secondary : 'transparent',
                                            color: paginaAtual === totalPaginas ? cores.neutral.light : cores.primary.accent,
                                            border: `1px solid ${paginaAtual === totalPaginas ? cores.primary.light : cores.primary.accent}`,
                                            borderRadius: '8px', 
                                            cursor: paginaAtual === totalPaginas ? 'not-allowed' : 'pointer',
                                            fontSize: '13px', 
                                            opacity: paginaAtual === totalPaginas ? 0.5 : 1
                                        }}
                                    >
                                        Próxima →
                                    </button>
                                </div>
                            )}
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