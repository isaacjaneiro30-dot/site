// Script da página do Dashboard
// Protege a página - requer autenticação
(async () => {
    await requireAuth();
    
    // Mostra informações do usuário logado
    const user = await getCurrentUser();
    if (user) {
        console.log('Usuário autenticado:', user.email);
    }
    
    // Carregar mensagens do Appwrite
    await loadMessages();
    
    // Inicializar atualização automática (a cada 30 segundos)
    startAutoRefresh();
})();

// Variável global para armazenar mensagens
let MESSAGES = [];

// Função para carregar mensagens do Appwrite
async function loadMessages() {
    MESSAGES = await getAllMessages();
    console.log('Mensagens carregadas:', MESSAGES.length);
    updateMessageCounters();
    renderMessages('all');
    // Aguardar um pouco para garantir que o DOM foi atualizado
    setTimeout(() => {
        initializeMessageFilters();
    }, 100);
}

// Atualizar contadores de mensagens
function updateMessageCounters() {
    const unreadCount = MESSAGES.filter(m => !m.lida).length;
    const readCount = MESSAGES.filter(m => m.lida).length;
    
    document.getElementById('sidebarBadge').textContent = unreadCount;
    document.getElementById('countAll').textContent = MESSAGES.length;
    document.getElementById('countUnread').textContent = unreadCount;
    document.getElementById('countRead').textContent = readCount;
}

