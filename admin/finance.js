// Script da página de Análise Financeira
// Protege a página - requer autenticação
(async () => {
    await requireAuth();
    
    // Mostra informações do usuário logado
    const user = await getCurrentUser();
    if (user) {
        console.log('Usuário autenticado:', user.email);
    }
    
    // Atualizar badge de mensagens
    updateMessageBadge();
})();

// Atualizar badge de mensagens não lidas
async function updateMessageBadge() {
    const messages = await getAllMessages();
    const unreadCount = messages.filter(m => !m.lida).length;
    document.getElementById('sidebarBadge').textContent = unreadCount;
}

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

// ============== INICIALIZAÇÃO ==============
// Inicializar gráfico e tabela ao carregar página
updateFinanceChart();
renderFinanceRecords();
