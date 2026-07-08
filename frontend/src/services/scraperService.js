import api from './api';

export const buscarLeadsNoMaps = async (termo, limite) => {
    const response = await api.post('/scraper/maps', { termo, limite });
    return response.data;
};

export const importarLeadsEmMassa = async (leads) => {
    const response = await api.post('/empresas/importar-maps', leads);
    return response.data;
};
