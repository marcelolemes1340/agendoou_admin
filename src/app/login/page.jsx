"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { loginAdmin } from "../../../services/api";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setErro("");
    setLoading(true);

    try {
      // Usa sua função loginAdmin do services/api.js
      const data = await loginAdmin(email, senha);

      // Salva token em cookie simples
      document.cookie = `token=${data?.token}; path=/; SameSite=Lax`;

      router.push("/dashboard");
    } catch (err) {
      setErro("Credenciais inválidas ou erro de rede.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 380, margin: "48px auto", background:"#151821", padding:24, borderRadius:12, border:"1px solid #232632" }}>
      <h1 style={{ marginBottom: 16 }}>Entrar</h1>
      <form onSubmit={onSubmit} style={{ display:"grid", gap:12 }}>
        <label>
          <div style={{ fontSize: 14, marginBottom: 6 }}>E-mail</div>
          <input
            type="email"
            value={email}
            onChange={e=>setEmail(e.target.value)}
            required
            placeholder="voce@exemplo.com"
            style={{ width:"100%", padding:"10px 12px", borderRadius:8, border:"1px solid #303544", background:"#0f1115", color:"#eaeaea" }}
          />
        </label>

        <label>
          <div style={{ fontSize: 14, marginBottom: 6 }}>Senha</div>
          <input
            type="password"
            value={senha}
            onChange={e=>setSenha(e.target.value)}
            required
            placeholder="••••••••"
            style={{ width:"100%", padding:"10px 12px", borderRadius:8, border:"1px solid #303544", background:"#0f1115", color:"#eaeaea" }}
          />
        </label>

        {erro && <div style={{ color:"#ff6b6b", fontSize:14 }}>{erro}</div>}

        <button
          type="submit"
          disabled={loading}
          style={{
            padding:"10px 12px",
            border:"1px solid #4c6fff",
            background:"#4c6fff",
            color:"#fff",
            borderRadius:8,
            cursor:"pointer",
            opacity: loading ? 0.8 : 1
          }}
        >
          {loading ? "Entrando..." : "Entrar"}
        </button>
      </form>
    </div>
  );
}
