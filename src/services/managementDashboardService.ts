import api from './api';

export const createDashboard = async (request: any) => {
  const response = await api.post('/management-service/create', request);
  return response.data;
};

export const updateDashboard = async (request: any) => {
  const response = await api.post('/management-service/update', request);
  return response.data;
};

export const retrieveDashboard = async (request: any) => {
  const response = await api.post('/management-service/retrieve', request);
  return response.data;
};

