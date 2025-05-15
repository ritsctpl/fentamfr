import api from "./api";

export const fetchLineClearanceTop50 = async (site: string) => {
  const response = await api.post("/lineclearance-service/retrieveTop50", {
    site,
  });
  return response.data;
};
export const fetchLineClearanceAll = async (site: string) => {
    const response = await api.post("/lineclearance-service/retrieveAll", { site });
    return response.data;
  };
  export const RetriveLineClearanceSelectedRow = async (
    site: string,
    row: any
  ) => {
    const response = await api.post("/lineclearance-service/retrieve", {
      site,
      ...row,
    });
    return response.data;
  };
  export const createLineClearance = async (site: string, userId: string, payload: Object) => {
    const response = await api.post('lineclearance-service/create', { site, userId, ...payload, });
    return response.data;
  };
  export const updateLineClearance = async (site: string, userId:string, payload: Object) => {
    const response = await api.post('lineclearance-service/update', { site, userId, ...payload });
    return response.data;
  };

  export const deleteLineClearance = async (site: string, userId:string, payload: Object) => {
    const response = await api.post('lineclearance-service/delete', { site, userId, ...payload });
    return response.data;
  };

  //Line Clearance Plugin
  export const retriveLineClearancePlugin = async (payload: Object) => {
    const response = await api.post('lineclearancelog-service/retrieve', {...payload });
    console.log(response.data, "lineclearancelog");
    return response.data;
  };
  export const startLineClearancePlugin = async (payload: Object) => {
    const response = await api.post('lineclearancelog-service/start', payload);
    return response.data;
  };
  export const completeLineClearancePlugin = async (payload: Object) => {
    const response = await api.post('lineclearancelog-service/complete', payload);
    return response.data;
  };
  
  
  
  export const retrieveLineClearanceData = async (payload: Object) => {
    const response = await api.post('lineclearance-service/retrieve', {...payload });
    return response.data;
  };
  
  export const storeFile = async (payload: Object) => {
    const response = await api.post('lineclearancelog-service/storeFile', {...payload });
    return response.data;
  };


  export const retrieveAllReasonCodeBySite = async (site: string) => {
    const response = await api.post('/reasoncode-service/retrieveAll', { site });
    return response?.data?.reasonCodeResponseList;
  };
  