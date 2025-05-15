import api from './api';

export const fetchDataFields = async (site: string) => {
  const response = await api.post('/datafield-service/retrieveTop50', { site })
  return response.data.dataFieldList;
};

export const deleteDataFields = async (site: string, userId, selectedRowData: object) => {
  try {
    const response = await api.post('/datafield-service/delete', {site,userId,...selectedRowData});
    return response.data;
 
  } catch (error) {
    console.error('Error deleting datafield:', error);
    throw error; 
  }
};

export const CreateDataFields = async (site: string, userId, selectedRowData: object) => {
  try {
    const response = await api.post('/datafield-service/create', {site,userId,...selectedRowData});
    return response.data;
 
  } catch (error) {
    console.error('Error deleting datafield:', error);
    throw error; 
  }
};
