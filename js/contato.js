// JavaScript para a página de contato

/* ===== INICIALIZAÇÃO PRINCIPAL ===== */
document.addEventListener('DOMContentLoaded', function() {
    // Inicializar animações de entrada
    initAnimations();
    
    // Inicializar funcionalidades do formulário
    initContactForm();
    
    // Inicializar menu responsivo (se não estiver no script principal)
    initMobileMenu();
    
    // Inicializar efeito parallax no hero
    initParallaxEffect();
    
    // Inicializar verificação de status de funcionamento
    initBusinessHours();
    
    // Pré-selecionar serviço se vier de URL
    preselectServiceFromURL();
});

/* ===== PRÉ-SELEÇÃO DE SERVIÇO VIA URL ===== */
function preselectServiceFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    const servico = urlParams.get('servico');
    
    if (servico) {
        const selectElement = document.getElementById('assunto');
        if (selectElement) {
            selectElement.value = servico;
            // Scroll suave até o formulário
            const formContainer = document.querySelector('.contato-form-container');
            if (formContainer) {
                setTimeout(() => {
                    formContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }, 500);
            }
        }
    }
}

/* ===== SISTEMA DE ANIMAÇÕES ===== */
// Animações de entrada para elementos da página
function initAnimations() {
    // Configurar Intersection Observer para animações de scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, observerOptions);

    // Observar elementos específicos para animação
    const animateElements = document.querySelectorAll(
        '.info-item, .contato-form-container, .faq-item, .mapa-container'
    );
    
    animateElements.forEach(el => {
        observer.observe(el);
    });

    // Adicionar estilos de animação CSS dinamicamente
    addAnimationStyles();
}

// Adicionar estilos de animação CSS dinamicamente
function addAnimationStyles() {
    const style = document.createElement('style');
    style.textContent = `
        /* Estilos iniciais para elementos animados */
        .info-item,
        .contato-form-container,
        .faq-item,
        .mapa-container {
            opacity: 0;
            transform: translateY(30px);
            transition: all 0.6s ease;
        }
        
        /* Estados finais das animações */
        .info-item.animate-in,
        .contato-form-container.animate-in,
        .faq-item.animate-in,
        .mapa-container.animate-in {
            opacity: 1;
            transform: translateY(0);
        }
        
        /* Delays escalonados para animações */
        .info-item:nth-child(1) { transition-delay: 0.1s; }
        .info-item:nth-child(2) { transition-delay: 0.2s; }
        .info-item:nth-child(3) { transition-delay: 0.3s; }
        .info-item:nth-child(4) { transition-delay: 0.4s; }
        .info-item:nth-child(5) { transition-delay: 0.5s; }
        
        .faq-item:nth-child(1) { transition-delay: 0.1s; }
        .faq-item:nth-child(2) { transition-delay: 0.2s; }
        .faq-item:nth-child(3) { transition-delay: 0.3s; }
        .faq-item:nth-child(4) { transition-delay: 0.4s; }
    `;
    document.head.appendChild(style);
}

/* ===== SISTEMA DE HORÁRIO DE FUNCIONAMENTO ===== */
// Inicializar verificação de status de funcionamento
function initBusinessHours() {
    // Definir horários de funcionamento
    const businessHours = {
        monday: { start: 13, end: 18, open: true },
        tuesday: { start: 13, end: 18, open: true },
        wednesday: { start: 13, end: 18, open: true },
        thursday: { start: 13, end: 18, open: true },
        friday: { start: 13, end: 18, open: true },
        saturday: { start: 9, end: 13, open: true },
        sunday: { start: 0, end: 0, open: false } // Fechado aos domingos
    };
    
    // Atualizar status inicial
    updateBusinessStatus(businessHours);
    
    // Atualizar a cada minuto
    setInterval(() => {
        updateBusinessStatus(businessHours);
    }, 60000);
}

