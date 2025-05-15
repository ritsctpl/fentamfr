import api from './api';



export const createApiConfiguration = async (request: any) => {
  const response = await api.post('/oee-service/apiconfigurations', {...request});
  return response?.data;
};

export const updateApiConfiguration = async (request: any) => {
  const response = await api.put(`/oee-service/apiconfigurations/${request?.id}`, {...request});
  return response?.data;
};

export const deleteApiConfiguration = async (id: any) => {
  const response = await api.delete(`/oee-service/apiconfigurations/${id}`);
  return response?.data;
};

export const retrieveApiConfigurations = async (id: any) => {
  const response = await api.get(`/oee-service/apiconfigurations/${id}`);
  return response?.data;
};

export const retrieveTop50ApiConfigurations = async (request: any) => {
  const response = await api.get(`/oee-service/apiconfigurations`);
  return response?.data;
};

export const retrieveAllApiConfigurations = async (id: any) => {
  const response = await api.get(`oee-service/apiconfigurations/${id}`);
  return response?.data;
};






