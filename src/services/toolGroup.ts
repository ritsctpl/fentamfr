import api from './api';

export const fetchToolGroupsTop50 = async (site: string) => {
  const response = await api.post('/toolgroup-service/retrieveTop50', { site });
  return response.data.toolGroupList;
};

export const retrieveAllToolGroups = async (site: string) => {
  const response = await api.post('/toolgroup-service/retrieveAll', { site });
  return response.data.toolGroupList;
};

export const RetriveToolGroupRow = async (site: string, payload: object) => {
    const response = await api.post('/toolgroup-service/retrieve', { site, ...payload })
    return response.data;
  };

  export const CreateToolGroup = async (site: string, userId: string, payload: object) => {
    const response = await api.post('/toolgroup-service/create', { site, userId, ...payload });
    return response.data;
  };

  export const UpdateToolGroup = async (site: string, payload: object) => {
    const response = await api.post('/toolgroup-service/update', { site, ...payload });
    return response.data;
  };    

  export const DeleteToolGroup = async (site: string, userId: string, payload: object) => {
    const response = await api.post('/toolgroup-service/delete', { site, userId, ...payload });
    return response.data;
  };    

  
