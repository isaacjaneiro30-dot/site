// Integração do formulário de contato com Appwrite
// Este ficheiro deve ser carregado no Contato.html

// Configuração do Appwrite para o frontend público
const publicAppwriteClient = new Appwrite.Client();
publicAppwriteClient
    .setEndpoint(APPWRITE_CONFIG.endpoint)
    .setProject(APPWRITE_CONFIG.projectId);

const publicDatabases = new Appwrite.Databases(publicAppwriteClient);

/**
 * Envia mensagem do formulário de contato para o Appwrite
 */
async function sendContactMessage(messageData) {
    try {
        const response = await publicDatabases.createDocument(
            APPWRITE_CONFIG.databaseId,
            APPWRITE_CONFIG.messagesCollectionId,
            'unique()',
            {
                nome: messageData.nome,
                email: messageData.email,
                telefone: messageData.telefone || 'Não informado',
                servico: messageData.servico,
                mensagem: messageData.mensagem,
                lida: false
            }
        );
        
        return { success: true, data: response };
    } catch (error) {
        console.error('Erro ao enviar mensagem:', error);
        return { success: false, error: error.message };
    }
}
