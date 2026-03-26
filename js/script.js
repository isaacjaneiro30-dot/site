/* ===== ACESSO ADMINISTRATIVO ===== */
// Sistema de clique no logo para acesso admin
document.addEventListener('DOMContentLoaded', () => {
    const logoLink = document.getElementById('logo-link');
    
    if (logoLink) {
        logoLink.addEventListener('click', async (e) => {
            e.preventDefault();
            
            // Verificar se está autenticado
            try {
                const client = new Appwrite.Client();
                client
                    .setEndpoint(APPWRITE_CONFIG.endpoint)
                    .setProject(APPWRITE_CONFIG.projectId);
                
                const account = new Appwrite.Account(client);
                
                // Tentar obter o usuário atual
                await account.get();
                
                // Se chegou aqui, está autenticado - ir para dashboard
                window.location.href = 'admin/dashboard.html';
            } catch (error) {
                // Não está autenticado - ir para login
                window.location.href = 'admin/login.html';
            }
        });
    }
});

/* ===== EFEITOS DO HEADER ===== */
// Header transparente que muda com o scroll
window.addEventListener('scroll', () => {
    const header = document.querySelector('.header');
    if (window.scrollY > 100) {
        header.style.background = 'rgba(255, 255, 255, 0.98)';
        header.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
    } else {
        header.style.background = 'rgba(255, 255, 255, 0.95)';
        header.style.boxShadow = 'none';
    }
});

/* ===== SISTEMA DE ANIMAÇÕES ===== */
// Configuração global de animações ao scroll
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('fade-in-up');
        }
    });
}, observerOptions);

// Observar elementos para animação de entrada
document.querySelectorAll('.produto-card, .servico-card, .sobre-content, .contato-content').forEach(el => {
    observer.observe(el);
});

/* ===== FORMULÁRIO DE CONTATO ===== */
// Processamento do formulário de contato principal
const contactForm = document.querySelector('.contato-form');
if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Simular processamento do envio
        const submitBtn = contactForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        
        submitBtn.textContent = 'Enviando...';
        submitBtn.disabled = true;
        
        setTimeout(() => {
            // Removido o alert - a mensagem de sucesso é agora gerida pelo contato.js
            contactForm.reset();
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }, 2000);
    });
}

/* ===== NAVEGAÇÃO SUAVE ===== */
// Scroll suave para links internos da página
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const headerHeight = document.querySelector('.header').offsetHeight;
            const targetPosition = target.offsetTop - headerHeight;
            
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    });
});

/* ===== CONTADOR ANIMADO ===== */
// Sistema de contadores animados para estatísticas
function animateCounters() {
    const counters = document.querySelectorAll('.stat h3');
    
    counters.forEach(counter => {
        const target = parseInt(counter.textContent.replace(/\D/g, ''));
        const suffix = counter.textContent.replace(/[0-9]/g, '');
        let current = 0;
        const increment = target / 100;
        
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                counter.textContent = target + suffix;
                clearInterval(timer);
            } else {
                counter.textContent = Math.floor(current) + suffix;
            }
        }, 20);
    });
}

// Ativar contador quando a seção de estatísticas estiver visível
const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            animateCounters();
            statsObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.5 });

const statsSection = document.querySelector('.stats');
if (statsSection) {
    statsObserver.observe(statsSection);
}

/* ===== CARROSSEL PRINCIPAL DE PRODUTOS ===== */
// Classe para gerenciar o carrossel principal da página inicial
class MainProductCarousel {
    constructor() {
        this.track = document.querySelector('.carousel-track');
        this.slides = document.querySelectorAll('.produto-card');
        this.nextBtn = document.querySelector('.main-nav-btn.next');
        this.prevBtn = document.querySelector('.main-nav-btn.prev');
        this.indicators = document.querySelectorAll('.main-indicator');
        this.currentSlide = 0;
        this.slideWidth = 100; // 100% para cada slide
        this.autoPlayInterval = null;
        
        this.init();
    }
    
    // Inicializar eventos e funcionalidades do carrossel
    init() {
        this.bindEvents();
        this.startAutoPlay();
        this.updateCarousel();
    }
    
    // Configurar event listeners para navegação
    bindEvents() {
        // Verificar se os elementos existem antes de adicionar listeners
        if (this.nextBtn) {
            this.nextBtn.addEventListener('click', () => this.nextSlide());
        }
        if (this.prevBtn) {
            this.prevBtn.addEventListener('click', () => this.prevSlide());
        }
        
        this.indicators.forEach((indicator, index) => {
            indicator.addEventListener('click', () => this.goToSlide(index));
        });
        
        // Pausar autoplay ao passar o mouse sobre o carrossel
        const carousel = document.querySelector('.produto-carousel');
        carousel.addEventListener('mouseenter', () => this.stopAutoPlay());
        carousel.addEventListener('mouseleave', () => this.startAutoPlay());
    }
    
    // Avançar para o próximo slide
    nextSlide() {
        this.currentSlide = (this.currentSlide + 1) % this.slides.length;
        this.updateCarousel();
    }
    
    // Voltar para o slide anterior
    prevSlide() {
        this.currentSlide = this.currentSlide === 0 ? this.slides.length - 1 : this.currentSlide - 1;
        this.updateCarousel();
    }
    
    // Navegar para slide específico
    goToSlide(index) {
        this.currentSlide = index;
        this.updateCarousel();
    }
    
