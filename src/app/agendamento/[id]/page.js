// admin/src/app/agendamento/[id]/page.js

'use client';

import { useEffect, useState } from 'react';
import { api, logout } from '../../../../services/api';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

// Paleta de Cores (Consistente com Login/Dashboard)
const PALETTE = {
    primary: '#6f42c1',       // Roxo principal
    danger: '#dc3545',        // Vermelho para Cancelar
    success: '#198754',       // Verde para Confirmar
    warning: '#ffc107',       // Amarelo para Pendente
    background: '#f8f9fa',    // Fundo muito claro
    cardBg: 'white',          // Fundo do cartão
    textColor: '#212529',     // Texto escuro
};

// Funções Auxiliares de Estilo
const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
        case 'confirmado': return PALETTE.success;
        case 'cancelado': return PALETTE.danger;
        case 'concluido': return PALETTE.primary;
        case 'pendente': default: return PALETTE.warning;
    }
}

export default function DetalheAgendamentoPage() {
    // Captura o ID da URL
    const { id } = useParams();
    const router = useRouter();
    const [agendamento, setAgendamento] = useState(null);
    const [loading, setLoading] = useState(true);
    const [statusNovo, setStatusNovo] = useState('');
    const [updateLoading, setUpdateLoading] = useState(false);
    const [error, setError] = useState(null);
    const [updateError, setUpdateError] = useState(null);

    // 1. Função de Busca de Detalhes (GET /agendamentos/:id)
    async function fetchAgendamento() {
        if (!id) return;
        setLoading(true);
        setError(null);
        try {
            // 🚨 REQUISIÇÃO PROTEGIDA
            const data = await api(`/agendamentos/${id}`, { method: 'GET' });
            setAgendamento(data);
            setStatusNovo(data.status); // Define o status inicial no dropdown
        } catch (err) {
            setError('Não foi possível carregar os detalhes do agendamento. Verifique se o backend tem a rota GET /agendamentos/:id.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchAgendamento();
    }, [id]);

    // 2. Função de Atualização de Status (PATCH /agendamentos/:id)
    async function handleUpdateStatus(e) {
        e.preventDefault();
        setUpdateLoading(true);
        setUpdateError(null);
        try {
            // 🚨 REQUISIÇÃO PROTEGIDA
            const updatedData = await api(`/agendamentos/${id}`, {
                method: 'PATCH',
                body: JSON.stringify({ status: statusNovo }),
            });

            // Atualiza a tela com o novo status
            setAgendamento(updatedData);
            alert(`Status atualizado para: ${updatedData.status.toUpperCase()}`);

        } catch (err) {
            setUpdateError('Falha ao atualizar o status. Verifique se o backend tem a rota PATCH /agendamentos/:id.');
            console.error(err);
        } finally {
            setUpdateLoading(false);
        }
    }

    // Funções de Formato
    const formatData = (isoString) => isoString ? new Date(isoString).toLocaleDateString('pt-BR') : 'N/A';
    const formatHorario = (hora) => hora || 'N/A';

    // --- Renderização ---

    if (loading) return <div style={{ padding: '20px', textAlign: 'center' }}>Carregando detalhes...</div>;
    if (error) return <div style={{ padding: '20px', color: PALETTE.danger, textAlign: 'center' }}>{error}</div>;
    if (!agendamento) return <div style={{ padding: '20px', textAlign: 'center' }}>Agendamento não encontrado.</div>;

    return (
        <div style={{ minHeight: '100vh', background: PALETTE.background, padding: '40px', color: PALETTE.textColor }}>
            <div style={{ maxWidth: '800px', margin: '0 auto' }}>

                <Link href="/agendamento" style={{ color: PALETTE.primary, textDecoration: 'none', fontWeight: 'bold' }}>
                    &larr; Voltar para a Lista
                </Link>

                <h1 style={{ margin: '20px 0 30px', fontSize: '2rem' }}>Detalhes do Agendamento #{id}</h1>

                {/* Card de Informações do Agendamento */}
                <div style={cardStyle}>
                    <h2 style={{ color: PALETTE.primary, borderBottom: `2px solid ${PALETTE.primary}`, paddingBottom: 10, marginBottom: 20 }}>Informações do Agendamento</h2>

                    {/* Linha de Status Atual */}
                    <div style={{ marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0' }}>
                        <strong style={{ fontSize: '1.1rem' }}>Status Atual:</strong>
                        <span style={{
                            fontWeight: 'bold',
                            color: 'white',
                            backgroundColor: getStatusColor(agendamento.status),
                            padding: '5px 15px',
                            borderRadius: '20px'
                        }}>
                            {agendamento.status.toUpperCase()}
                        </span>
                    </div>

                    {/* Detalhes Principais */}
                    <DetailItem title="Cliente" value={agendamento.nome} />
                    <DetailItem title="Serviço" value={agendamento.servico} />
                    <DetailItem title="Profissional" value={agendamento.profissional} />
                    <DetailItem title="Data" value={formatData(agendamento.data || agendamento.criadoEm)} />
                    <DetailItem title="Horário" value={formatHorario(agendamento.horario)} />
                </div>

                {/* Card de Contato do Cliente (Seu Requisito) */}
                <div style={{ ...cardStyle, marginTop: 30 }}>
                    <h2 style={{ color: PALETTE.textColor, borderBottom: `1px solid #eee`, paddingBottom: 10, marginBottom: 20 }}>Dados de Contato</h2>
                    <DetailItem title="E-mail" value={agendamento.email || "Não fornecido"} />
                    <DetailItem title="Telefone/Número" value={agendamento.telefone || "Não fornecido"} />
                </div>

                {/* Área de Atualização de Status */}
                <div style={{ ...cardStyle, marginTop: 30, borderLeft: `5px solid ${PALETTE.primary}` }}>
                    <h2 style={{ color: PALETTE.primary, marginBottom: 20 }}>Atualizar Status</h2>
                    <form onSubmit={handleUpdateStatus}>
                        <label style={{ display: 'grid', gap: 6 }}>
                            <div style={{ fontWeight: 'bold' }}>Novo Status:</div>
                            <select
                                value={statusNovo}
                                onChange={(e) => setStatusNovo(e.target.value)}
                                style={selectStyle}
                                disabled={updateLoading}
                            >
                                <option value="pendente">Pendente</option>
                                <option value="confirmado">Confirmado</option>
                                <option value="cancelado">Cancelado</option>
                                <option value="concluido">Concluído</option>
                            </select>
                        </label>

                        {updateError && <div style={{ color: PALETTE.danger, fontSize: 14, marginTop: 10 }}>{updateError}</div>}

                        <button
                            type="submit"
                            // Desabilita se estiver carregando ou se o status não mudou
                            disabled={updateLoading || agendamento.status === statusNovo}
                            style={updateButtonStyle(updateLoading)}
                        >
                            {updateLoading ? 'Atualizando...' : 'Salvar Alteração'}
                        </button>
                    </form>
                </div>

            </div>
        </div>
    );
}

// Subcomponente para exibir detalhes
const DetailItem = ({ title, value }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px dotted #eee' }}>
        <strong style={{ opacity: 0.7 }}>{title}:</strong>
        <span>{value}</span>
    </div>
);

// Estilos
const cardStyle = {
    padding: '30px',
    borderRadius: '12px',
    background: PALETTE.cardBg,
    boxShadow: '0 8px 15px rgba(0, 0, 0, 0.08)',
};

const selectStyle = {
    padding: '10px',
    borderRadius: 8,
    border: `1px solid #ced4da`,
    fontSize: 16,
    boxSizing: 'border-box',
    width: '100%',
};

const updateButtonStyle = (loading) => ({
    padding: '12px 20px',
    background: PALETTE.primary,
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: loading ? 'not-allowed' : 'pointer',
    fontWeight: 'bold',
    marginTop: '20px',
    opacity: loading ? 0.7 : 1,
});