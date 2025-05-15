import api from "./api";

export const fetchPodMaintenanceTop50 = async (site: string) => {
    const response = await api.post('pod-service/retrieveTop50', { site });
    return response.data.podList;
  };
  
  export const retrieveAllPodMaintenance = async (site: string) => {
      const response = await api.post('/pod-service/retrieveAll', { site });
      return response.data.podList;
  };

  export const CreatePodMaintenance = async (site: string, userId: string, payload: object) => {
    const response = await api.post('pod-service/create', { site ,userId, ...payload});
    return response.data;
  };

  export const UpdatePodMaintenance = async (site: string, userId: string, payload: object) => {
    const response = await api.post('pod-service/update', { site ,userId, ...payload});
    return response.data;
  };

  export const RetrivePodSelectedRow = async (site: string, payload: object) => {
    const response = await api.post('pod-service/retrieve', { site, ...payload});
    return response.data;
  };

  export const createCopyPodMaintenance = async (site: string, userId: string, payload: object) => {
    const response = await api.post('pod-service/create', { site ,userId, ...payload});
    return response.data;
  };

  export const deletePodMaintenance = async (site: string, userId: string, payload: object) => {
    const response = await api.post('pod-service/delete', { site ,userId, ...payload});
    return response.data;
  };









  export const fetchAllDefaultWorkCenter = async (site: string, workCenter: string) => {
    const response = await api.post('/workcenter-service/retrieveAll', { site, workCenter });
    return response.data;
  };
  
  export const fetchTop50DefaultWorkCenter = async ( site: string ) => {
    const response = await api.post('/workcenter-service/retrieveTop50', { site });
    return response.data;
  };

  export const fetchAllDefaultOperation = async (site: string, newValue: object) => {
    const response = await api.post('/operation-service/retrieveByOperation', { site, ...newValue });
    return response.data;
  };
  
  export const fetchTop50DefaultOperation = async ( site: string ) => {
    const response = await api.post('/operation-service/retrieveTop50', { site });
    return response.data;
  };

  export const fetchAllDefaultResource = async (site: string, newValue: object) => {
    const response = await api.post('/resource-service/retrieveResourceList', { site, ...newValue });
    return response.data;
  };
  
  export const fetchTop50DefaultResource = async ( site: string ) => {
    const response = await api.post('/resource-service/retrieveTop50', { site });
    return response.data;
  };

  export const fetchAllDocument = async (site: string, newValue: object) => {
    const response = await api.post('/document-service/retrieveAll', { site, ...newValue });
    return response.data;
  };
  
  export const fetchTop50Document = async ( site: string ) => {
    const response = await api.post('/document-service/retrieveTop50', { site });
    return response.data;
  };

  export const fetchAllList = async (site: string, newValue: object) => {
    const response = await api.post('/listmaintenance-service/getAllListByCategory', { site, ...newValue });
    return response.data;
  };

  export const fetchTop50Activities = async (site: string) => {
    const response = await api.post('/activity-service/retrieveTop50', { site });
    return response.data;
  };

  export const fetchAllActivities = async (site: string, newValue: object) => {
    const response = await api.post('/activity-service/retrieveByActivityId', { site, ...newValue });
    return response.data;
  };

  export const fetchTop50UIActivities = async () => {
    const type = 'UI'
    const response = await api.post('/activity-service/retrieveServiceActivity', { type });
    return response.data;
  };

  export const fetchAllUIActivities = async (newValue: string) => {
    const activity = newValue;
    const type = 'UI';
    const response = await api.post('/activity-service/retrieveServiceActivity', { activity, type });
    return response.data;
  };

  export const fetchTop50ServicesActivities = async () => {
    const type = 'Service'
    const response = await api.post('/activity-service/retrieveServiceActivity', { type });
    return response.data;
  };

  export const fetchAllServicesActivities = async (newValue: string) => {
    const activity = newValue;
    const type = 'Service';
    const response = await api.post('/activity-service/retrieveServiceActivity', { activity, type });
    return response.data;
  };
  