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

export interface WorkInstructionRequest {
  site?: string;
  workInstruction?: string;
  revision?: string;
  handle?: string;
  description?: string;
  status?: string;
  required?: boolean;
  currentVersion?: boolean;
  alwaysShowInNewWindow?: boolean;
  logViewing?: boolean;
  changeAlert?: boolean;
  erpWi?: boolean;
  instructionType?: string;
  erpFilename?: string;
  fileName?: string;
  url?: string;
  tags?: string[];
  file?: string;
  text?: string;
  attachmentList?: Attachment[];
  customDataList?: CustomData[];
  active?: number;
  createdDateTime?: string; // Use string for ISO date representation
  modifiedDateTime?: string; // Use string for ISO date representation
  userId?: string;
  bom?: string;
  bomVersion?: string;
  component?: string;
  componentVersion?: string;
  pcuBO?: string;
  shopOrderBO?: string;
  operationBO?: string;
  resourceBO?: string;
}

export const defaultWorkInstructionRequest: WorkInstructionRequest = {
  site: '',
  workInstruction: '',
  revision: '',
  handle: '',
  description: '',
  status: '',
  required: false,
  currentVersion: false,
  alwaysShowInNewWindow: false,
  logViewing: false,
  changeAlert: false,
  erpWi: false,
  instructionType: '',
  erpFilename: '',
  fileName: '',
  url: '',
  tags: [],
  file: '',
  text: '',
  attachmentList: [],
  customDataList: [],
  active: 0,
  createdDateTime: new Date().toISOString(),
  modifiedDateTime: new Date().toISOString(),
  userId: '',
  bom: '',
  bomVersion: '',
  component: '',
  componentVersion: '',
  pcuBO: '',
  shopOrderBO: '',
  operationBO: '',
  resourceBO: '',
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