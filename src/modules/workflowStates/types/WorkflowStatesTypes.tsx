

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
  appliesTo: ['MFR'],
  editableFields: ['Comments'],
  isEnd: false,
  isActive: false,
 
};