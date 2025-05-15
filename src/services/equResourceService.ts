import { message } from 'antd';
import api from './api';

export const updateResourceStatus = async (payload) => {

  
  try {
      const response = await api.post(`/resource-service/changeResourceStatus`,  payload);
      console.log(response.data ,"change")
      return response.data;
  } catch (error) {
      console.error('API Error:', error);
      throw error;
  }
};
export const updateResourceStatu = async (payload) => {

  
  try {
      const response = await api.post(`/oee-calculation-service/downtime-service/logdowntime`,  payload);
      console.log(response.data ,"change")
      return response.data;
  } catch (error) {
      console.error('API Error:', error);
      throw error;
  }
};
export const updateResourceStatuOee = async (payload) => {

  
  try {
      const response = await api.post(`/oee-calculation-service/downtime/logmachinelog`,  payload);
      console.log(response.data ,"change")
      return response.data;
  } catch (error) {
      console.error('API Error:', error);
      throw error;
  }
};
export const getShiftData = async (site: string) => {
  try {
    const response = await api.post(`/shift-service/getShiftDetailsByShiftType`, { site });
    return response.data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};


export const fetchResourceType = async (site: string, userId: string, url: string,newUrl:string) => {

  let selectedRowDataCurrents = null;

  
  try {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      const storedData = sessionStorage.getItem('selectedRowCurrentData');
      if (storedData) {
        selectedRowDataCurrents = JSON.parse(storedData);
      }
    }
  } catch (error) {
    console.error('Error parsing selectedRowCurrentData from session storage:', error);
  }
  console.log(selectedRowDataCurrents,"selectedRowDataCurrents");
  
  const servicesToRetrieveTop50 = ['resourcetype-service','toolnumber-service', 'item-service', 'routing-service', 'bom-service','reasoncode-service', 'shoporder-service', 'datacollection-service', 'start-service'];
const pathUrl = url === 'activity-service' 
  ? 'retrieveHookActivity' 
  : url === 'batchnoheader-service' 
    ? 'retrieveBatchNoList'
  : url === 'site-service' 
    ? 'retrieveTimeZoneList'
  : url === 'recipe-service' && newUrl === 'getPhasesBySite'
    ? 'getPhasesBySite'
    : url === 'recipe-service' && newUrl === 'getOperationByFilter'
    ? 'getOperationByFilter'
  : url === 'recipe-service'
    ? 'retrieveAll'
  : url === 'pcuheader-service'
    ? 'retrieve'
    : url === 'batchnoinqueue-service'
    ? 'getInQueueForBatchRecipeByFilters'
  : url === 'processorder-service'
    ? 'retrieveAll'
  : url === 'recipebatchprocess-service'
    ? 'getBatchRecipePhases'
  : url === 'usergroup-service'
    ? 'retrieveTop50'
  : url === 'itemgroup-service'
    ? 'retrieveTop50'
  : url === 'start-service'
    ? 'retrieveAll'
  : url === 'resource-service'
    ? 'retrieveTop50'
  : servicesToRetrieveTop50.includes(url)
    ? 'retrieveTop50'
    : 'retrieveBySite';

      const params =
      {};
  try {
      let response = await api.post(`/${url}/${pathUrl}`, { site ,...params});
      console.log(response,"check");
      if(url === 'recipebatchprocess-service'){
        const {phases} = response.data;
        if (!phases) return null;
        
        const formattedPhases = phases.map(phase => ({
          phaseId: phase.phaseId,
          sequence: phase.sequence,
          phaseDescription: phase.phaseDescription,
        }));
        
        console.log({formattedPhases},"responsedd")
        return {formattedPhases};
      }
      
      else{
        return response.data;
      }
  } catch (error) {
      console.error('API Error:', error);
      throw error;
  }
};

