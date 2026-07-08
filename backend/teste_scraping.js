const puppeteer = require('puppeteer-core');

async function testarScraper() {
    console.log('--- Iniciando Navegador ---');
    
    // Verifique se este é o caminho do seu Chrome
    const browser = await puppeteer.launch({ 
        executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
        headless: true 
    });

    const page = await browser.newPage();
    const termo = 'Barbearia em São Paulo';
    
    console.log(`--- Buscando por: ${termo} ---`);
    await page.goto(`https://www.google.com/maps/search/${encodeURIComponent(termo)}`);

    // Aguarda os cards das empresas aparecerem
    await page.waitForSelector('div[role="feed"]', { timeout: 10000 });
    
    // Rola a página para carregar mais resultados
    await page.evaluate(() => {
        const feed = document.querySelector('div[role="feed"]');
        feed.scrollTop = feed.scrollHeight;
    });

    // Extrai os nomes das empresas
    const resultados = await page.evaluate(() => {
        const nomes = Array.from(document.querySelectorAll('a.hfpxzc'));
        return nomes.map(n => n.getAttribute('aria-label'));
    });

    console.log('Resultados encontrados:', resultados);
    
    await browser.close();
}

testarScraper().catch(console.error);
