
const API_BASE_URL = 'https://agendou-back-9dr1.vercel.app/api';


function getToken() {
  if (typeof document !== 'undefined') {
    return document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
  }
  return null;
}

function saveToken(token) {
  if (typeof document !== 'undefined') {
    const maxAge = 60 * 60 * 24; 
    document.cookie = `token=${token}; Max-Age=${maxAge}; path=/; Secure; SameSite=Lax;`;
    console.log('✅ Token salvo no cookie');
  }
}


function removeToken() {
  if (typeof document !== 'undefined') {
    document.cookie = 'token=; Max-Age=-99999999; path=/;';
    console.log('🗑️ Token removido dos cookies');
  }
}

export async function api(url, options = {}) {
    const token = getToken();
    
    const headers = {
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...(!options.headers?.['Content-Type'] && { 'Content-Type': 'application/json' }),
        ...options.headers
    };

    console.log('🌐 Fazendo requisição para:', `${API_BASE_URL}${url}`);
    console.log('🔑 Token presente:', !!token);

    try {
        const response = await fetch(`${API_BASE_URL}${url}`, { 
            ...options, 
            headers,
            credentials: 'include'
        });

        console.log('📨 Resposta recebida:', response.status, response.statusText);

        
        if ([401, 403].includes(response.status) && !url.includes('/login')) {
            console.log('❌ Token inválido ou expirado, removendo...');
            removeToken();
            if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
                window.location.href = '/login';
            }
            throw new Error('Sessão expirada ou token inválido');
        }

        if (response.status === 204) {
            return null;
        }

        const data = await response.json();

    
        if (!response.ok && response.status !== 404) {
            throw new Error(data.error || `Erro na requisição para ${url}`);
        }

       
        if (response.status === 404) {
            console.log('📭 Recurso não encontrado (404):', url);
            return null;
        }

        return data;

    } catch (error) {
        console.error('❌ Erro na requisição API:', error);
        
        
        if (error.message.includes('404') || error.message.includes('não encontrada')) {
            console.log('📭 Avaliação não encontrada (retornando null)');
            return null;
        }
        
        throw error;
    }
}


export async function loginAdmin(email, senha) {
    console.log('🔐 Iniciando login admin:', email);
    
    const response = await fetch(`${API_BASE_URL}/auth/login-admin`, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, senha }),
        credentials: 'include'
    });

    console.log('📨 Status da resposta login:', response.status);

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Erro desconhecido' }));
        throw new Error(errorData.error || 'Erro no login');
    }

    const data = await response.json();
    
    if (data.token) {
        saveToken(data.token);
    }
    
    return data;
}

export async function verifyAdmin() {
    console.log('🔍 Verificando se usuário é admin...');
    const token = getToken();
    
    if (!token) {
        console.log('❌ Nenhum token encontrado para verificação');
        throw new Error('Token não encontrado');
    }
    
    return await api('/auth/verify-admin');
}

export async function checkAuthStatus() {
    const token = getToken();
    
    if (!token) {
        console.log('🔍 Nenhum token encontrado - usuário não autenticado');
        return { authenticated: false };
    }
    
    try {
        const response = await api('/auth/verify');
        return { 
            authenticated: true, 
            user: response.usuario 
        };
    } catch (error) {
        console.log('❌ Token inválido - removendo...');
        removeToken();
        return { authenticated: false };
    }
}


export function logout() {
    console.log('🚪 Realizando logout...');
    removeToken();
    
    if (typeof window !== 'undefined') {
        window.location.href = '/login';
    }
}


export async function getDashboardData() {
    return await api('/admin/dashboard');
}


export async function getAvaliacoesAdmin() {
    try {
        console.log('📊 Buscando TODAS as avaliações através da rota admin...');
        
        const avaliacoes = await api('/avaliacoes/admin/todas-avaliacoes');
        
        if (!avaliacoes) {
            console.log('📭 Nenhuma avaliação encontrada no sistema');
            return [];
        }
        
        console.log(`✅ ${avaliacoes.length} avaliações encontradas através da rota admin`);
        return avaliacoes;
        
    } catch (error) {
        console.error('❌ Erro ao buscar avaliações (admin):', error);
        
        return [];
    }
}

export async function getEstatisticasAvaliacoes() {
    try {
        const avaliacoes = await getAvaliacoesAdmin();
        
        const estatisticas = {
            total: avaliacoes.length,
            media: avaliacoes.length > 0 
                ? (avaliacoes.reduce((acc, av) => acc + av.nota, 0) / avaliacoes.length).toFixed(1)
                : 0,
            comComentario: avaliacoes.filter(av => av.comentario && av.comentario.trim() !== '').length,
            semComentario: avaliacoes.filter(av => !av.comentario || av.comentario.trim() === '').length
        };

        estatisticas.distribuicaoNotas = {
            5: avaliacoes.filter(av => av.nota === 5).length,
            4: avaliacoes.filter(av => av.nota === 4).length,
            3: avaliacoes.filter(av => av.nota === 3).length,
            2: avaliacoes.filter(av => av.nota === 2).length,
            1: avaliacoes.filter(av => av.nota === 1).length
        };

        return estatisticas;
    } catch (error) {
        console.error('❌ Erro ao calcular estatísticas:', error);
        return {
            total: 0,
            media: 0,
            comComentario: 0,
            semComentario: 0,
            distribuicaoNotas: {5:0,4:0,3:0,2:0,1:0}
        };
    }
}

export async function getAvaliacaoPorAgendamento(agendamentoId) {
    try {
        const avaliacao = await api(`/avaliacoes/agendamento/${agendamentoId}`);
        return avaliacao;
    } catch (error) {
        console.log(`📭 Avaliação não encontrada para agendamento ${agendamentoId}`);
        return null;
    }
}