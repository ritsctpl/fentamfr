import api from './api';

export const fetchResourceTypeTop50= async (site: string) => {
  const response = await api.post('/resourcetype-service/retrieveTop50',{site});
  return response.data;
};

export const fetchResourceTypeAll= async (site: string) => {
  const response = await api.post('/resourcetype-service/retrieveAllResourceType',{site});
  return response.data;
};

export const RetriveResourceTypeSelectedRow= async (site: string, row: any) => {
  const response = await api.post('/resourcetype-service/retrieveByResourceType',{site, ...row});
  return response.data;
};

export const getAllResourcesByResourceType= async (site: string, row: any) => {
  const response = await api.post('/resourcetype-service/getAllResourcesByResourceType',{site, ...row});
  return response.data;
};

export const createResourceType = async (site: string, userId: string, payload: Object) => {
  const response = await api.post('resourcetype-service/create', { site, userId, ...payload, });
  return response.data;
};

export const deleteResourceType = async (site: string, userId:string, payload: Object) => {
  const response = await api.post('resourcetype-service/delete', { site, userId, ...payload });
  return response.data;
};

export const updateResourceType = async (site: string, userId:string, payload: Object) => {
  const response = await api.post('resourcetype-service/update', { site, userId, ...payload });
  return response.data;
};

export const fetchAvailableResource= async (site: string) => {
  const response = await api.post('/resourcetype-service/availableResources', {site});
  return response.data.resourceList;
};

export const fetchResourceList= async (site: string, resourceType: string) => {
  console.log();
  
  const response = await api.post('/resourcetype-service/availableResources',{site, resourceType});
  return response.data.resourceList;
};