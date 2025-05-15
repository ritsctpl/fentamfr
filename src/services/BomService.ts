import api from './api';

export const fetchBomTop50 = async (site: string) => {
  const response = await api.post('/bom-service/retrieveTop50', { site });
  return response.data.bomList;
};

export const retrieveAllBom = async (site: string) => {
    const response = await api.post('/bom-service/retrieveAll', { site });
    return response.data.bomList;
};

export const createBom = async (site: string, payload:object) => {
  const response = await api.post('/bom-service/create', { site, ...payload });
  return response.data;
};

export const createBomCustom = async (site: string, userId: string, payload:object) => {
  const response = await api.post('/customdata-service/retrieveByCategory', { site, userId, ...payload });
  return response.data;
};

export const RetriveBomSelectedRow = async (site: string, row:object) => {
  const response = await api.post('/bom-service/retrieve', { site, ...row });
  return response.data;
};

export const createCopyBom = async (site: string, userId: string, row:object) => {
  const response = await api.post('/bom-service/create', { site, userId, ...row });
  return response.data;
};

export const UpdateBom = async (site: string, userId: string, row:object) => {
  const response = await api.post('/bom-service/update', { site, userId, ...row });
  return response.data;
};

export const UpdateBomComponent = async (site: string, userId: string, payload:any) => {
  const response = await api.post('/bom-service/update', { site, userId, ...payload });
  return response.data;
};

export const deleteBom = async (site: string, userId: string, row:object) => {
  const response = await api.post('/bom-service/delete', { site, userId, ...row });
  return response.data;
};



export const fetchAllAssyOperation = async (site: string, newValue: object) => {
  const response = await api.post('/operation-service/retrieveByOperation', { site, ...newValue });
  return response.data;
};

export const fetchTop50AssyOperation = async ( site: string ) => {
  const response = await api.post('/operation-service/retrieveTop50', { site });
  return response.data;
};

export const fetchAllComponent = async (site: string, newValue: object) => {
  
  const response = await api.post('/item-service/retrieveAll', { site, ...newValue });
  return response.data;
};

export const fetchTop50Component = async ( site: string ) => {
  const response = await api.post('/item-service/retrieveTop50', { site });
  return response.data;
};

export const fetchAllAssyDataType = async (site: string, newValue: object) => {
  const response = await api.post('/datatype-service/retrieveAll', { site, ...newValue });
  return response.data;
};

export const fetchTop50AssyDataType = async ( site: string ) => {
  const response = await api.post('/datatype-service/retrieveTop50', { site });
  return response.data;
};