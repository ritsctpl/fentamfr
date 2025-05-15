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

export const fetchTop50DataCollection = async (site: string) => {
  const response = await api.post('/datacollection-service/retrieveTop50', { site });
  return response.data.dataCollectionList;
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

export const retrieveAllDataCollection = async (site: string, dataCollection: string) => {
  const response = await api.post('/datacollection-service/retrieveAll', { site, dataCollection });
  return response.data.dataCollectionList;
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

export const createDataCollection = async (request: object) => {
  const response = await api.post('/datacollection-service/create', request);
  return response.data;
};




export const updateRouting = async (routingData: RoutingData) => {
  const response = await api.post('/routing-service/update', routingData);
  return response.data;
};

export const updateDataCollection = async (request: object) => {
  const response = await api.post('/datacollection-service/update', request);
  return response.data;
};


export const retrieveDataCollection = async (site: string, dataCollection: string, version: string) => {
  const response = await api.post('/datacollection-service/retrieve', { site, dataCollection, version });
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

export const retrieveAllNCCode = async (site: string, ncCode: string) => {
  const response = await api.post('/nccode-service/retrieveAll', { site, ncCode });
  return response.data.ncCodeList;
};

export const retrieveTop50NCCode = async (site: string) => {
  const response = await api.post('/nccode-service/retrieveTop50', { site });
  return response.data.ncCodeList;
};

export const retrieveAllCertification = async (site: string, certification: string) => {
  const response = await api.post('/certification-service/retrieveAll', { site, certification });
  return response.data.certificationList;
};

export const retrieveTop50Certification = async (site: string) => {
  const response = await api.post('/certification-service/retrieveTop50', { site });
  return response.data.certificationList;
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

export const retrieveAllParameterNames = async (site: string) => {
  const response = await api.post('/datacollection-service/retrieveAllParameterNames', { site });
  console.log('Parameter List Response', response.data);
  return response.data;
};

export const retrieveTop50ItemGroup = async (site: string) => {
  console.log("Item group top 50 request: ", { site });
  const response = await api.post('/itemgroup-service/retrieveTop50', { site });
  console.log("Item group top 50 response: ", response.data.groupNameList);
  return response.data.groupNameList;
};

export const deleteDataCollection = async (site: string, dataCollection: string, version: string, userId: string) => {
  const response = await api.post('/datacollection-service/delete', { site, dataCollection, version, userId });
  return response.data;
};

export const retrieveAllItemGroup = async (site: string,  itemGroup: string) => {
  console.log("Item group request: ", { site, itemGroup });
  const response = await api.post('/itemgroup-service/retrieveAll', { site, itemGroup });
  console.log("Item group response: ", response.data.groupNameList);
  return response.data.groupNameList;
};

export const fetchTop50Item = async (site: string) => {
  console.log("Item top 50 request: ", { site });
  const response = await api.post('/item-service/retrieveTop50', { site });
  console.log("Item top 50 response: ", response.data.itemList);
  return response.data.itemList;
};

export const retrieveAllItem = async (site: string,  item: string) => {
  const response = await api.post('/item-service/retrieveAll', { site, item });
  return response.data.itemList;
};

export const fetchTop50Routing = async (site: string) => {
  const response = await api.post('/routing-service/retrieveTop50', { site });
  return response.data.routingList;
};

export const retrieveAllRouting = async (site: string, routing: string) => {
  const response = await api.post('/routing-service/retrieveAll', { site, routing });
  return response.data.routingList;
};

export const fetchTop50Operation= async (site: string) => {
  const response = await api.post('/operation-service/retrieveTop50/', { site });
  return response.data.operationList;
};

export const retrieveAllOperation = async (site: string, operation: string) => {
  const response = await api.post('/operation-service/retrieveByOperation', { site, operation });
  return response.data.operationList;
};

export const fetchTop50WorkCenter = async (site: string) => {
  const response = await api.post('/workcenter-service/retrieveTop50', { site });
  return response.data.workCenterList;
};

export const fetchAllWorkCenter = async (site: string, workCenter: string) => {
  const response = await api.post('/workcenter-service/retrieveAll', { site, workCenter });
  return response.data.workCenterList;
};

export const fetchResourceTop50 = async (site: string) => {
  const response = await api.post('/resource-service/retrieveTop50', { site });
  return response.data;
};

export const fetchResourceAll = async (site: string, resource: string) => {
  const response = await api.post('/resource-service/retrieveResourceList', { site, resource });
  return response.data;
};

export const fetchShopTop50= async (site: string) => {
  const response = await api.post('/shoporder-service/retrieveTop50/', { site });
  return response.data.shopOrderResponseList;
};

export const fetchShopAllData= async (site: string, shopOrder: string) => {
  const response = await api.post('/shoporder-service/retrieveAll/', { site, shopOrder});
  return response.data.shopOrderResponseList;
};

export const retrieveTop50DataField = async (site: string) => {
  const response = await api.post('/datafield-service/retrieveTop50', { site });
  return response.data.dataFieldList;
};

export const retrieveAllDataField = async (site: string, dataField: string) => {
  const response = await api.post('/datafield-service/retrieveAll', { site, dataField });
  return response.data.dataFieldList;
};

export const retrieveListOfPCU = async (site: string) => {
  const response = await api.post('/start-service/getAllActiveAndInQueuePcuBySite', { site });
  return response.data;
};