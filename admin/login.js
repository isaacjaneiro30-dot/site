// Script da página de login com Appwrite
// Verifica se já está logado - redireciona para dashboard
(async () => {
    const authenticated = await isAuthenticated();
    if (authenticated) {
        window.location.href = 'dashboard.html';
    }
})();

// Controle de rate limiting
let loginAttempts = 0;
let lastAttemptTime = 0;
const MAX_ATTEMPTS = 3;
const COOLDOWN_TIME = 60000; // 1 minuto

// Gerenciar envio do formulário de login
document.getElementById('loginForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    // Verificar rate limiting local
    const now = Date.now();
    if (loginAttempts >= MAX_ATTEMPTS && (now - lastAttemptTime) < COOLDOWN_TIME) {
        const waitTime = Math.ceil((COOLDOWN_TIME - (now - lastAttemptTime)) / 1000);
        errorText.textContent = `Muitas tentativas. Aguarde ${waitTime} segundos.`;
        errorMessage.style.display = 'flex';
        return;
    }
    
    // Reset após cooldown
    if ((now - lastAttemptTime) >= COOLDOWN_TIME) {
        loginAttempts = 0;
    }
    
    // Obter valores dos campos
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const errorMessage = document.getElementById('errorMessage');
    const errorText = document.getElementById('errorText');
    const submitButton = this.querySelector('button[type="submit"]');
    
    // Desabilita botão durante o login
    submitButton.disabled = true;
    submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Entrando...';
    
    try {
        // Tentar fazer login
        const result = await login(email, password);
        
        if (result.success) {
            // Reset contador em caso de sucesso
            loginAttempts = 0;
            // Login bem-sucedido - redirecionar para dashboard
            window.location.href = 'dashboard.html';
        } else {
            // Incrementa tentativas
            loginAttempts++;
            lastAttemptTime = Date.now();
            
            // Login falhou - mostrar mensagem de erro
            let errorMsg = result.error || 'Email ou senha incorretos';
            
            // Mensagem especial para rate limit
            if (errorMsg.includes('Rate limit') || errorMsg.includes('Too Many Requests')) {
                errorMsg = 'Muitas tentativas de login. Aguarde 15-30 minutos e tente novamente.';
            }
            
            errorText.textContent = errorMsg;
            errorMessage.style.display = 'flex';
            
            // Animação de tremor (shake)
            errorMessage.classList.add('shake');
            setTimeout(() => {
                errorMessage.classList.remove('shake');
            }, 500);
            
            // Reabilita botão
            submitButton.disabled = false;
            submitButton.innerHTML = '<i class="fas fa-sign-in-alt"></i> Entrar';
        }
    } catch (error) {
        console.error('Erro durante login:', error);
        loginAttempts++;
        lastAttemptTime = Date.now();
        
        errorText.textContent = 'Erro ao conectar. Tente novamente.';
        errorMessage.style.display = 'flex';
        
        // Reabilita botão
        submitButton.disabled = false;
        submitButton.innerHTML = '<i class="fas fa-sign-in-alt"></i> Entrar';
    }
});
