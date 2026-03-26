// Sistema de Autenticação com Appwrite

// Inicializa cliente Appwrite (apenas uma vez)
let appwriteClient, appwriteAccount;

if (typeof window.appwriteAuth === 'undefined') {
    appwriteClient = new Appwrite.Client();
    appwriteClient
        .setEndpoint(APPWRITE_CONFIG.endpoint)
        .setProject(APPWRITE_CONFIG.projectId);

    appwriteAccount = new Appwrite.Account(appwriteClient);
    window.appwriteAuth = true;
} else {
    // Reutiliza instâncias existentes
    appwriteClient = window.appwriteClient;
    appwriteAccount = window.appwriteAccount;
}

// Guarda instâncias no window para reutilização
window.appwriteClient = appwriteClient;
window.appwriteAccount = appwriteAccount;

/**
 * Tenta fazer login com as credenciais fornecidas usando Appwrite
 */
async function login(email, password) {
    try {
        // Cria sessão no Appwrite (gerenciada automaticamente por cookies)
        await appwriteAccount.createEmailPasswordSession(email, password);
        
        // Obtém informações do usuário
        const user = await appwriteAccount.get();
        
        return { success: true, user };
    } catch (error) {
        console.error('Erro no login:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Faz logout
 */
async function logout() {
    try {
        // Deleta sessão no Appwrite
        await appwriteAccount.deleteSession('current');
    } catch (error) {
        console.error('Erro ao fazer logout:', error);
    } finally {
        window.location.href = 'login.html';
    }
}

/**
 * Verifica se o usuário está autenticado (verifica diretamente no Appwrite)
 */
async function isAuthenticated() {
    try {
        // Tenta obter dados do usuário - se funcionar, está autenticado
        await appwriteAccount.get();
        return true;
    } catch (error) {
        // Não está autenticado
        return false;
    }
}

/**
 * Obtém informações do usuário autenticado
 */
async function getCurrentUser() {
    try {
        const user = await appwriteAccount.get();
        return {
            id: user.$id,
            email: user.email,
            name: user.name
        };
    } catch (error) {
        return null;
    }
}

/**
 * Protege a página - redireciona para login se não estiver autenticado
 */
async function requireAuth() {
    const authenticated = await isAuthenticated();
    if (!authenticated) {
        window.location.href = 'login.html';
    }
}

/**
 * Cria uma nova conta de usuário (para registro)
 */
async function register(email, password, name) {
    try {
        await appwriteAccount.create('unique()', email, password, name);
        // Após criar, faz login automaticamente
        return await login(email, password);
    } catch (error) {
        console.error('Erro no registro:', error);
        return { success: false, error: error.message };
    }
}
