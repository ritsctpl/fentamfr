import api from './api';

export const fetchResourceTop50 = async (site: string) => {
  const response = await api.post('/resource-service/retrieveTop50', { site });
  return response.data;
};

export const fetchResourceAll = async (site: string) => {
  const response = await api.post('/resource-service/retrieveBySite', { site });
  return response.data;
};

export const RetriveResourceSelectedRow = async (site: string, row) => {
    const response = await api.post('/resource-service/retrieveByResource', { site, ...row });
    console.log('call03');
    return response.data;
  };  

  export const RetriveResourceUpdateList = async (site: string, resource: string) => {
    const response = await api.post('/resource-service/availableResourceType', { site, resource});
    return response.data.availableResourceType;
  };  

// export const retrieveResource = async (site: string, resource: string, description: string) => {
//   const response = await api.post('/resource-service/retrieve', { site, resource, description });
//   return response.data;
// };

export const retrieveResource = async (site: string, resource: object) => {
  const response = await api.post('/resource-service/retrieve', { site, resource });
  return response.data;
};

export const retrieveResourceTypes = async (site: string) => {
  const response = await api.post('/resource-service/availableResourceType', { site });
  return response.data.availableResourceType;
  ;
};

export const createResource = async (site: string, userId: string, payload: Object) => {
  const response = await api.post('resource-service/create', { site, userId, ...payload, });
  return response.data;
};

export const deleteResource = async (site: string, userId:string, payload: Object) => {
  const response = await api.post('resource-service/delete', { site, userId, ...payload });
  return response.data;
};

export const updateResource = async (site: string, userId:string, payload: Object) => {
  const response = await api.post('resource-service/update', { site, userId, ...payload });
  return response.data;
};









export const fetchAllActivity = async (site: string) => {
  const response = await api.post('/activity-service/retrieveHookActivity', { site });
  return response.data;
};

export const retrieveAllCertification = async (site: string, payload) => {
  console.log('calleds');
  const response = await api.post('/certificate-service/retrieveAll', { site, ...payload });
  console.log(response,'calleds');
  return response.data.certificationList;
};

export const fetchTop50Certification = async (site: string) => {
  console.log('called');
  const response = await api.post('/certificate-service/retrieveTop50', { site });
  return response.data.certificationList;
};
