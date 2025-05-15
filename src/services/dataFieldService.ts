import api from './api';

export const fetchTop50ReasonCode = async (site: string) => {
  const response = await api.post('/reasoncode-service/retrieveTop50', { site });
  // console.log(response,'Reason Code Top 50 Response');
  
  return response.data.reasonCodeResponseList;
};

export const fetchAllReasonCode = async (site: string, reasonCode: string) => {
  const response = await api.post('/reasoncode-service/retrieveAll', { site, reasonCode });
  // console.log(response,'Reason Code Top 50 Response');
  
  return response.data.reasonCodeResponseList;
};

export const fetchAllResource = async (site: string, resource: string) => {
  const response = await api.post('/resource-service/retrieveResourceList', { site, resource });
  
  return response.data;
};

export const fetchTop50Resource = async (site: string) => {
  const response = await api.post('/resource-service/retrieveTop50', { site });
  
  return response.data;
};

export const fetchAllWorkCenter = async (site: string, workCenter: string) => {
  const response = await api.post('/workcenter-service/retrieveAll', { site, workCenter });
  
  return response.data.workCenterList;
};

export const fetchTop50WorkCenter = async (site: string) => {
  const response = await api.post('/workcenter-service/retrieveTop50', { site });
  
  return response.data.workCenterList;
};


export const retrieveReasonCode = async (site: string, reasonCode: string ) => {
  const response = await api.post('/reasoncode-service/retrieve', { site, reasonCode });
  // console.log(response,'Reason Code Retrieve Response');
  
  return response.data;
};



type ReasonCodeData = {
  handle: string;
  site: string;
  reasonCode: string;
  messageType: string;
  description: string;
  status: string;
  
  customDataList: { customData: string; value: any }[];
  inUse: boolean;
  active: number;
  createdBy: any;
  modifiedBy: any;
  createdDateTime: string;
  modifiedDateTime: any;
  userId: string;
};

export const createReasonCode = async (reasonCodeData: ReasonCodeData) => {
  try {
    const response = await api.post('/reasoncode-service/create', reasonCodeData);
    console.log('Create Reason Code Response:', response);

    return response.data;
  } catch (error) {
    console.error('Error creating reason code:', error);
    throw error;
  }
};

export const updateReasonCode = async (reasonCodeData: ReasonCodeData) => {
  try {
    const response = await api.post('/reasoncode-service/update', reasonCodeData);
    // console.log('Update Reason Code Response:', response);

    return response.data;
  } catch (error) {
    console.error('Error creating item:', error);
    throw error;
  }
};

export const retrieveCustomDataList = async (site: string, category: string, userId: string) => {
  const response = await api.post('/customdata-service/retrieveByCategory', { site, category, userId });
  // console.log(response,'Custom Data List Response');
  
  return response.data;
};

export const deleteReasonCode = async (site: string, reasonCode: string,  userId: string) => {
  const response = await api.post('/reasoncode-service/delete', { site, reasonCode, userId });
  // console.log(response,'reason code Delete Response');
  
  return response.data;
};

export const retrieveAllReasonCode = async (site: string, reasonCode: string) => {
  const response = await api.post('/reasoncode-service/retrieveAll', { site, reasonCode });
  // console.log(response,'reason code Delete Response');
  
  return response.data;
};

export const retrieveAllReasonCodeBySite = async (site: string) => {
  const response = await api.post('/reasoncode-service/retrieveAll', { site });
  // console.log(response,'reason code Delete Response');
  
  return response.data.reasonCodeResponseList;
};

export const retrieveTop50DataField = async (site: string) => {
  const response = await api.post('/datafield-service/retrieveTop50', { site });
  return response.data.dataFieldList;
};

export const retrieveAllDataField = async (site: string, dataField: string) => {
  const response = await api.post('/datafield-service/retrieveAll', { site, dataField });
  return response.data.dataFieldList;
};

export const retrieveDataField = async (site: string, dataField: string) => {
  const response = await api.post('/datafield-service/retrieve', { site, dataField });
  return response.data;
};

export const createDataField = async (request: object) => {
  const response = await api.post('/datafield-service/create', request);
  return response.data;
}

export const updateDataField = async (request: object) => {
  const response = await api.post('/datafield-service/update', request);
  return response.data;
};

export const deleteDataField = async (site: string, dataField: string, userId: string) => {
  const response = await api.post('/datafield-service/delete', {site, dataField, userId});
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





