import api from './api';

// scheduler service

export const addScheduler= async ( site: string, params: Object) => {

 
  const response = await api.post('/scheduler-config/scheduler-conf/', {site,...params});
  console.log(response +'Responseapi')
  return response.data;
};

export const fetchSchedulerAll = async (site: string) => {
  try {
    const response = await api.post('/scheduler-config/retrieve/',{site});
    console.log(response.data + ' Responseaa');
    return response.data.responses;
  } catch (error) {
    console.error('Error fetching scheduler data:', error);
    throw error; // Rethrow the error for handling later
  }
};

export const fetchSchedularById= async (site: string,entityId) => {
  console.log(entityId,"entityId");
  
  const response = await api.post('/scheduler-config/retrieveById',{ 

    "site":site, 

    "entityId": entityId 

} );
  console.log(response,'schedulerResponse')
  return response.data.responses[0];
};

export const fetchSchedularDelete= async (site: string,entityId) => {
  const response = await api.post('/scheduler-config/delete',{site,entityId });
  console.log(response.data,'schedulerResponse')
  return response.data;
};

export const updateScheduler= async (site: string,params) => {
  console.log({site,...params});
  
  const response = await api.put('/scheduler-config/scheduler-conf-update',{site,...params});
  console.log(response.data,'schedulerResponse')
  return response.data;
};

export const fetchUserTop50= async () => {
  const response = await api.post('/user-service/retrieveTop50/', {  });
  return response.data.userList;
};