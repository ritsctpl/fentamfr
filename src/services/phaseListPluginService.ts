
import api from './api';

export const retrieveListOfPhases= async (req: object) => {
  console.log("Phase list request: ", req);
  const response = await api.post('/recipebatchprocess-service/getRecipesPhaseByFilters', {...req} );
  // console.log("Phase list response: ", response.data);
  return response.data;
};

export const retrievePCUInQueue= async (req: any) => {
  // console.log("Retrieve PCU in queue request: ", req);
  const response = await api.post('/pcuinqueue-service/retrieve', req );
  // console.log("Retrieve PCU in queue response: ", response.data);
  return response.data;
};

export const startPcu= async (req: any) => {
  // console.log("Start PCU request: ", req);
  const response = await api.post('/start-service/start', req );
  // console.log("Start PCU response: ", response.data);
  return response.data;
};

export const retrieveActivity = async (req: any)   => {
  const response = await api.post('/activity-service/retrieve', { ...req });
  return response.data;
};

export const retrieveIngredients = async (req: any)   => {
  const response = await api.post('/recipebatchprocess-service/getBatchRecipeOpIngredient', { ...req });
  return response.data;
};


export const startBatchNumber = async (req: any)   => {
  const response = await api.post('/processorderstate-service/start', { ...req });
  return response.data;
};

export const signOffBatchNumber = async (req: any)   => {
  const response = await api.post('/processorderstate-service/signoff', { ...req });
  return response.data;
};

export const completeBatchNumber = async (req: any)   => {
  const response = await api.post('processorderstate-service/complete', { ...req });
  return response.data;
};


