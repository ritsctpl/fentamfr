import api from "./api";

export const addWorkListAssemble = async (site: string, userId: string, payload:object) => {
    const response = await api.post('/customdata-service/retrieveByCategory', { site, userId, ...payload });
    return response.data;
  };

  export const getComponentDetails = async (site: string, payload:object) => {
    const response = await api.post('assembly-service/getDataType', { site, ...payload });
    return response.data;
  };

  export const saveAssembleComponent = async (site: string, payload:object) => {
    const response = await api.post('assembly-service/addComponent', { site, ...payload });
    return response.data;
  };

  export const getInventeryData = async (site: string, payload:object) => {
    const response = await api.post('inventory-service/retrieveByItem', { site, ...payload });
    return response.data;
  };

  export const getPcuData = async (site: string, payload:object) => {
    const response = await api.post('inventory-service/retrieveByItem', { site, ...payload });
    return response.data;
  };

 export const getDCList = async ( payload:object) => {
    const response = await api.post('datacollection-service/retrieveByPcuAndOperationAndResource', {  ...payload });
    console.log("DC List response: ", response.data);
    return response.data;
  };

  export const retrieveOperationVersion = async ( site: string, operation: string) => {
    const response = await api.post('operation-service/retrieve', {  site, operation });
    // console.log("retrieveOperationVersion response: ", response.data);
    return response.data;
  };
  
  export const safeDraft = async ( payload: any) => {
    const response = await api.post('dccollect-service/saveDraft', payload);
    return response.data;
  }; 
   
  export const collectData = async ( payload: any) => {
    const response = await api.post('dccollect-service/save', payload );
    return response.data;
  }; 
  
  export const retrievePreSaved = async ( payload:object) => {
    const response = await api.post('dccollect-service/retrievePreSaved', {  ...payload });
    return response.data;
  };
  
  export const retrieveDataField = async (req: object) => {
    const response = await api.post('/datafield-service/retrieve', { ...req});
    return response.data;
  };
  
  export const retrieveCollectedDCParamList = async (req: object) => {
    const response = await api.post('/dccollect-service/retrieveByDcGroupAndVersion', { ...req});
    // console.log("Collected DC param list response: ", retrieveCollectedDCParamList);
    return response.data;
  };

