import api from './api';

export const retrieveTop50DataField = async (site: string) => {
  const response = await api.post('/datafield-service/retrieveTop50', { site });
  return response.data.dataFieldList;
};

export const retrieveAllDataField = async (site: string, dataField: string) => {
  const response = await api.post('/datafield-service/retrieveAll', { site, dataField });
  return response.data.dataFieldList;
};

export const retrieveTop50DataType = async (site: string) => {
  const response = await api.post('/datatype-service/retrieveTop50', { site });
  return response.data.dataTypeList;
};

export const retrieveAllDataType = async (site: string, dataType: string, category: string) => {
  const response = await api.post('/datatype-service/retrieveAll', { site, dataType, category });
  return response.data.dataTypeList;
};

export const retrieveDataField = async (site: string, dataField: string) => {
  const response = await api.post('/datafield-service/retrieve', { site, dataField });
  return response.data;
};

export const retrieveDataType = async (site: string, dataType: string,  category: string) => {
  const response = await api.post('/datatype-service/retrieve', { site, dataType, category});
  return response.data;
};

export const createDataType = async (request: object) => {
  const response = await api.post('/datatype-service/create', request);
  return response.data;
}

export const updateDataType = async (request: object) => {
  const response = await api.post('/datatype-service/update', request);
  return response.data;
};

export const deleteDataType = async (site: string, dataType: string, category: string, userId: string) => {
  const response = await api.post('/datatype-service/delete', {site, dataType, category, userId});
  return response.data;
};

export const retrieveTop50Activity = async (site: string) => {
  const response = await api.post('/activity-service/retrieveTop50', { site });
  return response.data.activityList;
};

export const retrieveAllActivity = async (site: string, activityId: string) => {
  console.log("retrieve all response: ", activityId)
  const response = await api.post('/activity-service/retrieveByActivityId', { site, activityId });
  return response.data.activityList;
};