    // Atualizar posição e indicadores do carrossel
    updateCarousel() {
        const translateX = -this.currentSlide * this.slideWidth;
        this.track.style.transform = `translateX(${translateX}%)`;
        
        // Atualizar estado dos indicadores
        this.indicators.forEach((indicator, index) => {
            indicator.classList.toggle('active', index === this.currentSlide);
        });
        
        // Atualizar classe active nos slides
        this.slides.forEach((slide, index) => {
            slide.classList.toggle('active', index === this.currentSlide);
        });
    }
    
    // Iniciar reprodução automática dos slides
    startAutoPlay() {
        this.autoPlayInterval = setInterval(() => {
            this.nextSlide();
        }, 6000);
    }
    
    // Parar reprodução automática
    stopAutoPlay() {
        if (this.autoPlayInterval) {
            clearInterval(this.autoPlayInterval);
        }
    }
}

/* ===== CARROSSEL DE IMAGENS INDIVIDUAIS ===== */
// Classe para gerenciar carrosseis de imagens dentro de cada produto
class ImageCarousel {
    constructor(container) {
        this.container = container;
        this.images = container.querySelectorAll('.image-carousel img');
        this.indicators = container.querySelectorAll('.indicator');
        this.nextBtn = container.querySelector('.next-btn');
        this.prevBtn = container.querySelector('.prev-btn');
        this.currentImage = 0;
        this.autoPlayInterval = null;
        
        this.init();
    }
    
    // Inicializar carrossel de imagens
    init() {
        this.bindEvents();
        this.startAutoPlay();
    }
    
    // Configurar eventos de navegação
    bindEvents() {
        this.nextBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.nextImage();
        });
        
        this.prevBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.prevImage();
        });
        
        this.indicators.forEach((indicator, index) => {
            indicator.addEventListener('click', (e) => {
                e.stopPropagation();
                this.goToImage(index);
            });
        });
        
        // Pausar autoplay ao passar o mouse
        this.container.addEventListener('mouseenter', () => this.stopAutoPlay());
        this.container.addEventListener('mouseleave', () => this.startAutoPlay());
    }
    
    nextImage() {
        this.currentImage = (this.currentImage + 1) % this.images.length;
        this.updateImages();
    }
    
    prevImage() {
        this.currentImage = this.currentImage === 0 ? this.images.length - 1 : this.currentImage - 1;
        this.updateImages();
    }
    
    goToImage(index) {
        this.currentImage = index;
        this.updateImages();
    }
    
    updateImages() {
        this.images.forEach((img, index) => {
            img.classList.toggle('active', index === this.currentImage);
        });
        
        this.indicators.forEach((indicator, index) => {
            indicator.classList.toggle('active', index === this.currentImage);
        });
    }
    
    startAutoPlay() {
        this.autoPlayInterval = setInterval(() => {
            this.nextImage();
        }, 4000);
    }
    
    stopAutoPlay() {
        if (this.autoPlayInterval) {
            clearInterval(this.autoPlayInterval);
        }
    }
}

/* ===== INICIALIZAÇÃO DOS CARROSSEIS ===== */
// Inicializar todos os carrosseis quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    // Inicializar carrossel principal de produtos
    new MainProductCarousel();
    
    // Inicializar carrosseis individuais de imagens para cada produto
    const imageCarousels = document.querySelectorAll('.produto-image-carousel');
    imageCarousels.forEach(carousel => {
        new ImageCarousel(carousel);
    });
});

/* ===== SISTEMA DE CARREGAMENTO ===== */
// Animação de carregamento da página
window.addEventListener('load', () => {
    document.body.classList.add('loaded');
});

// Modal para produtos (funcionalidade futura)
function openProductModal(productId) {
    // Implementar modal de detalhes do produto
    console.log(`Abrir modal para produto: ${productId}`);
}

// Adicionar event listeners aos botões "Saiba Mais"
document.querySelectorAll('.btn-outline').forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.preventDefault();
        const productCard = btn.closest('.produto-card');
        const productName = productCard.querySelector('h3').textContent;
        
        // Por enquanto, mostrar alert
        alert(`Em breve você verá mais detalhes sobre: ${productName}`);
    });
});

// Lazy loading para imagens
const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src || img.src;
            img.classList.remove('lazy');
            observer.unobserve(img);
        }
    });
});

document.querySelectorAll('img[data-src]').forEach(img => {
    imageObserver.observe(img);
});

// Feedback visual para formulário
function addFormValidation() {
    const inputs = document.querySelectorAll('.contato-form input, .contato-form select, .contato-form textarea');
    
    inputs.forEach(input => {
        input.addEventListener('blur', () => {
            if (input.value.trim() !== '') {
                input.classList.add('valid');
            } else {
                input.classList.remove('valid');
            }
        });
        
        input.addEventListener('invalid', () => {
            input.classList.add('invalid');
        });
        
        input.addEventListener('input', () => {
            input.classList.remove('invalid');
        });
    });
}

// Inicializar validação do formulário
document.addEventListener('DOMContentLoaded', () => {
    addFormValidation();
});

// Smooth reveal animation para elementos
const revealElements = document.querySelectorAll('.produto-card, .servico-card');
const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
            setTimeout(() => {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }, index * 100);
        }
    });
}, { threshold: 0.1 });

revealElements.forEach(element => {
    element.style.opacity = '0';
    element.style.transform = 'translateY(20px)';
    element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    revealObserver.observe(element);
});