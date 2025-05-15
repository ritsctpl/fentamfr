import api from './api';

export const fetchToolNumberTop50 = async (site: string) => {
  const response = await api.post('/toolnumber-service/retrieveTop50', { site });
  return response.data.toolNumberList;
};

export const retrieveAllToolNumber = async (site: string) => {
  const response = await api.post('/toolnumber-service/retrieveAll', { site });
  return response.data.toolNumberList;
};

export const RetriveToolNumberRow = async (site: string, toolNumber: string) => {
    const response = await api.post('/toolnumber-service/retrieve', { site, toolNumber });
    console.log(response,'response');
    return response.data;
  };
  
  export const CreateToolNumber = async (site: string, userId: string, payload: object) => {
    const response = await api.post('/toolnumber-service/create', { site, userId, ...payload });
    return response.data;
  };
  
  export const UpdateToolNumber = async (site: string, userId: string, payload: object) => {
    const response = await api.post('/toolnumber-service/update', { site, userId, ...payload });
    return response.data;
  };

export const DeleteToolNumber = async (site: string, userId: string, payload: object) => {
    const response = await api.post('/toolnumber-service/delete', { site, userId, ...payload });
    return response.data;
  };
 
  











  
  export const fetchToolGroupTop50 = async (site: string) => {
      const response = await api.post('/toolgroup-service/retrieveTop50', { site });
      return response.data;
    };
  
  export const fetchToolGroupAll = async (site: string, payload: object) => {
      const response = await api.post('/toolgroup-service/retrieveAll', { site, ...payload });
      return response.data;
    };