// Verificar e atualizar status de funcionamento
function updateBusinessStatus(businessHours) {
    const now = new Date();
    const currentDay = getDayName(now.getDay());
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTime = currentHour + (currentMinute / 60);
    
    const todaySchedule = businessHours[currentDay];
    const statusElement = document.querySelector('.card-status');
    
    if (!statusElement) return;
    
    let isOpen = false;
    let statusText = '';
    let statusClass = '';
    
    if (!todaySchedule.open) {
        // Fechado aos domingos
        statusText = 'Fechado Hoje';
        statusClass = 'closed';
    } else if (currentTime >= todaySchedule.start && currentTime < todaySchedule.end) {
        // Aberto
        isOpen = true;
        const closeTime = formatTime(todaySchedule.end, 0);
        statusText = `Aberto - Fecha às ${closeTime}`;
        statusClass = 'open';
    } else if (currentTime < todaySchedule.start) {
        // Ainda não abriu hoje
        const openTime = formatTime(todaySchedule.start, 0);
        statusText = `Fechado - Abre às ${openTime}`;
        statusClass = 'closed';
    } else {
        // Já fechou hoje
        const nextOpenDay = getNextOpenDay(businessHours, now);
        statusText = `Fechado - ${nextOpenDay}`;
        statusClass = 'closed';
    }
    
    // Atualizar elemento
    statusElement.textContent = statusText;
    statusElement.className = `card-status ${statusClass}`;
}

// Obter nome do dia em inglês
function getDayName(dayIndex) {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    return days[dayIndex];
}

// Formatar hora para exibição
function formatTime(hour, minute) {
    const h = Math.floor(hour);
    const m = minute || 0;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

// Encontrar próximo dia de funcionamento
function getNextOpenDay(businessHours, currentDate) {
    const dayNames = {
        monday: 'Segunda',
        tuesday: 'Terça',
        wednesday: 'Quarta',
        thursday: 'Quinta',
        friday: 'Sexta',
        saturday: 'Sábado',
        sunday: 'Domingo'
    };
    
    let nextDate = new Date(currentDate);
    nextDate.setDate(nextDate.getDate() + 1);
    
    for (let i = 0; i < 7; i++) {
        const dayName = getDayName(nextDate.getDay());
        const schedule = businessHours[dayName];
        
        if (schedule.open) {
            const openTime = formatTime(schedule.start, 0);
            const dayDisplayName = dayNames[dayName];
            
            if (i === 0) {
                return `Abre amanhã às ${openTime}`;
            } else if (i === 1) {
                return `Abre ${dayDisplayName} às ${openTime}`;
            } else {
                return `Abre ${dayDisplayName} às ${openTime}`;
            }
        }
        
        nextDate.setDate(nextDate.getDate() + 1);
    }
    
    return 'Horário indisponível';
}

/* ===== SISTEMA DE FORMULÁRIO DE CONTATO ===== */
// Inicializar funcionalidades do formulário de contato
function initContactForm() {
    const form = document.getElementById('contactForm');
    const submitBtn = document.querySelector('.btn-submit');
    
    // Verificar se há um serviço pré-selecionado da página de serviços
    checkPreSelectedService();
    
    if (form) {
        // Event listener para envio do formulário
        form.addEventListener('submit', handleFormSubmit);
        
        // Sistema de validação em tempo real
        const inputs = form.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            input.addEventListener('blur', validateField);
            input.addEventListener('input', clearErrors);
        });
    }
}

// Verificar e aplicar serviço pré-selecionado
function checkPreSelectedService() {
    const servicoSelecionado = localStorage.getItem('servicoSelecionado');
    const assuntoSelect = document.getElementById('assunto');
    
    if (servicoSelecionado && assuntoSelect) {
        // Mapear nomes de serviços para valores do select
        const servicoMap = {
            'Instalação Completa': 'instalacao',
            'Manutenção': 'manutencao',
            'Desmontagem': 'desmontagem'
        };
        
        const valorSelect = servicoMap[servicoSelecionado];
        if (valorSelect) {
            assuntoSelect.value = valorSelect;
            
            // Adicionar destaque visual temporário
            assuntoSelect.style.borderColor = '#1e4a72';
            assuntoSelect.style.boxShadow = '0 0 0 3px rgba(30, 74, 114, 0.1)';
            
            setTimeout(() => {
                assuntoSelect.style.borderColor = '';
                assuntoSelect.style.boxShadow = '';
            }, 2000);
        }
        
        // Limpar o localStorage após usar
        localStorage.removeItem('servicoSelecionado');
    }
}

