export interface Attachment {
  sequence?: string;
  item?: string;
  itemGroup?: string;
  itemVersion?: string;
  routing?: string;
  routingVersion?: string;
  operation?: string;
  workCenter?: string;
  resource?: string;
  resourceType?: string;
  customerOrder?: string;
  shopOrder?: string;
  pcu?: string;
  bom?: string;
  bomVersion?: string;
  component?: string;
  componentVersion?: string;
}

export interface ComponentData {
  id: number;
  item: string;
  revision: string;
  description: string;
  status: string;
  procurementType: string;
  lotSize: string;
  dataType: string;
  category: string;
}

export interface ResourceData {
  id: number;
  resource: string;
  description: string;
  status: string;
}

export interface ItemGroupData {
  id: number;
  resource: string;
  description: string;
  status: string;
}

export interface BomData {
  id: number;
  resource: string;
  description: string;
  status: string;
}

export interface RoutingData {
  id: number;
  resource: string;
  description: string;
  status: string;
}

export interface ResourceTypeData {
  id: number;
  resource: string;
  description: string;
  status: string;
}

export interface ShopOrderData {
  id: number;
  resource: string;
  description: string;
  status: string;
}

export interface WorkCenterData {
  id: number;
  workCenter: string;
  description: string;
}

export interface OperationData {
  id: number;
  operation: string;
  revision: string;
  description: string;
  status: string;
}

export interface MaterialData {
  id: number;
  item: string;
  revision: string;
  description: string;
  status: string;
}

export interface CustomData {
  customData?: string;
  value?: string;
}

export interface ToolGroupRequest {
  site?: string;
  toolGroup?: string;
  handle?: string;
  description?: string;
  status?: string;
  trackingControl?: string;
  location?: string;
  toolQty?: number;
  timeBased?: boolean;
  erpGroup?: boolean;
  calibrationType: string;
  startCalibrationDate: string;
  calibrationPeriod: string;
  calibrationCount: number;
  maximumCalibrationCount: number;
  expirationDate: string;
  attachmentList?: Attachment[];
  customDataList?: CustomData[];
  active?: number;
  createdDateTime?: string; // Use string for ISO date representation
  modifiedDateTime?: string; // Use string for ISO date representation
  userId?: string;
}

export const defaultToolGroupRequest: ToolGroupRequest = {
  site: '',
  toolGroup: '',
  handle: '',
  description: '',
  status: 'Enabled',
  trackingControl: 'None',
  location: '',
  toolQty: 0,
  timeBased: false,
  erpGroup: false,
  calibrationType: 'None',
  calibrationPeriod: '',
  calibrationCount: 0,
  maximumCalibrationCount: 0,
  startCalibrationDate: '',
  expirationDate: '',
  attachmentList: [],
  customDataList: [],
  active: 0,
  createdDateTime: new Date().toISOString(),
  modifiedDateTime: new Date().toISOString(),
  userId: '',
};

export const defaultAttachmentRequest: Attachment = {
  sequence: '',
  item: '',
  itemGroup: '',
  itemVersion: '',
  routing: '',
  routingVersion: '',
  operation: '',
  workCenter: '',
  resource: '',
  resourceType: '',
  customerOrder: '',
  shopOrder: '',
  pcu: '',
  bom: '',
  bomVersion: '',
  component: '',
  componentVersion: ''
};