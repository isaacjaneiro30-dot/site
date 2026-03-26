// JavaScript para a página de produtos

/* ===== CARREGAMENTO DINÂMICO DE PRODUTOS ===== */
// Os produtos agora são carregados do Appwrite em tempo real

// Funcionalidade da página
document.addEventListener('DOMContentLoaded', function() {
    const categoriasCards = document.querySelectorAll('.categoria-card');
    const produtosDetalhes = document.querySelector('.produtos-detalhes');
    const categoriasSection = document.querySelector('.categorias-produtos');
    const btnVoltar = document.querySelector('.btn-voltar');
    const categoriaNome = document.getElementById('categoria-nome');
    const categoriaDescricao = document.getElementById('categoria-descricao');
    const produtosLista = document.getElementById('produtos-lista');

    // Event listeners para os cards de categoria
    categoriasCards.forEach(card => {
        card.addEventListener('click', function() {
            const categoria = this.dataset.categoria;
            mostrarProdutos(categoria);
        });
    });

    // Event listener para botão voltar
    if (btnVoltar) {
        btnVoltar.addEventListener('click', function() {
            voltarCategorias();
        });
    }

    // Event listeners para links do footer
    document.querySelectorAll('a[data-categoria]').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const categoria = this.dataset.categoria;
            mostrarProdutos(categoria);
        });
    });

    // Função para mostrar produtos de uma categoria (carrega do Appwrite)
    async function mostrarProdutos(categoria) {
        // Mostrar loading
        produtosLista.innerHTML = '<div class="loading-spinner"><i class="fas fa-spinner fa-spin"></i> Carregando produtos...</div>';
        
        try {
            // Obter informações da categoria
            const categoryInfo = getCategoryInfo(categoria);
            
            // Atualizar título e descrição
            categoriaNome.textContent = categoryInfo.nome;
            categoriaDescricao.textContent = categoryInfo.descricao;

            // Carregar produtos do Appwrite
            const produtos = await loadProductsFromAppwrite(categoria);

            // Limpar lista de produtos
            produtosLista.innerHTML = '';

            if (produtos.length === 0) {
                produtosLista.innerHTML = `
                    <div class="no-products-message">
                        <i class="fas fa-box-open"></i>
                        <p>Nenhum produto disponível nesta categoria no momento.</p>
                    </div>
                `;
            } else {
                // Adicionar produtos
                produtos.forEach(produto => {
                    const produtoHTML = criarProdutoHTML(produto);
                    produtosLista.appendChild(produtoHTML);
                });
            }

            // Mostrar seção de produtos e esconder categorias
            categoriasSection.style.display = 'none';
            produtosDetalhes.classList.add('active');
            
            // Scroll para o topo da seção de produtos
            produtosDetalhes.scrollIntoView({ behavior: 'smooth' });
            
        } catch (error) {
            console.error('Erro ao carregar produtos:', error);
            produtosLista.innerHTML = `
                <div class="error-message">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>Erro ao carregar produtos. Por favor, tente novamente.</p>
                </div>
            `;
        }
    }

    // Função para voltar às categorias
    function voltarCategorias() {
        produtosDetalhes.classList.remove('active');
        categoriasSection.style.display = 'block';
        categoriasSection.scrollIntoView({ behavior: 'smooth' });
    }

    // Função para criar HTML do produto
    function criarProdutoHTML(produto) {
        const produtoDiv = document.createElement('div');
        produtoDiv.className = 'produto-item';
        
        produtoDiv.innerHTML = `
            <div class="produto-imagem">
                <img src="${produto.imagem}" alt="${produto.nome}" loading="lazy" onerror="this.src='public/Camping-bg.png'">
            </div>
            <div class="produto-info">
                <h3>${produto.nome}</h3>
                <p>${produto.descricao}</p>
                <div class="produto-actions">
                    <button class="btn-produto" onclick="solicitarOrcamento('${produto.nome.replace(/'/g, "\\'")}')">
                        <i class="fas fa-whatsapp"></i> Solicitar Orçamento
                    </button>
                </div>
            </div>
        `;
        
        return produtoDiv;
    }

    /* ===== SISTEMA DE ANIMAÇÕES DE ENTRADA ===== */
    // Configurações do observer para animação de cards
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Aplicar animações de entrada aos cards de categoria
    categoriasCards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(card);
    });
});

/* ===== FUNCIONALIDADES DE ORÇAMENTO ===== */
// Função global para solicitar orçamento via WhatsApp
function solicitarOrcamento(nomeProduto) {
    const mensagem = `Olá! Gostaria de um orçamento para: ${nomeProduto}`;
    const telefone = '5511999998888';
    const url = `https://wa.me/${telefone}?text=${encodeURIComponent(mensagem)}`;
    window.open(url, '_blank');
}

/* ===== NAVEGAÇÃO MOBILE ===== */
// Sistema de navegação responsiva para produtos
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

if (hamburger && navMenu) {
    // Toggle do menu mobile
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    });

    // Fechar menu ao clicar em qualquer link
    document.querySelectorAll('.nav-menu a').forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });
}
