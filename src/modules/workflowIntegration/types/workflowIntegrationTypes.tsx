
export interface WorkflowIntegrationRequest {
  identifier: string;            
  type: string; 
  messageId?: string; 
  processSplitXslt: boolean;     
  processBy: string;
  transformationType: string;  
  preprocessJolt?: string;      
  preprocessXslt?: string;      
  preprocessApi?: string;        
  apiToProcess: string;            
  expectedSplits?: any;
  postProcessJolt?: string;     
  postProcessApi?: string;      
  passHandler: string;           
  failHandler: string;           
}

export const defaultWorkflowIntegrationRequest: WorkflowIntegrationRequest = {
  identifier: '',                 
  type: 'simple',                
  messageId: '',                
  processSplitXslt: false, 
  processBy: 'JSON',            
  transformationType: 'JSONATA',  
  preprocessJolt: '',           
  preprocessXslt: '',            
  preprocessApi: '',             
  apiToProcess: '',               
  expectedSplits: [],                 
  postProcessJolt: '',           
  postProcessApi: '',            
  passHandler: '',       
  failHandler: '',       
};
