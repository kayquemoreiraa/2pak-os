const axios = require('axios');
const fs = require('fs');

async function processarImportacao() {
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImIyYzNkNGU1LWY2YTctODkwMS1iY2RlLWYxMjM0NTY3ODkwMSIsImVtYWlsIjoiYWRtaW5AMnBhay5jb20uYnIiLCJwYXBlbCI6ImFkbWluIiwib3JnYW5pemFjYW9faWQiOiJhMWIyYzNkNC1lNWY2LTc4OTAtYWJjZC1lZjEyMzQ1Njc4OTAiLCJpYXQiOjE3ODMyMTc4NjAsImV4cCI6MTc4MzgyMjY2MH0.P3oOSbrNvxSNGcWoDXADZ-gA5Dr15CxSMQpHWSJgnnE';
    
    try {
        // Lemos o arquivo como string e removemos qualquer caractere invis?vel do in?cio
        let rawData = fs.readFileSync('empresas_para_importar.json', 'utf8').replace(/^\uFEFF/, '');
        const dados = JSON.parse(rawData);
        
        console.log(`Enviando ${dados.length} empresas para o CRM...`);
        
        const response = await axios.post('http://localhost:3000/api/v1/empresas/importar-maps', dados, {
            headers: { 'Authorization': 'Bearer ' + token }
        });
        
        console.log('Sucesso:', response.data);
    } catch (err) {
        console.error('Erro na importa??o:', err.response?.data || err.message);
    }
}
processarImportacao();
