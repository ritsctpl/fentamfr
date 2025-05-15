export interface RoutingData {
  site: string;
  routing: string;
  version: string;
  handle: string;
  description: string;
  routingType: string;
  status: string;
  subType: string;
  currentVersion: boolean;
  relaxedRoutingFlow: boolean;
  document: string;
  dispositionGroup: string;
  bom: string;
  bomVersion: string;
  replicationToErp: boolean;
  isParentRoute: boolean;
  routingStepList: any[]; // You can replace `any` with a more specific type if needed
  customDataList: any[]; // You can replace `any` with a more specific type if needed
  userId: string;
  createdDateTime: string;
  updatedDateTime: string; // Fixed typo from "mpdatedDateTime" to "updatedDateTime"
  createdBy: string;
  modifiedBy: string;
}

// Default data using the RoutingData interface
export const defaultRoutingData: RoutingData = {
  site: '',
  routing: '',
  version: '',
  handle: '',
  description: '',
  routingType: 'Master',
  status: '',
  subType: 'Seqential',
  currentVersion: false,
  relaxedRoutingFlow: false,
  document: '',
  dispositionGroup: '',
  bom: '',
  bomVersion: '',
  replicationToErp: false,
  isParentRoute: false,
  routingStepList: [],
  customDataList: [],
  userId: '',
  createdDateTime: '',
  updatedDateTime: '',
  createdBy: '',
  modifiedBy: ''
};
