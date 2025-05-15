import api from './api';

export const fetchAllQueryBuilder = async (site: string) => {
  const response = await api.post('/queryBuilder-service/retrieveAll', {site: site});
  
  return response.data;
};

export const fetchQueryBuilder = async (runQueryData: any) => {
  const response = await api.post('/queryBuilder-service/fetchDataByTemplateOrQuery', runQueryData);
  return response.data;
};

export const createQueryBuilder = async (createQueryData: any) => {
  const response = await api.post('/queryBuilder-service/create', createQueryData);
  return response.data;
};

export const updateQueryBuilder = async (updatedQueryData: any) => {
  const response = await api.post('/queryBuilder-service/update', updatedQueryData);
  
  return response.data;
};

export const deleteQueryBuilder = async (queryData: any) => {
  
  const response = await api.post('/queryBuilder-service/delete', queryData);
  
  return response.data;
};

export const createDataSource = async (dataSourceData: any) => {
  const response = await api.post('/queryBuilder-service/createDataSource', dataSourceData);
  return response.data;
};

export const retrieveAllDataSource = async (data: any) => {
  const response = await api.post('/queryBuilder-service/retrieveAllDataSource', data);
  return response.data.dataSourceDataList;
};

export const dataSourceConnection = async (data: any) => {
  const response = await api.post('/queryBuilder-service/dataSourceConfig', data);
  return response.data;
};

export const retrieveAllTableAndColumn = async (data: any) => {
  const response = await api.post('/queryBuilder-service/getTablesAndColumns', data);
  return response.data.tableInfoList;
};

export const deleteDataSourceConfig = async (data: any) => {
  const response = await api.post('/queryBuilder-service/deleteDataSource', data);
  return response.data;
};

export const updateDataSourceConfig = async (data: any) => {
  const response = await api.post('/queryBuilder-service/updateDataSource', data);
  return response.data;
};












