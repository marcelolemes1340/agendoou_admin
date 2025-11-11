// admin/src/app/dashboard/page.js (CORRIGIDO E ESTILIZADO)

'use client';

import { useEffect, useState } from 'react';
import { api, logout } from '../../../services/api';
import Link from 'next/link';

// 🚨 PALETA BASEADA NA TELA HOME 🚨
const PALETTE = {
    primary: '#6f42c1',       // Roxo principal
    secondary: '#4c6fff',     // Azul/Roxo
    danger: '#dc3545',        // Vermelho para o botão Sair
    success: '#198754',       // Verde para status OK
    background: '#f8f9fa',    // Fundo muito claro/branco
    cardBg: 'white',          // Fundo do cartão branco
    textColor: '#212529',     // Texto escuro
};

export default function DashboardPage() {
    const [totalAgendamentos, setTotalAgendamentos] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function fetchDashboardData() {
            try {
                // Rota protegida: GET /agendamentos
                const data = await api('/agendamentos', { method: 'GET' });
                // Usamos o .length do array retornado para obter o total.
                setTotalAgendamentos(data.length);
            } catch (err) {
                setError('Falha ao carregar dados. Sua sessão pode ter expirado.');
                console.error('Erro no Dashboard:', err);
            } finally {
                setLoading(false);
            }
        }
        fetchDashboardData();
    }, []);


    return (
        // Fundo Claro/Branco
        <div style={{ minHeight: '100vh', background: PALETTE.background, color: PALETTE.textColor }}>

            {/* Header / Barra de Navegação (Simulando a barra superior da Home) */}
            <header style={headerStyle}>
                <h2 style={{ color: PALETTE.primary, margin: 0 }}>Agendou | ADMIN</h2>
                <button
                    onClick={logout}
                    style={logoutButtonStyle}
                >
                    Sair
                </button>
            </header>

            <div style={{ padding: '30px', maxWidth: '1200px', margin: '0 auto' }}>
                <h1 style={{ margin: '20px 0 30px', color: PALETTE.textColor, fontSize: '2rem' }}>
                    Dashboard de Gerenciamento
                </h1>

                {loading && <p>Carregando dados protegidos...</p>}
                {error && <div style={{ color: PALETTE.danger, border: `1px solid ${PALETTE.danger}`, padding: 15, borderRadius: 8 }}>Erro: {error}</div>}

                {!loading && !error && (
                    <div style={cardStyle}>

                        {/* Status de Conexão */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid #eee`, paddingBottom: '15px', marginBottom: '15px' }}>
                            <h2 style={{ margin: 0, fontSize: '1.5rem' }}>Status da API</h2>
                            <span style={{ color: PALETTE.success, fontWeight: 'bold', fontSize: '1rem' }}>
                                ✅ CONECTADO
                            </span>
                        </div>

                        {/* Métrica Principal */}
                        <h3 style={{ margin: '0 0 5px', color: PALETTE.textColor, opacity: 0.7, fontSize: '1rem' }}>
                            Agendamentos Pendentes/Totais
                        </h3>
                        <p style={{ fontSize: '3rem', fontWeight: 700, margin: '0 0 20px' }}>
                            {/* Aqui idealmente você teria uma métrica específica, mas usamos o total por enquanto */}
                            {totalAgendamentos}
                        </p>

                        {/* Botão de Ação - Caminho estático para a lista */}
                        <Link
                            href="/agendamento"
                            style={actionButtonStyle}
                        >
                            Gerenciar Agendamentos ({totalAgendamentos}) &rarr;
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}

// --- Funções de Estilo Auxiliares ---

const headerStyle = {
    background: PALETTE.cardBg, // Mantendo o header branco para o topo
    padding: '15px 30px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
};

const logoutButtonStyle = {
    padding: '8px 15px',
    background: 'none',
    color: PALETTE.danger,
    border: `1px solid ${PALETTE.danger}`,
    borderRadius: '5px',
    cursor: 'pointer',
    fontWeight: 'bold',
    transition: 'background-color 0.2s',
};

const cardStyle = {
    padding: '30px',
    borderRadius: '12px',
    background: PALETTE.cardBg,
    boxShadow: '0 8px 15px rgba(0, 0, 0, 0.08)',
    maxWidth: 450,
    marginTop: 20,
};

const actionButtonStyle = {
    display: 'block',
    textAlign: 'center',
    padding: '12px 20px',
    background: PALETTE.primary,
    color: 'white',
    textDecoration: 'none',
    borderRadius: '8px',
    fontWeight: 'bold',
    marginTop: '20px',
    transition: 'opacity 0.2s',
};