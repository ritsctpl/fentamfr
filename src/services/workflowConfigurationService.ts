import api from './api';



export const createConfiguration = async (request: any) => {
  const response = await api.post('/workflow-service/create', {...request});
  return response?.data;
};

export const updateConfiguration = async (request: any) => {
  const response = await api.post(`/workflow-service/update`, {...request});
  return response?.data;
};

export const deleteConfiguration = async (request: any) => {
  const response = await api.post(`/workflow-service/delete`, {...request});
  return response?.data;
};

export const retrieveConfigurations = async (request: any) => {
  const response = await api.post(`/workflow-service/getById`, {...request});
  return response?.data;
};

export const retrieveTop50Configurations = async (request: any) => {
  const response = await api.post(`/workflow-service/getTop50`, {...request});
  return response?.data;
};

export const retrieveAllConfigurations = async (request: any) => {
  const response = await api.post(`/workflow-service/getAll`, {...request});
  return response?.data;
};

export const retrieveAllWorkFlowStatesMaster = async (request: any) => {
  const response = await api.post('/workflowstatesmaster-service/getAllWorkFlowStatesMaster', {...request});
  return response?.data;
};

export const fetchAllUserGroup= async (site: string) => {
  const response = await api.post('/usergroup-service/retrieveAll', { site });
  return response?.data?.userGroupResponses;
};

export const retrieveAllUserGroup= async (request: any) => {
  const response = await api.post('/usergroup-service/retrieveAll', { ...request });
  return response?.data?.userGroupResponses;
};


