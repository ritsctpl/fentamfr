import { message } from 'antd';
import api from './api';

export const updateResourceStatus = async (payload) => {


  try {
    const response = await api.post(`/resource-service/changeResourceStatus`, payload);
    console.log(response.data, "change")
    return response.data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};
export const fetchResource = async (site: string, userId: string, url: string) => {
  // const servicesToRetrieveTop50 = ['resourcetype-service', 'item-service', 'routing-service', 'bom-service'];
  // const pathUrl = url === 'activity-service' 
  //   ? 'retrieveHookActivity' 
  //   : servicesToRetrieveTop50.includes(url) 
  //     ? 'retrieveTop50' 
  //     : 'retrieveBySite';
  const servicesToRetrieveTop50 = ['resourcetype-service', 'item-service', 'routing-service', 'bom-service', 'reasoncode-service'];
  const pathUrl = url === 'activity-service'
    ? 'retrieveHookActivity'
    : url === 'site-service'
      ? 'retrieveTimeZoneList'
      : servicesToRetrieveTop50.includes(url)
        ? 'retrieveTop50'
        : 'retrieveBySite';


  try {
    const response = await api.post(`/${url}/${pathUrl}`, { site });
    console.log(response, "response")
    return response.data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

export const fetchResourceSearch = async (site: string, userId: string, url: string) => {
  const servicesToRetrieveTop50 = ['resourcetype-service', 'item-service', 'routing-service', 'bom-service'];
  const pathUrl = url === 'activity-service'
    ? 'retrieveHookActivity'
    : servicesToRetrieveTop50.includes(url)
      ? 'retrieveTop50'
      : 'retrieveBySite';



  try {
    const response = await api.post(`/${url}/retrieveAll`, { site });
    console.log(response, "response")
    return response.data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};
export const fetchResourceAll = async (site: string, userId: string, url: string) => {

  try {
    const response = await api.post(`/${url}/retrieveAll`, { site });
    console.log(response, "response")
    return response.data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

export const retrievePCUHeader = async (site: string) => {
  try {
    const response = await api.post('pcuheader-service/retrieve', { site });
    console.log("Retrieve pcu header response: ", response);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const fetchShopOrderTop50 = async (site: string) => {
  const response = await api.post('/shoporder-service/retrieveTop50/', { site });
  return response.data.shopOrderResponseList;
};

export const fetchAllShopOrderData = async (site: string, shopOrder: string) => {
  const response = await api.post('/shoporder-service/retrieveAll/', { site, shopOrder });
  return response.data.shopOrderResponseList;
};

export const retrievePCUtoScrap = async (request: any) => {
  const response = await api.post('/scrap-service/retrieve/', { ...request });
  return response.data;
};

export const retrievePCUtoUnscrap = async (request: any) => {

  const response = await api.post('/scrap-service/retrieveForUnscrap/', request);
  return response.data;
};

export const scrap = async (request: any) => {
  // console.log("Scrap request from service file: ", request);
  const response = await api.post('/scrap-service/scrap/', request );
  return response.data;
};

export const unScrap = async (request: any) => {
  const response = await api.post('/scrap-service/unScrap/', request );
  return response.data;
};

export const fetchPcuToUnScrap = async (site: string) => {
  console.log("reqq: ", { site });
  const response = await api.post('/scrap-service/retrieveAll/', { site });
  return response.data;
};

export const scrapBatchNumber = async (request: any) => {
 
  const response = await api.post('/batchnoscrap-service/scrap', {...request});
  return response.data;
};

export const unScrapBatchNumber = async (request: any) => {
  
  const response = await api.post('/batchnoscrap-service/unScrap', {...request});
  return response.data;
};


export const retrieveBatchNumberHeader = async (request: any) => {
  const response = await api.post('/batchnoheader-service/retrieve', { ...request });
  return response.data;
};