// Processar envio do formulário de contato
function handleFormSubmit(e) {
    e.preventDefault();
    
    const form = e.target;
    const submitBtn = form.querySelector('.btn-submit');
    const formData = new FormData(form);
    
    // Validar todos os campos do formulário
    if (!validateForm(form)) {
        return;
    }
    
    // Exibir estado de carregamento
    showLoading(submitBtn);
    
    // Preparar dados da mensagem
    const messageData = {
        nome: formData.get('nome'),
        email: formData.get('email'),
        telefone: formData.get('telefone') || 'Não informado',
        servico: getAssuntoText(formData.get('assunto')),
        mensagem: formData.get('mensagem')
    };
    
    // Enviar para o Appwrite
    sendContactMessage(messageData).then(result => {
        if (result.success) {
            // Exibir mensagem de sucesso
            showSuccessMessage();
            
            // Resetar formulário após delay
            setTimeout(() => {
                form.reset();
                resetButton(submitBtn);
            }, 3000);
        } else {
            // Erro ao enviar - mostrar mensagem personalizada
            showErrorMessage(result.error || 'Erro ao enviar mensagem. Por favor, tente novamente.');
            resetButton(submitBtn);
        }
    }).catch(error => {
        console.error('Erro:', error);
        showErrorMessage('Erro ao conectar com o servidor. Por favor, tente novamente.');
        resetButton(submitBtn);
    });
}

// Mostrar mensagem de sucesso
function showSuccessMessage() {
    // Criar elemento de mensagem de sucesso
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.innerHTML = `
        <div class="success-content">
            <i class="fas fa-check-circle"></i>
            <h3>Mensagem Enviada com Sucesso!</h3>
            <p>A sua mensagem foi enviada com sucesso. Entraremos em contacto assim que possível.</p>
        </div>
    `;
    
    // Adicionar estilos
    successDiv.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
        animation: fadeIn 0.3s ease;
    `;
    
    const successContent = successDiv.querySelector('.success-content');
    successContent.style.cssText = `
        background: white;
        padding: 3rem;
        border-radius: 15px;
        text-align: center;
        max-width: 500px;
        margin: 0 20px;
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
        animation: slideUp 0.3s ease;
    `;
    
    const icon = successContent.querySelector('i');
    icon.style.cssText = `
        font-size: 4rem;
        color: #28a745;
        margin-bottom: 1rem;
    `;
    
    const title = successContent.querySelector('h3');
    title.style.cssText = `
        color: #1e4a72;
        font-size: 1.8rem;
        margin-bottom: 1rem;
        font-weight: 600;
    `;
    
    const text = successContent.querySelector('p');
    text.style.cssText = `
        color: #666;
        font-size: 1.1rem;
        line-height: 1.6;
        margin: 0;
    `;
    
    // Adicionar animações CSS
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        @keyframes slideUp {
            from { transform: translateY(30px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
        }
    `;
    document.head.appendChild(style);
    
    // Adicionar ao corpo da página
    document.body.appendChild(successDiv);
    
    // Remover após 4 segundos
    setTimeout(() => {
        successDiv.style.animation = 'fadeOut 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(successDiv);
            document.head.removeChild(style);
        }, 300);
    }, 4000);
    
    // Permitir fechar clicando fora
    successDiv.addEventListener('click', (e) => {
        if (e.target === successDiv) {
            document.body.removeChild(successDiv);
            document.head.removeChild(style);
        }
    });
}

