import api from "./api";

export const retrieveWIList = async (req: object) => {
  const response = await api.post('/workinstruction-service/getWorkInstructionList', { ...req });
  return response.data;
};

export const retrievePOD = async (req: object) => {
  const response = await api.post('/pod-service/retrieve', { ...req });
  return response.data;
};

export const retrieveWI = async (req: object) => {
  const response = await api.post('/workinstruction-service/retrieveByWorkInstruction', { ...req });
  return response.data;
};

export const productionlog = async (req: object) => {
  const response = await api.post('/workinstruction-service/logRecord', { ...req });
  return response.data;
};

export const retrieveOperationVersion = async (site: string, operation: string) => {
  const response = await api.post('operation-service/retrieve', { site, operation });
  // console.log("retrieveOperationVersion response: ", response.data);
  return response.data;
};


export const fetchTop50NcGroup = async (site: string) => {
  const response = await api.post('/ncgroup-service/retrieveTop50', { site });
  // console.log(response,'Item Top 50 Response');

  return response.data.ncGroupList;
};

export const retrieveNcGroupListByOperation = async (req: any) => {
  const response = await api.post('/ncgroup-service/retrieveByOperation', { ...req });
  return response.data;
};

export const retrieveNcGroup = async (req: any) => {
  const response = await api.post('/ncgroup-service/retrieve', { ...req });
  return response.data;
};

export const retrieveNcCode = async (req: any) => {
  const response = await api.post('/nccode-service/retrieve', { ...req });
  return response.data;
};


export const retrieveDispositionRouting = async (req: any) => {
  debugger
  const response = await api.post('/nccode-service/getDispositionRouting', req);
  return response.data;
};

export const retrieveDataType = async (req: any) => {
  const response = await api.post('/datatype-service/retrieve', { ...req });
  return response.data;
};

export const logNC = async (req: any) => {
  const response = await api.post('/nonconformance-service/lognc', { ...req });
  return response.data;
};

export const getAllNcByPCU = async (req: any) => {
  const response = await api.post('/nonconformance-service/getAllNcByPCU', { ...req });
  return response.data;
};

export const done = async (req: any) => {
  const response = await api.post('/nonconformance-service/Done', req);
  return response.data;
};


export const retrieveDataField = async (request: any) => {
  const response = await api.post('/datafield-service/retrieve', { ...request });
  return response.data;
};

export const validateUser = async (request: any) => {
  const response = await api.post(window.location.origin + '/user/validate', { ...request });
  return response;
};

export const getListOfBuyoff = async (request: any) => {
  const response = await api.post('/logbuyoff-service/getListOfBuyoff', { ...request });
  return response.data;
};

export const retrieveOperation = async (request: any) => {
  const response = await api.post('/operation-service/retrieve', { ...request });
  return response.data;
};

export const retrievePCUInQueue = async (request: any) => {
  const response = await api.post('/pcuinqueue-service/retrieveByPcu', { ...request });
  return response.data;
};

export const retrievePCUInWork = async (request: any) => {
  const response = await api.post('/start-service/retrieveByPcuAndSite', { ...request });
  return response.data;
};

export const acceptBuyOff = async (request: any) => {
  console.log("Accept Request service", request);
  const response = await api.post('logbuyoff-service/accept', request );
  return response.data;
};

export const rejectBuyOff = async (request: any) => {
  const response = await api.post('logbuyoff-service/reject', request);
  return response.data;
};

export const partialBuyOff = async (request: any) => {
  const response = await api.post('logbuyoff-service/partial', request);
  return response.data;
};

export const skipBuyOff = async (request: any) => {
  const response = await api.post('logbuyoff-service/skip', request);
  return response.data;
};







