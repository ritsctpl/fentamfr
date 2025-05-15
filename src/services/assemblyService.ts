import api from "./api";

export const addWorkListAssemble = async (site: string, userId: string, payload:object) => {
    const response = await api.post('/customdata-service/retrieveByCategory', { site, userId, ...payload });
    return response.data;
  };

  export const getComponentDetails = async (site: string, payload:object) => {
    const response = await api.post('assembly-service/getDataType', { site, ...payload });
    return response.data;
  };

  export const saveAssembleComponent = async (site: string, payload:object) => {
    const response = await api.post('assembly-service/addComponent', { site, ...payload });
    return response.data;
  };

  export const getInventeryData = async (site: string, payload:object) => {
    const response = await api.post('inventory-service/retrieveByItem', { site, ...payload });
    return response.data;
  };

  export const getPcuData = async (site: string, payload:object) => {
    const response = await api.post('inventory-service/retrieveByItem', { site, ...payload });
    return response.data;
  };