// Mostrar mensagem de erro
function showErrorMessage(errorText) {
    // Criar elemento de mensagem de erro
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.innerHTML = `
        <div class="error-content">
            <i class="fas fa-exclamation-circle"></i>
            <h3>Erro ao Enviar Mensagem</h3>
            <p>${errorText}</p>
            <button class="btn-close-error">Fechar</button>
        </div>
    `;
    
    // Adicionar estilos
    errorDiv.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
        animation: fadeIn 0.3s ease;
    `;
    
    const errorContent = errorDiv.querySelector('.error-content');
    errorContent.style.cssText = `
        background: white;
        padding: 3rem;
        border-radius: 15px;
        text-align: center;
        max-width: 500px;
        margin: 0 20px;
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
        animation: slideUp 0.3s ease;
    `;
    
    const icon = errorContent.querySelector('i');
    icon.style.cssText = `
        font-size: 4rem;
        color: #dc3545;
        margin-bottom: 1rem;
    `;
    
    const title = errorContent.querySelector('h3');
    title.style.cssText = `
        color: #1e4a72;
        font-size: 1.8rem;
        margin-bottom: 1rem;
        font-weight: 600;
    `;
    
    const text = errorContent.querySelector('p');
    text.style.cssText = `
        color: #666;
        font-size: 1.1rem;
        line-height: 1.6;
        margin-bottom: 1.5rem;
    `;
    
    const closeBtn = errorContent.querySelector('.btn-close-error');
    closeBtn.style.cssText = `
        background: #1e4a72;
        color: white;
        border: none;
        padding: 12px 30px;
        border-radius: 25px;
        font-size: 1rem;
        cursor: pointer;
        transition: all 0.3s ease;
    `;
    
    closeBtn.addEventListener('mouseenter', () => {
        closeBtn.style.background = '#163a5f';
        closeBtn.style.transform = 'translateY(-2px)';
    });
    
    closeBtn.addEventListener('mouseleave', () => {
        closeBtn.style.background = '#1e4a72';
        closeBtn.style.transform = 'translateY(0)';
    });
    
    // Adicionar ao corpo da página
    document.body.appendChild(errorDiv);
    
    // Fechar ao clicar no botão
    closeBtn.addEventListener('click', () => {
        document.body.removeChild(errorDiv);
    });
    
    // Permitir fechar clicando fora
    errorDiv.addEventListener('click', (e) => {
        if (e.target === errorDiv) {
            document.body.removeChild(errorDiv);
        }
    });
}

// Construir dados para email
function buildEmailMessage(formData) {
    const nome = formData.get('nome');
    const email = formData.get('email');
    const telefone = formData.get('telefone');
    const assunto = formData.get('assunto');
    const mensagem = formData.get('mensagem');
    
    const subject = `Contato - ${getAssuntoText(assunto)} - ${nome}`;
    
    const body = `NOVO CONTATO - Camping Faustino

Nome: ${nome}
Email: ${email}
Telefone: ${telefone || 'Não informado'}
Assunto: ${getAssuntoText(assunto)}

Mensagem:
${mensagem}

---
Enviado através do site Camping Faustino`;

    return {
        subject: subject,
        body: body
    };
}

// Converter valor do assunto para texto legível
function getAssuntoText(value) {
    const assuntos = {
        'cozinhas': 'Cozinhas Completas',
        'toldos': 'Toldos e Para-ventos',
        'armazens': 'Sistemas de Armazenamento',
        'sistemas-solares': 'Sistemas Solares',
        'sistemas-agua': 'Sistemas de Água',
        'climatizacao': 'Climatização',
        'seguranca': 'Segurança',
        'instalacao': 'Instalação Completa',
        'manutencao': 'Manutenção',
        'desmontagem': 'Desmontagem',
        'orcamento': 'Orçamento',
        'outros': 'Outros'
    };
    
    return assuntos[value] || value;
}

/* ===== SISTEMA DE VALIDAÇÃO ===== */
// Validar formulário completo antes do envio
function validateForm(form) {
    let isValid = true;
    const requiredFields = form.querySelectorAll('[required]');
    
    requiredFields.forEach(field => {
        if (!validateField({ target: field })) {
            isValid = false;
        }
    });
    
    return isValid;
}

// Validar campo individual
function validateField(e) {
    const field = e.target;
    const value = field.value.trim();
    const fieldName = field.name;
    
    // Limpar erros anteriores
    clearFieldError(field);
    
    // Validações específicas
    let isValid = true;
    let errorMessage = '';
    
    if (field.hasAttribute('required') && !value) {
        isValid = false;
        errorMessage = 'Este campo é obrigatório';
    } else if (fieldName === 'email' && value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            isValid = false;
            errorMessage = 'Email inválido';
        }
    } else if (fieldName === 'telefone' && value) {
        const phoneRegex = /^[\d\s\-\+\(\)]+$/;
        if (!phoneRegex.test(value)) {
            isValid = false;
            errorMessage = 'Telefone inválido';
        }
    }
    
    if (!isValid) {
        showFieldError(field, errorMessage);
    }
    
    return isValid;
}

// Mostrar erro no campo
function showFieldError(field, message) {
    const formGroup = field.closest('.form-group');
    
    // Remover erro anterior
    const existingError = formGroup.querySelector('.field-error');
    if (existingError) {
        existingError.remove();
    }
    
    // Adicionar novo erro
    const errorElement = document.createElement('div');
    errorElement.className = 'field-error';
    errorElement.textContent = message;
    errorElement.style.cssText = `
        color: #e74c3c;
        font-size: 0.85rem;
        margin-top: 0.5rem;
        display: flex;
        align-items: center;
        gap: 0.25rem;
    `;
    errorElement.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;
    
    formGroup.appendChild(errorElement);
    field.style.borderColor = '#e74c3c';
}

// Limpar erro do campo
function clearFieldError(field) {
    const formGroup = field.closest('.form-group');
    const errorElement = formGroup.querySelector('.field-error');
    
    if (errorElement) {
        errorElement.remove();
    }
    
    field.style.borderColor = '#e1e8ed';
}

// Limpar erros ao digitar
function clearErrors(e) {
    clearFieldError(e.target);
}

// Mostrar loading no botão
function showLoading(button) {
    button.disabled = true;
    button.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Enviando...`;
    button.style.background = 'linear-gradient(135deg, #95a5a6, #7f8c8d)';
}

