import { message } from 'antd';
import api from './api';

export const fetchCycleTimes = async (site: string) => {
  const response = await api.post('/cycletime-service/retrieveAll', { site });
  return response.data.itemAndVersionGroups;
};

export const fetch50CycleTime = async (site: string) => {
  const response = await api.post('/cycletime-service/retrieveAll', { site });
  return response.data.cycleTimeList;
};

export const addCycleTime = async (site: string, userId: string, payload: Object) => {
  
  try {
    const response = await api.post('/cycletime-service/createOrUpdate', {
      site, 
      userId, 
      ...payload, 
    });  
    return response.data;
  } catch (error) {
    throw error; 
  }
};

export const deleteCycleTime = async (site: string, userId, selectedRowData: object) => {
  try {
    const response = await api.post('/cycletime-service/delete', {site,userId,...selectedRowData});
    message.info(response.data.message)
    return response.data;
  } catch (error) {
    message.success(error.data.message)
    throw error; 
  }
};

export const fetchResource = async (site: string, userId: string, url: string) => {
  try {
      const response = await api.post(`${url}-service/retrieveBySite`, { site, userId });
      return response.data;
  } catch (error) {
      throw error;
  }
};

export const fetchActivityBrowse = async (site: string, userId: string, url: string, end: string) => {
  try {
      const response = await api.post(`${url}-service/${end}`, { site, userId });
      return response.data;
  } catch (error) {
      throw error;
  }
};

export const fetchActivityBrowses = async (site: string, userId: string, url: string) => {
  try {
      const response = await api.post(`${url}`, { site, userId });
      return response.data;
  } catch (error) {
      throw error;
  }
};

export const retriveCycleTimeRow = async (site: string, row) => {
  const response = await api.post('/cycletime-service/retrieve', { site, ...row });
  return response.data;
};












export const fetchAllResource = async (site: string, newValue: object) => {
  const response = await api.post('/resource-service/retrieveResourceList', { site, ...newValue });
  return response.data;
};

export const fetchTop50Resource = async ( site: string ) => {
  const response = await api.post('/resource-service/retrieveTop50', { site });
  return response.data;
};

export const fetchAllWorkCenter = async (site: string, workCenter: object) => {
  const response = await api.post('/workcenter-service/retrieveAll', { site, ...workCenter });
  return response.data;
};

export const fetchTop50WorkCenter = async ( site: string ) => {
  const response = await api.post('/workcenter-service/retrieveTop50', { site });
  return response.data;
};

export const fetchAllOperation = async (site: string, newValue: object) => {
  const response = await api.post('/operation-service/retrieveByOperation', { site, ...newValue });
  return response.data;
};

export const fetchTop50Operation = async ( site: string ) => {
  const response = await api.post('/operation-service/retrieveTop50', { site });
  return response.data;
};

export const fetchAllMaterial = async (site: string, newValue: object) => {
  const response = await api.post('/item-service/retrieveAll', { site, ...newValue });
  return response.data;
};

export const fetchTop50Material = async ( site: string ) => {
  const response = await api.post('/item-service/retrieveTop50', { site });
  return response.data;
};
