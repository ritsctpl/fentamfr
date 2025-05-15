
import api from './api';

export const fetchWorkInstructionTop50 = async (site: string) => {
  const response = await api.post('/workinstruction-service/retrieveTop50', { site });
  return response.data.workInstructionListList;
};

export const retrieveAllWorkInstructionGroup = async (site: string) => {
  const response = await api.post('/workinstruction-service/retrieveAllByWorkInstruction', { site });
  return response.data.workInstructionListList;
};

export const RetriveWorkInstructionRow = async (site: string, payload: object) => {
    const response = await api.post('/workinstruction-service/retrieveByWorkInstruction', { site, ...payload });
    console.log(response.data,'respo');
    
    return response.data;
  };

  export const createWorkInstruction = async (site: string, userId: string, payload: Object) => {
    const response = await api.post('/workinstruction-service/create', { site, userId, ...payload, });
    return response.data;
  };

  export const deleteWorkInstruction = async (site: string, userId: string, payload: Object) => {
    const response = await api.post('workinstruction-service/delete', { site, userId, ...payload, });
    return response.data;
  };
  
  export const UpdateWorkInstruction = async (site: string, userId: string, payload: Object) => {
    const response = await api.post('workinstruction-service/update', { site, userId, ...payload, });
    return response.data;
  };

  export const UploadFile = async (site: string) => {
    const response = await api.post('workinstruction-service/uploadFile', { site });
    return response.data;
  };










  export const fetchAllItemGroup = async (site: string, newValue: object) => {
    const response = await api.post('/itemgroup-service/retrieveAll', { site, ...newValue });
    return response.data;
  };
  
  export const fetchTop50ItemGroup = async ( site: string ) => {
    const response = await api.post('/itemgroup-service/retrieveTop50', { site });
    return response.data;
  };

  export const fetchAllRouting = async (site: string, newValue: object) => {
    const response = await api.post('/routing-service/retrieveAll', { site, ...newValue });
    return response.data;
  };
  
  export const fetchTop50Routing = async ( site: string ) => {
    const response = await api.post('/routing-service/retrieveTop50', { site });
    return response.data;
  };

  export const fetchAllShopOrder = async (site: string, newValue: object) => {
    const response = await api.post('/shoporder-service/retrieveAll', { site, ...newValue });
    return response.data;
  };
  
  export const fetchTop50ShopOrder = async ( site: string ) => {
    const response = await api.post('/shoporder-service/retrieveTop50', { site });
    return response.data;
  };

  export const fetchAllBom = async (site: string, newValue: object) => {
    const response = await api.post('/bom-service/retrieveAll', { site, ...newValue });
    return response.data;
  };
  
  export const fetchTop50Bom = async ( site: string ) => {
    const response = await api.post('/bom-service/retrieveTop50', { site });
    return response.data;
  };

  export const fetchAllResourceType = async (site: string, newValue: object) => {
    const response = await api.post('/resourcetype-service/retrieveResourceTypeList', { site, ...newValue });
    return response.data;
  };
  
  export const fetchTop50ResourceType = async ( site: string ) => {
    const response = await api.post('/resourcetype-service/retrieveTop50', { site });
    return response.data;
  };