import api from './api';

export const fetchTop50 = async (site: string) => {
  const response = await api.post('/item-service/retrieveTop50', { site });
  // console.log(response,'Item Top 50 Response');
  
  return response.data.itemList;
};



export const retrieveItem = async (site: string, item: string, revision: string) => {
  const response = await api.post('/item-service/retrieve', { site, item, revision });
  // console.log(response,'Item Retrieve Response');
  
  return response.data;
};

export const retrieveDocumentList = async (site: string) => {
  const response = await api.post('/document-service/retrieveTop50', { site });
  // console.log(response,'Document List Response');
  
  return response.data.documentResponseList;
};

export const retrieveAvailableDocumentList = async (site: string, item: string, revision: string) => {
  const response = await api.post('/item-service/getAvailableDocument', { site, item, revision });
  // console.log(response,'Available Document List Response');
  
  return response.data.printDocuments;
};

type ItemData = {
  handle: string;
  site: string;
  item: string;
  revision: string;
  description: string;
  itemGroup: string;
  status: string;
  procurementType: string;
  currentVersion: boolean;
  itemType: string;
  lotSize: number;
  routing: string;
  routingVersion: string;
  bom: string;
  bomVersion: string;
  bomBO: any;
  routingBO: any;
  assemblyDataType: string;
  removalDataType: string;
  receiptDataType: string;
  printDocuments: any[];
  customDataList: { customData: string; value: any }[];
  alternateComponentList: any[];
  inUse: boolean;
  active: number;
  createdBy: any;
  modifiedBy: any;
  createdDateTime: string;
  modifiedDateTime: any;
  userId: string;
};

export const createItem = async (itemData: ItemData) => {
  try {
    const response = await api.post('/item-service/create', itemData);
    // console.log('Create Item Response:', response);

    return response.data;
  } catch (error) {
    console.error('Error creating item:', error);
    throw error;
  }
};

export const updateItem = async (itemData: ItemData) => {
  try {
    const response = await api.post('/item-service/update', itemData);
    // console.log('Update Item Response:', response);

    return response.data;
  } catch (error) {
    console.error('Error creating item:', error);
    throw error;
  }
};

export const retrieveCustomDataList = async (site: string, category: string, userId: string) => {
  const response = await api.post('/customdata-service/retrieveByCategory', { site, category, userId });
  // console.log(response,'Custom Data List Response');
  
  return response.data;
};

export const deleteItem = async (site: string, item: string, revision: string, userId: string) => {
  const response = await api.post('/item-service/delete', { site, item, revision, userId });
  // console.log(response,'Item Delete Response');
  
  return response.data;
};

export const retrieveAllRouting = async (site: string,  routing: string) => {
  const response = await api.post('/routing-service/retrieveAll', { site, routing });
  // console.log(response,'All Routing List Response');
  
  return response.data.routingList;
};

export const retrieveTop50Routing = async (site: string  ) => {
  const response = await api.post('/routing-service/retrieveTop50', { site });
  // console.log(response,'All Routing List Response');
  
  return response.data.routingList;
};

export const retrieveTop50Bom = async (site: string,  userId: string) => {
  const response = await api.post('/bom-service/retrieveTop50', { site });
  // console.log(response,'Top 50 Bom List Response');
  
  return response.data.bomList;
};

export const retrieveAllBom = async (site: string,  bom: string) => {
  const response = await api.post('/bom-service/retrieveAll', { site, bom });
  // console.log(response,'All Bom List Response');
  
  return response.data.bomList;
};

export const retrieveTop50DataType = async (site: string,  ) => {
  const response = await api.post('/datatype-service/retrieveTop50', { site });
  // console.log(response,'Top 50 Datatype List Response');
  
  return response.data.dataTypeList;
};

export const retrieveAllDataType = async (site: string,  dataType: string, category: string) => {
  const response = await api.post('/datatype-service/retrieveAll', { site, dataType, category });
  // console.log(response,'All Datatype List Response');
  
  return response.data.dataTypeList;
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

export const retrieveItemGroup = async (site: string,  itemGroup: string) => {
  const response = await api.post('/itemgroup-service/retrieve', { site, itemGroup });
  // console.log(response,'All Item Hroup List Response');
  return response.data;
};

export const createItemGroup = async (request: object) => {
  const response = await api.post('/itemgroup-service/create', request);
  // console.log(response,'All Item Hroup List Response');
  return response.data;
};

export const updateItemGroup = async (request: object) => {
  const response = await api.post('/itemgroup-service/update', request);
  // console.log(response,'All Item Hroup List Response');
  return response.data;
};

export const deleteItemGroup = async (site: string,  itemGroup: string, userId: string) => {
  const response = await api.post('/itemgroup-service/delete', {site, itemGroup, userId});
  // console.log(response,'All Item Hroup List Response');
  return response.data;
};

export const retrieveAvailableItems = async (site: string,  itemGroup: string) => {
  const response = await api.post('/itemgroup-service/retrieveAvailableItems', {site, itemGroup});
  // console.log(response,'All Item Hroup List Response');
  return response.data.listOfAvailableItems;
};




