import api from './api';

export const fetchTop50List = async (site: string) => {
  const response = await api.post('/activityhook-service/retrieveTop50', { site });
  return response.data;
};



export const retrieveHook = async (site: string, activityHookId: string) => {
  const response = await api.post('/activityhook-service/retrieve', { site, activityHookId });
  return response.data;
};

export const retrieveAllHook = async (site: string, activityHookId: string) => {
  const response = await api.post('/activityhook-service/retrieveAll', { site, activityHookId });
  return response.data;
};



export const createHook = async (req: any) => {
  try {
    const response = await api.post('/activityhook-service/create', req);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateHook = async (req: any) => {
  try {
    const response = await api.post('/activityhook-service/update', req);
    return response.data;
  } catch (error) {
    throw error;
  }
};



export const deleteHook = async (site: string, activityHookId: string, userId: string) => {
  const response = await api.post('/activityhook-service/delete', { site, activityHookId, userId });
  return response.data;
};


export const fetchTop50Operation = async (site: string) => {
  const response = await api.post('/operation-service/retrieveTop50/', { site });
  return response.data.operationList;
};

export const retrieveAllOperation = async (site: string, operation: string) => {
  const response = await api.post('/operation-service/retrieveByOperation', { site, operation });
  return response.data.operationList;
};


export const fetchTop50Sites = async () => {
  const response = await api.post('/site-service/retrieveTop50',);
  return response?.data?.retrieveTop50List;
};

export const fetchTop50Users = async (site: any) => {
  const response = await api.post('/user-service/retrieveTop50', {});
  return response.data?.userList;
};

export const fetchAllUsers = async (payload: any) => {
  const response = await api.post('/user-service/retrieveAllByUser', { ...payload });
  return response?.data?.userList;
};

export const fetchServiceActivity = async (payload: any) => {
  const response = await api.post('/activity-service/retrieveServiceActivity', { ...payload });
  return response?.data;
};