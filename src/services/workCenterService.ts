import api from './api';

export const fetchTop50WorkCenter = async (site: string) => {
  const response = await api.post('/workcenter-service/retrieveTop50', { site });
  // console.log(response,'Work center Top 50 Response');
  
  return response.data.workCenterList;
};

export const fetchAllWorkCenter = async (site: string, workCenter: string) => {
  const response = await api.post('/workcenter-service/retrieveAll', { site, workCenter });
  // console.log(response,'Work center Top 50 Response');
  
  return response.data.workCenterList;
};

export const retrieveHookActivity = async (site: string) => {
  const response = await api.post('/activity-service/retrieveHookActivity', { site });
  // console.log(response,'retrieveHookActivity Response');
  
  return response.data;
};

export const fetchAllActivityGroup = async (site: string) => {
  const response = await api.post('/activitygroup-service/retrieveAll', { site });
  // console.log(response,'activity group Top 50 Response');
  
  return response.data.activityGroupList;
};









export const createWorkCenter = async (request) => {
  try {
    const response = await api.post('/workcenter-service/create', request);
    // console.log('Create Activity Response:', response);

    return response.data;
  } catch (error) {
    console.error('Error creating work center:', error);
    throw error;
  }
};

export const updateWorkCenter = async (request) => {
  try {
    const response = await api.post('/workcenter-service/update', request);
    // console.log('Update Activity Response:', response);

    return response.data;
  } catch (error) {
    console.error('Error updating work center:', error);
    throw error;
  }
};

export const retrieveCustomDataList = async (site: string, category: string, userId: string) => {
  const response = await api.post('/customdata-service/retrieveByCategory', { site, category, userId });
  // console.log(response,'Custom Data List Response');
  
  return response.data;
};

export const deleteWorkCenter = async (site: string, workCenter: string,  userId: string) => {
  const response = await api.post('/workcenter-service/delete', { site, workCenter, userId });
  // console.log(response,'work center Delete Response');
  
  return response.data;
};

export const retrieveWorkCenter = async (site: string, workCenter: string)   => {
  const response = await api.post('/workcenter-service/retrieve', { site, workCenter,  });
  // console.log(response,'retrieve wc Response');
  
  return response.data;
};

export const retrieveAllWorkCenter = async (site: string) => {
  const response = await api.post('/workcenter-service/retrieveBySite', { site });
  // console.log(response,'all work center  Response');
  
  return response.data.availableWorkCenterList;
};

export const retrieveParentWorkCenter = async (site: string, workCenter: string) => {
  const response = await api.post('/workcenter-service/getParentWorkCenter', { site, workCenter });
  // console.log(response,'all work center  Response');
  
  return response.data.availableWorkCenterList;
};

export const retrieveTop50Routing = async (site: string) => {
  const response = await api.post('/routing-service/retrieveTop50', { site });
  
  return response.data.routingList;
};

export const retrieveAllRouting = async (site: string, routing: string) => {
  const response = await api.post('/routing-service/retrieveAll', { site, routing });
  
  return response.data.routingList;
};

export const retrieveTop50Resource = async (site: string) => {
  const response = await api.post('/resource-service/retrieveTop50', { site });
  // console.log(response,'resource Delete Response');
  
  return response.data;
};

export const retrieveAllResource = async (site: string, resource: string) => {
  const response = await api.post('/resource-service/retrieveResourceList', { site, resource });
  
  return response.data;
};






