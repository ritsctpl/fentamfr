export interface ReasonCodeData {
  customData: string;
  site: string;
  reasonCode: string;
  handle: string;
  description: string;
  status: string;
  category: string;
  document: string;
  messagetype: string;
  customDataList: any[];  // Replace `any` with the appropriate type if you know the structure of custom data.
  userId: string;
  createdDateTime: string;
  updatedDateTime: string;
  createdBy: string;
  modifiedBy: string;
  type: string;
  resource: string[];
  workCenter: string[];
}


// Default data using the RoutingData interface
export const defaultReasonCodeData: ReasonCodeData = {
  site: '',
  reasonCode: '',
  handle: '',
  description: '',
  status: 'Enabled',
  category: 'Corrective Action',
  document: '',
  messagetype: '',
  customDataList: [],
  userId: '',
  createdDateTime: '',
  updatedDateTime: '',
  createdBy: '',
  modifiedBy: '',
  type: 'Resource',
  resource: [],
  workCenter: [],
  customData: ""
};