// Mostrar sucesso no botão
function showSuccess(button) {
    button.innerHTML = `<i class="fas fa-check"></i> Mensagem Enviada!`;
    button.style.background = 'linear-gradient(135deg, #27ae60, #2ecc71)';
}

// Resetar botão
function resetButton(button) {
    button.disabled = false;
    button.innerHTML = `<i class="fas fa-paper-plane"></i> Enviar Mensagem`;
    button.style.background = 'linear-gradient(135deg, #1e4a72, #2980b9)';
}

// Menu responsivo (caso não esteja no script principal)
function initMobileMenu() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', function() {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });

        // Fechar menu ao clicar em um link
        document.querySelectorAll('.nav-menu a').forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });
    }
}

// Efeito parallax no hero
function initParallaxEffect() {
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const hero = document.querySelector('.contato-hero');
        
        if (hero) {
            const speed = scrolled * 0.5;
            hero.style.transform = `translateY(${speed}px)`;
        }
    });
}

// Smooth scroll para links internos
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Adicionar máscara para telefone (opcional)
function addPhoneMask() {
    const phoneInput = document.getElementById('telefone');
    
    if (phoneInput) {
        phoneInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            
            if (value.length <= 11) {
                // Formato português: +351 999 666 000
                if (value.length > 6) {
                    value = value.replace(/(\d{3})(\d{3})(\d{3})/, '$1 $2 $3');
                } else if (value.length > 3) {
                    value = value.replace(/(\d{3})(\d{3})/, '$1 $2');
                }
            }
            
            e.target.value = value;
        });
    }
}

// Inicializar máscara de telefone
addPhoneMask();

// Efeito de hover nos itens de informação
document.querySelectorAll('.info-item').forEach(item => {
    item.addEventListener('mouseenter', function() {
        // Adicionar efeito de destaque
        document.querySelectorAll('.info-item').forEach(otherItem => {
            if (otherItem !== this) {
                otherItem.style.opacity = '0.7';
            }
        });
    });
    
    item.addEventListener('mouseleave', function() {
        // Remover efeito de destaque
        document.querySelectorAll('.info-item').forEach(otherItem => {
            otherItem.style.opacity = '1';
        });
    });
});

// Analytics de interação (opcional)
function trackFormInteraction(action, details = {}) {
    // Aqui você pode integrar com Google Analytics, Facebook Pixel, etc.
    console.log('Form Interaction:', action, details);
}

// Rastrear início de preenchimento
document.querySelectorAll('#contactForm input, #contactForm select, #contactForm textarea').forEach(field => {
    let hasInteracted = false;
    
    field.addEventListener('focus', function() {
        if (!hasInteracted) {
            trackFormInteraction('form_start', { field: field.name });
            hasInteracted = true;
        }
    });
});