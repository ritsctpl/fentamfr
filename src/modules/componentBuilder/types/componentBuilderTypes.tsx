

export interface ComponentBuilderFormData {
  componentLabel: string;
  dataType: string;
  unit: string;
  defaultValue: string;
  required: boolean;
  validation: string;
  apiUrl: string;
  minValue: string;
  maxValue: string;
}

export const defaultFormData: ComponentBuilderFormData = {
  componentLabel: '',
  dataType: 'Input',
  unit: 'kg',
  defaultValue: 'NA',
  required: false,
  validation: '',
  apiUrl: '',
  minValue: '0',
  maxValue: '100'
};