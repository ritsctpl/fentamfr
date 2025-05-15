import api from "./api";

export const setHold = async (object: any) => {
    const response = await api.post(`/batchnohold-service/hold`, object);
    return response.data;
};

export const setUnHold = async (object: any) => {
    const response = await api.post(`/batchnohold-service/unhold`, object);
    return response.data;
};


export const retrieveBatchNumberHeader = async (request: any) => {
    const response = await api.post('/batchnoheader-service/retrieve', { ...request });
    return response.data;
  };
