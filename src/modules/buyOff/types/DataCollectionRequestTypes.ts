export interface DataCollectionRequest {
  
  dataCollection: string;
  version: string;
  description: string;
  status: string;
  currentVersion: boolean;
  collectionType: string;
  collectDataAt: string;
  collectionMethod: string;
  erpGroup: boolean;
  qmInspectionGroup: boolean;
  passOrFailGroup: boolean;
  failOrRejectNumber: string;
  userAuthenticationRequired: boolean;
  certification: string;
  dataCollected: boolean;
  showReport: boolean;
  frequency: string;
  tags: string[]; // Array of tags
  parameterList: any[]; // You can replace `any` with a more specific type if needed
  attachmentList: any[]; // You can replace `any` with a more specific type if needed
  customDataList: any[]; // You can replace `any` with a more specific type if needed
  
}

// Default data using the DataCollectionRequest interface
export const defaultDataCollectionRequest: DataCollectionRequest = {
 
  dataCollection: '',
  version: '',
  description: '',
  status: '',
  currentVersion: false,
  collectionType: '',
  collectDataAt: '',
  collectionMethod: '',
  erpGroup: false,
  qmInspectionGroup: false,
  passOrFailGroup: false,
  failOrRejectNumber: '',
  userAuthenticationRequired: false,
  certification: '',
  dataCollected: false,
  showReport: false,
  frequency: '',
  tags: [],
  parameterList: [],
  attachmentList: [],
  customDataList: [],
  
};
