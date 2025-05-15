import api from './api';

// scheduler service

export const addScheduler= async ( site: string, params: Object) => {
  console.log(params +'Responseapi')

 
  const response = await api.post('/schedule-service/createSchedule/', {site,...params});
  console.log(response +'Responseapi')
  return response.data;
};

export const fetchSchedulerAll = async (site: string) => {
  try {
    const response = await api.post('/schedule-service/getAllSchedules/');
    console.log(response + ' Responseaa');
    return response.data;
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

export const fetchSchedularDelete= async (site: string,id) => {
  const response = await api.post('/schedule-service/deleteSchedule',{id} );
  console.log(response,'schedulerResponse')
  return response.data;
};

export const updateScheduler= async (site: string,params) => {
  console.log({site,...params},"updateScheduler1");
  
  const response = await api.post('/schedule-service/updateSchedule',{site:site,...params});
  console.log(response.data,'schedulerResponse')
  return response.data;
};

export const getScheduleStatus= async (site: string,id) => {
  console.log({site,id});
  
  const response = await api.post('/schedule-service/getScheduleStatus',{site,id});
  console.log(response.data,'schedulerResponse')
  return response.data;
};

export const fetchSchedulerOutput= async (id) => {
  const response = await api.post('/schedule-service/getScheduleOutput',{id});
  console.log(response.data,'schedulerResponse')
  return response.data;
};

