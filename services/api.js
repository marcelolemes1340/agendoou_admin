
// admin/services/api.js

// URL do seu back-end (ajuste se necessário)
const API_URL = "http://localhost:3001"; // ou onde seu back-end está rodando

// Função para login de administrador
export async function loginAdmin(email, senha) {
  const res = await fetch(`${API_URL}/admin/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, senha }),
  });

  if (!res.ok) {
    throw new Error("Falha no login. Verifique email e senha.");
  }

  const data = await res.json();
  return data; // normalmente retorna { token: "..." }
}

// Função exemplo para pegar dados do dashboard
export async function getDashboardData(token) {
  const res = await fetch(`${API_URL}/admin/dashboard`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    throw new Error("Erro ao buscar dados do dashboard");
  }

  return res.json();
}
