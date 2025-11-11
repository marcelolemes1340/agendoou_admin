// admin/src/app/agendamento/page.js (CORRIGIDO E ESTILIZADO)

'use client';

import { useEffect, useState } from 'react';
import { api, logout } from '../../../services/api';
import Link from 'next/link';

// 🚨 PALETA DE CORES CLARA E ROXA/AZUL (Consistente com o Dashboard) 🚨
const PALETTE = {
    primary: '#6f42c1',       // Roxo principal
    danger: '#dc3545',        // Vermelho para Sair
    background: '#f8f9fa',    // Fundo muito claro/branco
    cardBg: 'white',          // Fundo da tabela/cartão
    textColor: '#212529',     // Texto escuro
};

// Função auxiliar para cor do status
const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
        case 'confirmado': return '#4CAF50'; // Verde
        case 'cancelado': return '#f44336';  // Vermelho
        case 'concluido': return PALETTE.primary; // Roxo
        case 'pendente': default: return '#ffc107'; // Amarelo
    }
}

export default function AgendamentoPage() {
    const [agendamentos, setAgendamentos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

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

    const formatData = (isoString) => {
        if (!isoString) return 'N/A';
        const date = new Date(isoString);
        return date.toLocaleDateString('pt-BR');
    };

    if (loading) {
        return <div style={{ padding: '20px' }}>Carregando lista de agendamentos...</div>;
    }

    if (error) {
        return <div style={{ padding: '20px', color: PALETTE.danger }}>Erro: {error}</div>;
    }

    // --- Estilos de Tabela para o tema claro ---
    const tableHeaderStyle = { padding: '15px 15px', textAlign: 'left', background: PALETTE.primary, color: 'white' };
    const tableCellStyle = { padding: '12px 15px', borderBottom: `1px solid #e0e0e0`, color: PALETTE.textColor };
    // ------------------------------------------

    return (
        <div style={{ padding: '30px', maxWidth: '1200px', margin: '0 auto', background: PALETTE.background, minHeight: '100vh' }}>

            {/* Cabeçalho */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                <h1 style={{ margin: 0, fontSize: '1.8rem', color: PALETTE.textColor }}>
                    📋 Gerenciamento de Agendamentos ({agendamentos.length} no total)
                </h1>
                <button
                    onClick={logout}
                    style={{ padding: '8px 15px', background: 'none', color: PALETTE.danger, border: `1px solid ${PALETTE.danger}`, borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
                >
                    Sair
                </button>
            </div>

            <Link href="/dashboard" style={{ marginBottom: '20px', color: PALETTE.primary, textDecoration: 'none', fontWeight: 'bold', display: 'block' }}>
                &larr; Voltar para Dashboard
            </Link>


            {agendamentos.length === 0 ? (
                <p style={{ marginTop: 20 }}>Nenhum agendamento encontrado.</p>
            ) : (
                <table style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    marginTop: '20px',
                    background: PALETTE.cardBg,
                    borderRadius: '10px',
                    overflow: 'hidden',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
                }}>
                    <thead>
                        <tr>
                            <th style={tableHeaderStyle}>ID</th>
                            <th style={tableHeaderStyle}>Cliente</th>
                            <th style={tableHeaderStyle}>Serviço</th>
                            <th style={tableHeaderStyle}>Profissional</th>
                            <th style={tableHeaderStyle}>Data</th>
                            <th style={tableHeaderStyle}>Horário</th>
                            <th style={tableHeaderStyle}>Status</th>
                            <th style={tableHeaderStyle}>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {agendamentos.map((agendamento) => (
                            <tr key={agendamento.id} style={{ borderBottom: `1px solid #f0f0f0` }}>
                                <td style={tableCellStyle}>{agendamento.id}</td>
                                <td style={tableCellStyle}>{agendamento.nome}</td>
                                <td style={tableCellStyle}>{agendamento.servico}</td>
                                <td style={tableCellStyle}>{agendamento.profissional}</td>
                                <td style={tableCellStyle}>{agendamento.data || formatData(agendamento.criadoEm)}</td>
                                <td style={tableCellStyle}>{agendamento.horario}</td>
                                <td style={{ ...tableCellStyle, fontWeight: 'bold', color: getStatusColor(agendamento.status) }}>
                                    {agendamento.status?.toUpperCase()}
                                </td>
                                <td style={tableCellStyle}>
                                    {/* 🚨 CORREÇÃO DO ERRO Dynamic href: Concatena o ID na string */}
                                    <Link href={`/agendamento/${agendamento.id}`} style={{ color: PALETTE.primary, textDecoration: 'none', fontWeight: 'bold' }}>
                                        Ver Detalhes
                                    </Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

        </div>
    );
}