export const fetchResource = async (site: string, userId: string, url: string,newUrl:string) => {
  // const servicesToRetrieveTop50 = ['resourcetype-service', 'item-service', 'routing-service', 'bom-service'];
  // const pathUrl = url === 'activity-service' 
  //   ? 'retrieveHookActivity' 
  //   : servicesToRetrieveTop50.includes(url) 
  //     ? 'retrieveTop50' 
  //     : 'retrieveBySite';
  let selectedRowDataCurrents = null;
  try {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      const storedData = sessionStorage.getItem('selectedRowCurrentData');
      if (storedData) {
        selectedRowDataCurrents = JSON.parse(storedData);
      }
    }
  } catch (error) {
    console.error('Error parsing selectedRowCurrentData from session storage:', error);
  }
  console.log(selectedRowDataCurrents,"selectedRowDataCurrents");
  
  const servicesToRetrieveTop50 = ['resourcetype-service','toolnumber-service', 'item-service', 'routing-service', 'bom-service','reasoncode-service', 'shoporder-service', 'datacollection-service', 'start-service'];
const pathUrl = url === 'activity-service' 
  ? 'retrieveHookActivity' 
  : url === 'batchnoheader-service' 
    ? 'retrieveBatchNoList'
  : url === 'site-service' 
    ? 'retrieveTimeZoneList'
  : url ==='resourcetype-service'
   ? 'getAllResourcesByResourceType'
  : url === 'recipe-service' && newUrl === 'getPhasesBySite'
    ? 'getPhasesBySite'
    : url === 'recipe-service' && newUrl === 'getOperationByFilter'
    ? 'getOperationByFilter'
  : url === 'recipe-service'
    ? 'retrieveAll'
  : url === 'pcuheader-service'
    ? 'retrieve'
    : url === 'batchnoinqueue-service'
    ? 'getInQueueForBatchRecipeByFilters'
  : url === 'processorder-service'
    ? 'retrieveAll'
  : url === 'recipebatchprocess-service'
    ? 'getBatchRecipePhases'
  : url === 'usergroup-service'
    ? 'retrieveTop50'
  : url === 'itemgroup-service'
    ? 'retrieveTop50'
  : url === 'start-service'
    ? 'retrieveAll'
  : url === 'resource-service'
    ? 'retrieveTop50'
  : servicesToRetrieveTop50.includes(url)
    ? 'retrieveTop50'
    : 'retrieveBySite';

      const params = url === 'recipebatchprocess-service' ? {
        batchNo: selectedRowDataCurrents?.[0]?.pcu || '',
        orderNo: selectedRowDataCurrents?.[0]?.shopOrder || '',
        material: (selectedRowDataCurrents?.[0]?.item || '').split('/')[0] || '',
        materialVersion: '00',
        phaseId: sessionStorage.getItem('PhaseIdd') || '',
      } : url === 'recipe-service' ? {
        phaseId: sessionStorage.getItem('PhaseIdd') || '',
      } :
      url ==='resourcetype-service'? {
        site: site || '',
        resourceType: sessionStorage.getItem('resourceType') || '',
      } :
      {};
  try {
      let response = await api.post(`/${url}/${pathUrl}`, { site ,...params});
      console.log(response,"check");
      if(url === 'recipebatchprocess-service'){
        const {phases} = response.data;
        if (!phases) return null;
        
        const formattedPhases = phases.map(phase => ({
          phaseId: phase.phaseId,
          sequence: phase.sequence,
          phaseDescription: phase.phaseDescription,
        }));
        
        console.log({formattedPhases},"responsedd")
        return {formattedPhases};
      }
      else if(url === 'recipe-service' && newUrl === 'getOperationByFilter'){
        const {operationList} = response.data;
        const formattedRecipe = operationList.map(operation => ({
          operationId: operation,
        }));
        
      console.log({formattedRecipe},"formattedRecipe")
      return {formattedRecipe};
      }
      else if(url === 'resourcetype-service'){
        const {availableResources} = response.data;
        const formattedRecipe = 
        availableResources.map(resourceType => ({
          resource: resourceType.resource,
          description: resourceType.description,
          status : resourceType.status,
        }));
        
      console.log({formattedRecipe},"formattedRecipe")
      return formattedRecipe;
      }
      
      else if(url === 'recipe-service' && newUrl === 'retrieveAll'){
        const {responseList} = response.data;
        const formattedRecipe = responseList.map(recipe => ({
          recipeId: recipe.recipeId,
          version: recipe.version,
          batchSize: recipe.batchSize,
        }));
        
      console.log({formattedRecipe},"formattedRecipe")
      return {formattedRecipe};
      }
      
      else if(url === 'recipe-service'){
        const {phaseList} = response.data;
        const formattedRecipe = phaseList.map(phase => ({
          phaseId: phase,
        }));
        
      console.log({formattedRecipe},"formattedRecipe")
      return {formattedRecipe};
      }
      else{
        return response.data;
      }
  } catch (error) {
      console.error('API Error:', error);
      throw error;
  }
};

