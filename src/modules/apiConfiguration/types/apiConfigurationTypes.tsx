

export interface ApiConfigurationFormData {
  apiName: string;
  storedProcedure: string;
  httpMethod: string;
  inputParameters: string;
  outputStructure: string;
 
}

export const defaultFormData: ApiConfigurationFormData = {
  apiName: '',
  storedProcedure: '',
  httpMethod: 'POST',
  inputParameters: '',
  outputStructure: '',
 
};