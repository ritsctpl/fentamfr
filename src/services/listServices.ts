import api from "./api";

export const fetchListTop50 = async (site: string) => {
    const response = await api.post('/listmaintenance-service/retrieveTop50', { site });
    return response.data.listMaintenanceList;
};

export const fetchListAll = async (site: string) => {
    const response = await api.post('/listmaintenance-service/retrieveAll', { site });
    return response.data.listMaintenanceList;
};

export const retrieveList = async (site: string, list) => {
    const response = await api.post('/listmaintenance-service/retrieve', { site, ...list });
    console.log(response.data,list, 'response');
    return response.data;
};

export const fetchListAllbyType = async (site: string, type) => {
    const response = await api.post('/listmaintenance-service/retrieveAll', { site, ...type });
    return response.data.listMaintenanceList;
};

export const getFieldNameByCategory = async (site: string, category: string) => {
    const response = await api.post('/worklist-service/getFieldNameByCategory', {category: category, });
    return response.data;
};

export const updateList = async (site: string, userId:string, payload: Object) => {
    const response = await api.post('/listmaintenance-service/update', { site, userId, ...payload });
    return response.data;
};
export const createList = async (site: string, userId: string, payload: Object) => {
  const response = await api.post('/listmaintenance-service/create', { site, userId, ...payload });
  return response.data;
};
export const deleteList = async (site: string, userId: string, payload: Object) => {
  const response = await api.post('/listmaintenance-service/delete', { site, userId, ...payload });
  return response.data;
};
