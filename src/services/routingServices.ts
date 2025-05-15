import api from "./api";

export const fetchResource = async (site: string, userId: string, url: string) => {
  console.log(site,userId,url,'gfhfh');
  try {
      const response = await api.post(`${url}-service/retrieveBySite`, { site, userId });
      console.log(response);
      
      return response.data;
  } catch (error) {
      console.error('API Error:', error);
      throw error;
  }
};

export const retrieveAllBOM = async (site: string, bom: string) => {
  const response = await api.post('/bom-service/retrieveAll', { site, bom });
  // console.log(response,'bom retrieve all by site Response');
  
  return response.data.bomList;
};

export const retrieveTop50BOM = async (site: string) => {
  const response = await api.post('/bom-service/retrieveTop50', { site });
  // console.log(response,'bom retrieve all by site Response');
  
  return response.data.bomList;
};

export const fetchTop50Routing = async (site: string) => {
  const response = await api.post('/routing-service/retrieveTop50', { site });
  // console.log(response,'bom retrieve all by site Response');
  
  return response.data.routingList;
};

export const retrieveTop50DocumentList = async (site: string) => {
  const response = await api.post('/document-service/retrieveTop50', { site });
  // console.log(response,'Document List Response');
  
  return response.data.documentResponseList;
};

export const retrieveAllDocumentList = async (site: string, document: string) => {
  const response = await api.post('/document-service/retrieveAll', { site, document });
  // console.log(response,'Document List Response');
  
  return response.data.documentResponseList;
};

export const retrieveAllRouting = async (site: string, routing: string) => {
  const response = await api.post('/routing-service/retrieveAll', { site, routing });
  // console.log(response,'Routing List Response');
  
  return response.data.routingList;
};

export const retrieveTop50Routing = async (site: string) => {
  const response = await api.post('/routing-service/retrieveTop50', { site });
  // console.log(response,'Routing List Response');
  
  return response.data.routingList;
};

export const retrieveErpOperation = async (site: string) => {
  const response = await api.post('/operation-service/retrieveByErpOperation', { site });
  // console.log(response,'retrieve ERP Operation Response');
  
  return response.data.operationList;
};

export const retrieveTop50Operation = async (site: string) => {
  const response = await api.post('/operation-service/retrieveTop50', { site });
  // console.log(response,'retrieve ERP Operation Response');
  
  return response.data.operationList;
};

export const retrieveAllOperation = async (site: string, operation: string) => {
  const response = await api.post('/operation-service/retrieveByOperation', { site, operation });
  // console.log(response,'retrieve ERP Operation Response');
  
  return response.data.operationList;
};

interface RoutingData {
  site: string
  routing: string;
  version: string;
  description: string;
  routingType: string;
  status: string;
  currentVersion: boolean;
  relaxedRoutingFlow: boolean;
  document: string;
  dispositionGroup: string;
  bom: string;
  bomVersion: string;
  replicationToErp: boolean;
  isParentRoute: boolean;
  routingStepList: any[]; // Replace 'any' with the appropriate type if known
  customDataList: any[];  // Replace 'any' with the appropriate type if known
  userId: string;
  createdDateTime: string;
  updatedDateTime: string;
  createdBy: string;
  modifiedBy: string;
};

export const createRouting = async (routingData: RoutingData) => {
  const response = await api.post('/routing-service/create', routingData);
  return response.data;
};

export const updateRouting = async (routingData: RoutingData) => {
  const response = await api.post('/routing-service/update', routingData);
  return response.data;
};


export const retrieveRouting = async (site: string, routing: string, version: string) => {
  const response = await api.post('/routing-service/retrieve', { site, routing, version });
  // console.log(response,'Routing retrieve Response');
  
  return response.data;
};



export const deleteRouting = async (site: string, routing: string, version: string, userId: string) => {
  const response = await api.post('/routing-service/delete', { site, routing, version, userId });
  // console.log(response,'Routing delete Response');
  
  return response.data;
};

export const retrieveAllWC = async (site: string, workCenter: string) => {
  const response = await api.post('/workcenter-service/retrieveAll', { site, workCenter });
  // console.log(response,'work center List Response');
  
  return response.data.workCenterList;
};

export const retrieveTop50WC = async (site: string) => {
  const response = await api.post('/workcenter-service/retrieveTop50', { site });
  // console.log(response,'work center List Response');
  
  return response.data.workCenterList;
};

export const retrieveErpWC = async (site: string) => {
  const response = await api.post('/workcenter-service/getErpWorkCenterList', { site });
  // console.log(response,'ERP work center List Response');
  
  return response.data.workCenterList;
};

export const retrieveCustomDataList = async (site: string, category: string, userId: string) => {
  const response = await api.post('/customdata-service/retrieveByCategory', { site, category, userId });
  // console.log(response,'Custom Data List Response');
  
  return response.data;
};