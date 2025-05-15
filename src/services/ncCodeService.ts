
import api from './api';

export const fetchNcCodeTop50 = async (site: string) => {
  const response = await api.post('/nccode-service/retrieveTop50', { site });
  return response.data.ncCodeList;
};

export const retrieveAllNcCode = async (site: string) => {
  const response = await api.post('/nccode-service/retrieveAll', { site });
  return response.data.ncCodeList;
};

export const RetriveNcCodeRow = async (site: string, payload: object) => {
    const response = await api.post('/nccode-service/retrieve', { site, ...payload });
    console.log("RetriveNcCodeRow", response);
    return response.data;
  };

  export const retrieveAvailableSecondary = async (site: string) => {
    const response = await api.post('/nccode-service/retrieveAvailableSecondaries', {site});
    return response.data.availableSecondariesList;
  };

  export const retrieveAvailableSecondaries = async (site: string,  ncCode: string) => {
    const response = await api.post('/nccode-service/retrieveAvailableSecondaries', {site, ncCode});
    return response.data.availableSecondariesList;
  };

  export const retrieveAvailableNcGroup = async (site: string) => {
    const response = await api.post('/nccode-service/retrieveAvailableNCGroups', {site});
    return response.data.availableNCGroupsList;
  };

  export const retrieveAvailableNcGroups = async (site: string,  ncCode: string) => {
    const response = await api.post('/nccode-service/retrieveAvailableNCGroups', {site, ncCode});
    return response.data.availableNCGroupsList;
  };

  export const retrieveAvailableRouting = async (site: string) => {
    const response = await api.post('/nccode-service/retrieveAvailableRoutings', {site});
    return response.data.availableRoutingList;
  };

  export const retrieveAvailableRoutings = async (site: string,  ncCode: string) => {
    const response = await api.post('/nccode-service/retrieveAvailableRoutings', {site, ncCode});
    return response.data.availableRoutingList;
  };

  export const createNcCode = async (site: string, userId: string, payload: Object) => {
    const response = await api.post('nccode-service/create', { site, userId, ...payload, });
    return response.data;
  };

  export const deleteNcCode = async (site: string, userId: string, payload: Object, currentSite: string) => {
    const response = await api.post('nccode-service/delete', { site, userId, ...payload, currentSite });
    return response.data;
  };
  
  export const UpdateNcCode = async (site: string, userId: string, payload: Object) => {
    const response = await api.post('nccode-service/update', { site, userId, ...payload, });
    return response.data;
  };

  export const fetchTop50NCDataType = async ( site: string, category: string ) => {
    const response = await api.post('/datatype-service/retrieveTop50', { site, category });
    return response.data;
  };

