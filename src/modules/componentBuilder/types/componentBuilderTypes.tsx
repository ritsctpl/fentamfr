

export interface ComponentBuilderFormData {
  componentLabel: string;
  dataType: string;
  unit: string;
  defaultValue: string;
  required: boolean;
  validation: string;
  dropdownOptions: any;
  apiUrl: string;
  minValue: string;
  maxValue: string;
}

export const defaultFormData: ComponentBuilderFormData = {
  componentLabel: '',
  dataType: 'Input',
  unit: '',
  defaultValue: 'NA',
  required: false,
  validation: '',
  dropdownOptions: [],
  apiUrl: '',
  minValue: '0',
  maxValue: '100'
};