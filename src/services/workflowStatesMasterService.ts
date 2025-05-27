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

export const retrieveTop50States = async (request: any) => {
  const response = await api.post(`/workflowstatesmaster-service/getTop50WorkFlowStatesMaster`,  request);
  return response?.data;
};

export const createWorkFlowStatesMaster = async (request: any) => {
  const response = await api.post('/workflowstatesmaster-service/createWorkFlowStatesMaster', {...request});
  return response?.data;
};

export const updateWorkFlowStatesMaster = async (request: any) => {
  const response = await api.post('/workflowstatesmaster-service/updateWorkFlowStatesMaster', {...request});
  return response?.data;
};

export const retrieveWorkFlowStatesMaster = async (request: any) => {
  const response = await api.post('/workflowstatesmaster-service/getWorkFlowStatesMaster', {...request});
  return response?.data;
};

export const deleteWorkFlowStatesMaster = async (request: any) => {
  const response = await api.post('/workflowstatesmaster-service/deleteWorkFlowStatesMaster', {...request});
  return response?.data;
};

export const retrieveAllWorkFlowStatesMaster = async (request: any) => {
  const response = await api.post('/workflowstatesmaster-service/getAllWorkFlowStatesMaster', {...request});
  return response?.data;
};




