export interface DataTypeRequest {
  site: string;
  handle: string;
  dataType: string;
  category: string;
  description: string;
  preSaveActivity: string;
  dataFieldList: DataField[];
  
  
  
}

export interface DataField {
  sequence: string;
  dataField: string;
  required: boolean;
  description: string;
  dataType: string;
}

// Default data for DataTypeRequest
export const defaultDataTypeRequest: DataTypeRequest = {
  site: '',
  handle: '',
  dataType: '',
  category: 'Assembly',
  description: '',
  preSaveActivity: '',
  dataFieldList: [],
 
 
  
};

// Default data for DataField
export const defaultDataField: DataField = {
  sequence: '',
  dataField: '',
  required: false,
  description: '',
  dataType: ''
};

