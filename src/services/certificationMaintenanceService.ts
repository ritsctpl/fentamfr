import api from "./api";

export const fetchCertificationMaintenanceTop50 = async (site: string) => {
  const response = await api.post("/certificate-service/retrieveTop50", {
    site,
  });
  return response.data;
};
export const fetchCertificationMaintenanceAll = async (site: string) => {
  const response = await api.post("/certificate-service/retrieveAll", { site });
  return response.data;
};
export const RetriveCertificationMaintenanceSelectedRow = async (
  site: string,
  row: any
) => {
  const response = await api.post("/certificate-service/retrieve", {
    site,
    ...row,
  });
  return response.data;
};
export const fetchAvailableUserGroup= async (site: string) => {
  const response = await api.post('/certificate-service/getAvailableUserGroup', {site});
  return response.data;
};

export const fetchUserGroup= async (site: string, resourceType: string) => {  
  const response = await api.post('/certificate-service/getAvailableUserGroup',{site, resourceType});
  return response.data.resourceList;
};
export const createCertificationMaintenance = async (site: string, userId: string, payload: Object) => {
  const response = await api.post('certificate-service/create', { site, userId, ...payload, });
  return response.data;
};
export const updateCertificationMaintenance = async (site: string, userId:string, payload: Object) => {
  const response = await api.post('certificate-service/update', { site, userId, ...payload });
  return response.data;
};
export const deleteCertificationMaintenance = async (site: string, userId:string, payload: Object) => {
  const response = await api.post('certificate-service/delete', { site, userId, ...payload });
  return response.data;
};