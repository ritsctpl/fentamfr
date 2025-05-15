import api from "./api";

export const fetchtop50LineClearance = async (site: string) => {
    const response = await api.post('/lineclearance-service/retrieveTop50', { site });
    return response.data;
  };

  export const fetchAllLineClearanceList = async (site: string, lineClearance:object) => {
    const response = await api.post('lineclearance-service/retrieveAll', { site, lineClearance });
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

  export const retrieveLineClearanceLogs = async ( templeteName: object) => {
    const response = await api.post('/lineclearancelog-service/retrieveLineClearanceLogList', {  ...templeteName });
    return response.data;
  };

  export const fetchTop50Users = async (site: any) => {
    const response = await api.post('/user-service/retrieveTop50', { });
    return response.data?.userList;
  };
  
  export const fetchAllUsers = async (payload: any) => {
    const response = await api.post('/user-service/retrieveAllByUser', { ...payload });
    return response?.data?.userList;
  };
  
  export const fetchLoggedBuyOffList = async (payload: any) => {
    const response = await api.post('/logbuyoff-service/retrieveLoggedBuyOffList', { ...payload });
    return response?.data;
  };

  export const fetchTop50Sites = async () => {
    const response = await api.post('/site-service/retrieveTop50', );
    return response?.data?.retrieveTop50List;
  };