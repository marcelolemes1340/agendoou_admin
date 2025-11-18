'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { loginAdmin, verifyAdmin } from "../../../services/api";
import { cores } from "@/lib/cores";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 });

  
  useEffect(() => {
    async function checkExistingAuth() {
      try {
        console.log('🔍 Verificando autenticação existente...');
      
        
        const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
        
        if (!token) {
          console.log('❌ Token não encontrado nos cookies');
          setCheckingAuth(false);
          return;
        }

        console.log('✅ Token encontrado, verificando validade...');
        await verifyAdmin();
        console.log('✅ Usuário já autenticado, redirecionando...');
        router.push("/dashboard");
      } catch (error) {
        console.log('❌ Token inválido ou usuário não autenticado:', error.message);
        
        document.cookie = 'token=; Max-Age=-99999999; path=/;';
        setCheckingAuth(false);
      }
    }

    checkExistingAuth();
  }, [router]);

  
  async function onSubmit(e) {
    e.preventDefault();
    setErro("");
    setLoading(true);

    console.log('🎯 Iniciando login admin...', { email });

    
    if (!email || !senha) {
      setErro("Por favor, preencha todos os campos.");
      setLoading(false);
      return;
    }

    try {
      const data = await loginAdmin(email, senha);
      console.log('✅ Login bem-sucedido:', data);
      
      
      setTimeout(() => {
        router.push("/dashboard");
      }, 500);
      
    } catch (err) {
      console.error('❌ Erro no login:', err);
      
      
      if (err.message.includes('Acesso negado')) {
        setErro("Acesso restrito a administradores.");
      } else if (err.message.includes('Credenciais inválidas')) {
        setErro("Email ou senha incorretos.");
      } else if (err.message.includes('rede') || err.message.includes('Network')) {
        setErro("Erro de conexão. Verifique sua internet.");
      } else {
        setErro(err.message || "Erro ao fazer login. Tente novamente.");
      }
    } finally {
      setLoading(false);
    }
  }

  const handleMouseMove = (e) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setMousePosition({ x, y });
  };

  
  if (checkingAuth) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: cores.background.primary
      }}>
        <div style={{ textAlign: 'center', color: cores.primary.accent }}>
          <div style={{ fontSize: '3rem', marginBottom: '16px' }}>⏳</div>
          <div>Verificando autenticação...</div>
        </div>
      </div>
    );
  }

  return (
    <div 
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        background: `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, ${cores.primary.main} 0%, ${cores.background.primary} 70%)`,
        transition: 'background 0.3s ease'
      }}
      onMouseMove={handleMouseMove}
    >
      
      <div style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          top: '20%',
          left: '10%',
          width: '300px',
          height: '300px',
          background: cores.primary.accent,
          borderRadius: '50%',
          mixBlendMode: 'overlay',
          filter: 'blur(40px)',
          opacity: 0.1,
          animation: 'float 6s ease-in-out infinite'
        }}></div>
        <div style={{
          position: 'absolute',
          bottom: '20%',
          right: '10%',
          width: '200px',
          height: '200px',
          background: cores.secondary.main,
          borderRadius: '50%',
          mixBlendMode: 'overlay',
          filter: 'blur(40px)',
          opacity: 0.05,
          animation: 'float 8s ease-in-out infinite 2s'
        }}></div>
      </div>

      <div style={{
        maxWidth: '440px',
        width: '100%',
        background: cores.background.card,
        borderRadius: '20px',
        border: `1px solid ${cores.primary.light}`,
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
        overflow: 'hidden',
        backdropFilter: 'blur(10px)',
        position: 'relative',
        zIndex: 10
      }}>
        
        <div style={{
          background: cores.gradients.gold,
          padding: '50px 30px 40px',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute',
            top: '-50px',
            right: '-50px',
            width: '120px',
            height: '120px',
            background: 'rgba(255,255,255,0.1)',
            borderRadius: '50%'
          }}></div>
          <div style={{
            position: 'absolute',
            bottom: '-30px',
            left: '-30px',
            width: '80px',
            height: '80px',
            background: 'rgba(255,255,255,0.1)',
            borderRadius: '50%'
          }}></div>

          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px',
            boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
            fontSize: '24px',
            fontWeight: 'bold',
            color: cores.primary.accent
          }}>
            ✂️
          </div>

          <h2 style={{
            margin: '0 0 8px',
            fontSize: '28px',
            fontWeight: 'bold',
            color: '#000'
          }}>
            Bem-vindo de volta!
          </h2>
          <p style={{
            margin: 0,
            opacity: 0.8,
            color: '#000',
            fontSize: '16px'
          }}>
            Área administrativa Agendou
          </p>
        </div>

        
        <form onSubmit={onSubmit} style={{
          padding: '40px 30px',
          display: 'grid',
          gap: '24px'
        }}>
          
          <div>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: cores.neutral.light,
              marginBottom: '8px'
            }}>
              E-mail
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              placeholder="Digite seu e-mail"
              style={{
                width: "100%",
                padding: "16px",
                borderRadius: "12px",
                border: `1px solid ${cores.primary.light}`,
                fontSize: "16px",
                boxSizing: 'border-box',
                background: cores.background.secondary,
                color: cores.neutral.white,
                transition: 'all 0.3s ease'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = cores.primary.accent;
                e.target.style.boxShadow = `0 0 0 3px ${cores.primary.accent}20`;
              }}
              onBlur={(e) => {
                e.target.style.borderColor = cores.primary.light;
                e.target.style.boxShadow = 'none';
              }}
              disabled={loading}
            />
          </div>

          
          <div>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: cores.neutral.light,
              marginBottom: '8px'
            }}>
              Senha
            </label>
            <input
              type="password"
              value={senha}
              onChange={e => setSenha(e.target.value)}
              required
              placeholder="Digite sua senha"
              style={{
                width: "100%",
                padding: "16px",
                borderRadius: "12px",
                border: `1px solid ${cores.primary.light}`,
                fontSize: "16px",
                boxSizing: 'border-box',
                background: cores.background.secondary,
                color: cores.neutral.white,
                transition: 'all 0.3s ease'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = cores.primary.accent;
                e.target.style.boxShadow = `0 0 0 3px ${cores.primary.accent}20`;
              }}
              onBlur={(e) => {
                e.target.style.borderColor = cores.primary.light;
                e.target.style.boxShadow = 'none';
              }}
              disabled={loading}
            />
          </div>

          
          {erro && (
            <div style={{
              color: cores.status.error,
              fontSize: '14px',
              textAlign: 'center',
              padding: '16px',
              background: `${cores.status.error}15`,
              borderRadius: '12px',
              border: `1px solid ${cores.status.error}30`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}>
              <span>⚠️</span>
              {erro}
            </div>
          )}

          
          <button
            type="submit"
            disabled={loading}
            style={{
              padding: "18px",
              background: cores.gradients.gold,
              color: "#000",
              borderRadius: "12px",
              cursor: loading ? 'not-allowed' : 'pointer',
              border: 'none',
              fontSize: "16px",
              fontWeight: 'bold',
              opacity: loading ? 0.7 : 1,
              transition: 'all 0.3s ease',
              width: '100%',
              position: 'relative',
              overflow: 'hidden'
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 12px 25px rgba(212, 175, 55, 0.3)';
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = 'none';
              }
            }}
          >
            {loading ? (
              <>
                <span style={{ animation: 'spin 1s linear infinite', display: 'inline-block', marginRight: '8px' }}>⏳</span>
                Entrando...
              </>
            ) : (
              '🚀 Entrar no Sistema'
            )}
          </button>
        </form>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}