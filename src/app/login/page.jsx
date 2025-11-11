// admin/src/app/login/page.js (REESCRITO COM ESTILOS)

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { loginAdmin } from "../../../services/api";

// 🚨 DEFINIÇÕES DE ESTILO E PALETA (Ajuste se necessário) 🚨
const PALETTE = {
  primary: '#6f42c1', // Roxo principal (Para o botão)
  gradientStart: '#8a2be2', // Roxo do topo
  gradientEnd: '#4c6fff',   // Azul/Roxo do topo
  background: '#f8f9fa', // Fundo claro geral
  cardBg: 'white',
  inputBorder: '#ced4da',
  error: '#dc3545',
};

const cardStyle = {
  maxWidth: 400,
  margin: "80px auto 0",
  borderRadius: 20,
  boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)', // Sombra suave
  overflow: 'hidden',
  background: PALETTE.cardBg,
};

const headerStyle = {
  background: `linear-gradient(135deg, ${PALETTE.gradientStart}, ${PALETTE.gradientEnd})`,
  padding: '40px 20px',
  textAlign: 'center',
  color: 'white',
};

const formContainerStyle = {
  padding: '30px',
  display: 'grid',
  gap: 20,
};

// --- COMPONENTE PRINCIPAL ---

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  // ... (A função onSubmit permanece a mesma) ...
  async function onSubmit(e) {
    e.preventDefault();
    setErro("");
    setLoading(true);

    try {
      const data = await loginAdmin(email, senha);
      document.cookie = `token=${data?.token}; path=/; SameSite=Lax`;
      router.push("/dashboard");
    } catch (err) {
      setErro("Credenciais inválidas ou erro de rede.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: PALETTE.background }}>
      <div style={cardStyle}>

        {/* Cabeçalho com Gradiente */}
        <div style={headerStyle}>
          {/* Placeholder para a bolinha/logo do Agendou */}
          <div style={{ margin: '0 auto 15px', width: 60, height: 60, borderRadius: '50%', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 10px rgba(0,0,0,0.2)' }}>
            <span style={{ color: PALETTE.gradientStart, fontWeight: 'bold', fontSize: 12 }}>Agendou</span>
          </div>

          <h2 style={{ margin: '0', fontSize: 24 }}>Bem-vindo de volta!</h2>
          <p style={{ margin: '5px 0 0', opacity: 0.8 }}>
            Entre para gerenciar seus agendamentos
          </p>
        </div>

        {/* Formulário */}
        <form onSubmit={onSubmit} style={formContainerStyle}>

          {/* Campo E-mail */}
          <label style={{ display: 'grid', gap: 6 }}>
            <div style={{ fontSize: 14, fontWeight: '500' }}>E-mail</div>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              placeholder="seu@email.com"
              style={inputStyle}
            />
          </label>

          {/* Campo Senha */}
          <label style={{ display: 'grid', gap: 6 }}>
            <div style={{ fontSize: 14, fontWeight: '500' }}>Senha</div>
            <input
              type="password"
              value={senha}
              onChange={e => setSenha(e.target.value)}
              required
              placeholder="Digite sua senha"
              style={inputStyle}
            />
          </label>

          {/* Mensagem de Erro */}
          {erro && <div style={{ color: PALETTE.error, fontSize: 14, textAlign: 'center' }}>{erro}</div>}

          {/* Botão de Entrar */}
          <button
            type="submit"
            disabled={loading}
            style={buttonStyle(loading)}
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>

          {/* Link para Cadastro (se aplicável) */}
          <div style={{ textAlign: 'center', fontSize: 14, marginTop: 10 }}>
            Não tem uma conta? <a href="/register" style={{ color: PALETTE.primary, textDecoration: 'none', fontWeight: 'bold' }}>Cadastre-se</a>
          </div>
        </form>
      </div>
    </div>
  );
}

// --- Funções de Estilo Auxiliares ---

const inputStyle = {
  width: "100%",
  padding: "12px",
  borderRadius: 8,
  border: `1px solid ${PALETTE.inputBorder}`,
  fontSize: 16,
  boxSizing: 'border-box',
  transition: 'border-color 0.2s',
};

const buttonStyle = (loading) => ({
  padding: "12px",
  background: PALETTE.primary,
  color: "#fff",
  borderRadius: 8,
  cursor: loading ? 'not-allowed' : 'pointer',
  border: 'none',
  fontSize: 16,
  fontWeight: 'bold',
  opacity: loading ? 0.7 : 1,
  transition: 'opacity 0.2s, transform 0.1s',
});