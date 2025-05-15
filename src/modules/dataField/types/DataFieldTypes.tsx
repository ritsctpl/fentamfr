// ... existing code ...

export interface DataFieldRequest {
  site: string;
  dataField: string;
  type: string;
  qmSelectedSet: boolean;
  description: string;
  fieldLabel: string;
  maskGroup: string;
  browseIcon: boolean;
  trackable: boolean;
  mfrRef: boolean;
  preSaveActivity: string;
  listDetails: ListDetails[];
  userId: string;
}

export interface ListDetails {
  defaultLabel: boolean;
  sequence: string;
  fieldValue: string;
  labelValue: string;
  type: string;
  width: string;
  api: string;
  parameters: string;
  values: Values[];
}

export interface Values {
  name: string;
}

// Default data for DataFieldRequest
export const defaultDataFieldRequest: DataFieldRequest = {
  site: '',
  dataField: '',
  type: '',
  qmSelectedSet: false,
  description: '',
  fieldLabel: '',
  maskGroup: '',
  browseIcon: false,
  trackable: false,
  mfrRef: false,
  preSaveActivity: '',
  listDetails: [],
  userId: ''
};

// ... existing code ...