// Formatar data para exibição
function formatarData(dataISO) {
    const data = new Date(dataISO);
    return data.toLocaleDateString('pt-PT', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Variável para controlar o intervalo de atualização
let refreshInterval = null;

// Iniciar atualização automática das mensagens
function startAutoRefresh() {
    // Limpar intervalo anterior se existir
    if (refreshInterval) {
        clearInterval(refreshInterval);
    }
    
    // Atualizar a cada 30 segundos
    refreshInterval = setInterval(async () => {
        console.log('Auto-atualizando mensagens...');
        await loadMessages();
    }, 30000); // 30 segundos
    
    // Subscrever a atualizações em tempo real do Appwrite
    subscribeToRealtimeUpdates();
}

// Parar atualização automática
function stopAutoRefresh() {
    if (refreshInterval) {
        clearInterval(refreshInterval);
        refreshInterval = null;
    }
}

// Subscrever a atualizações em tempo real usando Appwrite Realtime
function subscribeToRealtimeUpdates() {
    try {
        // Criar cliente de realtime
        const unsubscribe = window.appwriteClient.subscribe(
            `databases.${APPWRITE_CONFIG.databaseId}.collections.${APPWRITE_CONFIG.messagesCollectionId}.documents`,
            async (response) => {
                console.log('Atualização em tempo real:', response);
                
                // Recarregar mensagens quando houver alteração
                if (response.events.includes('databases.*.collections.*.documents.*')) {
                    await loadMessages();
                }
            }
        );
        
        // Guardar função de unsubscribe para limpar depois
        window.realtimeUnsubscribe = unsubscribe;
    } catch (error) {
        console.error('Erro ao subscrever realtime:', error);
        // Continuar usando polling se realtime falhar
    }
}

// Limpar subscrições quando sair da página
window.addEventListener('beforeunload', () => {
    stopAutoRefresh();
    if (window.realtimeUnsubscribe) {
        window.realtimeUnsubscribe();
    }
});

// Carregar dados financeiros do localStorage
let FINANCE_DATA = JSON.parse(localStorage.getItem('financeData') || '[]');

// ============== MENU MOBILE ==============
// Criar overlay para fechar sidebar no mobile
const overlay = document.createElement('div');
overlay.className = 'sidebar-overlay';
document.body.appendChild(overlay);

// Toggle do menu mobile
const mobileMenuToggle = document.getElementById('mobileMenuToggle');
const sidebar = document.querySelector('.sidebar');

if (mobileMenuToggle) {
    mobileMenuToggle.addEventListener('click', function() {
        sidebar.classList.toggle('mobile-active');
        overlay.classList.toggle('active');
    });
}

// Fechar sidebar ao clicar no overlay
overlay.addEventListener('click', function() {
    sidebar.classList.remove('mobile-active');
    overlay.classList.remove('active');
});

// Fechar sidebar ao clicar em links de navegação no mobile
const navLinks = document.querySelectorAll('.sidebar .nav-item');
navLinks.forEach(link => {
    link.addEventListener('click', function() {
        if (window.innerWidth <= 768) {
            sidebar.classList.remove('mobile-active');
            overlay.classList.remove('active');
        }
    });
});

// ============== CONTADORES ==============
// Os contadores são atualizados pela função updateMessageCounters()

// ============== GERENCIAMENTO FINANCEIRO ==============
let editingEntryId = null; // Variável para controlar se estamos editando

// Botão para mostrar formulário de adicionar entrada
document.getElementById('btnAddEntry').addEventListener('click', function() {
    editingEntryId = null; // Modo criação
    document.getElementById('financeEditId').value = '';
    document.getElementById('financeForm').style.display = 'block';
    document.getElementById('financeMonth').focus();
});

// Botão para cancelar e esconder formulário
document.getElementById('btnCancelEntry').addEventListener('click', function() {
    editingEntryId = null;
    document.getElementById('financeForm').style.display = 'none';
    document.getElementById('addFinanceForm').reset();
    document.getElementById('financeEditId').value = '';
});

// Função para editar um registro existente
function editFinanceRecord(id) {
    const record = FINANCE_DATA.find(r => r.id === id);
    if (!record) return;
    
    // Preencher formulário com dados existentes
    editingEntryId = id;
    document.getElementById('financeEditId').value = id;
    document.getElementById('financeMonth').value = record.month;
    document.getElementById('financeDespesas').value = record.despesas;
    document.getElementById('financeLucros').value = record.lucros;
    document.getElementById('financeNotes').value = record.notes || '';
    
    // Mostrar formulário
    document.getElementById('financeForm').style.display = 'block';
    document.getElementById('financeMonth').focus();
}

// Submeter formulário de nova entrada financeira
document.getElementById('addFinanceForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Obter valores dos campos
    const month = document.getElementById('financeMonth').value;
    const despesas = parseFloat(document.getElementById('financeDespesas').value);
    const lucros = parseFloat(document.getElementById('financeLucros').value);
    const notes = document.getElementById('financeNotes').value.trim();
    
    if (editingEntryId) {
        // MODO EDIÇÃO: Atualizar registro existente
        const index = FINANCE_DATA.findIndex(r => r.id === editingEntryId);
        if (index !== -1) {
            FINANCE_DATA[index] = {
                id: editingEntryId,
                month: month,
                despesas: despesas,
                lucros: lucros,
                notes: notes
            };
        }
        editingEntryId = null;
    } else {
        // MODO CRIAÇÃO: Adicionar nova entrada ao array
        FINANCE_DATA.push({
            id: Date.now(),
            month: month,
            despesas: despesas,
            lucros: lucros,
            notes: notes
        });
    }
    
    // Ordenar por data (mais antigo primeiro)
    FINANCE_DATA.sort((a, b) => new Date(a.month) - new Date(b.month));
    
    // Salvar no localStorage
    localStorage.setItem('financeData', JSON.stringify(FINANCE_DATA));
    
    // Atualizar visualizações
    updateFinanceChart();
    renderFinanceRecords();
    
    // Resetar e esconder formulário
    document.getElementById('financeForm').style.display = 'none';
    document.getElementById('addFinanceForm').reset();
    document.getElementById('financeEditId').value = '';
});

// ============== TABELA DE REGISTROS FINANCEIROS ==============
// Renderizar tabela de registros financeiros
function renderFinanceRecords() {
    const container = document.getElementById('financeRecords');
    
    // Se não há dados, não mostrar nada
    if (FINANCE_DATA.length === 0) {
        container.innerHTML = '';
        return;
    }
    
    // Criar tabela com registros
    container.innerHTML = `
        <div class="records-header">
            <h4><i class="fas fa-table"></i> Registros Financeiros</h4>
            <button class="btn-toggle-records" onclick="toggleFinanceRecords()">
                <i class="fas fa-chevron-down" id="toggleIcon"></i> <span id="toggleText">Mostrar</span>
            </button>
        </div>
        <div class="records-table" id="recordsTable" style="display: none;">
            <table>
                <thead>
                    <tr>
                        <th>Data</th>
                        <th>Custo Material</th>
                        <th>Ganho/Lucro</th>
                        <th>Total Vendas</th>
                        <th>Ações</th>
                    </tr>
                </thead>
                <tbody>
                    ${FINANCE_DATA.map(record => {
                        // Calcular total de vendas (custo + lucro)
                        const totalVendas = record.despesas + record.lucros;
                        // Formatar data para português
                        const date = new Date(record.month);
                        const dateFormatted = date.toLocaleDateString('pt-PT', { day: '2-digit', month: 'long', year: 'numeric' });
                        // Renderizar notas se existirem
                        const notesHtml = record.notes ? `<div class="record-notes"><i class="fas fa-sticky-note"></i>${record.notes}</div>` : '';
                        return `
                            <tr>
                                <td>
                                    ${dateFormatted}
                                    ${notesHtml}
                                </td>
                                <td class="value-negative">€${record.despesas.toFixed(2)}</td>
                                <td class="value-positive">€${record.lucros.toFixed(2)}</td>
                                <td class="value-total">€${totalVendas.toFixed(2)}</td>
                                <td>
                                    <button class="btn-edit-small" onclick="editFinanceRecord(${record.id})">
                                        <i class="fas fa-edit"></i> Editar
                                    </button>
                                    <button class="btn-delete-small" onclick="deleteFinanceRecord(${record.id})">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
        </div>
    `;
}

// Alternar visibilidade da tabela de registros (mostrar/esconder)
function toggleFinanceRecords() {
    const table = document.getElementById('recordsTable');
    const icon = document.getElementById('toggleIcon');
    const text = document.getElementById('toggleText');
    
    if (table.style.display === 'none') {
        // Mostrar tabela
        table.style.display = 'block';
        icon.className = 'fas fa-chevron-up';
        text.textContent = 'Esconder';
    } else {
        // Esconder tabela
        table.style.display = 'none';
        icon.className = 'fas fa-chevron-down';
        text.textContent = 'Mostrar';
    }
}

// Deletar um registro financeiro
function deleteFinanceRecord(id) {
    // Filtrar removendo o registro com o ID especificado
    FINANCE_DATA = FINANCE_DATA.filter(r => r.id !== id);
    // Salvar alterações no localStorage
    localStorage.setItem('financeData', JSON.stringify(FINANCE_DATA));
    // Atualizar visualizações
    updateFinanceChart();
    renderFinanceRecords();
}

// Deletar todos os registros financeiros
function deleteAllFinanceRecords() {
    // Limpar array
    FINANCE_DATA = [];
    // Salvar alterações no localStorage
    localStorage.setItem('financeData', JSON.stringify(FINANCE_DATA));
    // Atualizar visualizações
    updateFinanceChart();
    renderFinanceRecords();
}

// ============== GRÁFICO FINANCEIRO (CHART.JS) ==============
// Variável global para armazenar instância do gráfico
let financesChart = null;

// Atualizar/criar gráfico financeiro
function updateFinanceChart() {
    const ctx = document.getElementById('financesChart').getContext('2d');
    
    // Destruir gráfico anterior se existir (para evitar sobreposição)
    if (financesChart) {
        financesChart.destroy();
    }
    
    // Se não há dados, mostrar mensagem vazia
    if (FINANCE_DATA.length === 0) {
        ctx.font = '16px Arial';
        ctx.fillStyle = '#8b9dc3';
        ctx.textAlign = 'center';
        ctx.fillText('Nenhum dado financeiro registrado', ctx.canvas.width / 2, ctx.canvas.height / 2);
        return;
    }
    
    // Preparar labels (datas) para o eixo X
    const labels = FINANCE_DATA.map(record => {
        const date = new Date(record.month);
        return date.toLocaleDateString('pt-PT', { day: '2-digit', month: 'short' });
    });
    
    // Preparar dados das linhas
    const despesasData = FINANCE_DATA.map(record => record.despesas);
    const lucrosData = FINANCE_DATA.map(record => record.lucros);
    
    // Criar novo gráfico Chart.js
    financesChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Custo Material',
                    data: despesasData,
                    borderColor: '#ef4444', // Vermelho
                    backgroundColor: 'rgba(239, 68, 68, 0.2)',
                    fill: true,
                    tension: 0.4, // Curvatura da linha
                    borderWidth: 3
                },
                {
                    label: 'Ganho/Lucro',
                    data: lucrosData,
                    borderColor: '#10b981', // Verde
                    backgroundColor: 'rgba(16, 185, 129, 0.2)',
                    fill: true,
                    tension: 0.4, // Curvatura da linha
                    borderWidth: 3
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                // Configuração da legenda
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        color: '#8b9dc3',
                        usePointStyle: true,
                        padding: 20,
                        font: {
                            size: 14
                        }
                    }
                },
                // Configuração dos tooltips (pop-ups ao passar mouse)
                tooltip: {
                    backgroundColor: '#1e293b',
                    titleColor: '#f1f5f9',
                    bodyColor: '#cbd5e1',
                    borderColor: '#334155',
                    borderWidth: 1,
                    padding: 12,
                    displayColors: true,
                    callbacks: {
                        // Formatar label do tooltip com símbolo €
                        label: function(context) {
                            return context.dataset.label + ': €' + context.parsed.y.toFixed(2);
                        }
                    }
                }
            },
            scales: {
                // Eixo Y (vertical) - Valores em euros
                y: {
                    beginAtZero: true, // Começar em 0
                    max: 5000, // Valor máximo de 5000€
                    ticks: {
                        color: '#8b9dc3',
                        // Adicionar símbolo € aos valores
                        callback: function(value) {
                            return '€' + value;
                        }
                    },
                    grid: {
                        color: 'rgba(139, 157, 195, 0.1)'
                    }
                },
                // Eixo X (horizontal) - Datas
                x: {
                    ticks: {
                        color: '#8b9dc3'
                    },
                    grid: {
                        color: 'rgba(139, 157, 195, 0.1)'
                    }
                }
            }
        }
    });
}

// Inicializar gráfico e tabela ao carregar página
updateFinanceChart();
renderFinanceRecords();

// ============== SISTEMA DE MENSAGENS ==============

// Inicializar gráfico e tabela ao carregar página
updateFinanceChart();
renderFinanceRecords();

// ============== SISTEMA DE MENSAGENS ==============
// Variável para armazenar filtro atual e busca
let currentFilter = 'all';
let currentSearchQuery = '';

// Renderizar lista de mensagens com filtro e busca
function renderMessages(filter = 'all', searchQuery = '') {
    currentFilter = filter;
    currentSearchQuery = searchQuery;
    const messagesList = document.getElementById('messagesList');
    
    // Usar mensagens do Appwrite (já carregadas no array MESSAGES)
    
    // Aplicar filtro por status (lida/não lida)
    let filteredMessages = MESSAGES;
    if (filter === 'unread') {
        filteredMessages = MESSAGES.filter(m => !m.lida);
    } else if (filter === 'read') {
        filteredMessages = MESSAGES.filter(m => m.lida);
    }
    
    // Aplicar busca se houver query
    if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase();
        filteredMessages = filteredMessages.filter(m => {
            return m.nome.toLowerCase().includes(query) ||
                   m.email.toLowerCase().includes(query) ||
                   (m.telefone && m.telefone.includes(query)) ||
                   (m.servico && m.servico.toLowerCase().includes(query)) ||
                   m.mensagem.toLowerCase().includes(query);
        });
    }
    
    // Atualizar todos os contadores
    document.getElementById('sidebarBadge').textContent = MESSAGES.filter(m => !m.lida).length;
    document.getElementById('countAll').textContent = MESSAGES.length;
    document.getElementById('countUnread').textContent = MESSAGES.filter(m => !m.lida).length;
    document.getElementById('countRead').textContent = MESSAGES.filter(m => m.lida).length;
    
    // Se não há mensagens, mostrar estado vazio
    if (filteredMessages.length === 0) {
        const emptyMessage = searchQuery.trim() !== '' 
            ? 'Nenhuma mensagem encontrada para a pesquisa' 
            : 'Nenhuma mensagem recebida';
        messagesList.innerHTML = `
            <div class="no-messages">
                <i class="fas fa-inbox"></i>
                <p>${emptyMessage}</p>
            </div>
        `;
        return;
    }
    
    // Ordenar mensagens por data (mais recente primeiro)
    filteredMessages.sort((a, b) => new Date(b.$createdAt) - new Date(a.$createdAt));
    
    // Gerar HTML de cada mensagem
    messagesList.innerHTML = filteredMessages.map(msg => `
        <div class="message-card ${msg.lida ? 'read' : 'unread'}">
            <div class="message-header">
                <div class="message-from">
                    <i class="fas fa-user"></i>
                    <strong>${msg.nome}</strong>
                    ${!msg.lida ? '<span class="badge-new">Nova</span>' : ''}
                </div>
                <div class="message-date">
                    <i class="fas fa-clock"></i>
                    ${formatarData(msg.$createdAt)}
                </div>
            </div>
            <div class="message-contact">
                <span>
                    <i class="fas fa-envelope"></i>
                    ${msg.email}
                </span>
                <span>
                    <i class="fas fa-phone"></i>
                    ${msg.telefone || 'N/A'}
                </span>
            </div>
            <div class="message-subject">
                <strong>Serviço:</strong> ${msg.servico || 'Geral'}
            </div>
            <div class="message-body">
                <p>${msg.mensagem}</p>
            </div>
            <div class="message-actions">
                <button class="btn-action btn-reply" onclick="replyMessage('${msg.$id}')">
                    <i class="fas fa-reply"></i> Responder
                </button>
                <button class="btn-action btn-mark" onclick="toggleReadStatus('${msg.$id}')">
                    <i class="fas fa-${msg.lida ? 'eye-slash' : 'check'}"></i>
                    ${msg.lida ? 'Marcar como não lida' : 'Marcar como lida'}
                </button>
                <button class="btn-action btn-delete" onclick="deleteMensagem('${msg.$id}')">
                    <i class="fas fa-trash"></i> Apagar
                </button>
            </div>
        </div>
    `).join('');
}

// ============== INICIALIZAR FILTROS E PESQUISA ==============
function initializeMessageFilters() {
    console.log('Inicializando filtros de mensagens...');
    
    // Aguardar para garantir que elementos existem
    const filterButtons = document.querySelectorAll('.filter-btn');
    console.log('Botões de filtro encontrados:', filterButtons.length);
    
    if (filterButtons.length === 0) {
        console.warn('Nenhum botão de filtro encontrado! Tentando novamente...');
        setTimeout(initializeMessageFilters, 200);
        return;
    }
    
    // Event listeners dos botões de filtro
    filterButtons.forEach((btn, index) => {
        console.log(`Configurando botão ${index}:`, btn.dataset.filter);
        
        btn.onclick = function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('Filtro clicado:', this.dataset.filter);
            
            // Remover classe active de todos os botões
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            // Adicionar classe active ao botão clicado
            this.classList.add('active');
            // Renderizar com o filtro selecionado e manter busca
            renderMessages(this.dataset.filter, currentSearchQuery);
        };
    });

    // ============== PESQUISA DE MENSAGENS ==============
    const searchInput = document.getElementById('searchInput');

    if (searchInput) {
        searchInput.oninput = function() {
            const query = this.value;
            console.log('Pesquisando:', query);
            // Renderizar mensagens com filtro atual e nova busca
            renderMessages(currentFilter, query);
        };
    }
    
    console.log('Filtros inicializados com sucesso!');
}

// ============== AÇÕES DE MENSAGENS ==============
// Responder mensagem via email
function replyMessage(id) {
    const msg = MESSAGES.find(m => m.$id === id);
    if (msg) {
        // Abrir cliente de email com dados pré-preenchidos
        const servico = msg.servico || 'Informações';
        window.location.href = `mailto:${msg.email}?subject=Re: ${servico} - Camping Faustino`;
    }
}

// Alternar status lido/não lido
async function toggleReadStatus(id) {
    const msg = MESSAGES.find(m => m.$id === id);
    if (msg) {
        // Inverter status no Appwrite
        const result = await toggleMessageRead(id, !msg.lida);
        if (result.success) {
            // Atualizar localmente
            const msgIndex = MESSAGES.findIndex(m => m.$id === id);
            if (msgIndex !== -1) {
                MESSAGES[msgIndex].lida = !MESSAGES[msgIndex].lida;
            }
            // Re-renderizar
            updateMessageCounters();
            renderMessages(currentFilter, currentSearchQuery);
        } else {
            console.error('Erro ao atualizar mensagem:', result.error);
        }
    }
}

// Deletar mensagem
async function deleteMensagem(id) {
    // Deletar do Appwrite
    const result = await deleteMessage(id);
    if (result.success) {
        // Remover localmente
        MESSAGES = MESSAGES.filter(m => m.$id !== id);
        // Re-renderizar
        updateMessageCounters();
        renderMessages(currentFilter, currentSearchQuery);
    } else {
        console.error('Erro ao deletar mensagem:', result.error);
    }
}

// ============== INICIALIZAÇÃO ==============
// Carregar e renderizar mensagens ao carregar página
renderMessages();

