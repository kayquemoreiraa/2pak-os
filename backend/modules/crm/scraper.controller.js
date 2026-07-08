const supabase = require('../../config/supabaseClient');

exports.buscarNoMaps = async (req, res) => {
    const { termo, limite } = req.body;
    
    if (!termo) return res.status(400).json({ erro: 'Termo de busca é obrigatório' });

    try {
        // --- SUA LÓGICA DE SCRAPER AQUI ---
        // Exemplo: const resultadosDoScraper = await rodarPuppeteer(termo, limite);
        const resultadosDoScraper = [
            { nome_fantasia: 'Exemplo Teste', origem_lead: 'Google Maps' }
        ];

        // --- INTEGRAÇÃO COM SUPABASE ---
        const { data, error } = await supabase
            .from('empresas')
            .insert(resultadosDoScraper.map(item => ({
                nome_fantasia: item.nome_fantasia,
                origem_lead: item.origem_lead || 'Google Maps',
                status: 'Novo'
            })));

        if (error) throw error;

        res.json({ 
            mensagem: 'empresas salvos no Supabase com sucesso!', 
            empresas: data 
        });

    } catch (error) {
        console.error('Erro na integração:', error);
        res.status(500).json({ erro: 'Falha ao processar empresas no banco' });
    }
};
