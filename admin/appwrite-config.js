// Configuração do Appwrite
// Substitua com os seus IDs do projeto Appwrite

const APPWRITE_CONFIG = {
    endpoint: 'https://fra.cloud.appwrite.io/v1',
    projectId: '69412208000be0756ce0',
    
    // Database
    databaseId: '69451a8a0034f16de14c',
    
    // Collections
    messagesCollectionId: 'messages', // ID correto da collection de messages
    productsCollectionId: 'products', // Collection de produtos
    
    // Storage
    productImagesBucketId: 'product-images', // Bucket de imagens de produtos
};

// Exportar configuração
if (typeof module !== 'undefined' && module.exports) {
    module.exports = APPWRITE_CONFIG;
}
