import api from "./api";



 
  
  export const retrieveWIList = async (req: object) => {
    const response = await api.post('/workinstruction-service/getWorkInstructionList', { ...req});
    return response.data;
  };
  
  export const retrievePOD = async (req: object) => {
    const response = await api.post('/pod-service/retrieve', { ...req});
    return response.data;
  }; 
  
  export const retrieveWI = async (req: object) => {
    const response = await api.post('/workinstruction-service/retrieveByWorkInstruction', { ...req});
    return response.data;
  }; 
  
  export const productionlog = async (req: object) => {
    const response = await api.post('/workinstruction-service/logRecord', { ...req});
    return response.data;
  };

  export const retrieveOperationVersion = async ( site: string, operation: string) => {
    const response = await api.post('operation-service/retrieve', {  site, operation });
    // console.log("retrieveOperationVersion response: ", response.data);
    return response.data;
  };



