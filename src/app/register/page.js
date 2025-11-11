"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { registerAdmin } from "../../../services/api.js";

const PALETTE = {
    primary: "#6f42c1",
    gradientStart: "#8a2be2",
    gradientEnd: "#4c6fff",
    background: "#f8f9fa",
    cardBg: "white",
    inputBorder: "#ced4da",
    error: "#dc3545",
    success: "#28a745",
};

const cardStyle = {
    maxWidth: 450,
    margin: "40px auto",
    borderRadius: 20,
    boxShadow: "0 10px 30px rgba(0, 0, 0, 0.1)",
    overflow: "hidden",
    background: PALETTE.cardBg,
};

const headerStyle = {
    background: `linear-gradient(135deg, ${PALETTE.gradientStart}, ${PALETTE.gradientEnd})`,
    padding: "30px 20px",
    textAlign: "center",
    color: "white",
};

const formContainerStyle = {
    padding: "30px",
    display: "grid",
    gap: 15,
};

export default function RegisterAdminPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        nome: "",
        email: "",
        senha: "",
        telefone: "",
        cpf: "",
    });
    const [loading, setLoading] = useState(false);
    const [erro, setErro] = useState("");
    const [sucesso, setSucesso] = useState("");

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    async function onSubmit(e) {
        e.preventDefault();
        setErro("");
        setSucesso("");
        setLoading(true);

        if (Object.values(formData).some((val) => !val)) {
            setErro("Por favor, preencha todos os campos.");
            setLoading(false);
            return;
        }

        try {
            await registerAdmin(
                formData.nome,
                formData.email,
                formData.senha,
                formData.telefone,
                formData.cpf
            );

            setSucesso("✅ Administrador criado com sucesso! Redirecionando...");
            setTimeout(() => router.push("/login"), 2500);
        } catch (err) {
            setErro(err.message || "Erro desconhecido ao registrar.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div style={{ minHeight: "100vh", background: PALETTE.background }}>
            <div style={cardStyle}>
                <div style={headerStyle}>
                    <h2 style={{ margin: "0", fontSize: 24 }}>Cadastro Admin</h2>
                    <p style={{ margin: "5px 0 0", opacity: 0.8, fontWeight: "bold" }}>
                        Crie o administrador principal do sistema
                    </p>
                </div>

                <form onSubmit={onSubmit} style={formContainerStyle}>
                    <InputField label="Nome Completo" name="nome" value={formData.nome} onChange={handleChange} placeholder="Seu nome" />
                    <InputField label="E-mail (Login)" name="email" type="email" value={formData.email} onChange={handleChange} placeholder="admin@seusistema.com" />
                    <InputField label="Senha" name="senha" type="password" value={formData.senha} onChange={handleChange} placeholder="Senha segura" />
                    <InputField label="Telefone" name="telefone" value={formData.telefone} onChange={handleChange} placeholder="(XX) XXXXX-XXXX" />
                    <InputField label="CPF (Opcional)" name="cpf" value={formData.cpf} onChange={handleChange} placeholder="000.000.000-00" required={false} />

                    {erro && <div style={{ color: PALETTE.error, fontSize: 14, textAlign: "center" }}>{erro}</div>}
                    {sucesso && <div style={{ color: PALETTE.success, fontSize: 14, textAlign: "center" }}>{sucesso}</div>}

                    <button type="submit" disabled={loading || sucesso} style={buttonStyle(loading || sucesso)}>
                        {loading ? "Registrando..." : "Registrar Administrador"}
                    </button>

                    <div style={{ textAlign: "center", fontSize: 14, marginTop: 10 }}>
                        Já tem conta?{" "}
                        <a href="/login" style={{ color: PALETTE.primary, textDecoration: "none", fontWeight: "bold" }}>
                            Faça Login
                        </a>
                    </div>
                </form>
            </div>
        </div>
    );
}

const inputStyle = {
    width: "100%",
    padding: "12px",
    borderRadius: 8,
    border: `1px solid ${PALETTE.inputBorder}`,
    fontSize: 16,
    boxSizing: "border-box",
};

const buttonStyle = (loading) => ({
    padding: "12px",
    background: PALETTE.primary,
    color: "#fff",
    borderRadius: 8,
    cursor: loading ? "not-allowed" : "pointer",
    border: "none",
    fontSize: 16,
    fontWeight: "bold",
    opacity: loading ? 0.7 : 1,
});

const InputField = ({ label, name, type = "text", value, onChange, placeholder, required = true }) => (
    <label style={{ display: "grid", gap: 6 }}>
        <div style={{ fontSize: 14, fontWeight: "500" }}>{label}</div>
        <input
            type={type}
            name={name}
            value={value}
            onChange={onChange}
            required={required}
            placeholder={placeholder}
            style={inputStyle}
        />
    </label>
);
