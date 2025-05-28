

export interface WorkflowStatesFormData {
  name: string,
  description: string,
  appliesTo: any,
  editableFields: any,
  isEnd: boolean,
  isActive: boolean,
 
}

export const defaultFormData: WorkflowStatesFormData = {
  name: '',
  description: '',
  appliesTo: [],
  editableFields: [],
  isEnd: false,
  isActive: false,
 
};