import api from './api';

export const createBuyOff = async (payload: any) => {
    const response = await api.post('/buyoff-service/create', payload);
    return response.data;
};

export const updateBuyOff = async (payload: any) => {
    const response = await api.post('/buyoff-service/update', payload);
    return response.data;
};

export const deleteBuyOff = async (payload: any) => {
    const response = await api.post('/buyoff-service/delete', payload);
    return response.data;
};

export const fetchBuyOffById = async (site: string, payload: any) => {
    const response = await api.post('/buyoff-service/retrieve', { site, ...payload });
    return response.data;
};

export const fetchBuyOffAll = async (site: string, buyOff: string) => {
    const response = await api.post('/buyoff-service/retrieveAll', { site, buyOff });
    return response.data;
};

export const fetchBuyOffTop50 = async (site: string) => {
    const response = await api.post('/buyoff-service/retrieveTop50', { site });
    return response.data;
};
