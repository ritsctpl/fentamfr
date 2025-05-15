import { parseCookies } from 'nookies';
import api from './api';


export const siteServices= async (user: string) => {
  console.log(user,'user');
  
  const response = await api.post('/user-service/getSiteListByUser', { user });
  console.log(response.data,'userResponse')
  return response.data;
};

export const initializeSite= async () => {
  const response = await api.post('/master-data/initialize');
  console.log(response,'initializeSiteresponse');
  return response.data;
};

export const fetchInventoryTop50= async (site: string) => {
  const response = await api.post('/inventory-service/retrieveTop50',{site:"RITS"});
  console.log(response.data,'userResponse')
  return response.data.inventoryList;
};

export const fetchInventoryData = async (inventoryId: string) => {
  const cookies = parseCookies();
  const site = cookies.site;
  const response = await api.post('/inventory-service/retrieve', {inventoryId,site});
  console.log(response.data,'userResponse')
  return response.data;
};