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

export const fetchCycleTime = async (site: string) => {
  const response = await api.post('/cycletime-service/retrieveAll', { site });
  console.log(response,'Top 50 cycle time');
  
  return response.data.cycleTimeList;
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

export const retrieveTop50Operation = async (site: string) => {
  const response = await api.post('/operation-service/retrieveTop50', { site });
  
  return response.data.operationList;
};

export const retrieveAllOperation = async (site: string, operation: string) => {
  const response = await api.post('/operation-service/retrieveByOperation', { site, operation });
  
  return response.data.operationList;
};

export const retrieveTop50Item = async (site: string) => {
  const response = await api.post('/item-service/retrieveTop50', { site });
  
  return response.data.itemList;
};

export const retrieveAllItem = async (site: string, item: string) => {
  const response = await api.post('/item-service/retrieveAll', { site, item });
  
  return response.data.itemList;
};

export const createCycleTime = async (request: object) => {
  const response = await api.post('/cycletime-service/createOrUpdate', request);
  return response.data;
};

export const fetchAllCycleTime = async (site: string) => {
  const response = await api.post('/cycletime-service/retrieveAll', { site });
  // debugger
  return response.data.cycleTimeSpecificRec;
};

export const deleteCycleTime = async (site: string) => {
  const response = await api.post('/cycletime-service/delete', { site });
  return response.data;
};

export const retrieveAllUom = async (site: string) => {
  const response = await api.post('/uom-service/retrieveAll',   { site } );
  return response.data.uomList;
};

export const createUom = async (request: object) => {
  console.log("create request: ", request);
  const response = await api.post('/uom-service/create', request);
  return response.data;
};

export const updateUom =  async (request: object) => {
  console.log("update request: ", request);
  const response = await api.put('/uom-service/update', request);
  return response.data;
};

export const deleteUom =  async (request: object) => {
  // const cookie = parseCookies();
  // const site = cookie.site;
  console.log("delete request: ", request);
  const response = await api.delete('/uom-service/delete', { data: { site: "RITS", ...request } });
  return response.data;
};

export const createBaseUnitConvertion = async (request: object) => {
  const response = await api.post('/uom-service/createBaseUnitConvertion', request);
  return response.data;
};

export const deleteBaseUnitConvertion = async (request: object) => {
  const response = await api.post('/uom-service/deleteBaseUnitConvertion', request);
  return response.data;
};

export const updateBaseUnitConvertion = async (request: object) => {
  const response = await api.post('/uom-service/updateBaseUnitConvertion', request);
  return response.data;
};

export const retrieveBaseUnitConvertion = async (request: object) => {
  const response = await api.post('/uom-service/retrieveBaseUnitConvertion', request);
  return response.data;
};

export const retrieveTop50BaseUnitConvertion = async (request: object) => {
  const response = await api.post('/uom-service/retrieveTop50BaseUnitConvertion', request);
  return response.data;
};


export const retrieveAllUnitConvertion = async (request: object) => {
  const response = await api.post('/uom-service/getUomByFilteredName', request);
  return response.data;
};


