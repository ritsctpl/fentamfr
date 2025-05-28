

export interface ComponentBuilderFormData {
  componentLabel: string;
  dataType: string;
  unit: string;
  defaultValue: string;
  required: boolean;
  validation: string;
  apiUrl: string;
  bulletPointText: string;
}

export const defaultFormData: ComponentBuilderFormData = {
  componentLabel: '',
  dataType: 'Input',
  unit: 'kg',
  defaultValue: 'NA',
  required: false,
  validation: '',
  apiUrl: '',
  bulletPointText: '• ',
};