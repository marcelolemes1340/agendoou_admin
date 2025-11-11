const API_BASE_URL = 'http://localhost:3001/api';

export async function loginAdmin(email, senha) {
  const response = await fetch(`${API_BASE_URL}/auth/login-admin`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, senha }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Erro no login');
  if (data.token) document.cookie = `token=${data.token}; Max-Age=${60 * 60 * 24}; path=/; Secure; SameSite=Lax;`;
  return data;
}

export async function registerAdmin(nome, email, senha, telefone, cpf) {
  const response = await fetch(`${API_BASE_URL}/admin/register-admin`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nome, email, senha, telefone, cpf }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Erro ao registrar administrador.');
  return data;
}

export async function api(url, options = {}) {
  const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
  const headers = { ...(token && { 'Authorization': `Bearer ${token}` }), ...(!options.headers?.['Content-Type'] && { 'Content-Type': 'application/json' }), ...options.headers };
  const response = await fetch(`${API_BASE_URL}${url}`, { ...options, headers });
  if ([401, 403].includes(response.status)) {
    document.cookie = 'token=; Max-Age=-99999999; path=/;';
    window.location.href = '/login';
    throw new Error('Sessão expirada');
  }
  if (response.status === 204) return null;
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || `Erro na requisição para ${url}`);
  return data;
}

export function logout() {
  document.cookie = 'token=; Max-Age=-99999999; path=/;';
  window.location.href = '/login';
}