export const fetchResourceSearch = async (site: string, userId: string, url: string) => {
  const servicesToRetrieveTop50 = ['resourcetype-service', 'item-service', 'routing-service', 'bom-service', 'start-service'];
  const pathUrl = url === 'activity-service' 
  ? 'retrieveHookActivity' 
  : url === 'start-service'
    ? 'retrieveAll'
  : servicesToRetrieveTop50.includes(url) 
    ? 'retrieveTop50' 
    : 'retrieveBySite';
  


  try {
      const response = await api.post(`/${url}/retrieveAll`, { site });
      console.log(response,"response")
      return response.data;
  } catch (error) {
      console.error('API Error:', error);
      throw error;
  }
};
export const fetchResourceAll = async (site: string, userId: string, url: string) => {
  
  try {
      const response = await api.post(`/${url}/retrieveAll`, { site });
      console.log(response,"response")
      return response.data;
  } catch (error) {
      console.error('API Error:', error);
      throw error;
  }
};


export const retrieveBatchNoList = async (request: any) => {
  const response = await api.post('/batchnoheader-service/retrieveAll', { ...request });
  return response?.data?.responseList;
};
//  retrieveAll
export const retrieveOrderNumberList = async (request: any) => {
  const response = await api.post('/processorder-service/getAllProessOrders', { ...request });
  return response?.data?.processOrderResponseList;
};

export const retrieveItemTop50List = async (request: any) => {
  const response = await api.post('/item-service/retrieveTop50', { ...request });
  return response?.data?.itemList;
};

export const retrieveItemList = async (request: any) => {
  const response = await api.post('/item-service/retrieveAll', { ...request });
  return response?.data?.itemList;
};


export const retrieveShopOrderTop50List = async (request: any) => {
  const response = await api.post('/shoporder-service/retrieveTop50', { ...request });
  return response?.data?.shopOrderResponseList;
};

export const retrieveShopOrderAllList = async (request: any) => {
  const response = await api.post('/shoporder-service/retrieveAll', { ...request });
  return response?.data?.shopOrderResponseList;
};

export const retrievePcuList = async (request: any) => {
  const response = await api.post('/pcuheader-service/retrievePcuList', { ...request });
  return response?.data?.pcuHeaderResponseList;
};

export const retrieveLogs = async (site: string, productionLog) => {
  const response = await api.post('/productionlog-service/retrieveByType', { site, ...productionLog });
  return response.data;
};

export const retrievePhaseList = async (site: string) => {
  const response = await api.post('/recipe-service/getPhasesBySite', { site });
  return response.data?.phaseList;
};

export const retrieveOperationList = async (site: string, phaseId: string) => {
  const response = await api.post('/recipe-service/getOperationByFilter', { site, phaseId });
  return response.data?.operationList;
};

export const fetchTop50Sites = async () => {
  const response = await api.post('/site-service/retrieveTop50', );
  return response?.data?.retrieveTop50List;
};

export const fetchTop50Users = async (site: any) => {
  const response = await api.post('/user-service/retrieveTop50', { });
  return response.data?.userList;
};

export const fetchAllUsers = async (payload: any) => {
  const response = await api.post('/user-service/retrieveAllByUser', { ...payload });
  return response?.data?.userList;
};

export const fetchTop50OrderNos = async (request: any) => {
  const response = await api.post('/processorder-service/retrieveTop50OrderNos', { ...request });
  return response?.data?.processOrderResponseList;
};

export const getWCBySrc = async (request: any) => {
  const response = await api.post('/workcenter-service/getWorkCenterByResource', { ...request });
  return response?.data;
};

