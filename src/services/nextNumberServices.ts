import api from './api';

export const fetchTop50 = async (site: string) => {
  const response = await api.post('/item-service/retrieveTop50', { site });
  // console.log(response,'Item Top 50 Response');
  
  return response.data.itemList;
};



export const retrieveAllItem = async (site: string,  item: string) => {
  const response = await api.post('/item-service/retrieveAll', { site, item });
  // console.log(response,'All Item List Response');
  
  return response.data.itemList;
};

export const retrieveTop50ItemGroup = async (site: string) => {
  const response = await api.post('/itemgroup-service/retrieveTop50', { site });
  // console.log(response,'Top 50 Item Hroup List Response');
  
  return response.data.groupNameList;
};

export const retrieveAllItemGroup = async (site: string,  itemGroup: string) => {
  const response = await api.post('/itemgroup-service/retrieveAll', { site, itemGroup });
  // console.log(response,'All Item Hroup List Response');
  
  return response.data.groupNameList;
};


export const fetchTop50Activities = async (site: string) => {
  const response = await api.post('/activity-service/retrieveTop50', { site });
  return response.data.activityList;
};

export const retrieveAllActivity = async (site: string, activityId: string) => {
  const response = await api.post('/activity-service/retrieveByActivityId', { site, activityId });
  return response.data.activityList;
};

export const createNextNumber = async (request: object) => {
  const response = await api.post('/nextnumbergenerator-service/create', request);
  return response.data;
};

export const updateNextNumber = async (request: object) => {
  const response = await api.post('/nextnumbergenerator-service/update', request);
  return response.data;
};

export const retrieveNextNumber = async (request: object) => {
  const response = await api.post('/nextnumbergenerator-service/retrieve', request);
  return response.data;
};

export const deleteNextNumber = async (request: object) => {
  const response = await api.post('/nextnumbergenerator-service/delete', request);
  return response.data;
};

export const retrieveAllBOM = async (site: string, bom: string) => {
  const response = await api.post('/bom-service/retrieveAll', { site, bom });
  // console.log(response,'bom retrieve all by site Response');
  
  return response.data.bomList;
};