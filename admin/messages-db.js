// Gerenciamento de Mensagens com Appwrite Database

// Inicializa o serviço de Databases
const databases = new Appwrite.Databases(window.appwriteClient);

/**
 * Obtém todas as mensagens
 */
async function getAllMessages() {
    try {
        const response = await databases.listDocuments(
            APPWRITE_CONFIG.databaseId,
            APPWRITE_CONFIG.messagesCollectionId
        );
        return response.documents;
    } catch (error) {
        console.error('Erro ao buscar mensagens:', error);
        return [];
    }
}

/**
 * Cria uma nova mensagem
 */
async function createMessage(messageData) {
    try {
        const response = await databases.createDocument(
            APPWRITE_CONFIG.databaseId,
            APPWRITE_CONFIG.messagesCollectionId,
            'unique()',
            {
                nome: messageData.nome,
                email: messageData.email,
                telefone: messageData.telefone,
                servico: messageData.servico,
                mensagem: messageData.mensagem,
                lida: false
            }
        );
        return { success: true, message: response };
    } catch (error) {
        console.error('Erro ao criar mensagem:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Marca mensagem como lida/não lida
 */
async function toggleMessageRead(messageId, lida) {
    try {
        const response = await databases.updateDocument(
            APPWRITE_CONFIG.databaseId,
            APPWRITE_CONFIG.messagesCollectionId,
            messageId,
            { lida: lida }
        );
        return { success: true, message: response };
    } catch (error) {
        console.error('Erro ao atualizar mensagem:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Deleta uma mensagem
 */
async function deleteMessage(messageId) {
    try {
        await databases.deleteDocument(
            APPWRITE_CONFIG.databaseId,
            APPWRITE_CONFIG.messagesCollectionId,
            messageId
        );
        return { success: true };
    } catch (error) {
        console.error('Erro ao deletar mensagem:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Obtém mensagens não lidas
 */
async function getUnreadMessages() {
    try {
        const response = await databases.listDocuments(
            APPWRITE_CONFIG.databaseId,
            APPWRITE_CONFIG.messagesCollectionId,
            [
                Appwrite.Query.equal('lida', false)
            ]
        );
        return response.documents;
    } catch (error) {
        console.error('Erro ao buscar mensagens não lidas:', error);
        return [];
    }
}

/**
 * Pesquisa mensagens por texto
 */
async function searchMessages(searchText) {
    try {
        const response = await databases.listDocuments(
            APPWRITE_CONFIG.databaseId,
            APPWRITE_CONFIG.messagesCollectionId,
            [
                Appwrite.Query.search('nome', searchText)
            ]
        );
        return response.documents;
    } catch (error) {
        console.error('Erro ao pesquisar mensagens:', error);
        return [];
    }
}
