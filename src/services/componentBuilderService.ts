import api from './api';



export const createComponent = async (request: any) => {
  const response = await api.post('/componentbuilder-service/createComponent ', {...request});
  return response?.data;
};

export const updateComponent = async (request: any) => {
  const response = await api.post(`/componentbuilder-service/updateComponent `, {...request});
  return response?.data;
};

export const deleteComponent = async (request: any) => {
  const response = await api.post(`/componentbuilder-service/deleteComponent `, {...request});
  return response?.data;
};

export const retrieveComponent = async (request: any) => {
  const response = await api.post(`/componentbuilder-service/getComponentById `, {...request});
  return response?.data;
};

export const retrieveTop50Components = async (request: any) => {
  const response = await api.post(`/componentbuilder-service/getTop50Component`, {...request});
  return response?.data;
};

export const retrieveAllComponents = async (request: any) => {
  const response = await api.post(`/componentbuilder-service/getAllComponent `, {...request});
  return response?.data;
};






